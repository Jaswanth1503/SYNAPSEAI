"""
SYNAPSEAI Transcription, Cleaning, Content Generation & RAG AI Tutor Suite.
"""

from .transcriber import transcribe
from .cleaner import clean_transcript
from .content_generator import generate_content, generate_content_async
from .vector_store import index_transcript, search_relevant_chunks, semantic_search, TranscriptChunk
from .rag_tutor import ask_tutor, TutorResponse, Citation, SessionStore, ChatMessage
from .visual_classifier import classify_visual, classify_visual_batch
from .topic_linker import extract_topics, merge_into_graph, recommend_next_topic
from .learning_engine import (
    track_topic_mastery,
    generate_study_plan,
    calculate_next_review,
    QuizResult,
    WatchEvent,
)
from .coaching_analyzer import (
    transcribe_speech,
    analyze_speech_metrics,
    analyze_confidence,
    analyze_visual_signals,
    compile_report,
)
from .models import (
    TranscriptResult,
    Segment,
    CleanTranscript,
    CleanParagraph,
    TranscriptionError,
)
from .content_models import (
    SummaryArtifact,
    NotesArtifact,
    FlashcardsArtifact,
    QuizArtifact,
    MindMapArtifact,
    RoadmapArtifact,
    VisualClassification,
)

__all__ = [
    "transcribe",
    "clean_transcript",
    "generate_content",
    "generate_content_async",
    "index_transcript",
    "search_relevant_chunks",
    "semantic_search",
    "classify_visual",
    "classify_visual_batch",
    "extract_topics",
    "merge_into_graph",
    "recommend_next_topic",
    "track_topic_mastery",
    "generate_study_plan",
    "calculate_next_review",
    "QuizResult",
    "WatchEvent",
    "transcribe_speech",
    "analyze_speech_metrics",
    "analyze_confidence",
    "analyze_visual_signals",
    "compile_report",
    "ask_tutor",
    "TranscriptChunk",
    "TutorResponse",
    "Citation",
    "SessionStore",
    "ChatMessage",
    "TranscriptResult",
    "Segment",
    "CleanTranscript",
    "CleanParagraph",
    "TranscriptionError",
    "SummaryArtifact",
    "NotesArtifact",
    "FlashcardsArtifact",
    "QuizArtifact",
    "MindMapArtifact",
    "RoadmapArtifact",
    "VisualClassification",
]
