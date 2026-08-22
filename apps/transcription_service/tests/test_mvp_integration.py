"""
MVP Integration Test Harness for SYNAPSEAI.
Validates end-to-end pipeline (Transcription Engine -> Content Intelligence -> RAG Tutor)
against 4 MVP success criteria using REAL pipeline calls and REAL LLM providers (no mock fallbacks).
"""

import os
import sys
import time
import json
import logging
from typing import List, Dict, Any, Optional

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from apps.transcription_service import (
    transcribe,
    clean_transcript,
    generate_content,
    index_transcript,
    ask_tutor,
    TranscriptResult,
    Segment,
    CleanTranscript,
    CleanParagraph,
    SummaryArtifact,
    NotesArtifact,
    FlashcardsArtifact,
    QuizArtifact,
    MindMapArtifact,
    RoadmapArtifact,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MVPIntegrationTest")

LOGS_DIR = os.path.join(os.path.dirname(__file__), "integration_logs")
os.makedirs(LOGS_DIR, exist_ok=True)


def load_env_file():
    """Loads environment variables from .env files if present."""
    possible_paths = [
        os.path.join(PROJECT_ROOT, ".env"),
        os.path.join(PROJECT_ROOT, "apps", "api", ".env"),
    ]
    for env_path in possible_paths:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and v and k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass


def run_mvp_integration_harness():
    """Main execution entrypoint for the MVP Integration Test Harness."""
    logger.info("==================================================================")
    logger.info("🚀 STARTING SYNAPSEAI MVP INTEGRATION TEST HARNESS (REAL EXECUTION)")
    logger.info("==================================================================")

    load_env_file()

    # Startup API Key Validation (Requirement 5)
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not gemini_key or gemini_key in ("your_gemini_api_key_here", "dummy_gemini_key"):
        logger.error("❌ CRITICAL CONFIGURATION ERROR: GEMINI_API_KEY is not set or is set to a placeholder.")
        logger.error("Set a valid Gemini API key in your environment/.env file before running the MVP integration test harness.")
        sys.exit(1)

    test_sources = [
        {
            "id": "yt_demo_video",
            "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "type": "youtube",
            "in_scope_questions": [
                "What will the singer never do to you?",
                "How long have they known each other?",
                "What are you full of according to the lyrics?",
                "What do we both know about the rules?",
                "What will the singer never make you do?"
            ],
            "out_of_scope_questions": [
                "What is the capital of France?",
                "How do you bake a chocolate chip cookie?",
                "Who won the 1998 World Cup?",
                "What is the distance to Jupiter?",
                "How do you fix an engine oil leak?"
            ]
        }
    ]

    report_list = []

    for item in test_sources:
        video_id = item["id"]
        logger.info(f"\n--- Testing Video Source: '{video_id}' ({item['url']}) ---")

        # -------------------------------------------------------------------
        # Stage 1: Transcription Engine (REAL Execution, NO Mock Fallbacks)
        # -------------------------------------------------------------------
        t_start_total = time.time()

        t0 = time.time()
        # MUST call transcribe() directly without try/except mock substitution
        raw_result = transcribe(item["url"], source_type=item["type"])
        t_transcription = time.time() - t0

        t0 = time.time()
        clean_result = clean_transcript(raw_result, glossary=["Kubernetes", "PyTorch", "TypeScript"])
        t_cleaning = time.time() - t0

        # -------------------------------------------------------------------
        # Stage 2: Content Generation Intelligence (REAL LLM Provider)
        # -------------------------------------------------------------------
        t0 = time.time()
        content_result = generate_content(clean_result)
        t_content_gen = time.time() - t0

        t_end_pipeline = time.time()
        total_pipeline_sec = t_end_pipeline - t_start_total

        # Safety Check: Total pipeline timing validation
        if total_pipeline_sec < 1.0:
            logger.warning(f"⚠️ Total pipeline time was surprisingly short ({total_pipeline_sec:.3f}s). Verifying if real calls were executed.")

        # -------------------------------------------------------------------
        # Stage 3: RAG Tutor Indexing & Q&A (REAL LLM Provider)
        # -------------------------------------------------------------------
        t0 = time.time()
        index_transcript(clean_result.video_id, clean_result)
        t_indexing = time.time() - t0

        t0 = time.time()
        # Warmup call
        _ = ask_tutor(clean_result.video_id, "test_user", "What is discussed?")
        t_rag_tutor = time.time() - t0

        # -------------------------------------------------------------------
        # Save Raw Logs for Manual Inspection (Requirement 1)
        # -------------------------------------------------------------------
        raw_log_path = os.path.join(LOGS_DIR, f"raw_log_{video_id}.json")
        raw_log_data = {
            "video_id": video_id,
            "raw_transcript": raw_result.to_dict(),
            "clean_transcript": clean_result.to_dict(),
            "content_artifacts": content_result,
        }
        with open(raw_log_path, "w", encoding="utf-8") as f:
            json.dump(raw_log_data, f, indent=2)
        logger.info(f"💾 Raw outputs logged to: {raw_log_path}")

        # -------------------------------------------------------------------
        # 1. Latency Check (Requirement 2)
        # -------------------------------------------------------------------
        duration = max(clean_result.duration_sec, 60.0)
        target_max_sec = max(30.0, (duration / 1800.0) * 300.0)
        latency_target_met = total_pipeline_sec <= target_max_sec

        latency_report = {
            "total_sec": round(total_pipeline_sec, 2),
            "target_max_sec": round(target_max_sec, 2),
            "target_met": latency_target_met,
            "stage_breakdown": {
                "transcription_sec": round(t_transcription, 3),
                "cleaning_sec": round(t_cleaning, 3),
                "content_generation_sec": round(t_content_gen, 3),
                "indexing_sec": round(t_indexing, 3),
                "rag_tutor_sec": round(t_rag_tutor, 3),
            }
        }

        # -------------------------------------------------------------------
        # 2. Schema Validation Rate (Requirement 3)
        # Configurable via SCHEMA_TEST_RUNS env var (default: 15)
        # -------------------------------------------------------------------
        schema_failures = []
        valid_runs = 0
        try:
            total_schema_runs = max(1, int(os.environ.get("SCHEMA_TEST_RUNS", "15")))
        except ValueError:
            total_schema_runs = 15

        logger.info(f"Testing Schema Validation across {total_schema_runs} real generation runs...")
        for run_idx in range(total_schema_runs):
            try:
                time.sleep(1.0)
                artifact_batch = generate_content(clean_result)
                # Validate Pydantic Schemas
                SummaryArtifact.model_validate(artifact_batch["summary"])
                NotesArtifact.model_validate(artifact_batch["notes"])
                FlashcardsArtifact.model_validate(artifact_batch["flashcards"])
                QuizArtifact.model_validate(artifact_batch["quiz"])
                MindMapArtifact.model_validate(artifact_batch["mind_map"])
                RoadmapArtifact.model_validate(artifact_batch["roadmap"])
                valid_runs += 1
            except Exception as val_err:
                schema_failures.append({
                    "run_index": run_idx,
                    "error": str(val_err)
                })

        pass_rate = (valid_runs / total_schema_runs) * 100.0
        schema_target_met = pass_rate >= 95.0

        schema_report = {
            "pass_rate": round(pass_rate, 2),
            "target_met": schema_target_met,
            "valid_runs": valid_runs,
            "total_runs": total_schema_runs,
            "failures": schema_failures,
        }

        # -------------------------------------------------------------------
        # 3. Grounding & Citation Check (Requirement 4: 10 questions)
        # -------------------------------------------------------------------
        grounding_failures = []
        correct_questions = 0
        total_questions = len(item["in_scope_questions"]) + len(item["out_of_scope_questions"])

        # Test In-Scope Questions
        for q in item["in_scope_questions"]:
            resp = ask_tutor(clean_result.video_id, "user_harness", q)
            has_citations = len(resp.citations) > 0
            timestamps_valid = False
            if has_citations:
                timestamps_valid = all(0.0 <= c.start <= c.end <= (duration + 10.0) for c in resp.citations)

            if has_citations and timestamps_valid and resp.answer != "I don't have enough information from this video":
                correct_questions += 1
            else:
                grounding_failures.append({
                    "question": q,
                    "type": "in_scope",
                    "reason": "Missing citations or invalid timestamp range",
                    "answer": resp.answer,
                    "citations": [c.to_dict() for c in resp.citations]
                })

        # Test Out-Of-Scope Questions
        for q in item["out_of_scope_questions"]:
            resp = ask_tutor(clean_result.video_id, "user_harness", q)
            is_refused = "I don't have enough information from this video" in resp.answer or resp.answer == "I don't have enough information from this video"
            empty_citations = len(resp.citations) == 0

            if is_refused and empty_citations:
                correct_questions += 1
            else:
                grounding_failures.append({
                    "question": q,
                    "type": "out_of_scope",
                    "reason": "Failed to refuse ungrounded question cleanly",
                    "answer": resp.answer,
                    "citations": [c.to_dict() for c in resp.citations]
                })

        grounding_target_met = correct_questions == total_questions
        grounding_report = {
            "correct": correct_questions,
            "total": total_questions,
            "target_met": grounding_target_met,
            "failed_questions": grounding_failures,
        }

        # -------------------------------------------------------------------
        # 4. Cache Effectiveness Check (Requirement 5)
        # -------------------------------------------------------------------
        cache_store = {}
        cache_hits = []

        def harness_cache_lookup(h, types):
            if h in cache_store:
                cache_hits.append(h)
                return cache_store[h]
            return None

        def harness_cache_write(h, data):
            cache_store[h] = data

        # First call: Cache miss, writes to cache_store
        res1 = generate_content(clean_result, cache_lookup=harness_cache_lookup, cache_write=harness_cache_write)
        # Second call: Cache hit
        res2 = generate_content(clean_result, cache_lookup=harness_cache_lookup, cache_write=harness_cache_write)

        cache_hit_met = len(cache_hits) > 0 and res1 == res2
        cache_report = {
            "hit_on_second_call": cache_hit_met,
            "cached_content_hash": res1.get("content_hash", "")
        }

        # -------------------------------------------------------------------
        # Compile Video Report Object (Requirement 6)
        # -------------------------------------------------------------------
        video_report = {
            "video": item["url"],
            "video_id": video_id,
            "latency": latency_report,
            "schema_validity": schema_report,
            "grounding": grounding_report,
            "cache": cache_report,
            "overall_pass": (
                latency_target_met and
                schema_target_met and
                grounding_target_met and
                cache_hit_met
            )
        }
        report_list.append(video_report)

    # -----------------------------------------------------------------------
    # Output Final Summary Reports (Console + Saved Files)
    # -----------------------------------------------------------------------
    report_json_path = os.path.join(LOGS_DIR, "mvp_integration_report.json")
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report_list, f, indent=2)

    logger.info("\n==================================================================")
    logger.info("📊 SYNAPSEAI MVP INTEGRATION TEST HARNESS REPORT (REAL)")
    logger.info("==================================================================")
    for rep in report_list:
        logger.info(f"Video: {rep['video']}")
        logger.info(f"  Overall Status: {'✅ PASSED' if rep['overall_pass'] else '❌ FAILED'}")
        logger.info(f"  1. Latency Target Met (<300s): {rep['latency']['target_met']} (Total: {rep['latency']['total_sec']}s)")
        logger.info(f"     Breakdown: {rep['latency']['stage_breakdown']}")
        logger.info(f"  2. Schema Validity Target Met (>95%): {rep['schema_validity']['target_met']} ({rep['schema_validity']['pass_rate']}%)")
        logger.info(f"  3. Grounding Target Met (100%): {rep['grounding']['target_met']} ({rep['grounding']['correct']}/{rep['grounding']['total']})")
        logger.info(f"  4. Cache Effectiveness Met: {rep['cache']['hit_on_second_call']}")

    logger.info(f"\n📄 Saved full report JSON to: {report_json_path}")
    return report_list


if __name__ == "__main__":
    run_mvp_integration_harness()
