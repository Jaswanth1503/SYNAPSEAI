"""
Unit tests for Part A (Visualization Classifier) and Part B (Semantic Search) ML utilities.
"""

import unittest
from apps.transcription_service import (
    classify_visual,
    classify_visual_batch,
    semantic_search,
    index_transcript,
    CleanTranscript,
    CleanParagraph,
    TranscriptChunk,
    VisualClassification,
)


class TestVisualizationClassifier(unittest.TestCase):
    def test_classify_visual_mock_provider(self):
        chunk = TranscriptChunk(
            chunk_id="c1",
            video_id="v1",
            text="Here we see a flowchart depicting step 1 and step 2 of the algorithm.",
            start_time=0.0,
            end_time=15.0,
            speaker="[Speaker 00]"
        )
        res = classify_visual(chunk, provider_name="mock")
        self.assertIsInstance(res, VisualClassification)
        self.assertIn(res.type, ["flowchart", "3d_model", "animation", "diagram", "none"])
        self.assertIsInstance(res.needs_visual, bool)
        self.assertIsInstance(res.concept, str)

    def test_classify_visual_batch(self):
        chunks = [
            TranscriptChunk(chunk_id="c1", video_id="v1", text="Process flowchart algorithm.", start_time=0.0, end_time=10.0, speaker="[Speaker 00]"),
            TranscriptChunk(chunk_id="c2", video_id="v1", text="3D molecular structure geometry.", start_time=10.0, end_time=20.0, speaker="[Speaker 00]")
        ]
        results = classify_visual_batch(chunks, provider_name="mock")
        self.assertEqual(len(results), 2)
        for r in results:
            self.assertIsInstance(r, VisualClassification)


class TestSemanticSearch(unittest.TestCase):
    def setUp(self):
        t1 = CleanTranscript(
            video_id="v_search_1",
            duration_sec=30.0,
            segments=[
                CleanParagraph(speaker="[Speaker 00]", start=0.0, end=15.0, text="Kubernetes manages containerized microservices deployments."),
                CleanParagraph(speaker="[Speaker 00]", start=15.0, end=30.0, text="PyTorch trains deep neural network learning models.")
            ],
            full_text="Kubernetes manages containerized microservices deployments. PyTorch trains deep neural network learning models."
        )
        t2 = CleanTranscript(
            video_id="v_search_2",
            duration_sec=20.0,
            segments=[
                CleanParagraph(speaker="[Speaker 00]", start=0.0, end=20.0, text="Baking chocolate chip cookies requires flour, sugar, and butter.")
            ],
            full_text="Baking chocolate chip cookies requires flour, sugar, and butter."
        )
        index_transcript("v_search_1", t1)
        index_transcript("v_search_2", t2)

    def test_semantic_search_filtered_by_video_id(self):
        results = semantic_search(query="container Kubernetes", video_id="v_search_1", top_k=5)
        self.assertGreater(len(results), 0)
        item = results[0]
        self.assertIn("text_snippet", item)
        self.assertIn("start", item)
        self.assertIn("end", item)
        self.assertEqual(item["video_id"], "v_search_1")
        self.assertIsInstance(item["score"], float)

    def test_semantic_search_across_all_videos(self):
        results = semantic_search(query="cookies baking", video_id=None, top_k=5)
        self.assertGreater(len(results), 0)
        top_match = results[0]
        self.assertEqual(top_match["video_id"], "v_search_2")

    def test_semantic_search_empty_query(self):
        results = semantic_search(query="", video_id="v_search_1")
        self.assertEqual(results, [])


if __name__ == "__main__":
    unittest.main()
