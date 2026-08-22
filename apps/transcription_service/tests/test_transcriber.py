"""
Unit Tests for SYNAPSEAI Transcription & Speaker Diarization Module.
Tests:
1. YouTube caption fetch success and fallback scenarios.
2. FFmpeg audio extraction command & file handling.
3. Audio chunking logic for 10+ minute audio (5 min segments, 5 sec overlap).
4. Timestamp alignment merger between Whisper segments and Pyannote speaker turns.
"""

import os
import unittest
from unittest.mock import patch, MagicMock

from apps.transcription_service.models import Segment, TranscriptResult, TranscriptionError
from apps.transcription_service import youtube_handler
from apps.transcription_service import audio_processor
from apps.transcription_service import diarizer
from apps.transcription_service import transcriber


class TestYouTubeHandler(unittest.TestCase):
    """Tests for YouTube URL parsing and caption fetching."""

    def test_extract_youtube_id_formats(self):
        """Test video ID extraction across various YouTube URL formats."""
        urls = [
            ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
            ("https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"),
        ]
        for url, expected_id in urls:
            extracted = youtube_handler.extract_youtube_id(url)
            self.assertEqual(extracted, expected_id, f"Failed extracting ID from {url}")

    def test_extract_invalid_url(self):
        """Test regex rejection of invalid URLs."""
        invalid_urls = ["https://google.com", "not_a_url", "http://youtube.com/watch?v=short"]
        for url in invalid_urls:
            self.assertIsNone(youtube_handler.extract_youtube_id(url))

    def test_fetch_youtube_captions_success(self):
        """Test successful caption fetching via youtube-transcript-api."""
        mock_api = MagicMock()
        mock_api.get_transcript.return_value = [
            {"start": 0.0, "duration": 3.5, "text": "Welcome to SYNAPSEAI"},
            {"start": 3.6, "duration": 4.0, "text": "Video transcription pipeline"},
        ]
        with patch.object(youtube_handler, "YouTubeTranscriptApi", mock_api):
            segments = youtube_handler.fetch_youtube_captions("dQw4w9WgXcQ")
            self.assertIsNotNone(segments)
            self.assertEqual(len(segments), 2)
            self.assertEqual(segments[0].text, "Welcome to SYNAPSEAI")
            self.assertEqual(segments[0].start, 0.0)
            self.assertEqual(segments[0].end, 3.5)

    def test_fetch_youtube_captions_failure(self):
        """Test graceful fallback when captions are unavailable."""
        mock_api = MagicMock()
        mock_api.get_transcript.side_effect = Exception("Captions disabled")
        with patch.object(youtube_handler, "YouTubeTranscriptApi", mock_api):
            segments = youtube_handler.fetch_youtube_captions("dQw4w9WgXcQ")
            self.assertIsNone(segments)


class TestAudioProcessor(unittest.TestCase):
    """Tests for FFmpeg audio conversion and 5-min overlapping chunking logic."""

    def test_split_audio_short_duration(self):
        """Short audio (<= 10 min) should not be chunked."""
        with patch.object(audio_processor, "get_audio_duration", return_value=300.0):
            chunks = audio_processor.split_audio_into_chunks("test.wav", chunk_size_sec=300, overlap_sec=5)
            self.assertEqual(len(chunks), 1)
            self.assertEqual(chunks[0][1], 0.0)
            self.assertEqual(chunks[0][2], 300.0)

    def test_split_audio_long_duration_overlapping(self):
        """Long audio (>10 min / 900 sec) should be split into overlapping 5-min chunks."""
        with patch.object(audio_processor, "get_audio_duration", return_value=900.0):
            with patch("subprocess.run", return_value=MagicMock(returncode=0)):
                with patch("os.path.exists", return_value=True):
                    chunks = audio_processor.split_audio_into_chunks("test.wav", chunk_size_sec=300, overlap_sec=5)
                    self.assertTrue(len(chunks) >= 3)
                    # Chunk 0: 0 to 300
                    self.assertEqual(chunks[0][1], 0.0)
                    self.assertEqual(chunks[0][2], 300.0)
                    # Chunk 1 starts at 300 - 5 = 295
                    self.assertEqual(chunks[1][1], 295.0)


class TestDiarizerMerger(unittest.TestCase):
    """Tests for timestamp alignment merger between Whisper segments and Pyannote speaker turns."""

    def test_merge_whisper_and_diarization_overlap(self):
        """Test matching speaker label based on maximum temporal overlap."""
        whisper_segments = [
            {"start": 0.0, "end": 4.0, "text": "Hello world from speaker 1"},
            {"start": 5.0, "end": 10.0, "text": "Good morning from speaker 2"},
        ]
        speaker_turns = [
            diarizer.SpeakerTurn(start=0.0, end=4.5, speaker="SPEAKER_00"),
            diarizer.SpeakerTurn(start=4.6, end=11.0, speaker="SPEAKER_01"),
        ]

        merged = diarizer.merge_whisper_and_diarization(whisper_segments, speaker_turns)
        self.assertEqual(len(merged), 2)
        self.assertEqual(merged[0].speaker, "SPEAKER_00")
        self.assertEqual(merged[0].text, "Hello world from speaker 1")
        self.assertEqual(merged[1].speaker, "SPEAKER_01")
        self.assertEqual(merged[1].text, "Good morning from speaker 2")

    def test_merge_whisper_without_speaker_turns(self):
        """Test fallback when no speaker turns are present."""
        whisper_segments = [
            {"start": 0.0, "end": 5.0, "text": "Single speaker transcript"},
        ]
        merged = diarizer.merge_whisper_and_diarization(whisper_segments, [])
        self.assertEqual(len(merged), 1)
        self.assertEqual(merged[0].speaker, "SPEAKER_00")


class TestTranscribePipeline(unittest.TestCase):
    """Tests for main transcribe() entrypoint."""

    def test_transcribe_youtube_captions_success(self):
        """Test transcribe() returning YouTube caption result."""
        mock_captions = [
            Segment(start=0.0, end=4.0, speaker="SPEAKER_00", text="YouTube Captions Text")
        ]
        with patch.object(transcriber, "fetch_youtube_captions", return_value=mock_captions):
            result = transcriber.transcribe("https://www.youtube.com/watch?v=dQw4w9WgXcQ", source_type="youtube")

            self.assertIsInstance(result, TranscriptResult)
            self.assertEqual(result.video_id, "yt_dQw4w9WgXcQ")
            self.assertEqual(len(result.segments), 1)
            self.assertEqual(result.segments[0].text, "YouTube Captions Text")

    def test_transcribe_invalid_source_type(self):
        """Test invalid source_type exception."""
        with self.assertRaises(TranscriptionError):
            transcriber.transcribe("file.mp4", source_type="unsupported"  # type: ignore
            )


if __name__ == "__main__":
    unittest.main()
