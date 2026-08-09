"""
Personalized Learning Engine for SYNAPSEAI.
Tracks topic mastery, generates adaptive study plans based on knowledge graph relationships,
and computes simplified SM-2 spaced-repetition review schedules.
"""

import math
import logging
from typing import List, Dict, Any, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


@dataclass
class QuizResult:
    """Represents a completed quiz score for a specific topic."""
    topic: str
    score: float  # Normalized 0.0 to 1.0 (or 0.0 to 100.0)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class WatchEvent:
    """Represents video watch completion signal for a topic/video."""
    video_id: str
    topic: Optional[str] = None
    watch_time_sec: float = 0.0
    duration_sec: float = 1.0
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


def _normalize_score(score: float) -> float:
    """Ensures score is a float in range 0.0 to 1.0."""
    score_val = float(score)
    if score_val > 1.0:
        return score_val / 100.0
    return max(0.0, min(1.0, score_val))


def track_topic_mastery(
    user_id: str,
    quiz_history: List[Any],
    watch_history: List[Any],
    knowledge_graph: Optional[Dict[str, Any]] = None
) -> Dict[str, Dict[str, Any]]:
    """
    1. track_topic_mastery(user_id, quiz_history, watch_history) -> Dict[str, TopicMastery]
       Aggregates quiz scores & watch completion per topic label matching node names in knowledge_graph.
       Classifies topics into: 'weak' (<70%), 'developing' (70-85%), 'strong' (>85%), or 'not_covered'.
    """
    topic_quiz_scores: Dict[str, List[float]] = {}
    topic_timestamps: Dict[str, datetime] = {}
    topic_watch_pcts: Dict[str, List[float]] = {}

    # Map video_id to topics if knowledge_graph is provided
    video_to_topics: Dict[str, List[str]] = {}
    known_topics: Set[str] = set()

    if knowledge_graph and "nodes" in knowledge_graph:
        for node in knowledge_graph["nodes"]:
            t_name = node["name"]
            known_topics.add(t_name)
            for src_vid in node.get("sources", []):
                video_to_topics.setdefault(src_vid, []).append(t_name)

    # Process Watch History
    for w in watch_history:
        w_topic = getattr(w, "topic", None) or (w.get("topic") if isinstance(w, dict) else None)
        w_vid = getattr(w, "video_id", None) or (w.get("video_id") if isinstance(w, dict) else None)
        w_time = float(getattr(w, "watch_time_sec", 0.0) if hasattr(w, "watch_time_sec") else w.get("watch_time_sec", 0.0))
        w_dur = float(getattr(w, "duration_sec", 1.0) if hasattr(w, "duration_sec") else w.get("duration_sec", 1.0)) or 1.0
        pct = min(1.0, max(0.0, w_time / w_dur))

        target_topics = []
        if w_topic:
            target_topics.append(w_topic)
        elif w_vid and w_vid in video_to_topics:
            target_topics.extend(video_to_topics[w_vid])

        for t in target_topics:
            known_topics.add(t)
            topic_watch_pcts.setdefault(t, []).append(pct)

    # Process Quiz History
    for q in quiz_history:
        q_topic = getattr(q, "topic", None) or (q.get("topic") if isinstance(q, dict) else None)
        q_score = getattr(q, "score", None) if hasattr(q, "score") else (q.get("score") if isinstance(q, dict) else None)
        q_time = getattr(q, "timestamp", None) or (q.get("timestamp") if isinstance(q, dict) else None)

        if not q_time:
            q_time = datetime.now(timezone.utc)
        elif isinstance(q_time, str):
            try:
                q_time = datetime.fromisoformat(q_time)
            except ValueError:
                q_time = datetime.now(timezone.utc)

        if q_topic and q_score is not None:
            norm_score = _normalize_score(q_score)
            known_topics.add(q_topic)
            topic_quiz_scores.setdefault(q_topic, []).append(norm_score)

            if q_topic not in topic_timestamps or q_time > topic_timestamps[q_topic]:
                topic_timestamps[q_topic] = q_time

    # Calculate Topic Mastery per Topic
    mastery_report: Dict[str, Dict[str, Any]] = {}

    for topic_name in sorted(known_topics):
        scores = topic_quiz_scores.get(topic_name, [])
        watch_list = topic_watch_pcts.get(topic_name, [])
        avg_score = float(sum(scores) / len(scores)) if scores else 0.0
        avg_watch_pct = float(sum(watch_list) / len(watch_list)) if watch_list else 0.0
        last_rev = topic_timestamps.get(topic_name, datetime.now(timezone.utc))

        # Classification logic
        if not scores and avg_watch_pct < 0.70:
            status = "not_covered"
        elif avg_score < 0.70:
            status = "weak"
        elif avg_score <= 0.85:
            status = "developing"
        else:
            status = "strong"

        mastery_report[topic_name] = {
            "status": status,
            "avg_score": round(avg_score, 4),
            "last_reviewed": last_rev,
            "watch_completion_pct": round(avg_watch_pct, 4),
            "repetitions": len(scores),
            "interval_days": 1 if status == "weak" else (3 if status == "developing" else 7)
        }

    return mastery_report


