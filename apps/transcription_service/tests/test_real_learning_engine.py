"""
Real Data Verification Script for Personalized Learning Engine.
Runs track_topic_mastery, calculate_next_review, and generate_study_plan against
the actual knowledge graph output produced by topic_linker.py on real educational videos.
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta, timezone

# UTF-8 Console reconfigure
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RealLearningEngineCheck")

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
    track_topic_mastery,
    generate_study_plan,
    calculate_next_review,
    QuizResult,
    WatchEvent,
    transcribe,
    clean_transcript,
    extract_topics,
    merge_into_graph
)


def run_real_learning_engine_verification():
    logger.info("=== STARTING REAL PERSONALIZED LEARNING ENGINE VERIFICATION ===")

    # 1. Fetch real Knowledge Graph output from real educational videos
    video_1_url = "https://www.youtube.com/watch?v=kqtD5dpn9C8"  # Mosh Python Tutorial
    video_2_url = "https://www.youtube.com/watch?v=_uQrJ0TkZlc"  # Fireship Python in 100s

    logger.info("Transcribing & Cleaning Video 1...")
    clean_v1 = clean_transcript(transcribe(source=video_1_url, source_type="youtube"))
    logger.info("Transcribing & Cleaning Video 2...")
    clean_v2 = clean_transcript(transcribe(source=video_2_url, source_type="youtube"))

    logger.info("Extracting topics for Video 1...")
    topics_v1 = extract_topics(clean_v1, provider_name="gemini")
    logger.info("Extracting topics for Video 2...")
    topics_v2 = extract_topics(clean_v2, provider_name="gemini")

    g1 = merge_into_graph(topics_v1, existing_graph=None)
    real_knowledge_graph = merge_into_graph(topics_v2, existing_graph=g1)

    print("\n=======================================================")
    print("1. REAL KNOWLEDGE GRAPH INPUT (From topic_linker.py)")
    print("=======================================================")
    printable_kg = {
        "nodes": [{"id": n["id"], "name": n["name"], "sources": n["sources"]} for n in real_knowledge_graph["nodes"]],
        "edges": real_knowledge_graph["edges"]
    }
    print(json.dumps(printable_kg, indent=2))

    node_names = [n["name"] for n in real_knowledge_graph["nodes"]]

    # 2. Simulate User Learning Activity (Mix of Weak, Developing, Strong & Unwatched)
    now = datetime.now(timezone.utc)
    ten_days_ago = now - timedelta(days=10)

    user_id = "user_synth_101"

    # User history containing node names from real knowledge graph
    user_quiz_history = []
    user_watch_history = []

    if len(node_names) >= 4:
        # Topic 1: Weak (Score 45%, Overdue review 10 days ago)
        user_quiz_history.append({"topic": node_names[0], "score": 0.45, "timestamp": ten_days_ago.isoformat()})
        user_watch_history.append({"video_id": clean_v1.video_id, "topic": node_names[0], "watch_time_sec": 300.0, "duration_sec": 300.0})

        # Topic 2: Developing (Score 78%)
        user_quiz_history.append({"topic": node_names[1], "score": 0.78, "timestamp": now.isoformat()})
        user_watch_history.append({"video_id": clean_v1.video_id, "topic": node_names[1], "watch_time_sec": 300.0, "duration_sec": 300.0})

        # Topic 3: Strong (Score 95%)
        user_quiz_history.append({"topic": node_names[2], "score": 0.95, "timestamp": now.isoformat()})
        user_watch_history.append({"video_id": clean_v1.video_id, "topic": node_names[2], "watch_time_sec": 300.0, "duration_sec": 300.0})

        # Topic 4: Not Covered (Unwatched / No Quiz)

    print("\n=======================================================")
    print("2. USER LEARNING ACTIVITY INPUT")
    print("=======================================================")
    print("User Quiz History:", json.dumps(user_quiz_history, indent=2))
    print("User Watch History:", json.dumps(user_watch_history, indent=2))

    # 3. Track Topic Mastery
    mastery = track_topic_mastery(
        user_id=user_id,
        quiz_history=user_quiz_history,
        watch_history=user_watch_history,
        knowledge_graph=real_knowledge_graph
    )

    # Printable mastery dict
    printable_mastery = {}
    for t_name, m in mastery.items():
        printable_mastery[t_name] = {
            "status": m["status"],
            "avg_score": m["avg_score"],
            "watch_completion_pct": m["watch_completion_pct"],
            "last_reviewed": m["last_reviewed"].isoformat() if isinstance(m["last_reviewed"], datetime) else str(m["last_reviewed"])
        }

    print("\n=======================================================")
    print("3. TRACK TOPIC MASTERY OUTPUT")
    print("=======================================================")
    print(json.dumps(printable_mastery, indent=2))

    # 4. Spaced Repetition Next Review Calculation
    weak_topic_name = node_names[0]
    weak_mastery = mastery[weak_topic_name]

    # Calculate review on retry failure vs success
    next_due_fail = calculate_next_review(weak_topic_name, dict(weak_mastery), last_score=0.40)
    next_due_success = calculate_next_review(weak_topic_name, dict(weak_mastery), last_score=0.88)

    print("\n=======================================================")
    print("4. SPACED REPETITION SCHEDULER OUTPUT")
    print("=======================================================")
    print(f"Topic: '{weak_topic_name}'")
    print(f"  - On Review Failure (Score 40%): Interval reset to 1 day ➜ Next Due: {next_due_fail.isoformat()}")
    print(f"  - On Review Success (Score 88%): Interval increased ➜ Next Due: {next_due_success.isoformat()}")

    # 5. Generate Study Plan (Adaptive Mode)
    study_plan_adaptive = generate_study_plan(
        user_id=user_id,
        topic_mastery=mastery,
        knowledge_graph=real_knowledge_graph,
        target_topics=None
    )

    print("\n=======================================================")
    print("5. ADAPTIVE STUDY PLAN OUTPUT (No Target Topics Given)")
    print("=======================================================")
    print(json.dumps(study_plan_adaptive, indent=2))

    # 6. Generate Study Plan (Target Topics Mode)
    target_topic_name = node_names[-1]
    study_plan_target = generate_study_plan(
        user_id=user_id,
        topic_mastery=mastery,
        knowledge_graph=real_knowledge_graph,
        target_topics=[target_topic_name]
    )

    print("\n=======================================================")
    print(f"6. TARGETED STUDY PLAN OUTPUT (Target: '{target_topic_name}')")
    print("=======================================================")
    print(json.dumps(study_plan_target, indent=2))

    logger.info("=== REAL PERSONALIZED LEARNING ENGINE VERIFICATION COMPLETE ===")


if __name__ == "__main__":
    run_real_learning_engine_verification()
