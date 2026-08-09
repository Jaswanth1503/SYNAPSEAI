"""
Unit tests for Personalized Learning Engine (learning_engine.py).
Validates mastery classification thresholds, SM-2 spaced repetition interval resets/progression,
and prerequisite-aware study plan generation.
"""

import unittest
from datetime import datetime, timedelta, timezone
from apps.transcription_service import (
    track_topic_mastery,
    generate_study_plan,
    calculate_next_review,
    QuizResult,
    WatchEvent,
)


class TestLearningEngine(unittest.TestCase):
    def setUp(self):
        self.now = datetime.now(timezone.utc)
        self.mock_graph = {
            "nodes": [
                {"id": "n1", "name": "Python Basics", "sources": ["v1"]},
                {"id": "n2", "name": "Control Flow Loops", "sources": ["v1", "v2"]},
                {"id": "n3", "name": "Functions & Modules", "sources": ["v2"]},
                {"id": "n4", "name": "Object-Oriented Programming", "sources": ["v3"]}
            ],
            "edges": [
                {"from": "n1", "to": "n2", "type": "related_to"},
                {"from": "n2", "to": "n3", "type": "related_to"},
                {"from": "n3", "to": "n4", "type": "related_to"}
            ]
        }

    def test_mastery_classification_thresholds(self):
        quiz_history = [
            QuizResult(topic="Python Basics", score=0.92),  # >85% -> strong
            QuizResult(topic="Control Flow Loops", score=0.78),  # 70-85% -> developing
            QuizResult(topic="Functions & Modules", score=0.45),  # <70% -> weak
        ]
        watch_history = [
            WatchEvent(video_id="v1", topic="Python Basics", watch_time_sec=100.0, duration_sec=100.0),
            WatchEvent(video_id="v2", topic="Object-Oriented Programming", watch_time_sec=10.0, duration_sec=100.0) # unwatched/low
        ]

        mastery = track_topic_mastery("u1", quiz_history, watch_history, knowledge_graph=self.mock_graph)

        self.assertEqual(mastery["Python Basics"]["status"], "strong")
        self.assertEqual(mastery["Control Flow Loops"]["status"], "developing")
        self.assertEqual(mastery["Functions & Modules"]["status"], "weak")
        self.assertEqual(mastery["Object-Oriented Programming"]["status"], "not_covered")
        self.assertEqual(mastery["Python Basics"]["watch_completion_pct"], 1.0)

    def test_spaced_repetition_progression_and_reset(self):
        topic = "Control Flow Loops"
        mastery = {
            "last_reviewed": self.now,
            "repetitions": 0,
            "interval_days": 1
        }

        # First successful review (score 0.80) -> repetitions 1, interval 1 day
        due1 = calculate_next_review(topic, mastery, last_score=0.80)
        self.assertEqual(mastery["repetitions"], 1)
        self.assertEqual(mastery["interval_days"], 1)

        # Second successful review (score 0.85) -> repetitions 2, interval 3 days
        due2 = calculate_next_review(topic, mastery, last_score=0.85)
        self.assertEqual(mastery["repetitions"], 2)
        self.assertEqual(mastery["interval_days"], 3)

        # Third successful review -> repetitions 3, interval int(round(3 * 2.5)) = 8 days
        due3 = calculate_next_review(topic, mastery, last_score=0.90)
        self.assertEqual(mastery["repetitions"], 3)
        self.assertEqual(mastery["interval_days"], 8)

        # Failed review (score 0.40) -> reset repetitions 0, interval 1 day
        due_fail = calculate_next_review(topic, mastery, last_score=0.40)
        self.assertEqual(mastery["repetitions"], 0)
        self.assertEqual(mastery["interval_days"], 1)

    def test_study_plan_target_mode_prerequisites(self):
        mastery = {
            "Python Basics": {"status": "strong", "avg_score": 0.95},
            "Control Flow Loops": {"status": "developing", "avg_score": 0.75},
            "Functions & Modules": {"status": "weak", "avg_score": 0.40},
            "Object-Oriented Programming": {"status": "not_covered", "avg_score": 0.0}
        }

        # User targets 'Object-Oriented Programming'
        plan = generate_study_plan("u1", mastery, self.mock_graph, target_topics=["Object-Oriented Programming"])
        items = plan["plan"]

        self.assertGreater(len(items), 0)
        topic_order = [item["topic"] for item in items]

        # Prerequisite 'Functions & Modules' must appear before target 'Object-Oriented Programming'
        func_idx = topic_order.index("Functions & Modules")
        oop_idx = topic_order.index("Object-Oriented Programming")
        self.assertLess(func_idx, oop_idx)

        # Check reason tags
        self.assertIn(items[func_idx]["reason"], ["prerequisite", "review"])
        self.assertEqual(items[oop_idx]["reason"], "next_step")
        self.assertEqual(items[oop_idx]["suggested_content"], ["v3"])

    def test_study_plan_adaptive_mode(self):
        past_date = self.now - timedelta(days=10)
        mastery = {
            "Python Basics": {"status": "strong", "avg_score": 0.95, "last_reviewed": self.now},
            "Control Flow Loops": {"status": "weak", "avg_score": 0.40, "last_reviewed": past_date}, # Overdue weak topic
            "Functions & Modules": {"status": "not_covered", "avg_score": 0.0, "last_reviewed": self.now}
        }

        plan = generate_study_plan("u1", mastery, self.mock_graph, target_topics=None)
        items = plan["plan"]

        self.assertGreater(len(items), 0)
        # Highest priority should be weak overdue topic 'Control Flow Loops'
        first_item = items[0]
        self.assertEqual(first_item["topic"], "Control Flow Loops")
        self.assertEqual(first_item["reason"], "review")
        self.assertEqual(first_item["priority"], 1)


if __name__ == "__main__":
    unittest.main()
