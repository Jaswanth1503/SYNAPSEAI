"""
Unit tests for Entity Extraction, Graph Merging, and Topic Recommendation ML module (topic_linker.py).
"""

import unittest
from apps.transcription_service import (
    extract_topics,
    merge_into_graph,
    recommend_next_topic,
    CleanTranscript,
    CleanParagraph,
)


class TestTopicLinker(unittest.TestCase):
    def setUp(self):
        self.transcript = CleanTranscript(
            video_id="v_topics_1",
            duration_sec=60.0,
            segments=[
                CleanParagraph(speaker="[Speaker 00]", start=0.0, end=30.0, text="Kubernetes manages Docker container clusters."),
                CleanParagraph(speaker="[Speaker 00]", start=30.0, end=60.0, text="PyTorch trains neural network models.")
            ],
            full_text="Kubernetes manages Docker container clusters. PyTorch trains neural network models."
        )

    def test_extract_topics(self):
        topics = extract_topics(self.transcript, provider_name="mock")
        self.assertIsInstance(topics, list)
        self.assertGreater(len(topics), 0)
        for t in topics:
            self.assertIn("name", t)
            self.assertIn("embedding", t)
            self.assertEqual(t["video_id"], "v_topics_1")
            self.assertIn(len(t["embedding"]), [768, 1536, 3072])

    def test_merge_into_graph_new_nodes_and_edges(self):
        from apps.transcription_service.vector_store import generate_embedding
        topics = [
            {"name": "Kubernetes Clusters", "video_id": "v1", "embedding": generate_embedding("Kubernetes Clusters")},
            {"name": "Docker Containers", "video_id": "v1", "embedding": generate_embedding("Docker Containers")},
            {"name": "PyTorch Models", "video_id": "v1", "embedding": generate_embedding("PyTorch Models")}
        ]

        graph = merge_into_graph(topics, existing_graph=None, similarity_threshold=0.85, related_threshold=0.60)
        self.assertIn("nodes", graph)
        self.assertIn("edges", graph)
        self.assertGreater(len(graph["nodes"]), 0)

        # Merge identical topic into existing graph
        topic_duplicate = [{"name": "Kubernetes Clusters", "video_id": "v2", "embedding": generate_embedding("Kubernetes Clusters")}]
        updated_graph = merge_into_graph(topic_duplicate, existing_graph=graph, similarity_threshold=0.85)

        # Node count should remain same, sources list should append 'v2'
        self.assertEqual(len(updated_graph["nodes"]), len(graph["nodes"]))
        k8s_node = next(n for n in updated_graph["nodes"] if "Kubernetes" in n["name"])
        self.assertIn("v1", k8s_node["sources"])
        self.assertIn("v2", k8s_node["sources"])

    def test_recommend_next_topic(self):
        graph = {
            "nodes": [
                {"id": "node_1", "name": "Kubernetes", "sources": ["v1"]},
                {"id": "node_2", "name": "Docker", "sources": ["v1"]},
                {"id": "node_3", "name": "Helm Charts", "sources": ["v2"]},
                {"id": "node_4", "name": "PyTorch", "sources": ["v3"]}
            ],
            "edges": [
                {"from": "node_1", "to": "node_2", "type": "related_to"},
                {"from": "node_1", "to": "node_3", "type": "related_to"}
            ]
        }

        # User scored poorly on Kubernetes (score 0.40) and well on Docker (score 0.90)
        user_history = [
            {"topic": "Kubernetes", "score": 0.40},
            {"topic": "Docker", "score": 0.90}
        ]

        recommendations = recommend_next_topic(user_history, graph)
        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)
        # Should recommend 'Helm Charts' (neighbor of weak topic 'Kubernetes' not yet mastered)
        self.assertIn("Helm Charts", recommendations)


if __name__ == "__main__":
    unittest.main()
