"""
AI Content Generation Module for SYNAPSEAI.
Generates structured learning artifacts (Summary, Notes, Flashcards, Quiz, MindMap, Roadmap)
from CleanTranscript using Pydantic validation, Map-Reduce chunking, and parallel async execution.
"""

import json
import logging
import asyncio
import hashlib
import re
from typing import List, Dict, Any, Optional, Type, Tuple, Callable
from .models import CleanTranscript
from .content_models import (
    BaseModel,
    ValidationError,
    SummaryArtifact,
    NotesArtifact,
    FlashcardsArtifact,
    QuizArtifact,
    MindMapArtifact,
    RoadmapArtifact,
)
from .llm_providers import get_llm_provider, BaseLLMProvider

logger = logging.getLogger(__name__)


def compute_transcript_hash(full_text: str) -> str:
    """Computes SHA-256 hash of transcript.full_text for content caching."""
    if not full_text:
        return ""
    return hashlib.sha256(full_text.encode("utf-8")).hexdigest()

# Token length threshold for triggering Map-Reduce summarization (~2000 tokens / 8000 chars)
TOKEN_CHUNK_THRESHOLD = 8000
CHUNK_SIZE_CHARS = 7000

SYSTEM_JSON_PROMPT = (
    "You are an expert AI Learning Architect. "
    "Your response MUST be a single valid JSON object strictly conforming to the requested schema. "
    "Do NOT include any preamble, commentary, explanations, or markdown code blocks (e.g., do NOT use ```json)."
)


# ---------------------------------------------------------------------------
# Map-Reduce Long Transcript Summarizer
# ---------------------------------------------------------------------------
def chunk_transcript_text(text: str, max_chars: int = CHUNK_SIZE_CHARS) -> List[str]:
    """Splits full_text into logical paragraph chunks of ~max_chars."""
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_len = 0

    for p in paragraphs:
        if current_len + len(p) > max_chars and current_chunk:
            chunks.append("\n\n".join(current_chunk))
            current_chunk = [p]
            current_len = len(p)
        else:
            current_chunk.append(p)
            current_len += len(p)

    if current_chunk:
        chunks.append("\n\n".join(current_chunk))

    return chunks


def map_reduce_summarize_transcript(
    transcript_text: str,
    provider: BaseLLMProvider
) -> Tuple[str, Dict[str, int]]:
    """
    Executes Map-Reduce summarization on long transcripts.
    Map step: Summarize each chunk independently.
    Reduce step: Combine chunk summaries into a single cohesive text for final artifact generation.
    """
    chunks = chunk_transcript_text(transcript_text)
    total_tokens = {"prompt_tokens": 0, "completion_tokens": 0}

    if len(chunks) == 1:
        return transcript_text, total_tokens

    logger.info(f"[MapReduce] Long transcript ({len(transcript_text)} chars). Running Map step on {len(chunks)} chunks...")
    map_summaries = []

    for idx, chunk in enumerate(chunks):
        prompt = (
            f"Summarize the key educational concepts from this transcript excerpt (Part {idx + 1}/{len(chunks)}):\n\n"
            f"\"\"\"\n{chunk}\n\"\"\"\n\n"
            "Return a concise overview paragraph with main takeaways."
        )
        summary_text, usage = provider.generate(prompt, system_prompt=SYSTEM_JSON_PROMPT)
        total_tokens["prompt_tokens"] += usage.get("prompt_tokens", 0)
        total_tokens["completion_tokens"] += usage.get("completion_tokens", 0)
        map_summaries.append(f"Excerpt Part {idx + 1} Summary:\n{summary_text}")

    reduced_context = "\n\n".join(map_summaries)
    logger.info("[MapReduce] Reduce step completed. Combined map summaries generated.")
    return reduced_context, total_tokens


