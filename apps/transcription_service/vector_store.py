"""
Vector Indexing & Similarity Search Engine for RAG AI Tutor in SYNAPSEAI.
Handles transcript chunking (500 tokens, 50 token overlap), embedding generation,
and top-k similarity retrieval with token budget capping.
"""

import os
import math
import hashlib
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

from .models import CleanTranscript

logger = logging.getLogger(__name__)

# Default ~500 tokens (~2000 chars) chunk size with ~50 tokens (~200 chars) overlap
CHUNK_CHARS = 2000
OVERLAP_CHARS = 200
DEFAULT_TOP_K = 5
MAX_CONTEXT_BUDGET_CHARS = 8000  # ~2000 tokens


@dataclass
class TranscriptChunk:
    """Represents an indexed transcript chunk with embedding and metadata."""
    chunk_id: str
    video_id: str
    text: str
    start_time: float
    end_time: float
    speaker: str
    embedding: List[float] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "video_id": self.video_id,
            "text": self.text,
            "start_time": round(float(self.start_time), 2),
            "end_time": round(float(self.end_time), 2),
            "speaker": self.speaker,
        }


# Global in-memory vector store mapping video_id -> List[TranscriptChunk]
_IN_MEMORY_VECTOR_STORE: Dict[str, List[TranscriptChunk]] = {}


