"""
Unit Tests for SYNAPSEAI Transcript Cleaner Module.
Tests:
1. Filler word removal without altering sentence meaning.
2. Speaker paragraph merging with exact timestamp preservation (start of 1st, end of last).
3. Glossary fuzzy term correction firing on near-misses (e.g. 'cuber-net-ees' -> 'Kubernetes') and avoiding false positives.
"""

import unittest
from apps.transcription_service.models import Segment, TranscriptResult, CleanTranscript
from apps.transcription_service.cleaner import (
    strip_filler_words,
    restore_punctuation,
    fuzzy_correct_technical_terms,
    merge_speaker_paragraphs,
    clean_transcript,
)


class TestFillerRemoval(unittest.TestCase):
    """Tests for regex-based filler word stripping."""

    def test_strip_basic_fillers(self):
        text = "Um, welcome to the lesson, uh, today we are building AI."
        cleaned = strip_filler_words(text)
        self.assertNotIn("Um", cleaned)
        self.assertNotIn("uh", cleaned)
        self.assertIn("welcome to the lesson", cleaned)

    def test_strip_complex_fillers(self):
        text = "Basically, you know, we are actually using Python, like, for clean code."
        cleaned = strip_filler_words(text)
        self.assertNotIn("Basically", cleaned)
        self.assertNotIn("you know", cleaned)
        self.assertNotIn("actually", cleaned)
        self.assertIn("we are using Python for clean code", cleaned)


class TestPunctuationRestoration(unittest.TestCase):
    """Tests for capitalization and punctuation restoration."""

    def test_restore_initial_capital_and_period(self):
        text = "this is a clean transcript segment"
        restored = restore_punctuation(text)
        self.assertEqual(restored, "This is a clean transcript segment.")

    def test_existing_punctuation_preserved(self):
        text = "Is this working properly?"
        restored = restore_punctuation(text)
        self.assertEqual(restored, "Is this working properly?")


class TestGlossaryFuzzyCorrection(unittest.TestCase):
    """Tests for technical term edit-distance fuzzy matching."""

    def test_fuzzy_match_near_miss_terms(self):
        text = "We deployed cubernet-ees and pytorch models."
        glossary = ["Kubernetes", "PyTorch", "MongoDB"]
        corrected = fuzzy_correct_technical_terms(text, glossary)
        self.assertIn("Kubernetes", corrected)
        self.assertIn("PyTorch", corrected)

    def test_avoid_false_positives_on_unrelated_words(self):
        text = "The quick brown fox jumps over the lazy dog."
        glossary = ["Kubernetes", "PyTorch", "MongoDB"]
        corrected = fuzzy_correct_technical_terms(text, glossary)
        self.assertEqual(corrected, text)


class TestSpeakerMerging(unittest.TestCase):
    """Tests for merging consecutive speaker segments and preserving timestamps."""

    def test_merge_consecutive_same_speaker(self):
        segments = [
            Segment(start=0.0, end=5.0, speaker="SPEAKER_00", text="Hello everyone."),
            Segment(start=5.1, end=10.0, speaker="SPEAKER_00", text="Welcome to SYNAPSEAI."),
            Segment(start=10.5, end=15.0, speaker="SPEAKER_01", text="Thank you, professor."),
        ]

        merged = merge_speaker_paragraphs(segments)
        self.assertEqual(len(merged), 2)
        # Block 1
        self.assertEqual(merged[0].speaker, "[Speaker 00]")
        self.assertEqual(merged[0].start, 0.0)
        self.assertEqual(merged[0].end, 10.0)
        self.assertEqual(merged[0].text, "Hello everyone. Welcome to SYNAPSEAI.")
        # Block 2
        self.assertEqual(merged[1].speaker, "[Speaker 01]")
        self.assertEqual(merged[1].start, 10.5)
        self.assertEqual(merged[1].end, 15.0)


class TestCleanTranscriptPipeline(unittest.TestCase):
    """Tests for overall clean_transcript() entrypoint."""

    def test_full_pipeline_cleaning(self):
        raw = TranscriptResult(
            video_id="yt_test123",
            duration_sec=20.0,
            segments=[
                Segment(start=0.0, end=4.0, speaker="SPEAKER_00", text="um welcome to cubernet-ees lesson"),
                Segment(start=4.1, end=8.0, speaker="SPEAKER_00", text="you know we use typescript"),
            ]
        )
        glossary = ["Kubernetes", "TypeScript"]

        cleaned: CleanTranscript = clean_transcript(raw, glossary=glossary)

        self.assertEqual(cleaned.video_id, "yt_test123")
        self.assertEqual(len(cleaned.clean_transcript), 1)
        para = cleaned.clean_transcript[0]

        self.assertEqual(para.speaker, "[Speaker 00]")
        self.assertEqual(para.start, 0.0)
        self.assertEqual(para.end, 8.0)
        self.assertIn("Kubernetes", para.text)
        self.assertIn("TypeScript", para.text)
        self.assertNotIn("um", para.text.lower().split())
        self.assertTrue(cleaned.full_text.startswith("[Speaker 00]:"))


if __name__ == "__main__":
    unittest.main()
