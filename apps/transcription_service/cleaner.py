"""
Transcript Cleaning Module for SYNAPSEAI.
Transforms noisy raw ASR/diarized segments into a polished, LLM-ready transcript.

Steps applied in strict order:
1. Filler word removal (regex-based).
2. Punctuation & capitalization restoration.
3. Technical term correction (fuzzy edit-distance glossary matching).
4. Speaker paragraph merging with timestamp range preservation.
"""

import re
import difflib
import logging
from typing import List, Dict, Any, Optional, Union

from .models import Segment, TranscriptResult, CleanParagraph, CleanTranscript

logger = logging.getLogger(__name__)

# Configurable filler word regex pattern
DEFAULT_FILLER_WORDS = [
    r'\bum+\b',
    r'\buh+\b',
    r'\bah+\b',
    r'\ber+\b',
    r'\bhm+\b',
    r'\byou know\b',
    r'\bI mean\b',
    r'\bbasically\b',
    r'\bactually\b',
    r'\bsort of\b',
    r'\bkind of\b',
    r'\blike,\b',       # "like," as filler
    r'\b,\s*like\b',   # ", like" as filler
]

FILLER_REGEX = re.compile(
    '|'.join(DEFAULT_FILLER_WORDS),
    re.IGNORECASE
)

# Standalone "like" at sentence start or surrounded by commas
STANDALONE_LIKE_REGEX = re.compile(r'^\s*like[,\s]+', re.IGNORECASE)


def strip_filler_words(text: str) -> str:
    """Strips common filler words and hesitation noises from segment text."""
    if not text:
        return ""

    # Remove standard filler patterns
    cleaned = FILLER_REGEX.sub('', text)
    cleaned = STANDALONE_LIKE_REGEX.sub('', cleaned)

    # Clean up double spaces or floating/dangling punctuation created by removals
    cleaned = re.sub(r'\s+', ' ', cleaned)
    cleaned = re.sub(r'^[,\s]+', '', cleaned)            # Remove leading commas/spaces
    cleaned = re.sub(r'\s*,\s*,', ',', cleaned)          # Remove double commas ",,"
    cleaned = re.sub(r'\s*,\s*([\.!\?])', r'\1', cleaned) # Remove comma before period ",."
    cleaned = re.sub(r'\s+([,\.!\?])', r'\1', cleaned)   # Remove space before punctuation
    cleaned = re.sub(r',\s*for\b', ' for', cleaned)      # Remove dangling comma before preposition
    cleaned = re.sub(r'([,\.!\?])\1+', r'\1', cleaned)

    return cleaned.strip()


def restore_punctuation(text: str) -> str:
    """
    Restores sentence-ending punctuation and initial capitalization
    without reordering words or altering sentence meaning.
    """
    if not text:
        return ""

    s = text.strip()

    # Capitalize first character if letter
    if s and s[0].islower():
        s = s[0].upper() + s[1:]

    # Ensure terminating punctuation
    if s and not s[-1] in '.!?':
        s += '.'

    return s


def fuzzy_correct_technical_terms(
    text: str,
    glossary: Optional[List[str]] = None,
    similarity_threshold: float = 0.75
) -> str:
    """
    Fuzzy-matches tokens against a technical domain glossary using edit-distance matching.
    Corrects near-miss ASR errors (e.g. 'cuber-net-ees' -> 'Kubernetes') without full LLM rewrites.
    Guards strictly against false positives (similarity threshold >= 0.75).
    """
    if not text or not glossary:
        return text

    words = text.split()
    corrected_words = []

    # Prepare normalized glossary lookup map
    glossary_map = {g.lower().replace("-", "").replace(" ", ""): g for g in glossary}
    glossary_keys = list(glossary_map.keys())

    i = 0
    while i < len(words):
        word = words[i]
        clean_token = re.sub(r'[^a-zA-Z0-9-]', '', word).lower().replace("-", "")
        punct_suffix = "".join([c for c in word if not c.isalnum() and c != '-'])

        # Skip short common words (< 4 chars) to prevent false positives
        if len(clean_token) < 4:
            corrected_words.append(word)
            i += 1
            continue

        best_match = None
        best_ratio = 0.0

        # Direct or fuzzy match against glossary terms
        for key in glossary_keys:
            ratio = difflib.SequenceMatcher(None, clean_token, key).ratio()
            if ratio > best_ratio and ratio >= similarity_threshold:
                best_ratio = ratio
                best_match = glossary_map[key]

        if best_match and best_ratio >= similarity_threshold:
            logger.debug(f"[Cleaner] Fuzzy matched '{word}' -> '{best_match}' (ratio: {best_ratio:.2f})")
            # Preserve punctuation suffix if present
            if punct_suffix and not best_match.endswith(punct_suffix):
                best_match += punct_suffix
            corrected_words.append(best_match)
        else:
            corrected_words.append(word)

        i += 1

    return " ".join(corrected_words)


