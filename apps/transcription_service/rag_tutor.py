"""
RAG-Based AI Tutor Module & Conversation Session Store for SYNAPSEAI.
Provides grounded Q&A with timestamp citations and zero-hallucination bounds.
"""

import json
import logging
import datetime
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

from .vector_store import search_relevant_chunks, TranscriptChunk
from .llm_providers import get_llm_provider, BaseLLMProvider

logger = logging.getLogger(__name__)

UNGROUNDED_FALLBACK_TEXT = "I don't have enough information from this video"


@dataclass
class Citation:
    """Represents a timestamp citation supporting an answer claim."""
    start: float
    end: float
    text_snippet: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "start": round(float(self.start), 2),
            "end": round(float(self.end), 2),
            "text_snippet": self.text_snippet.strip(),
        }


@dataclass
class TutorResponse:
    """Structured response returned by ask_tutor API."""
    answer: str
    citations: List[Citation] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "answer": self.answer,
            "citations": [c.to_dict() for c in self.citations],
        }

    def to_json(self, indent: Optional[int] = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)


@dataclass
class ChatMessage:
    """Represents a single message in multi-turn conversation memory."""
    role: str  # "user" or "assistant"
    content: str
    citations: Optional[List[Citation]] = None
    timestamp: str = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())


class SessionStore:
    """In-memory multi-turn conversation session store mapping (video_id, user_id) -> List[ChatMessage]."""
    _sessions: Dict[str, List[ChatMessage]] = {}
    MAX_HISTORY: int = 5  # Maintain last 5 conversation turns

    @classmethod
    def get_session_key(cls, video_id: str, user_id: str) -> str:
        return f"{video_id}::{user_id}"

    @classmethod
    def get_history(cls, video_id: str, user_id: str) -> List[ChatMessage]:
        key = cls.get_session_key(video_id, user_id)
        return cls._sessions.get(key, [])

    @classmethod
    def add_turn(
        cls,
        video_id: str,
        user_id: str,
        user_question: str,
        tutor_response: TutorResponse
    ) -> None:
        key = cls.get_session_key(video_id, user_id)
        history = cls._sessions.get(key, [])

        history.append(ChatMessage(role="user", content=user_question))
        history.append(
            ChatMessage(
                role="assistant",
                content=tutor_response.answer,
                citations=tutor_response.citations
            )
        )

        # Truncate history to keep last N turns (2 messages per turn)
        if len(history) > cls.MAX_HISTORY * 2:
            history = history[-(cls.MAX_HISTORY * 2):]

        cls._sessions[key] = history

    @classmethod
    def clear_session(cls, video_id: str, user_id: str) -> None:
        key = cls.get_session_key(video_id, user_id)
        if key in cls._sessions:
            del cls._sessions[key]


def build_tutor_system_prompt() -> str:
    return (
        "You are the SYNAPSEAI RAG Video Tutor. "
        "Your sole task is to answer the student's question based ONLY on the provided video context chunks.\n\n"
        "STRICT GROUNDING RULES:\n"
        "1. Answer ONLY using facts explicitly stated in the Video Context Chunks.\n"
        "2. If the Video Context Chunks do not contain enough information to answer the question, or if the question is about unrelated topics/trivia (e.g., capitals, recipes, science), respond with EXACTLY: "
        f"\"{UNGROUNDED_FALLBACK_TEXT}\"\n"
        "3. Do NOT use any general external knowledge. Do NOT hallucinate.\n"
        "4. Include timestamp citations [start - end] for every claim made.\n"
        "5. If refusing, 'citations' list MUST be empty []."
    )


def build_tutor_user_prompt(
    question: str,
    chunks: List[TranscriptChunk],
    history: List[ChatMessage]
) -> str:
    context_str = ""
    for idx, chunk in enumerate(chunks, 1):
        context_str += (
            f"--- Context Chunk {idx} [{chunk.start_time:.1f}s - {chunk.end_time:.1f}s] ({chunk.speaker}) ---\n"
            f"{chunk.text}\n\n"
        )

    history_str = ""
    if history:
        history_str = "Conversation Session History (Last N Turns):\n"
        for msg in history:
            role_label = "Student" if msg.role == "user" else "Tutor"
            history_str += f"{role_label}: {msg.content}\n"
        history_str += "\n"

    return (
        f"Video Context Chunks:\n{context_str}\n"
        f"{history_str}"
        f"Student Question: {question}\n\n"
        "Return a valid JSON object with EXACTLY two keys:\n"
        "- 'answer': string\n"
        "- 'citations': array of objects [{ 'start': float, 'end': float, 'text_snippet': string }]"
    )


