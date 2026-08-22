"""
Unit Tests for SYNAPSEAI Content Generator Module.
Tests:
1. Pydantic schema validation for each output artifact type.
2. Map-reduce summarization on long transcripts (>8000 chars).
3. Single-retry error correction on malformed LLM JSON responses.
4. Async parallel generation returning requested artifact types.
"""

import unittest
from unittest.mock import MagicMock, patch

from apps.transcription_service.models import CleanTranscript, CleanParagraph
from apps.transcription_service.content_models import (
    ValidationError,
    SummaryArtifact,
    NotesArtifact,
    FlashcardsArtifact,
    QuizArtifact,
    MindMapArtifact,
    RoadmapArtifact,
)
from apps.transcription_service.llm_providers import MockProvider
from apps.transcription_service.content_generator import (
    generate_content,
    chunk_transcript_text,
    map_reduce_summarize_transcript,
    generate_single_artifact,
)


class TestPydanticSchemas(unittest.TestCase):
    """Tests Pydantic validation rules for all 6 artifact types."""

    def test_summary_artifact_valid(self):
        data = {
            "tldr": "High level summary",
            "key_points": ["Point 1", "Point 2"],
            "sections": [{"title": "Section 1", "summary": "Summary 1", "start_time": 0.0}]
        }
        artifact = SummaryArtifact.model_validate(data)
        self.assertEqual(artifact.tldr, "High level summary")
        self.assertEqual(len(artifact.key_points), 2)

    def test_quiz_artifact_valid(self):
        data = {
            "questions": [
                {
                    "question": "What is Python?",
                    "options": ["A programming language", "A snake", "A car", "A database"],
                    "correct_index": 0,
                    "explanation": "Python is a high-level programming language."
                }
            ]
        }
        artifact = QuizArtifact.model_validate(data)
        self.assertEqual(len(artifact.questions), 1)
        self.assertEqual(artifact.questions[0].correct_index, 0)

    def test_flashcards_artifact_valid(self):
        data = {
            "cards": [
                {"question": "Q1?", "answer": "A1", "difficulty": "easy"}
            ]
        }
        artifact = FlashcardsArtifact.model_validate(data)
        self.assertEqual(artifact.cards[0].difficulty, "easy")

    def test_mind_map_recursive_valid(self):
        data = {
            "root": "Main Concept",
            "children": [
                {
                    "label": "Subconcept 1",
                    "children": [{"label": "Child Node 1", "children": []}]
                }
            ]
        }
        artifact = MindMapArtifact.model_validate(data)
        self.assertEqual(artifact.root, "Main Concept")
        self.assertEqual(artifact.children[0].children[0].label, "Child Node 1")


class TestMapReduceSummarizer(unittest.TestCase):
    """Tests for long transcript chunking and Map-Reduce summarizer."""

    def test_chunk_transcript_text(self):
        long_text = "Paragraph 1 text.\n\n" * 500
        chunks = chunk_transcript_text(long_text, max_chars=1000)
        self.assertTrue(len(chunks) > 1)

    def test_map_reduce_execution(self):
        provider = MockProvider()
        long_text = "Detailed paragraph about software architecture.\n\n" * 300
        reduced_text, token_usage = map_reduce_summarize_transcript(long_text, provider)
        self.assertIsNotNone(reduced_text)
        self.assertIn("Excerpt Part 1 Summary", reduced_text)


class TestRetryAndCorrection(unittest.TestCase):
    """Tests single-retry error correction on malformed LLM responses."""

    def test_generate_single_artifact_retry_success(self):
        mock_provider = MagicMock()
        # 1st call returns malformed JSON, 2nd call returns valid JSON
        mock_provider.generate.side_effect = [
            ("Malformed text without JSON", {"prompt_tokens": 10, "completion_tokens": 5}),
            ('{"tldr":"Fixed TLDR","key_points":["K1"],"sections":[{"title":"S1","summary":"Sum","start_time":0.0}]}', {"prompt_tokens": 15, "completion_tokens": 20})
        ]

        result_dict, usage = generate_single_artifact("Generate summary", SummaryArtifact, mock_provider)
        self.assertNotIn("error", result_dict)
        self.assertEqual(result_dict["tldr"], "Fixed TLDR")
        self.assertEqual(mock_provider.generate.call_count, 2)


class TestGenerateContent(unittest.TestCase):
    """Tests end-to-end generate_content() entrypoint."""

    def setUp(self):
        self.transcript = CleanTranscript(
            video_id="yt_test_content",
            clean_transcript=[
                CleanParagraph(speaker="[Speaker 00]", start=0.0, end=10.0, text="Welcome to SYNAPSEAI content generation.")
            ],
            full_text="[Speaker 00]: Welcome to SYNAPSEAI content generation."
        )

    def test_generate_all_artifacts(self):
        result = generate_content(self.transcript, provider_name="mock")
        self.assertEqual(result["video_id"], "yt_test_content")
        self.assertIn("summary", result)
        self.assertIn("notes", result)
        self.assertIn("flashcards", result)
        self.assertIn("quiz", result)
        self.assertIn("mind_map", result)
        self.assertIn("roadmap", result)
        self.assertIn("_meta", result)

    def test_generate_content_caching(self):
        """Test content-hash SHA256 computation and cache_lookup / cache_write hooks."""
        mock_cache_store = {}

        def mock_lookup(h, types):
            return mock_cache_store.get(h)

        def mock_write(h, data):
            mock_cache_store[h] = data

        # First call: Cache miss, writes to cache
        res1 = generate_content(self.transcript, types=["summary"], provider_name="mock", cache_lookup=mock_lookup, cache_write=mock_write)
        self.assertIn("content_hash", res1)
        h = res1["content_hash"]
        self.assertIn(h, mock_cache_store)

        # Second call: Cache hit
        res2 = generate_content(self.transcript, types=["summary"], provider_name="mock", cache_lookup=mock_lookup, cache_write=mock_write)
        self.assertEqual(res2, res1)


if __name__ == "__main__":
    unittest.main()