def format_speaker_name(speaker: str, speaker_map: Optional[Dict[str, str]] = None) -> str:
    """Formats raw speaker ID (e.g. 'SPEAKER_00') into human-readable label."""
    if speaker_map and speaker in speaker_map:
        return speaker_map[speaker]

    # Convert "SPEAKER_00" -> "[Speaker 00]"
    if speaker.upper().startswith("SPEAKER_"):
        num = speaker.split("_")[-1]
        return f"[Speaker {num}]"

    if not speaker.startswith("[") and not speaker.endswith("]"):
        return f"[{speaker}]"

    return speaker


def merge_speaker_paragraphs(
    segments: List[Segment],
    speaker_map: Optional[Dict[str, str]] = None
) -> List[CleanParagraph]:
    """
    Merges consecutive segments from the same speaker into cohesive paragraph blocks.
    Preserves start timestamp of 1st segment and end timestamp of last segment in block.
    """
    if not segments:
        return []

    paragraphs: List[CleanParagraph] = []

    current_speaker = segments[0].speaker
    current_start = float(segments[0].start)
    current_end = float(segments[0].end)
    current_texts: List[str] = [segments[0].text] if segments[0].text else []

    for seg in segments[1:]:
        seg_speaker = seg.speaker
        seg_start = float(seg.start)
        seg_end = float(seg.end)
        seg_text = seg.text

        if not seg_text:
            continue

        if seg_speaker == current_speaker:
            # Merge with active speaker block
            current_end = max(current_end, seg_end)
            current_texts.append(seg_text)
        else:
            # Commit finished speaker block
            merged_text = " ".join(current_texts).strip()
            if merged_text:
                formatted_label = format_speaker_name(current_speaker, speaker_map)
                paragraphs.append(
                    CleanParagraph(
                        speaker=formatted_label,
                        start=current_start,
                        end=current_end,
                        text=merged_text
                    )
                )

            # Start new speaker block
            current_speaker = seg_speaker
            current_start = seg_start
            current_end = seg_end
            current_texts = [seg_text]

    # Commit final remaining block
    merged_text = " ".join(current_texts).strip()
    if merged_text:
        formatted_label = format_speaker_name(current_speaker, speaker_map)
        paragraphs.append(
            CleanParagraph(
                speaker=formatted_label,
                start=current_start,
                end=current_end,
                text=merged_text
            )
        )

    return paragraphs


def clean_transcript(
    raw: Union[TranscriptResult, Dict[str, Any]],
    glossary: Optional[List[str]] = None,
    speaker_map: Optional[Dict[str, str]] = None
) -> CleanTranscript:
    """
    Main Function Signature required by requirement 6:
    `clean_transcript(raw: TranscriptResult, glossary: Optional[List[str]] = None) -> CleanTranscript`

    Transforms noisy raw STT transcript segments into polished, LLM-ready clean transcript.

    Args:
        raw: TranscriptResult dataclass or dict with key "segments".
        glossary: Optional list of technical domain terms for fuzzy ASR correction.
        speaker_map: Optional dict mapping raw speaker IDs (e.g. {"SPEAKER_00": "Prof. Smith"}).

    Returns:
        CleanTranscript dataclass containing clean_transcript paragraphs and full_text.
    """
    duration_sec = 0.0
    if isinstance(raw, TranscriptResult):
        video_id = raw.video_id
        duration_sec = float(raw.duration_sec)
        raw_segments = raw.segments
    elif isinstance(raw, dict):
        video_id = str(raw.get("video_id", "transcript_clean"))
        duration_sec = float(raw.get("duration_sec", 0.0))
        segments_data = raw.get("segments", [])
        raw_segments = []
        for s in segments_data:
            if isinstance(s, Segment):
                raw_segments.append(s)
            elif isinstance(s, dict):
                raw_segments.append(
                    Segment(
                        start=float(s.get("start", 0.0)),
                        end=float(s.get("end", 0.0)),
                        speaker=str(s.get("speaker", "SPEAKER_00")),
                        text=str(s.get("text", ""))
                    )
                )
    else:
        raise ValueError("Invalid raw transcript input: expected TranscriptResult or dict with 'segments'.")

    cleaned_segments: List[Segment] = []

    # Calculate fallback duration_sec if not provided
    if duration_sec == 0.0 and raw_segments:
        duration_sec = max(float(s.end) for s in raw_segments)

    # Apply steps 1-3 in order per segment
    for seg in raw_segments:
        # Step 1: Filler word removal
        text = strip_filler_words(seg.text)

        if not text:
            continue

        # Step 2: Technical term fuzzy correction against glossary
        if glossary:
            text = fuzzy_correct_technical_terms(text, glossary)

        # Step 3: Punctuation & Capitalization restoration
        text = restore_punctuation(text)

        cleaned_segments.append(
            Segment(
                start=seg.start,
                end=seg.end,
                speaker=seg.speaker,
                text=text
            )
        )

    # Step 4: Speaker paragraph merging with timestamp preservation
    clean_paragraphs = merge_speaker_paragraphs(cleaned_segments, speaker_map=speaker_map)

    # Construct full_text concatenated string for LLM context
    full_text_lines = [f"{p.speaker}: {p.text}" for p in clean_paragraphs]
    full_text = "\n\n".join(full_text_lines)

    return CleanTranscript(
        video_id=video_id,
        duration_sec=duration_sec,
        segments=clean_paragraphs,
        full_text=full_text
    )