def calculate_next_review(
    topic: str,
    current_mastery: Dict[str, Any],
    last_score: Optional[float] = None
) -> datetime:
    """
    3. calculate_next_review(topic, current_mastery, last_score) -> datetime
       Simplified SM-2 Spaced Repetition algorithm:
       - Interval increases on correct review (last_score >= 0.70).
       - Interval resets to 1 day on review failure (last_score < 0.70).
       Returns the datetime when the topic is due for review.
    """
    last_rev = current_mastery.get("last_reviewed")
    if isinstance(last_rev, str):
        try:
            last_rev = datetime.fromisoformat(last_rev)
        except ValueError:
            last_rev = datetime.now(timezone.utc)
    elif not isinstance(last_rev, datetime):
        last_rev = datetime.now(timezone.utc)

    repetitions = int(current_mastery.get("repetitions", 0))
    interval_days = int(current_mastery.get("interval_days", 1))

    if last_score is not None:
        score_val = _normalize_score(last_score)
        if score_val < 0.70:
            # Failure: reset interval
            repetitions = 0
            interval_days = 1
        else:
            # Success: increase interval SM-2 style
            if repetitions == 0:
                interval_days = 1
                repetitions = 1
            elif repetitions == 1:
                interval_days = 3
                repetitions = 2
            else:
                interval_days = max(1, int(round(interval_days * 2.5)))
                repetitions += 1

    # Update in place if dictionary reference passed
    current_mastery["repetitions"] = repetitions
    current_mastery["interval_days"] = interval_days
    next_due = last_rev + timedelta(days=interval_days)
    current_mastery["next_review_due"] = next_due

    return next_due


