"""
Data Models and Exceptions for SYNAPSEAI Transcription & Cleaning Services.
"""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass, asdict
import json


class TranscriptionError(Exception):
    """Custom exception raised when transcription or media processing fails."""
    def __init__(self, message: str, code: str = "TRANSCRIPTION_ERROR", details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": self.code,
            "message": self.message,
            "details": self.details,
        }


@dataclass
class Segment:
    """Represents a timestamped speaker segment in the raw transcript."""
    start: float
    end: float
    speaker: str
    text: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "start": round(float(self.start), 2),
            "end": round(float(self.end), 2),
            "speaker": str(self.speaker),
            "text": str(self.text).strip(),
        }


@dataclass
class TranscriptResult:
    """Complete structured JSON result of raw transcription & diarization."""
    video_id: str
    duration_sec: float
    segments: List[Segment]

    @property
    def full_text(self) -> str:
        return " ".join(seg.text for seg in self.segments if seg.text)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "video_id": self.video_id,
            "duration_sec": round(float(self.duration_sec), 2),
            "full_text": self.full_text,
            "segments": [seg.to_dict() for seg in self.segments],
        }

    def to_json(self, indent: Optional[int] = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)


@dataclass
class CleanParagraph:
    """Represents a merged, cleaned speaker paragraph block with timestamps."""
    speaker: str
    start: float
    end: float
    text: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "speaker": str(self.speaker),
            "start": round(float(self.start), 2),
            "end": round(float(self.end), 2),
            "text": str(self.text).strip(),
        }


@dataclass
class CleanTranscript:
    """Complete structured JSON output contract of the ML Transcript Engine."""
    video_id: str
    segments: List[CleanParagraph]
    full_text: str
    duration_sec: float = 0.0

    def __init__(
        self,
        video_id: str,
        full_text: str,
        segments: Optional[List[CleanParagraph]] = None,
        clean_transcript: Optional[List[CleanParagraph]] = None,
        duration_sec: float = 0.0
    ):
        self.video_id = video_id
        self.full_text = full_text
        self.duration_sec = duration_sec
        self.segments = segments if segments is not None else (clean_transcript or [])

    @property
    def clean_transcript(self) -> List[CleanParagraph]:
        """Alias for backward compatibility with RAG and Content Generators."""
        return self.segments

    def to_dict(self) -> Dict[str, Any]:
        return {
            "video_id": self.video_id,
            "duration_sec": round(float(self.duration_sec), 2),
            "segments": [para.to_dict() for para in self.segments],
            "full_text": self.full_text,
        }

    def to_json(self, indent: Optional[int] = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
