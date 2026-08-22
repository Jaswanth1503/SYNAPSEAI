"""
Unit tests for AI Project Idea Generator (project_generator.py).
Validates difficulty alignment, weak topic reinforcement, pairwise vector de-duplication filtering,
and project build roadmap generation.
"""

import unittest
from apps.transcription_service import (
    generate_project_ideas,
    generate_project_roadmap,
    ProjectIdea,
    ProjectRoadmap,
)
from apps.transcription_service.project_generator import _filter_duplicate_ideas


class TestProjectGenerator(unittest.TestCase):

    def test_pairwise_deduplication_filtering(self):
        idea1 = ProjectIdea(
            title="Financial Portfolio API & Analytics Service",
            description="Build a REST API to fetch stock price data and compute portfolio returns using pandas.",
            skills_reinforced=["APIs", "authentication"],
            difficulty="intermediate",
            estimated_time="8 hours",
            key_features=["JWT auth", "Stock prices"],
            stretch_goals=["Redis cache"]
        )

        idea2_duplicate = ProjectIdea(
            title="Financial Portfolio API and Analytics Service",
            description="Build a REST API to fetch stock price data and compute portfolio returns using pandas.",
            skills_reinforced=["APIs", "authentication"],
            difficulty="intermediate",
            estimated_time="8 hours",
            key_features=["JWT auth", "Stock prices"],
            stretch_goals=["Redis cache"]
        )

        idea3_distinct = ProjectIdea(
            title="Automated Real-Estate Mortgage Calculator CLI",
            description="A command line tool calculating monthly amortization schedules and export to CSV.",
            skills_reinforced=["Python", "Math"],
            difficulty="intermediate",
            estimated_time="4 hours",
            key_features=["CLI prompts", "CSV export"],
            stretch_goals=["Plot graphs"]
        )

        ideas_batch = [idea1, idea2_duplicate, idea3_distinct]
        filtered = _filter_duplicate_ideas(ideas_batch, threshold=0.85)

        # Should filter out idea2_duplicate, keeping idea1 and idea3_distinct
        self.assertEqual(len(filtered), 2)
        self.assertEqual(filtered[0].title, idea1.title)
        self.assertEqual(filtered[1].title, idea3_distinct.title)

    def test_generate_project_ideas_mock(self):
        user_skills = ["Python", "pandas"]
        weak_topics = ["APIs", "authentication"]
        interests = ["finance"]

        ideas = generate_project_ideas(
            user_skills=user_skills,
            weak_topics=weak_topics,
            interests=interests,
            target_difficulty="intermediate",
            count=2,
            provider_name="mock"
        )

        self.assertIsInstance(ideas, list)
        self.assertGreater(len(ideas), 0)
        for idea in ideas:
            self.assertIsInstance(idea, ProjectIdea)
            self.assertEqual(idea.difficulty, "intermediate")

    def test_generate_project_roadmap_mock(self):
        idea = ProjectIdea(
            title="Financial Portfolio API & Analytics Service",
            description="Build a REST API to fetch stock price data, compute portfolio returns using pandas, and authenticate users.",
            skills_reinforced=["APIs", "authentication"],
            difficulty="intermediate",
            estimated_time="8-10 hours",
            key_features=["JWT authentication", "Stock price endpoint", "Pandas analytics"],
            stretch_goals=["OAuth2 integration", "Cache analytics in Redis"]
        )

        roadmap = generate_project_roadmap(idea, provider_name="mock")
        self.assertIsInstance(roadmap, ProjectRoadmap)
        self.assertGreater(len(roadmap.steps), 0)
        self.assertEqual(roadmap.steps[0].order, 1)


if __name__ == "__main__":
    unittest.main()