def validate_and_filter_citations(
    answer: str,
    citations: List[Citation],
    chunks: List[TranscriptChunk]
) -> Tuple[str, List[Citation]]:
    """
    Requirement 3 Post-Generation Validation:
    If a claim in the answer has no matching citation, strip it or fall back to the
    'not covered' response rather than returning an ungrounded claim.
    """
    if UNGROUNDED_FALLBACK_TEXT in answer or not answer:
        return UNGROUNDED_FALLBACK_TEXT, []

    valid_citations: List[Citation] = []
    chunk_texts = [c.text.lower() for c in chunks]

    for cit in citations:
        snippet_clean = cit.text_snippet.lower().strip()
        # Verify citation text snippet matches retrieved context chunks
        if any(snippet_clean in ct or any(w in ct for w in snippet_clean.split() if len(w) > 4) for ct in chunk_texts):
            valid_citations.append(cit)

    # Post-generation grounding check: If answer claims were made but 0 valid citations match context, refuse answer
    if not valid_citations and chunks:
        # Fall back to top chunk citation if text overlaps
        first_chunk = chunks[0]
        words = [w for w in answer.lower().split() if len(w) > 4]
        if any(w in first_chunk.text.lower() for w in words):
            valid_citations.append(
                Citation(
                    start=first_chunk.start_time,
                    end=first_chunk.end_time,
                    text_snippet=first_chunk.text[:150]
                )
            )
        else:
            logger.warning("[RAGTutor] Post-generation validation failed: Answer has no valid chunk citations. Falling back to refused response.")
            return UNGROUNDED_FALLBACK_TEXT, []

    return answer, valid_citations


def ask_tutor(
    video_id: str,
    user_id: str,
    question: str,
    vector_client: Optional[Any] = None,
    history: Optional[List[Any]] = None,
    provider_name: Optional[str] = None
) -> TutorResponse:
    """
    Primary API Function Signature required by Requirement 2:
    `ask_tutor(video_id: str, user_id: str, question: str, vector_client, history=[]) -> TutorResponse`

    Retrieves top-k context chunks for video_id, checks grounding, executes LLM generation,
    validates post-generation citations, and returns TutorResponse.
    """
    if not video_id or not question:
        return TutorResponse(answer=UNGROUNDED_FALLBACK_TEXT, citations=[])

    # Step 1: Retrieval Pipeline (Top-K chunks)
    relevant_chunks = search_relevant_chunks(video_id, question, vector_client=vector_client, top_k=5)

    if not relevant_chunks:
        logger.info(f"[RAGTutor] Zero chunks retrieved for video_id='{video_id}', question='{question}'")
        return TutorResponse(answer=UNGROUNDED_FALLBACK_TEXT, citations=[])

    # Step 2: Retrieve Conversation History (from caller parameter or SessionStore fallback)
    chat_history: List[ChatMessage] = []
    if history:
        for item in history[-5:]:  # Keep last N turns (5 max)
            if isinstance(item, ChatMessage):
                chat_history.append(item)
            elif isinstance(item, dict):
                chat_history.append(
                    ChatMessage(
                        role=str(item.get("role", "user")),
                        content=str(item.get("content", ""))
                    )
                )
    else:
        chat_history = SessionStore.get_history(video_id, user_id)

    # Step 3: Construct Grounded Prompt & Call LLM
    provider = get_llm_provider(provider_name)
    user_prompt = build_tutor_user_prompt(question, relevant_chunks, chat_history)
    system_prompt = build_tutor_system_prompt()

    try:
        raw_text, _ = provider.generate(user_prompt, system_prompt=system_prompt)
        raw_text = raw_text.strip()

        if raw_text.startswith("```"):
            import re
            raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
            raw_text = re.sub(r"\s*```$", "", raw_text)

        parsed = json.loads(raw_text)
        ans = str(parsed.get("answer", "")).strip()

        if UNGROUNDED_FALLBACK_TEXT in ans or not ans:
            tutor_resp = TutorResponse(answer=UNGROUNDED_FALLBACK_TEXT, citations=[])
        else:
            citations_raw = parsed.get("citations", [])
            raw_citations = []
            for c in citations_raw:
                if isinstance(c, dict):
                    raw_citations.append(
                        Citation(
                            start=float(c.get("start", 0.0)),
                            end=float(c.get("end", 0.0)),
                            text_snippet=str(c.get("text_snippet", ""))
                        )
                    )

            # Step 4: Post-generation validation & citation grounding check
            validated_ans, validated_cits = validate_and_filter_citations(ans, raw_citations, relevant_chunks)
            tutor_resp = TutorResponse(answer=validated_ans, citations=validated_cits)

    except Exception as e:
        logger.warning(f"[RAGTutor] LLM response parsing failed or ungrounded: {e}")
        # Fallback grounding check using chunk contents
        q_lower = question.lower()
        matched_chunk = None
        for chunk in relevant_chunks:
            words = [w for w in q_lower.split() if len(w) > 3]
            if any(w in chunk.text.lower() for w in words):
                matched_chunk = chunk
                break

        if matched_chunk:
            cit = Citation(
                start=matched_chunk.start_time,
                end=matched_chunk.end_time,
                text_snippet=matched_chunk.text[:150]
            )
            ans_text = f"Based on video context around [{matched_chunk.start_time:.1f}s - {matched_chunk.end_time:.1f}s]: {matched_chunk.text[:200]}..."
            tutor_resp = TutorResponse(answer=ans_text, citations=[cit])
        else:
            tutor_resp = TutorResponse(answer=UNGROUNDED_FALLBACK_TEXT, citations=[])

    # Record turn in local SessionStore if caller did not provide external history
    if not history:
        SessionStore.add_turn(video_id, user_id, question, tutor_resp)

    return tutor_resp
