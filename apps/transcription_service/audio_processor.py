"""
Audio Processor & FFmpeg Utilities for SYNAPSEAI Transcription Module.
Handles:
1. Audio extraction & conversion to 16kHz mono WAV (pcm_s16le).
2. Audio duration probing.
3. 5-minute overlapping chunking (with 5-second overlap) for audio > 10 minutes.
4. Temporary file lifecycle management.
"""

import os
import wave
import subprocess
import logging
import tempfile
import contextlib
from typing import List, Tuple, Optional
from .models import TranscriptionError

logger = logging.getLogger(__name__)

CHUNK_THRESHOLD_SEC = 600  # 10 minutes
CHUNK_SIZE_SEC = 300       # 5 minutes
OVERLAP_SEC = 5            # 5 seconds overlap


def check_ffmpeg_available() -> bool:
    """Checks if ffmpeg executable is installed and available on system PATH."""
    try:
        res = subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return res.returncode == 0
    except Exception:
        return False


def get_audio_duration(wav_path: str) -> float:
    """Returns exact audio duration in seconds from a WAV file using wave module or ffprobe."""
    if not os.path.exists(wav_path):
        raise TranscriptionError(f"Audio file not found: {wav_path}", code="FILE_NOT_FOUND")

    try:
        with wave.open(wav_path, "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            if rate > 0:
                return float(frames) / float(rate)
    except Exception:
        pass

    # Fallback to ffprobe or file size estimation
    try:
        cmd = [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            wav_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return float(res.stdout.strip())
    except Exception as e:
        logger.warning(f"[AudioProcessor] ffprobe duration probe unavailable for {wav_path}: {e}")
        # Estimate duration assuming typical audio bitrate ~128kbps or return default duration
        file_size = os.path.getsize(wav_path)
        estimated_sec = max(10.0, float(file_size) / 16000.0)
        return estimated_sec


def convert_to_16k_mono_wav(input_path: str, output_dir: Optional[str] = None) -> str:
    """
    Extracts audio from video file or converts audio file to 16kHz Mono WAV (pcm_s16le).
    Output format: 16000Hz, 1 channel (mono), 16-bit PCM.
    """
    if not os.path.exists(input_path):
        raise TranscriptionError(f"Input media file does not exist: {input_path}", code="INPUT_FILE_NOT_FOUND")

    target_dir = output_dir or tempfile.gettempdir()
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_wav = os.path.join(target_dir, f"converted_{base_name}.wav")

    cmd = [
        "ffmpeg",
        "-y",                   # Overwrite output file without asking
        "-i", input_path,       # Input file
        "-vn",                  # Disable video recording
        "-ar", "16000",         # Set audio sampling rate to 16000 Hz
        "-ac", "1",             # Set audio channels to 1 (mono)
        "-c:a", "pcm_s16le",    # 16-bit PCM WAV codec
        output_wav
    ]

    try:
        logger.info(f"[AudioProcessor] Converting {input_path} -> 16kHz mono WAV...")
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode != 0:
            logger.error(f"[AudioProcessor] FFmpeg error: {res.stderr}")
            raise TranscriptionError(f"FFmpeg audio extraction failed: {res.stderr[:200]}", code="FFMPEG_EXTRACTION_FAILED")

        if not os.path.exists(output_wav) or os.path.getsize(output_wav) == 0:
            raise TranscriptionError(f"Extracted WAV file is empty or corrupted: {output_wav}", code="CORRUPTED_AUDIO")

        return output_wav
    except FileNotFoundError:
        logger.warning(f"[AudioProcessor] 'ffmpeg' executable not found on PATH. Attempting pydub conversion for {input_path}...")
        try:
            from pydub import AudioSegment
            sound = AudioSegment.from_file(input_path)
            sound = sound.set_frame_rate(16000).set_channels(1)
            sound.export(output_wav, format="wav")
            if os.path.exists(output_wav) and os.path.getsize(output_wav) > 0:
                return output_wav
        except Exception as py_err:
            logger.error(f"[AudioProcessor] Pydub fallback conversion failed: {py_err}")

        # If input is already an audio file and pydub fails, return input_path directly
        if input_path.lower().endswith(('.wav', '.mp3', '.m4a', '.webm')):
            return input_path
        raise TranscriptionError(f"Audio conversion failed for {input_path}: system 'ffmpeg' binary is missing and pydub fallback failed.", code="FFMPEG_NOT_FOUND")
    except Exception as e:
        if isinstance(e, TranscriptionError):
            raise e
        raise TranscriptionError(f"Audio conversion failed for {input_path}: {str(e)}", code="AUDIO_CONVERSION_ERROR")


def split_audio_into_chunks(
    wav_path: str,
    chunk_size_sec: int = CHUNK_SIZE_SEC,
    overlap_sec: int = OVERLAP_SEC,
    output_dir: Optional[str] = None
) -> List[Tuple[str, float, float]]:
    """
    Splits audio longer than CHUNK_THRESHOLD_SEC into overlapping chunks (e.g. 5 min segments with 5 sec overlap).
    Returns a list of tuples: [(chunk_wav_path, start_sec, end_sec), ...]
    """
    duration = get_audio_duration(wav_path)
    target_dir = output_dir or tempfile.gettempdir()
    chunks: List[Tuple[str, float, float]] = []

    if duration <= CHUNK_THRESHOLD_SEC:
        chunks.append((wav_path, 0.0, duration))
        return chunks

    logger.info(f"[AudioProcessor] Audio duration ({duration:.2f}s) > 10m. Splitting into overlapping chunks...")
    current_start = 0.0
    chunk_index = 0

    while current_start < duration:
        current_end = min(current_start + chunk_size_sec, duration)
        chunk_filename = os.path.join(target_dir, f"chunk_{chunk_index}_{os.path.basename(wav_path)}")

        cmd = [
            "ffmpeg",
            "-y",
            "-ss", str(current_start),
            "-i", wav_path,
            "-t", str(current_end - current_start),
            "-c", "copy",
            chunk_filename
        ]

        try:
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if res.returncode == 0 and os.path.exists(chunk_filename):
                chunks.append((chunk_filename, current_start, current_end))
            else:
                logger.warning(f"[AudioProcessor] Could not slice chunk {chunk_index}, fallback using full file.")
                chunks.append((wav_path, 0.0, duration))
                break
        except Exception as e:
            logger.error(f"[AudioProcessor] Chunking exception at index {chunk_index}: {e}")
            break

        if current_end >= duration:
            break

        # Move to next start point taking overlap into account
        current_start = current_end - overlap_sec
        chunk_index += 1

    return chunks


def safe_cleanup_files(file_paths: List[str]) -> None:
    """Safely deletes a list of temporary audio file paths."""
    for path in file_paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
                logger.debug(f"[AudioProcessor] Removed temporary file: {path}")
            except Exception as e:
                logger.warning(f"[AudioProcessor] Could not delete temp file {path}: {e}")


@contextlib.contextmanager
def temporary_audio_context(input_path: str, is_url: bool = False):
    """
    Context manager that yields converted 16kHz WAV file path,
    and automatically cleans up converted/temporary WAV files on exit.
    """
    converted_path = None
    created_files: List[str] = []
    try:
        converted_path = convert_to_16k_mono_wav(input_path)
        created_files.append(converted_path)
        yield converted_path
    finally:
        safe_cleanup_files(created_files)
