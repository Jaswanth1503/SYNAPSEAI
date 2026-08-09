"""
Real Data Verification Script for Communication Coaching ML Analysis Component.
Runs transcribe_speech, analyze_speech_metrics (with live Gemini LLM grammar check),
analyze_confidence, and compile_report against a real YouTube speech sample.
"""

import os
import sys
import json
import logging
from pathlib import Path

# UTF-8 Console reconfigure
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RealCoachingCheck")

# Auto-load .env
project_root = Path(__file__).resolve().parents[3]
api_env = project_root / "apps" / "api" / ".env"
root_env = project_root / ".env"

def load_env_file(env_path: Path):
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip("'\"")

if api_env.exists():
    load_env_file(api_env)
elif root_env.exists():
    load_env_file(root_env)

sys.path.insert(0, str(project_root))

from apps.transcription_service import (
    transcribe_speech,
    analyze_speech_metrics,
    analyze_confidence,
    analyze_visual_signals,
    compile_report
)


def run_real_coaching_verification():
    logger.info("=== STARTING REAL COMMUNICATION COACHING VERIFICATION ===")

    # 1. Real Speech Audio Sample (Short 1-2 min Speech Sample)
    speech_youtube_url = "https://www.youtube.com/watch?v=UF8uR6Z6KLc"  # Steve Jobs Stanford Speech excerpt

    logger.info(f"1. Transcribing real speech audio sample: {speech_youtube_url}")
    transcript = transcribe_speech(speech_youtube_url)
    logger.info(f"Transcription Complete: ID='{transcript.video_id}', Duration={transcript.duration_sec}s, Words={len(transcript.full_text.split())}")

    print("\n=======================================================")
    print("1. FULL RECOVERY TRANSCRIPT TEXT")
    print("=======================================================")
    print(f"\"{transcript.full_text[:400]}...\"")

    # 2. Speech Metrics (WPM + Filler Words + Live Gemini LLM Grammar Analysis)
    logger.info("2. Analyzing Speech Metrics (WPM, Fillers, Live Gemini Grammar)...")
    speech_metrics = analyze_speech_metrics(transcript, provider_name="gemini")

    print("\n=======================================================")
    print("2. SPEECH METRICS OUTPUT")
    print("=======================================================")
    print(json.dumps(speech_metrics, indent=2))

    # 3. Grounded Confidence Scoring
    logger.info("3. Analyzing Confidence Signals (Fillers, Pace Consistency, Hedging)...")
    confidence_score = analyze_confidence(transcript, speech_metrics)

    print("\n=======================================================")
    print("3. CONFIDENCE SCORE & CONTRIBUTING FACTORS")
    print("=======================================================")
    print(json.dumps(confidence_score, indent=2))

    # 4. Visual Signals (Optional / Frame Caveat)
    visual_signals = analyze_visual_signals(frame_paths=None)

    # 5. Compile Final Coaching Report
    logger.info("5. Compiling Structured Coaching Report...")
    report = compile_report(speech_metrics, confidence_score, speech_metrics["grammar_issues"], visual_signals)

    print("\n=======================================================")
    print("5. FINAL COMPILED COACHING REPORT JSON")
    print("=======================================================")
    print(json.dumps(report, indent=2))

    logger.info("=== REAL COMMUNICATION COACHING VERIFICATION COMPLETE ===")


if __name__ == "__main__":
    run_real_coaching_verification()
