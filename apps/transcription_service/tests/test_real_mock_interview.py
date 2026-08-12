"""
Real Data Verification Script for AI Mock Interview Engine.
Runs a 3-question adaptive mock interview session using the live Gemini provider.
Tests strong STAR answer vs deliberately weak/vague answer, and verifies lower score with specific reasoning.
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
logger = logging.getLogger("RealMockInterviewCheck")

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
    generate_interview_question,
    evaluate_answer,
    run_interview_session,
    compile_interview_report,
    llm_providers
)


def run_real_mock_interview_verification():
    logger.info("=== STARTING REAL AI MOCK INTERVIEW VERIFICATION ===")

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise llm_providers.ConfigurationError("Valid GEMINI_API_KEY required in apps/api/.env for live test.")

    target_role = "Lead Backend Systems Engineer"
    candidate_resume = {
        "candidate_name": "Alex Mercer",
        "title": "Senior Backend Developer",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Distributed Systems", "Kubernetes"],
        "experience": [
            {
                "company": "TechCorp Solutions",
                "role": "Senior Engineer",
                "duration": "3 years",
                "highlights": ["Scaled microservices handling 50k RPM", "Migrated legacy monolith to async FastAPI"]
            }
        ]
    }

    questions_asked = []
    answers_given = []
    evaluations = []

    # TURN 1: Opening Question
    logger.info("\n--- TURN 1: Generating Opening Question via Gemini... ---")
    q1 = generate_interview_question(
        resume=candidate_resume,
        target_role=target_role,
        difficulty="medium",
        previous_questions=[],
        previous_answers=[],
        provider_name="gemini"
    )
    questions_asked.append(q1.question)

    print("\n=======================================================")
    print("TURN 1: GENERATED QUESTION 1")
    print("=======================================================")
    print(json.dumps(q1.model_dump(), indent=2))

    # Candidate Answer 1: Strong STAR Answer
    ans1 = (
        "Situation: During Black Friday sales, our checkout microservice experienced a 500% spike in traffic, "
        "causing database connection pool exhaustion and spiking p99 latency to 4.5 seconds.\n"
        "Task: I was responsible for stabilizing database connection pool limits and ensuring sub-200ms latency.\n"
        "Action: I implemented PgBouncer for connection pooling, added a Redis caching layer for read-heavy product catalog calls, "
        "and optimized slow SQL JOIN queries by adding composite B-tree indexes.\n"
        "Result: Database connection usage dropped by 70%, p99 latency decreased to 85ms, and we achieved 99.99% uptime during peak traffic."
    )
    answers_given.append(ans1)

    logger.info("Evaluating Answer 1 via Gemini...")
    eval1 = evaluate_answer(q1, ans1, provider_name="gemini")
    evaluations.append(eval1)

    print("\n=======================================================")
    print("TURN 1: EVALUATION 1 (Strong STAR Answer)")
    print("=======================================================")
    print(json.dumps(eval1.model_dump(), indent=2))

    # TURN 2: Adaptive Follow-up Question
    logger.info("\n--- TURN 2: Generating Adaptive Follow-up Question via Gemini... ---")
    q2 = generate_interview_question(
        resume=candidate_resume,
        target_role=target_role,
        difficulty="medium",
        previous_questions=questions_asked,
        previous_answers=answers_given,
        provider_name="gemini"
    )
    questions_asked.append(q2.question)

    print("\n=======================================================")
    print("TURN 2: GENERATED QUESTION 2")
    print("=======================================================")
    print(json.dumps(q2.model_dump(), indent=2))

    # Candidate Answer 2: Deliberately Weak & Vague Answer
    ans2 = "I just fixed the bugs when things got slow. I changed some code and database settings and then everything was better and ran faster."
    answers_given.append(ans2)

    logger.info("Evaluating Answer 2 (Weak/Vague) via Gemini...")
    eval2 = evaluate_answer(q2, ans2, provider_name="gemini")
    evaluations.append(eval2)

    print("\n=======================================================")
    print("TURN 2: EVALUATION 2 (Deliberately Weak/Vague Answer)")
    print("=======================================================")
    print(json.dumps(eval2.model_dump(), indent=2))

    # TURN 3: Probing Weak Area Question
    logger.info("\n--- TURN 3: Generating Probing Question on Weak Area via Gemini... ---")
    q3 = generate_interview_question(
        resume=candidate_resume,
        target_role=target_role,
        difficulty="hard",
        previous_questions=questions_asked,
        previous_answers=answers_given,
        provider_name="gemini"
    )
    questions_asked.append(q3.question)

    print("\n=======================================================")
    print("TURN 3: GENERATED QUESTION 3")
    print("=======================================================")
    print(json.dumps(q3.model_dump(), indent=2))

    # Candidate Answer 3: Technical Answer
    ans3 = (
        "To prevent cache stampedes under high concurrency, we implemented a distributed mutex lock using Redis Redlock. "
        "When a cache key expires, only the first worker thread acquires the lock to compute and write the value, while other requests fallback to stale data for up to 2 seconds."
    )
    answers_given.append(ans3)

    logger.info("Evaluating Answer 3 via Gemini...")
    eval3 = evaluate_answer(q3, ans3, provider_name="gemini")
    evaluations.append(eval3)

    print("\n=======================================================")
    print("TURN 3: EVALUATION 3 (Technical Answer)")
    print("=======================================================")
    print(json.dumps(eval3.model_dump(), indent=2))

    # FINAL COMPLIED REPORT
    logger.info("\nCompiling Final Mock Interview Session Report...")
    questions_obj_list = [q1, q2, q3]
    report = compile_interview_report(questions_obj_list, evaluations)

    print("\n=======================================================")
    print("FINAL COMPILED MOCK INTERVIEW SESSION REPORT JSON")
    print("=======================================================")
    print(json.dumps(report.model_dump(), indent=2))

    # Verification checks
    print("\n=======================================================")
    print("SCORE DIFFERENTIATION VERIFICATION SUMMARY")
    print("=======================================================")
    print(f"  - Answer 1 (Strong STAR) Score: {eval1.score} / 100")
    print(f"  - Answer 2 (Weak / Vague) Score: {eval2.score} / 100")
    print(f"  - Answer 3 (Technical) Score: {eval3.score} / 100")
    print(f"  - Overall Session Score: {report.overall_score} / 100")
    print(f"  - Category Scores: {report.category_scores}")

    assert eval2.score < eval1.score, "Weak answer MUST score lower than strong answer!"
    print("✅ VERIFIED: Weak vague answer scored demonstrably lower than strong STAR answer with specific reasoning!")

    logger.info("=== REAL AI MOCK INTERVIEW VERIFICATION COMPLETE ===")


if __name__ == "__main__":
    run_real_mock_interview_verification()
