"""
Real Educational Video Knowledge Graph Integration Test Script.
Transcribes two real educational YouTube videos, extracts topics via live Gemini LLM & live 3072-dim neural embeddings,
merges into knowledge graph, and validates node merging (sim >= 0.85) and related_to edge creation (0.60 <= sim < 0.85).
"""

import os
import sys
import time
import json
import logging
from pathlib import Path

# UTF-8 Console output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("EducationalGraphCheck")

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
    transcribe,
    clean_transcript,
    extract_topics,
    merge_into_graph,
    recommend_next_topic,
    llm_providers
)
from apps.transcription_service.vector_store import generate_embedding, cosine_similarity


def run_educational_graph_verification():
    logger.info("=== STARTING REAL EDUCATIONAL KNOWLEDGE GRAPH VERIFICATION ===")

    # 0. Check Gemini Key
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise llm_providers.ConfigurationError("Valid GEMINI_API_KEY required in apps/api/.env for live test.")

    # 1. Fetch 2 Real Educational Technical Videos (Python Tutorials)
    video_1_url = "https://www.youtube.com/watch?v=kqtD5dpn9C8"  # Programming with Mosh: Python Tutorial
    video_2_url = "https://www.youtube.com/watch?v=_uQrJ0TkZlc"  # Fireship: Python in 100 Seconds

    logger.info(f"Transcribing & Cleaning Educational Video 1: {video_1_url}")
    raw_v1 = transcribe(source=video_1_url, source_type="youtube")
    clean_v1 = clean_transcript(raw_v1)
    logger.info(f"Video 1 Cleaned: ID='{clean_v1.video_id}', Duration={clean_v1.duration_sec}s, Paragraphs={len(clean_v1.clean_transcript)}")

    logger.info(f"Transcribing & Cleaning Educational Video 2: {video_2_url}")
    raw_v2 = transcribe(source=video_2_url, source_type="youtube")
    clean_v2 = clean_transcript(raw_v2)
    logger.info(f"Video 2 Cleaned: ID='{clean_v2.video_id}', Duration={clean_v2.duration_sec}s, Paragraphs={len(clean_v2.clean_transcript)}")

    # 2. Extract Topics using Live Gemini Provider & Live 3072-dim Neural Embeddings
    logger.info("\nExtracting topics from Video 1 via Gemini LLM & 3072-dim Neural Embeddings...")
    topics_v1 = extract_topics(clean_v1, provider_name="gemini")
    time.sleep(2.0)

    logger.info("Extracting topics from Video 2 via Gemini LLM & 3072-dim Neural Embeddings...")
    topics_v2 = extract_topics(clean_v2, provider_name="gemini")

    print("\n=======================================================")
    print("3. EXTRACTED EDUCATIONAL TOPICS")
    print("=======================================================")

    print(f"\n--- Video 1 Topics (ID: '{clean_v1.video_id}') ---")
    for idx, t in enumerate(topics_v1):
        print(f"  [{idx + 1}] \"{t['name']}\" (Embedding dim: {len(t['embedding'])})")

    print(f"\n--- Video 2 Topics (ID: '{clean_v2.video_id}') ---")
    for idx, t in enumerate(topics_v2):
        print(f"  [{idx + 1}] \"{t['name']}\" (Embedding dim: {len(t['embedding'])})")

    # 3. Print Cross-Video Similarity Matrix
    print("\n=======================================================")
    print("CROSS-VIDEO TOPIC SIMILARITY MATRIX")
    print("=======================================================")
    print("Pairwise cosine similarity matrix between Video 1 & Video 2 topic embeddings:")

    similarity_matches = []
    for t1 in topics_v1:
        for t2 in topics_v2:
            sim = cosine_similarity(t1["embedding"], t2["embedding"])
            similarity_matches.append((sim, t1["name"], t2["name"]))
            print(f"  - \"{t1['name']}\" vs \"{t2['name']}\" => Cosine Similarity: {sim:.4f}")

    similarity_matches.sort(key=lambda x: x[0], reverse=True)

    # 4. Execute Merge into Graph
    logger.info("\nConstructing Graph from Video 1 topics...")
    graph_1 = merge_into_graph(topics_v1, existing_graph=None, similarity_threshold=0.85, related_threshold=0.60)

    logger.info("Merging Video 2 topics into Graph 1...")
    merged_graph = merge_into_graph(topics_v2, existing_graph=graph_1, similarity_threshold=0.85, related_threshold=0.60)

    # Clean printable graph JSON
    printable_graph = {
        "nodes": [{"id": n["id"], "name": n["name"], "sources": n["sources"]} for n in merged_graph["nodes"]],
        "edges": merged_graph["edges"]
    }

    print("\n=======================================================")
    print("4. FULL RESULTING MERGED KNOWLEDGE GRAPH JSON")
    print("=======================================================")
    print(json.dumps(printable_graph, indent=2))

    # 5. Core Correctness Analysis
    print("\n=======================================================")
    print("5. CORE CORRECTNESS & EDGE CREATION ANALYSIS")
    print("=======================================================")

    merged_nodes_multi_source = [n for n in merged_graph["nodes"] if len(n["sources"]) > 1]
    print(f"\n[A] Multi-Source Merged Nodes (sim >= 0.85): {len(merged_nodes_multi_source)}")
    for n in merged_nodes_multi_source:
        print(f"  ✅ Node ID: '{n['id']}' | Name: \"{n['name']}\" | Sources: {n['sources']}")

    edges_created = merged_graph["edges"]
    print(f"\n[B] Related Edges Created (0.60 <= sim < 0.85): {len(edges_created)}")
    for e in edges_created:
        src_node = next((n for n in merged_graph["nodes"] if n["id"] == e["from"]), None)
        target_node = next((n for n in merged_graph["nodes"] if n["id"] == e["to"]), None)
        src_name = src_node["name"] if src_node else e["from"]
        tgt_name = target_node["name"] if target_node else e["to"]
        print(f"  🔗 Edge: '{src_name}' ({e['from']}) --[{e['type']}]--> '{tgt_name}' ({e['to']})")

    # 6. Recommendation Verification
    if merged_graph["nodes"]:
        weak_topic_name = merged_graph["nodes"][0]["name"]
        mastered_topic_name = merged_graph["nodes"][-1]["name"] if len(merged_graph["nodes"]) > 1 else ""

        quiz_history = [{"topic": weak_topic_name, "score": 0.40}]
        if mastered_topic_name:
            quiz_history.append({"topic": mastered_topic_name, "score": 0.92})

        recs = recommend_next_topic(quiz_history, merged_graph)
        print("\n--- Next Topic Recommendations ---")
        print(f"Quiz Input (Weak Topic: \"{weak_topic_name}\"):")
        print(f"Recommended Suggestions: {json.dumps(recs, indent=2)}")

    logger.info("=== REAL EDUCATIONAL KNOWLEDGE GRAPH VERIFICATION COMPLETE ===")


if __name__ == "__main__":
    run_educational_graph_verification()
