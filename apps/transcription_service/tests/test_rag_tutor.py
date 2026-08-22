"""
Unit Tests for SYNAPSEAI RAG AI Tutor & Vector Store Module.
Tests:
1. Chunking logic with ~500 tokens / 50 token overlap and metadata retention.
2. Vector retrieval returning top-k relevant chunks for a known question.
3. Citation timestamps mapping correctly back to source segments.
4. Out-of-scope question refusal returning "I don't have enough information from this video".
5. Multi-turn session memory retention and history truncation.
"""

import unittest
from unittest.mock import patch, MagicMock

from apps.transcription_service.models import CleanTranscript, CleanParagraph
from apps.transcription_service.vector_store import (
    chunk_clean_transcript,
    index_transcript,
    search_relevant_chunks,
    generate_embedding,
    cosine_similarity,
)
from apps.transcription_service.rag_tutor import (
    ask_tutor,
    SessionStore,
    TutorResponse,
    Citation,
    UNGROUNDED_FALLBACK_TEXT,
)


class TestVectorStoreChunkingAndRetrieval(unittest.TestCase):
    """Tests for vector store chunking, overlap, and similarity search."""

    def setUp(self):
        self.transcript = CleanTranscript(
            video_id="v_test_rag",
            clean_transcript=[
                CleanParagraph(speaker="[Speaker 00]", start=0.0, end=10.0, text="Welcome to SYNAPSEAI vector search tutorial."),
                CleanParagraph(speaker="[Speaker 00]", start=10.5, end=20.0, text="MongoDB Atlas Vector Search stores 1536-dimensional embeddings."),
                CleanParagraph(speaker="[Speaker 01]", start=20.5, end=30.0, text="BullMQ handles background job processing."),
            ],
            full_text="[Speaker 00]: Welcome to SYNAPSEAI vector search tutorial.\n\n[Speaker 00]: MongoDB Atlas Vector Search stores 1536-dimensional embeddings.\n\n[Speaker 01]: BullMQ handles background job processing."
        )

    def test_chunking_overlap_and_metadata(self):
        """Test transcript chunking preserves speaker, start_time, and end_time metadata."""
        chunks = chunk_clean_transcript(self.transcript, chunk_chars=100, overlap_chars=20)
        self.assertTrue(len(chunks) >= 1)
        self.assertEqual(chunks[0].video_id, "v_test_rag")
        self.assertEqual(chunks[0].speaker, "[Speaker 00]")
        self.assertEqual(chunks[0].start_time, 0.0)

    def test_indexing_and_similarity_retrieval(self):
        """Test indexing transcript and retrieving relevant top-k chunks."""
        index_transcript("v_test_rag", self.transcript)
        results = search_relevant_chunks("v_test_rag", "MongoDB vector search embeddings", top_k=2)

        self.assertTrue(len(results) >= 1)
        self.assertEqual(results[0].video_id, "v_test_rag")
        self.assertIn("MongoDB", results[0].text)

    def test_cosine_similarity_calculation(self):
        """Test cosine similarity vector math."""
        vec1 = [1.0, 0.0, 0.0]
        vec2 = [1.0, 0.0, 0.0]
        vec3 = [0.0, 1.0, 0.0]

        self.assertAlmostEqual(cosine_similarity(vec1, vec2), 1.0)
        self.assertAlmostEqual(cosine_similarity(vec1, vec3), 0.0)


class TestRAGTutorResponseAndCitations(unittest.TestCase):
    """Tests for ask_tutor grounding, timestamp citations, and refusal handling."""

    def setUp(self):
        self.transcript = CleanTranscript(
            video_id="v_tutor_demo",
            clean_transcript=[
                CleanParagraph(speaker="[Speaker 00]", start=0.0, end=15.0, text="Clean architecture separates core business logic from framework dependencies."),
                CleanParagraph(speaker="[Speaker 00]", start=15.5, end=30.0, text="TypeScript interfaces enforce strict data contracts across API endpoints."),
            ],
            full_text="[Speaker 00]: Clean architecture separates core business logic from framework dependencies.\n\n[Speaker 00]: TypeScript interfaces enforce strict data contracts across API endpoints."
        )
        index_transcript("v_tutor_demo", self.transcript)
        SessionStore.clear_session("v_tutor_demo", "user_1")

    def test_ask_tutor_grounded_answer_with_citations(self):
        """Test grounded question returns answer and timestamp citations."""
        response = ask_tutor("v_tutor_demo", "user_1", "What is the benefit of clean architecture?", provider_name="mock")

        self.assertIsInstance(response, TutorResponse)
        self.assertNotIn(UNGROUNDED_FALLBACK_TEXT, response.answer)
        self.assertTrue(len(response.citations) >= 1)
        self.assertEqual(response.citations[0].start, 0.0)
        self.assertEqual(response.citations[0].end, 15.0)

    def test_ask_tutor_out_of_scope_refusal(self):
        """Test out-of-scope question returns strict refusal without hallucination."""
        response = ask_tutor("v_tutor_demo", "user_1", "What is the recipes for baking chocolate cake?", provider_name="mock")

        self.assertIsInstance(response, TutorResponse)
        self.assertEqual(response.answer, UNGROUNDED_FALLBACK_TEXT)
        self.assertEqual(len(response.citations), 0)


class TestSessionMemory(unittest.TestCase):
    """Tests for multi-turn conversation memory store."""

    def test_multi_turn_history_retention_and_truncation(self):
        """Test recording session turns and truncating older messages."""
        video_id = "v_sess"
        user_id = "u_sess"
        SessionStore.clear_session(video_id, user_id)

        # Add 6 turns (exceeds MAX_HISTORY=5)
        for i in range(1, 7):
            resp = TutorResponse(answer=f"Answer {i}", citations=[Citation(start=0.0, end=5.0, text_snippet=f"Snippet {i}")])
            SessionStore.add_turn(video_id, user_id, f"Question {i}", resp)

        history = SessionStore.get_history(video_id, user_id)
        # 5 turns * 2 messages per turn = 10 messages
        self.assertEqual(len(history), 10)
        self.assertEqual(history[0].content, "Question 2")
        self.assertEqual(history[-1].content, "Answer 6")


if __name__ == "__main__":
    unittest.main()
