"""
Entity Extraction & Cross-Document Topic Linking Engine for SYNAPSEAI.
Extracts entities/topics from CleanTranscript, merges them into an adjacency graph with similarity edges,
and provides quiz-history-based next topic recommendations.
"""

import json
import logging
from typing import List, Dict, Any, Optional

from .models import CleanTranscript
from .vector_store import generate_embedding, cosine_similarity
from .llm_providers import get_llm_provider, BaseLLMProvider

logger = logging.getLogger(__name__)

TOPIC_EXTRACTION_PROMPT = (
    "You are an expert educational entity and topic extraction model.\n"
    "Your job is to extract 5 to 10 key technical concepts, topics, tools, architectural patterns, "
    "or domain entities discussed in the transcript.\n\n"
    "STRICT OUTPUT FORMAT:\n"
    "Return a valid JSON object with a single key 'topics' containing an array of strings.\n"
    "Example:\n"
    "{\n"
    "  \"topics\": [\"Kubernetes\", \"Clean Architecture\", \"Docker Containers\", \"PyTorch Models\"]\n"
    "}\n"
)


def extract_topics(
    transcript: CleanTranscript,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> List[Dict[str, Any]]:
    """
    1. extract_topics(transcript: CleanTranscript) -> List[{ name: str, embedding: List[float], video_id: str }]
       Extracts entities/topics using LLM and generates 1536-dim vector embeddings for each topic.
    """
    provider = llm_provider or get_llm_provider(provider_name)
    full_text = str(getattr(transcript, "full_text", ""))
    user_prompt = f"Transcript Full Text:\n\"{full_text[:3000]}\"\n\nExtract key topics into JSON."

    topic_names: List[str] = []
    try:
        raw_resp, _ = provider.generate(user_prompt, system_prompt=TOPIC_EXTRACTION_PROMPT)
        cleaned_json = raw_resp.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.startswith("```"):
            cleaned_json = cleaned_json[3:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        cleaned_json = cleaned_json.strip()

        data = json.loads(cleaned_json)
        topic_names = [str(t).strip() for t in data.get("topics", []) if str(t).strip()]
    except Exception as e:
        logger.warning(f"[TopicLinker] LLM topic extraction failed: {e}. Using keyword fallback.")
        # Fallback topic extraction if LLM fails
        words = transcript.full_text.split()
        keywords = set()
        for w in words:
            clean_w = w.strip(".,!?:;\"'()[]").capitalize()
            if len(clean_w) > 4 and clean_w.isalpha():
                keywords.add(clean_w)
            if len(keywords) >= 5:
                break
        topic_names = list(keywords) or ["Core Learning Concept"]

    extracted_results = []
    for name in topic_names:
        embedding = generate_embedding(name)
        extracted_results.append({
            "name": name,
            "embedding": embedding,
            "video_id": transcript.video_id
        })

    logger.info(f"[TopicLinker] Extracted {len(extracted_results)} topics for video_id='{transcript.video_id}'.")
    return extracted_results


def merge_into_graph(
    new_topics: List[Dict[str, Any]],
    existing_graph: Optional[Dict[str, Any]] = None,
    similarity_threshold: float = 0.85,
    related_threshold: float = 0.60
) -> Dict[str, Any]:
    """
    2. merge_into_graph(new_topics, existing_graph, similarity_threshold=0.85) -> UpdatedGraph
       Compares topic embeddings against existing graph nodes.
       - Above threshold (>=0.85) -> merge into existing node & append source video_id to node's sources[].
       - Below threshold -> create new node. If max similarity > 0.60 -> add a 'related_to' edge.
       Returns plain adjacency graph structure:
       { "nodes": [{ "id": str, "name": str, "sources": List[str] }], "edges": [{ "from": str, "to": str, "type": str }] }
    """
    graph = existing_graph or {"nodes": [], "edges": []}
    nodes = list(graph.get("nodes", []))
    edges = list(graph.get("edges", []))

    for topic in new_topics:
        name = topic["name"]
        video_id = topic.get("video_id", "unknown_video")
        embedding = topic.get("embedding") or generate_embedding(name)

        best_node = None
        max_sim = -1.0

        for node in nodes:
            node_emb = node.get("embedding")
            if not node_emb:
                node_emb = generate_embedding(node["name"])
                node["embedding"] = node_emb

            sim = cosine_similarity(embedding, node_emb)
            if sim > max_sim:
                max_sim = sim
                best_node = node

        if best_node and max_sim >= similarity_threshold:
            # Merge into best_node
            sources = list(best_node.get("sources", []))
            if video_id not in sources:
                sources.append(video_id)
            best_node["sources"] = sources
            logger.info(f"[TopicLinker] Merged '{name}' into existing node '{best_node['name']}' (sim={max_sim:.3f}).")
        else:
            # Create new node
            new_node_id = f"node_{len(nodes) + 1}"
            new_node = {
                "id": new_node_id,
                "name": name,
                "sources": [video_id],
                "embedding": embedding
            }
            nodes.append(new_node)
            logger.info(f"[TopicLinker] Created new node '{name}' (id={new_node_id}).")

            # Add related_to edge if max_sim > related_threshold
            if best_node and max_sim > related_threshold:
                edge_obj = {
                    "from": new_node_id,
                    "to": best_node["id"],
                    "type": "related_to"
                }
                # Check for duplicate edge
                if not any(e["from"] == edge_obj["from"] and e["to"] == edge_obj["to"] for e in edges):
                    edges.append(edge_obj)
                    logger.info(f"[TopicLinker] Added 'related_to' edge from '{name}' to '{best_node['name']}' (sim={max_sim:.3f}).")

    # Clean nodes for handoff (retain id, name, sources)
    clean_nodes = []
    for n in nodes:
        clean_nodes.append({
            "id": n["id"],
            "name": n["name"],
            "sources": list(n.get("sources", [])),
            "embedding": n.get("embedding", [])
        })

    return {
        "nodes": clean_nodes,
        "edges": edges
    }


def recommend_next_topic(
    user_quiz_history: List[Dict[str, Any]],
    knowledge_graph: Dict[str, Any]
) -> List[str]:
    """
    3. recommend_next_topic(user_quiz_history, knowledge_graph) -> List[str]
       Identifies topics with low quiz scores ("weak topics", e.g. score < 0.70 or < 70%),
       finds neighboring nodes in the knowledge graph that the user hasn't covered/mastered yet,
       and returns them as ranked suggestions.
    """
    nodes = knowledge_graph.get("nodes", [])
    edges = knowledge_graph.get("edges", [])

    if not nodes:
        return []

    # Map node name/id to node
    node_map = {n["id"]: n for n in nodes}
    name_to_id = {n["name"].lower(): n["id"] for n in nodes}

    # Identify weak topics and mastered topics
    weak_node_ids = set()
    mastered_node_ids = set()

    for item in user_quiz_history:
        topic_ref = str(item.get("topic", item.get("topic_id", ""))).strip()
        score = float(item.get("score", item.get("accuracy", 0.0)))
        # Normalize score if given as percentage 0-100
        if score > 1.0:
            score = score / 100.0

        target_id = None
        if topic_ref in node_map:
            target_id = topic_ref
        elif topic_ref.lower() in name_to_id:
            target_id = name_to_id[topic_ref.lower()]

        if target_id:
            if score < 0.70:
                weak_node_ids.add(target_id)
            else:
                mastered_node_ids.add(target_id)

    # Find neighboring nodes of weak topics
    candidate_node_ids = set()

    for edge in edges:
        u = edge.get("from")
        v = edge.get("to")

        if u in weak_node_ids and v not in mastered_node_ids and v not in weak_node_ids:
            candidate_node_ids.add(v)
        elif v in weak_node_ids and u not in mastered_node_ids and u not in weak_node_ids:
            candidate_node_ids.add(u)

    # Fallback: If no weak topics or neighbors found, recommend unmastered nodes
    if not candidate_node_ids:
        for n in nodes:
            if n["id"] not in mastered_node_ids:
                candidate_node_ids.add(n["id"])

    # Rank suggestions by node degree (number of connections)
    node_degrees = {nid: 0 for nid in candidate_node_ids}
    for edge in edges:
        u, v = edge.get("from"), edge.get("to")
        if u in node_degrees:
            node_degrees[u] += 1
        if v in node_degrees:
            node_degrees[v] += 1

    sorted_candidates = sorted(candidate_node_ids, key=lambda nid: node_degrees[nid], reverse=True)
    recommendations = [node_map[nid]["name"] for nid in sorted_candidates if nid in node_map]
    return recommendations