# ---------------------------------------------------------------------------
# Artifact Generator Helpers with Pydantic Validation & 1-Retry Correction
# ---------------------------------------------------------------------------
def generate_single_artifact(
    prompt: str,
    model_class: Type[BaseModel],
    provider: BaseLLMProvider
) -> Tuple[Dict[str, Any], Dict[str, int]]:
    """
    Generates a single artifact JSON string from LLM, parses with json.loads,
    and validates against Pydantic model_class.
    If validation fails, retries once with an error-correction prompt.
    """
    total_usage = {"prompt_tokens": 0, "completion_tokens": 0}

    # Attempt 1
    raw_response, usage1 = provider.generate(prompt, system_prompt=SYSTEM_JSON_PROMPT)
    total_usage["prompt_tokens"] += usage1.get("prompt_tokens", 0)
    total_usage["completion_tokens"] += usage1.get("completion_tokens", 0)

    parsed_dict, err_msg = try_parse_and_validate(raw_response, model_class)
    if parsed_dict is not None:
        return parsed_dict, total_usage

    # Retry Attempt 1 with Error Correction Prompt
    logger.warning(f"[ContentGenerator] Schema validation failed for {model_class.__name__}: {err_msg}. Retrying once with error-correction prompt...")
    retry_prompt = (
        f"Your previous JSON response failed validation with error: '{err_msg}'.\n\n"
        f"Previous Response:\n\"\"\"\n{raw_response}\n\"\"\"\n\n"
        f"Please re-generate the JSON object strictly matching this schema requirements:\n{prompt}"
    )

    raw_retry, usage2 = provider.generate(retry_prompt, system_prompt=SYSTEM_JSON_PROMPT)
    total_usage["prompt_tokens"] += usage2.get("prompt_tokens", 0)
    total_usage["completion_tokens"] += usage2.get("completion_tokens", 0)

    retry_dict, retry_err = try_parse_and_validate(raw_retry, model_class)
    if retry_dict is not None:
        logger.info(f"[ContentGenerator] Retry successful for {model_class.__name__}!")
        return retry_dict, total_usage

    logger.error(f"[ContentGenerator] Retry failed for {model_class.__name__}: {retry_err}")
    return {
        "error": "VALIDATION_FAILED",
        "message": f"Failed to generate valid {model_class.__name__} after retry.",
        "details": retry_err
    }, total_usage


def try_parse_and_validate(
    raw_json_str: str,
    model_class: Type[BaseModel]
) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    """Helper to strip markdown fences, parse JSON, and validate Pydantic model."""
    if not raw_json_str:
        return None, "Empty response string from LLM"

    cleaned = raw_json_str.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        data_dict = json.loads(cleaned)
        validated = model_class.model_validate(data_dict)
        return validated.model_dump(), None
    except json.JSONDecodeError as e:
        return None, f"JSONDecodeError: {e}"
    except ValidationError as e:
        return None, f"Pydantic ValidationError: {e}"
    except Exception as e:
        return None, f"Unexpected Validation Exception: {e}"


# ---------------------------------------------------------------------------
# Individual Artifact Prompt Builders
# ---------------------------------------------------------------------------
def build_summary_prompt(context: str) -> str:
    return (
        "Generate a structured summary JSON object for the following transcript.\n"
        "Required JSON Keys:\n"
        "- 'tldr': string (concise overview)\n"
        "- 'key_points': array of strings (3-5 main takeaways)\n"
        "- 'sections': array of objects [{ 'title': string, 'summary': string, 'start_time': float }]\n\n"
        f"Transcript:\n\"\"\"\n{context}\n\"\"\""
    )


def build_notes_prompt(context: str) -> str:
    return (
        "Generate structured study notes JSON object for the transcript.\n"
        "Required JSON Keys:\n"
        "- 'sections': array of objects [{ 'heading': string, 'bullets': array of strings, 'start_time': float }]\n\n"
        f"Transcript:\n\"\"\"\n{context}\n\"\"\""
    )


def build_flashcards_prompt(context: str) -> str:
    return (
        "Generate 10-20 study flashcards JSON object derived strictly from transcript facts.\n"
        "Required JSON Keys:\n"
        "- 'cards': array of objects [{ 'question': string, 'answer': string, 'difficulty': 'easy'|'medium'|'hard' }]\n\n"
        f"Transcript:\n\"\"\"\n{context}\n\"\"\""
    )


def build_quiz_prompt(context: str) -> str:
    return (
        "Generate 5-10 multiple-choice quiz questions JSON object derived strictly from transcript facts.\n"
        "Required JSON Keys:\n"
        "- 'questions': array of objects [{ 'question': string, 'options': array of 4 strings, 'correct_index': int (0-3), 'explanation': string }]\n\n"
        f"Transcript:\n\"\"\"\n{context}\n\"\"\""
    )


def build_mind_map_prompt(context: str) -> str:
    return (
        "Generate a recursive mind map tree JSON object (max depth 3).\n"
        "Required JSON Keys:\n"
        "- 'root': string (main topic name)\n"
        "- 'children': array of objects [{ 'label': string, 'children': array of child objects }]\n\n"
        f"Transcript:\n\"\"\"\n{context}\n\"\"\""
    )


def build_roadmap_prompt(context: str) -> str:
    return (
        "Generate a sequential learning roadmap JSON object based on topic dependencies in the transcript.\n"
        "Required JSON Keys:\n"
        "- 'steps': array of objects [{ 'order': int (1-based), 'title': string, 'description': string, 'prerequisite_of': array of ints }]\n\n"
        f"Transcript:\n\"\"\"\n{context}\n\"\"\""
    )


