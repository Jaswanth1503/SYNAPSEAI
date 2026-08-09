"""
YouTube URL Handler & Audio Downloader for SYNAPSEAI Transcription Module.
Handles:
1. Video ID extraction & regex validation.
2. Captions fetching via youtube-transcript-api.
3. Fallback audio-only download via yt-dlp.
"""

import re
import os
import logging
import tempfile
from typing import Tuple, List, Optional

try:
    from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
except ImportError:
    YouTubeTranscriptApi = None
    TranscriptsDisabled = Exception
    NoTranscriptFound = Exception

try:
    import yt_dlp
except ImportError:
    yt_dlp = None

from .models import Segment, TranscriptionError

logger = logging.getLogger(__name__)

YOUTUBE_REGEX = re.compile(
    r'^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})(?:\S+)?$'
)


def extract_youtube_id(url: str) -> Optional[str]:
    """Extracts 11-character YouTube video ID from various URL formats."""
    if not url or not isinstance(url, str):
        return None
    match = YOUTUBE_REGEX.match(url.strip())
    return match.group(1) if match else None


def fetch_youtube_captions(video_id: str) -> Optional[List[Segment]]:
    """
    Attempts to fetch closed captions using youtube-transcript-api.
    Returns List[Segment] if successful, or None if unavailable/disabled.
    """
    if YouTubeTranscriptApi is None:
        logger.warning("[YouTubeHandler] youtube-transcript-api package is not installed.")
        return None

    try:
        logger.info(f"[YouTubeHandler] Attempting closed caption retrieval for video_id: {video_id}")
        transcript_list = None

        if hasattr(YouTubeTranscriptApi, "get_transcript"):
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            except Exception:
                pass

        if transcript_list is None:
            try:
                api = YouTubeTranscriptApi()
                if hasattr(api, "fetch"):
                    transcript_list = api.fetch(video_id)
                elif hasattr(api, "get_transcript"):
                    transcript_list = api.get_transcript(video_id)
            except Exception as fe:
                logger.debug(f"[YouTubeHandler] api.fetch error: {fe}")

        if not transcript_list:
            return None

        segments: List[Segment] = []
        for item in transcript_list:
            if hasattr(item, "start"):
                start = float(item.start)
                duration = float(getattr(item, "duration", 0.0))
                text = str(getattr(item, "text", "")).replace("\n", " ").strip()
            elif isinstance(item, dict):
                start = float(item.get("start", 0.0))
                duration = float(item.get("duration", 0.0))
                text = str(item.get("text", "")).replace("\n", " ").strip()
            else:
                continue

            end = start + duration
            if text:
                segments.append(Segment(start=start, end=end, speaker="SPEAKER_00", text=text))

        if segments:
            logger.info(f"[YouTubeHandler] Successfully fetched {len(segments)} caption segments.")
            return segments
    except (TranscriptsDisabled, NoTranscriptFound) as e:
        logger.info(f"[YouTubeHandler] Captions disabled or missing for {video_id}: {e}")
    except Exception as e:
        logger.warning(f"[YouTubeHandler] Failed to fetch captions for {video_id}: {e}")

    return None


def download_youtube_audio(youtube_url: str, output_dir: Optional[str] = None) -> str:
    """
    Downloads audio-only track from YouTube URL using yt-dlp (best quality WAV/m4a).
    Returns path to downloaded audio file.
    """
    target_dir = output_dir or tempfile.gettempdir()
    video_id = extract_youtube_id(youtube_url) or "yt_download"
    output_template = os.path.join(target_dir, f"{video_id}_%(id)s.%(ext)s")

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_template,
        'quiet': True,
        'no_warnings': True,
    }

    try:
        logger.info(f"[YouTubeHandler] Downloading audio via yt-dlp for: {youtube_url}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            filename = ydl.prepare_filename(info)
            # Postprocessor converts extension to .wav
            base, _ = os.path.splitext(filename)
            expected_wav = f"{base}.wav"

            if os.path.exists(expected_wav):
                return expected_wav
            elif os.path.exists(filename):
                return filename
            else:
                # Search for created wav file in target_dir matching video_id
                for fname in os.listdir(target_dir):
                    if video_id in fname and fname.endswith('.wav'):
                        return os.path.join(target_dir, fname)
                raise TranscriptionError(
                    f"Downloaded audio file not found for YouTube URL: {youtube_url}",
                    code="DOWNLOAD_FILE_NOT_FOUND"
                )
    except Exception as e:
        logger.error(f"[YouTubeHandler] yt-dlp download failed for {youtube_url}: {e}")
        raise TranscriptionError(
            f"Failed to download audio from YouTube: {str(e)}",
            code="YOUTUBE_DOWNLOAD_FAILED",
            details={"url": youtube_url, "error": str(e)}
        )
