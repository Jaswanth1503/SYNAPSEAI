"""
Visualization Classifier ML Utility for SYNAPSEAI.
Classifies whether transcript chunks benefit from visual representation (flowchart, 3d_model, animation, diagram, none)
and extracts the visual concept label for frontend template rendering.
"""

import json
import logging
from typing import List, Dict, Any, Optional

from .models import CleanParagraph
from .vector_store import TranscriptChunk
from .content_models import VisualClassification
from .llm_providers import get_llm_provider, BaseLLMProvider

logger = logging.getLogger(__name__)

CLASSIFIER_SYSTEM_PROMPT = (
    "You are a visualization metadata classifier for educational content.\n"
    "Your job is to analyze a transcript snippet and classify if it describes a complex process, "
    "3D object, animated mechanism, or visual diagram that would benefit from a visual aid.\n\n"
    "STRICT OUTPUT SCHEME:\n"
    "Return a valid JSON object with EXACTLY three fields:\n"
    "- 'needs_visual': boolean (true if visual aid is highly beneficial, false if purely text/conversation)\n"
    "- 'type': string (MUST be one of: 'flowchart', '3d_model', 'animation', 'diagram', 'none')\n"
    "- 'concept': string (short 2-5 word description of the visual concept to render, or empty string if 'none')\n"
)


def classify_visual(
    chunk: TranscriptChunk,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> VisualClassification:
    """
    Classifies a single transcript chunk for visualization metadata.

    Args:
        chunk: TranscriptChunk or object with text, start_time, end_time
        provider_name: Optional provider name ('gemini', 'anthropic', 'openai', 'mock')
        llm_provider: Optional pre-instantiated provider instance

    Returns:
        VisualClassification object with fields (needs_visual, type, concept)
    """
    provider = llm_provider or get_llm_provider(provider_name)

    chunk_text = getattr(chunk, "text", str(chunk))
    start = getattr(chunk, "start_time", getattr(chunk, "start", 0.0))
    end = getattr(chunk, "end_time", getattr(chunk, "end", 0.0))

    user_prompt = (
        f"Transcript Chunk [{start:.1f}s - {end:.1f}s]:\n"
        f"\"{chunk_text}\"\n\n"
        "Classify this transcript chunk into JSON."
    )

    try:
        raw_response, _ = provider.generate(user_prompt, system_prompt=CLASSIFIER_SYSTEM_PROMPT)
        cleaned_json = raw_response.strip()
        if cleaned_json.startswith("```json"):
            cleaned_json = cleaned_json[7:]
        if cleaned_json.startswith("```"):
            cleaned_json = cleaned_json[3:]
        if cleaned_json.endswith("```"):
            cleaned_json = cleaned_json[:-3]
        cleaned_json = cleaned_json.strip()

        data = json.loads(cleaned_json)
        return VisualClassification.model_validate(data)
    except Exception as e:
        logger.warning(f"[VisualClassifier] Classification failed for chunk [{start:.1f}s - {end:.1f}s]: {e}")
        # Rule-based fallback keyword detection if LLM call fails
        lower_text = chunk_text.lower()
        if any(w in lower_text for w in ["flowchart", "step 1", "process", "workflow", "algorithm"]):
            return VisualClassification(needs_visual=True, type="flowchart", concept="Process Flowchart")
        elif any(w in lower_text for w in ["3d", "molecule", "geometry", "structure", "engine"]):
            return VisualClassification(needs_visual=True, type="3d_model", concept="3D Model")
        elif any(w in lower_text for w in ["animation", "moving", "motion", "rotation"]):
            return VisualClassification(needs_visual=True, type="animation", concept="Concept Animation")
        elif any(w in lower_text for w in ["diagram", "architecture", "component", "layer", "chart"]):
            return VisualClassification(needs_visual=True, type="diagram", concept="Concept Diagram")
        return VisualClassification(needs_visual=False, type="none", concept="")


def classify_visual_batch(
    chunks: List[TranscriptChunk],
    provider_name: Optional[str] = None
) -> List[VisualClassification]:
    """
    Classifies a batch of transcript chunks sequentially.
    """
    provider = get_llm_provider(provider_name)
    results = []
    for chunk in chunks:
        res = classify_visual(chunk, llm_provider=provider)
        results.append(res)
    return results