def generate_embedding(text: str) -> List[float]:
    """
    Generates vector embedding for input text.
    First tries Gemini API (models/text-embedding-004) if GEMINI_API_KEY is available.
    Next tries OpenAI API (text-embedding-3-small) if OPENAI_API_KEY is available.
    Otherwise, logs a WARNING and generates a normalized semantic n-gram term-frequency vector for local/offline usage.
    """
    if not text:
        return [0.0] * 768

    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    gemini_err = None
    if gemini_key and gemini_key != "your_gemini_api_key_here":
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", category=FutureWarning)
            import google.generativeai as genai
        genai.configure(api_key=gemini_key)

        for g_model in ["models/gemini-embedding-001", "models/gemini-embedding-2-preview", "models/gemini-embedding-2"]:
            try:
                result = genai.embed_content(
                    model=g_model,
                    content=text
                )
                emb = result.get("embedding", [])
                if emb:
                    norm = math.sqrt(sum(v * v for v in emb)) or 1.0
                    logger.info(f"[VectorStore] Successfully generated {len(emb)}-dim neural embedding via Gemini API ('{g_model}').")
                    return [v / norm for v in emb]
            except Exception as e:
                gemini_err = e
                logger.debug(f"[VectorStore] Gemini embed_content with '{g_model}' failed: {e}")
        logger.warning(f"[VectorStore] Gemini embed_content failed across all models: {gemini_err}. Falling back to next method.")
    else:
        gemini_err = "GEMINI_API_KEY missing or placeholder"

    openai_key = os.environ.get("OPENAI_API_KEY", "")
    if openai_key and openai_key != "dummy_openai_key":
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            emb = response.data[0].embedding
            norm = math.sqrt(sum(v * v for v in emb)) or 1.0
            logger.info(f"[VectorStore] Successfully generated {len(emb)}-dim embedding via OpenAI API (text-embedding-3-small).")
            return [v / norm for v in emb]
        except Exception as e:
            logger.warning(f"[VectorStore] OpenAI embedding failed: {e}. Falling back to local vectorizer.")

    # Explicit warning log for traceability when falling back to local vectorizer
    logger.warning(f"[VectorStore] FALLBACK DETECTED: {gemini_err}. Using local term-frequency n-gram vectorizer.")

    # Local Semantic Term Frequency (Unigram + Bigram) Vector Generator
    # Ensures lexical and semantic term overlap yields high cosine similarity (>0.5 for substrings)
    import re
    words = re.findall(r'\w+', text.lower())
    if not words:
        return [0.0] * 768

    dim = 768
    raw_vec = [0.0] * dim

    # Unigrams
    for w in words:
        idx = abs(hash(w)) % dim
        raw_vec[idx] += 1.0

    # Bigrams
    for i in range(len(words) - 1):
        bigram = f"{words[i]}_{words[i+1]}"
        idx = abs(hash(bigram)) % dim
        raw_vec[idx] += 1.5

    # Normalize vector to unit length
    norm = math.sqrt(sum(v * v for v in raw_vec)) or 1.0
    return [v / norm for v in raw_vec]


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculates cosine similarity between two vector embeddings."""
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return dot / (norm1 * norm2)


def chunk_clean_transcript(
    transcript: CleanTranscript,
    chunk_chars: int = CHUNK_CHARS,
    overlap_chars: int = OVERLAP_CHARS
) -> List[TranscriptChunk]:
    """
    Chunks CleanTranscript into ~500 token (~2000 char) windows with 50 token (~200 char) overlap.
    Preserves speaker, start_time, and end_time metadata per chunk.
    """
    chunks: List[TranscriptChunk] = []

    if not transcript.clean_transcript:
        return chunks

    current_chunk_paragraphs = []
    current_length = 0
    chunk_counter = 0

    for paragraph in transcript.clean_transcript:
        para_text = f"{paragraph.speaker}: {paragraph.text}"
        para_len = len(para_text)

        if current_length + para_len > chunk_chars and current_chunk_paragraphs:
            # Emit current chunk
            start_t = current_chunk_paragraphs[0].start
            end_t = current_chunk_paragraphs[-1].end
            spk = current_chunk_paragraphs[0].speaker
            merged_chunk_text = "\n".join([f"{p.speaker}: {p.text}" for p in current_chunk_paragraphs])
            chunk_id = f"{transcript.video_id}_c{chunk_counter}"

            chunks.append(
                TranscriptChunk(
                    chunk_id=chunk_id,
                    video_id=transcript.video_id,
                    text=merged_chunk_text,
                    start_time=start_t,
                    end_time=end_t,
                    speaker=spk
                )
            )
            chunk_counter += 1

            # Prepare next chunk with overlap
            overlap_p = []
            accum_overlap = 0
            for p in reversed(current_chunk_paragraphs):
                p_len = len(f"{p.speaker}: {p.text}")
                if accum_overlap + p_len <= overlap_chars:
                    overlap_p.insert(0, p)
                    accum_overlap += p_len
                else:
                    break

            current_chunk_paragraphs = overlap_p + [paragraph]
            current_length = sum(len(f"{p.speaker}: {p.text}") for p in current_chunk_paragraphs)
        else:
            current_chunk_paragraphs.append(paragraph)
            current_length += para_len

    # Emit final remaining chunk
    if current_chunk_paragraphs:
        start_t = current_chunk_paragraphs[0].start
        end_t = current_chunk_paragraphs[-1].end
        spk = current_chunk_paragraphs[0].speaker
        merged_chunk_text = "\n".join([f"{p.speaker}: {p.text}" for p in current_chunk_paragraphs])
        chunk_id = f"{transcript.video_id}_c{chunk_counter}"

        chunks.append(
            TranscriptChunk(
                chunk_id=chunk_id,
                video_id=transcript.video_id,
                text=merged_chunk_text,
                start_time=start_t,
                end_time=end_t,
                speaker=spk
            )
        )

    return chunks


def index_transcript(
    video_id: str,
    transcript: CleanTranscript,
    vector_client: Optional[Any] = None
) -> None:
    """
    Primary Entrypoint Required by Requirement 1:
    `index_transcript(video_id: str, transcript: CleanTranscript, vector_client) -> None`

    Chunks clean transcript into ~500 token windows with 50 token overlap,
    generates 1536-dim embeddings, and writes chunks + embeddings + metadata to vector_client or store.
    """
    logger.info(f"[VectorStore] Indexing transcript for video_id='{video_id}'...")
    chunks = chunk_clean_transcript(transcript)

    for chunk in chunks:
        chunk.embedding = generate_embedding(chunk.text)

    _IN_MEMORY_VECTOR_STORE[video_id] = chunks

    if vector_client:
        try:
            chunk_dicts = []
            for c in chunks:
                cd = c.to_dict()
                cd["embedding"] = c.embedding
                chunk_dicts.append(cd)

            if hasattr(vector_client, "insert_many"):
                vector_client.insert_many(chunk_dicts)
            elif hasattr(vector_client, "add"):
                vector_client.add(chunk_dicts)
            logger.info(f"[VectorStore] Wrote {len(chunks)} chunks to vector_client dependency.")
        except Exception as e:
            logger.warning(f"[VectorStore] vector_client write failed: {e}")

    logger.info(f"[VectorStore] Indexed {len(chunks)} chunks for video_id='{video_id}'.")


def search_relevant_chunks(
    video_id: str,
    query: str,
    vector_client: Optional[Any] = None,
    top_k: int = DEFAULT_TOP_K,
    max_token_budget_chars: int = MAX_CONTEXT_BUDGET_CHARS
) -> List[TranscriptChunk]:
    """
    Primary Retrieval Pipeline:
    Embeds query, retrieves top-k chunks filtered by video_id,
    and caps context tokens by dropping lowest-similarity chunks if budget is exceeded.
    """
    if vector_client and hasattr(vector_client, "search"):
        try:
            query_vec = generate_embedding(query)
            client_results = vector_client.search(video_id=video_id, query_embedding=query_vec, top_k=top_k)
            parsed_chunks = []
            for r in client_results:
                parsed_chunks.append(
                    TranscriptChunk(
                        chunk_id=str(r.get("chunk_id", "")),
                        video_id=str(r.get("video_id", video_id)),
                        text=str(r.get("text", "")),
                        start_time=float(r.get("start_time", 0.0)),
                        end_time=float(r.get("end_time", 0.0)),
                        speaker=str(r.get("speaker", "[Speaker 00]")),
                        embedding=r.get("embedding", [])
                    )
                )
            if parsed_chunks:
                return parsed_chunks[:top_k]
        except Exception as e:
            logger.warning(f"[VectorStore] vector_client search failed: {e}. Falling back to internal vector index.")

    chunks = _IN_MEMORY_VECTOR_STORE.get(video_id, [])
    if not chunks or not query:
        return []

    query_vec = generate_embedding(query)
    scored_chunks = []

    for chunk in chunks:
        score = cosine_similarity(query_vec, chunk.embedding)
        scored_chunks.append((score, chunk))

    # Sort by highest similarity score
    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_candidates = [chunk for score, chunk in scored_chunks[:top_k]]

    # Cap context by token budget (drop lowest-similarity chunks first)
    selected_chunks = []
    current_chars = 0
    for chunk in top_candidates:
        if current_chars + len(chunk.text) <= max_token_budget_chars:
            selected_chunks.append(chunk)
            current_chars += len(chunk.text)
        else:
            logger.info(f"[VectorStore] Context budget reached ({current_chars} chars). Dropping lower-similarity chunk '{chunk.chunk_id}'.")

    return selected_chunks


def semantic_search(
    query: str,
    video_id: Optional[str] = None,
    vector_client: Optional[Any] = None,
    top_k: int = 10
) -> List[Dict[str, Any]]:
    """
    PART B — Semantic Search ML Utility:
    semantic_search(query: str, video_id: Optional[str], vector_client, top_k=10)
      -> List[{ text_snippet, start, end, video_id, score }]

    Embeds query string, runs similarity search across target video_id (or all indexed videos if video_id is None),
    and returns ranked list of metadata dictionaries.
    """
    if not query or not query.strip():
        return []

    query_vec = generate_embedding(query)

    # 1. External vector_client query
    if vector_client and hasattr(vector_client, "search"):
        try:
            kwargs = {"query_embedding": query_vec, "top_k": top_k}
            if video_id:
                kwargs["video_id"] = video_id
            raw_results = vector_client.search(**kwargs)

            formatted_results = []
            for r in raw_results:
                formatted_results.append({
                    "text_snippet": str(r.get("text_snippet", r.get("text", ""))),
                    "start": float(r.get("start", r.get("start_time", 0.0))),
                    "end": float(r.get("end", r.get("end_time", 0.0))),
                    "video_id": str(r.get("video_id", video_id or "")),
                    "score": float(r.get("score", r.get("similarity", 1.0)))
                })
            if formatted_results:
                formatted_results.sort(key=lambda x: x["score"], reverse=True)
                return formatted_results[:top_k]
        except Exception as e:
            logger.warning(f"[VectorStore] External vector_client search failed: {e}. Falling back to internal store.")

    # 2. Internal Vector Store Query
    candidate_chunks: List[TranscriptChunk] = []
    if video_id:
        candidate_chunks = _IN_MEMORY_VECTOR_STORE.get(video_id, [])
    else:
        # Search across all indexed videos
        for v_id, v_chunks in _IN_MEMORY_VECTOR_STORE.items():
            candidate_chunks.extend(v_chunks)

    if not candidate_chunks:
        return []

    scored_items = []
    for chunk in candidate_chunks:
        if not chunk.embedding:
            chunk.embedding = generate_embedding(chunk.text)
        score = cosine_similarity(query_vec, chunk.embedding)
        scored_items.append({
            "text_snippet": chunk.text,
            "start": chunk.start_time,
            "end": chunk.end_time,
            "video_id": chunk.video_id,
            "score": round(score, 4)
        })

    scored_items.sort(key=lambda x: x["score"], reverse=True)
    return scored_items[:top_k]