# ---------------------------------------------------------------------------
# Core Async Parallel Artifact Generator Function
# ---------------------------------------------------------------------------
async def generate_content_async(
    transcript: CleanTranscript,
    types: Optional[List[str]] = None,
    provider_name: Optional[str] = None,
    cache_lookup: Optional[Callable[[str, List[str]], Optional[Dict[str, Any]]]] = None,
    cache_write: Optional[Callable[[str, Dict[str, Any]], None]] = None
) -> Dict[str, Any]:
    """
    Primary Async Function Signature:
    `generate_content(transcript: CleanTranscript, types: List[str]) -> Dict[str, Any]`

    Args:
        transcript: CleanTranscript dataclass from cleaning module.
        types: Optional list of requested artifact keys ("summary", "notes", "flashcards", "quiz", "mind_map", "roadmap").
        provider_name: Optional LLM provider override ("gemini", "anthropic", "openai", "mock").
        cache_lookup: Optional backend hook callable(content_hash, types) -> cached_dict
        cache_write: Optional backend hook callable(content_hash, result_dict) -> None

    Returns:
        Dict containing requested structured JSON artifacts + token_usage metrics metadata.
    """
    valid_artifact_types = ["summary", "notes", "flashcards", "quiz", "mind_map", "roadmap"]
    requested_types = [t.lower() for t in (types or valid_artifact_types) if t.lower() in valid_artifact_types]

    if not requested_types:
        requested_types = valid_artifact_types

    # Step 0: Content-Hash Caching Hook
    content_hash = compute_transcript_hash(transcript.full_text)
    if cache_lookup:
        cached_result = cache_lookup(content_hash, requested_types)
        if cached_result:
            logger.info(f"[ContentGenerator] Cache HIT for content_hash='{content_hash[:10]}...'")
            return cached_result

    provider = get_llm_provider(provider_name)
    logger.info(f"[ContentGenerator] Starting parallel artifact generation for types={requested_types} using provider='{provider.name}'")

    # Step 1: Long Transcript Map-Reduce Check
    full_context, mr_tokens = map_reduce_summarize_transcript(transcript.full_text, provider)
    total_token_usage = {
        "prompt_tokens": mr_tokens.get("prompt_tokens", 0),
        "completion_tokens": mr_tokens.get("completion_tokens", 0),
    }

    # Dispatch requested artifact generation tasks concurrently via asyncio
    tasks = {}

    def run_artifact_task(prompt: str, schema_class: Type[BaseModel]):
        return generate_single_artifact(prompt, schema_class, provider)

    loop = asyncio.get_event_loop()

    spec_list = []
    if "summary" in requested_types:
        spec_list.append(("summary", build_summary_prompt(full_context), SummaryArtifact))
    if "notes" in requested_types:
        spec_list.append(("notes", build_notes_prompt(full_context), NotesArtifact))
    if "flashcards" in requested_types:
        spec_list.append(("flashcards", build_flashcards_prompt(full_context), FlashcardsArtifact))
    if "quiz" in requested_types:
        spec_list.append(("quiz", build_quiz_prompt(full_context), QuizArtifact))
    if "mind_map" in requested_types:
        spec_list.append(("mind_map", build_mind_map_prompt(full_context), MindMapArtifact))
    if "roadmap" in requested_types:
        spec_list.append(("roadmap", build_roadmap_prompt(full_context), RoadmapArtifact))

    artifact_output: Dict[str, Any] = {"video_id": transcript.video_id, "content_hash": content_hash}

    for idx, (key, prompt_str, schema_cls) in enumerate(spec_list):
        if provider.name != "mock" and idx > 0:
            await asyncio.sleep(2.0)
        artifact_dict, usage = await loop.run_in_executor(None, run_artifact_task, prompt_str, schema_cls)
        artifact_output[key] = artifact_dict
        total_token_usage["prompt_tokens"] += usage.get("prompt_tokens", 0)
        total_token_usage["completion_tokens"] += usage.get("completion_tokens", 0)

    # Attach token usage logging metadata
    artifact_output["_meta"] = {
        "provider": provider.name,
        "total_tokens": total_token_usage
    }

    if cache_write:
        try:
            cache_write(content_hash, artifact_output)
        except Exception as e:
            logger.warning(f"[ContentGenerator] cache_write hook failed: {e}")

    logger.info(f"[ContentGenerator] Completed artifact generation. Total Tokens Used: {total_token_usage}")
    return artifact_output


def generate_content(
    transcript: CleanTranscript,
    types: Optional[List[str]] = None,
    provider_name: Optional[str] = None,
    cache_lookup: Optional[Callable[[str, List[str]], Optional[Dict[str, Any]]]] = None,
    cache_write: Optional[Callable[[str, Dict[str, Any]], None]] = None
) -> Dict[str, Any]:
    """Synchronous wrapper for generate_content_async."""
    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, generate_content_async(transcript, types, provider_name, cache_lookup, cache_write))
                return future.result()
        else:
            return asyncio.run(generate_content_async(transcript, types, provider_name, cache_lookup, cache_write))
    except Exception:
        return asyncio.run(generate_content_async(transcript, types, provider_name, cache_lookup, cache_write))
