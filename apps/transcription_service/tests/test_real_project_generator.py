"""
Real Data Verification Script for AI Project Idea Generator.
Runs generate_project_ideas with real user input using live Gemini provider,
prints all 5 generated ideas, displays pairwise vector similarity matrix (<0.85),
and outputs generate_project_roadmap step breakdown.
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
logger = logging.getLogger("RealProjectGenCheck")

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
    generate_project_ideas,
    generate_project_roadmap,
    llm_providers
)
from apps.transcription_service.vector_store import generate_embedding, cosine_similarity


def run_real_project_generator_verification():
    logger.info("=== STARTING REAL AI PROJECT IDEA GENERATOR VERIFICATION ===")

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise llm_providers.ConfigurationError("Valid GEMINI_API_KEY required in apps/api/.env for live test.")

    user_skills = ["Python", "pandas"]
    weak_topics = ["APIs", "authentication"]
    interests = ["finance"]
    target_difficulty = "intermediate"

    logger.info("1. Generating 5 personalized project ideas via live Gemini Provider...")
    ideas = generate_project_ideas(
        user_skills=user_skills,
        weak_topics=weak_topics,
        interests=interests,
        target_difficulty=target_difficulty,
        count=5,
        provider_name="gemini"
    )

    print("\n=======================================================")
    print("1. GENERATED 5 PERSONALIZED PROJECT IDEAS")
    print("=======================================================")
    for idx, idea in enumerate(ideas):
        print(f"\n--- [Idea {idx+1}] {idea.title} ---")
        print(json.dumps(idea.model_dump(), indent=2))

    # 2. Pairwise Cosine Similarity Verification
    print("\n=======================================================")
    print("2. PAIRWISE VECTOR SIMILARITY MATRIX (<0.85 Threshold)")
    print("=======================================================")
    idea_embeddings = [generate_embedding(f"{idea.title}: {idea.description}") for idea in ideas]

    max_sim = 0.0
    for i in range(len(ideas)):
        for j in range(i + 1, len(ideas)):
            sim = cosine_similarity(idea_embeddings[i], idea_embeddings[j])
            max_sim = max(max_sim, sim)
            print(f"  - Idea {i+1} (\"{(ideas[i].title)[:25]}...\") vs Idea {j+1} (\"{(ideas[j].title)[:25]}...\") ➜ Similarity: {sim:.4f}")

    print(f"\nMaximum Pairwise Similarity in Batch: {max_sim:.4f}")
    assert max_sim < 0.85, f"Pairwise similarity should be strictly < 0.85! Got {max_sim:.4f}"
    print("✅ VERIFIED: All 5 project ideas are genuinely distinct and below the 0.85 similarity threshold!")

    # 3. generate_project_roadmap on Idea #1
    chosen_idea = ideas[0]
    logger.info(f"\n3. Generating build roadmap for Idea #1: '{chosen_idea.title}' via live Gemini Provider...")
    roadmap = generate_project_roadmap(chosen_idea, provider_name="gemini")

    print("\n=======================================================")
    print(f"3. PROJECT BUILD ROADMAP OUTPUT ('{chosen_idea.title}')")
    print("=======================================================")
    print(json.dumps(roadmap.model_dump(), indent=2))

    logger.info("=== REAL AI PROJECT IDEA GENERATOR VERIFICATION COMPLETE ===")


if __name__ == "__main__":
    run_real_project_generator_verification()