def generate_study_plan(
    user_id: str,
    topic_mastery: Dict[str, Dict[str, Any]],
    knowledge_graph: Dict[str, Any],
    target_topics: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    2. generate_study_plan(user_id, topic_mastery, knowledge_graph, target_topics=None) -> StudyPlan
       - If target_topics given: finds shortest path through knowledge graph from user's strong topics to target, ordering prerequisite topics first.
       - If no target given: prioritizes (a) weak/overdue topics (>7 days since review), (b) not_covered topics connected to strong topics.
       Returns:
       { "user_id": str, "plan": [{ "topic": str, "reason": "review"|"next_step"|"prerequisite", "priority": int, "suggested_content": List[str] }] }
    """
    nodes = knowledge_graph.get("nodes", [])
    edges = knowledge_graph.get("edges", [])

    node_map = {n["name"]: n for n in nodes}
    name_to_sources = {n["name"]: list(n.get("sources", [])) for n in nodes}

    plan_items: List[Dict[str, Any]] = []
    added_topics: Set[str] = set()

    # Mode 1: Target Topics Mode (Prerequisite Chain Path)
    if target_topics:
        for target in target_topics:
            if target not in node_map and target not in added_topics:
                # Add target if not in node_map directly
                plan_items.append({
                    "topic": target,
                    "reason": "next_step",
                    "suggested_content": name_to_sources.get(target, [])
                })
                added_topics.add(target)
                continue

            # Graph traversal to find prerequisite chain to target
            prereqs = _find_prerequisites(target, node_map, edges, topic_mastery)
            for pr in prereqs:
                if pr not in added_topics:
                    m_status = topic_mastery.get(pr, {}).get("status", "not_covered")
                    reason = "prerequisite" if m_status != "strong" else "review"
                    plan_items.append({
                        "topic": pr,
                        "reason": reason,
                        "suggested_content": name_to_sources.get(pr, [])
                    })
                    added_topics.add(pr)

            if target not in added_topics:
                plan_items.append({
                    "topic": target,
                    "reason": "next_step",
                    "suggested_content": name_to_sources.get(target, [])
                })
                added_topics.add(target)

    # Mode 2: Adaptive Prioritization Mode (Weak/Overdue Review + Natural Next Steps)
    else:
        now = datetime.now(timezone.utc)

        # (a) Weak and Developing Topics Due for Review (Overdue > 7 days ranked higher)
        review_candidates = []
        for topic_name, mastery in topic_mastery.items():
            status = mastery.get("status")
            if status in ("weak", "developing"):
                last_rev = mastery.get("last_reviewed")
                if isinstance(last_rev, str):
                    try:
                        last_rev = datetime.fromisoformat(last_rev)
                    except ValueError:
                        last_rev = now
                elif not isinstance(last_rev, datetime):
                    last_rev = now

                days_since_rev = (now - last_rev).total_seconds() / 86400.0
                is_overdue = days_since_rev >= 7.0
                score = mastery.get("avg_score", 0.0)

                # Priority score: overdue & low score get highest rank
                rank_score = (100.0 if is_overdue else 0.0) + (1.0 - score) * 50.0
                review_candidates.append((rank_score, topic_name))

        review_candidates.sort(key=lambda x: x[0], reverse=True)
        for _, topic_name in review_candidates:
            if topic_name not in added_topics:
                plan_items.append({
                    "topic": topic_name,
                    "reason": "review",
                    "suggested_content": name_to_sources.get(topic_name, [])
                })
                added_topics.add(topic_name)

        # (b) Not Covered Topics Connected to Strong/Developing Topics (Natural Next Steps)
        strong_topics = {t for t, m in topic_mastery.items() if m.get("status") in ("strong", "developing")}
        next_step_candidates = set()

        for edge in edges:
            u_node = next((n for n in nodes if n["id"] == edge["from"]), None)
            v_node = next((n for n in nodes if n["id"] == edge["to"]), None)
            if u_node and v_node:
                u_name, v_name = u_node["name"], v_node["name"]
                if u_name in strong_topics and topic_mastery.get(v_name, {}).get("status") == "not_covered":
                    next_step_candidates.add(v_name)
                elif v_name in strong_topics and topic_mastery.get(u_name, {}).get("status") == "not_covered":
                    next_step_candidates.add(u_name)

        for topic_name in sorted(next_step_candidates):
            if topic_name not in added_topics:
                plan_items.append({
                    "topic": topic_name,
                    "reason": "next_step",
                    "suggested_content": name_to_sources.get(topic_name, [])
                })
                added_topics.add(topic_name)

        # (c) Fallback: Remaining Uncovered Topics
        for node in nodes:
            t_name = node["name"]
            if t_name not in added_topics:
                m_status = topic_mastery.get(t_name, {}).get("status", "not_covered")
                if m_status == "not_covered":
                    plan_items.append({
                        "topic": t_name,
                        "reason": "next_step",
                        "suggested_content": name_to_sources.get(t_name, [])
                    })
                    added_topics.add(t_name)

    # Assign 1-based sequential priority
    final_plan = []
    for idx, item in enumerate(plan_items):
        final_plan.append({
            "topic": item["topic"],
            "reason": item["reason"],
            "priority": idx + 1,
            "suggested_content": item["suggested_content"]
        })

    return {
        "user_id": user_id,
        "plan": final_plan
    }


def _find_prerequisites(
    target_topic: str,
    node_map: Dict[str, Dict[str, Any]],
    edges: List[Dict[str, Any]],
    topic_mastery: Dict[str, Dict[str, Any]]
) -> List[str]:
    """Helper function to find prerequisite topics for target using graph edges."""
    if target_topic not in node_map:
        return []

    target_id = node_map[target_topic]["id"]
    id_to_name = {n["id"]: n["name"] for n in node_map.values()}

    # Graph BFS traversal
    visited = set()
    queue = [target_id]
    prereq_ids = []

    while queue:
        curr = queue.pop(0)
        if curr in visited:
            continue
        visited.add(curr)

        for edge in edges:
            if edge["to"] == curr and edge["from"] not in visited:
                prereq_ids.append(edge["from"])
                queue.append(edge["from"])

    prereqs = [id_to_name[pid] for pid in reversed(prereq_ids) if pid in id_to_name]
    return prereqs
