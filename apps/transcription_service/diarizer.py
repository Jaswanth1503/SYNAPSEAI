"""
Speaker Diarization Module & Timestamp Alignment Merger for SYNAPSEAI.
Supports:
1. Pyannote.audio speaker diarization pipeline.
2. Temporal overlap alignment merger between Whisper segments and Pyannote speaker turns.
3. Fallback speaker assigner for offline / missing token scenarios.
"""

import logging
from typing import List, Dict, Any, Optional
from .models import Segment

logger = logging.getLogger(__name__)


class SpeakerTurn:
    """Represents a speaker turn interval from diarization."""
    def __init__(self, start: float, end: float, speaker: str):
        self.start = float(start)
        self.end = float(end)
        self.speaker = str(speaker)


def run_pyannote_diarization(wav_path: str, hf_token: Optional[str] = None) -> List[SpeakerTurn]:
    """
    Runs speaker diarization on 16kHz WAV file using pyannote.audio pretrained model.
    Returns list of SpeakerTurn objects.
    """
    if not hf_token:
        logger.info("[Diarizer] No HuggingFace token provided. Skipping Pyannote live pipeline, using timestamp fallback aligner.")
        return []

    try:
        from pyannote.audio import Pipeline
        import torch

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"[Diarizer] Loading Pyannote speaker-diarization-3.1 pipeline on device: {device}...")

        pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=hf_token
        )
        if device.type == "cuda":
            pipeline.to(device)

        diarization = pipeline(wav_path)
        turns: List[SpeakerTurn] = []

        for turn, _, speaker in diarization.itertracks(yield_label=True):
            turns.append(SpeakerTurn(start=turn.start, end=turn.end, speaker=f"SPEAKER_{speaker}"))

        logger.info(f"[Diarizer] Pyannote diarization complete. Detected {len(turns)} speaker turns.")
        return turns

    except Exception as e:
        logger.warning(f"[Diarizer] Pyannote diarization failed or unconfigured: {e}. Falling back to default speaker alignment.")
        return []


def merge_whisper_and_diarization(
    whisper_segments: List[Dict[str, Any]],
    speaker_turns: List[SpeakerTurn]
) -> List[Segment]:
    """
    Merges Speech-to-Text Whisper segments with Pyannote speaker turns.
    Determines speaker label by maximum temporal overlap between Whisper segment [start, end]
    and Pyannote speaker turn intervals [turn.start, turn.end].
    """
    merged_segments: List[Segment] = []

    for seg in whisper_segments:
        seg_start = float(seg.get("start", 0.0))
        seg_end = float(seg.get("end", 0.0))
        text = str(seg.get("text", "")).strip()

        if not text:
            continue

        assigned_speaker = "SPEAKER_00"
        max_overlap = 0.0

        if speaker_turns:
            for turn in speaker_turns:
                # Compute overlap interval [overlap_start, overlap_end]
                overlap_start = max(seg_start, turn.start)
                overlap_end = min(seg_end, turn.end)
                overlap = max(0.0, overlap_end - overlap_start)

                if overlap > max_overlap:
                    max_overlap = overlap
                    assigned_speaker = turn.speaker

        merged_segments.append(
            Segment(
                start=seg_start,
                end=seg_end,
                speaker=assigned_speaker,
                text=text
            )
        )

    return merged_segments
