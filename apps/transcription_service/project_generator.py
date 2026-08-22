"""
AI Project Idea Generator Module for SYNAPSEAI.
Generates personalized project ideas that reinforce weak topics using existing skills,
with pairwise vector embedding de-duplication checks and step-by-step project build roadmaps.
Uses strict Pydantic schema validation with retry-once error correction logic.
"""

import json
import logging
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, ValidationError

from .llm_providers import get_llm_provider, BaseLLMProvider
from .vector_store import generate_embedding, cosine_similarity

logger = logging.getLogger(__name__)


# ============================================================================
# Pydantic Schemas for AI Project Generator Outputs
# ============================================================================

class ProjectIdea(BaseModel):
    title: str = Field(description="Catchy and descriptive title of the project")
    description: str = Field(description="Clear overview of what the project builds and accomplishes")
    skills_reinforced: List[str] = Field(description="Target skills/weak topics reinforced by this project")
    difficulty: Literal["beginner", "intermediate", "advanced"] = Field(description="Difficulty level of the project")
    estimated_time: str = Field(description="Estimated time to complete, e.g., '6-8 hours'")
    key_features: List[str] = Field(description="Core functional features to build")
    stretch_goals: List[str] = Field(description="Advanced optional features for extra challenge")


class ProjectIdeasBatch(BaseModel):
    ideas: List[ProjectIdea] = Field(description="List of distinct generated project ideas")


class ProjectStep(BaseModel):
    order: int = Field(description="1-based step order sequence number")
    title: str = Field(description="Step title, e.g., 'Set up Authentication & User Models'")
    description: str = Field(description="Clear instructions on what to build in this step")
    concepts_needed: List[str] = Field(description="Key technical concepts or tools needed for this step")


class ProjectRoadmap(BaseModel):
    title: str = Field(description="Project title for this build roadmap")
    steps: List[ProjectStep] = Field(description="Sequential build steps for the project")


# ============================================================================
# Helper function for Pydantic Schema Validation with Retry-Once Logic
# ============================================================================

def _parse_and_validate_json(
    provider: BaseLLMProvider,
    prompt: str,
    system_prompt: str,
    model_class: Any
) -> Any:
    """Helper that invokes LLM, cleans JSON formatting, validates against model_class, and retries once on error."""
    raw_response, _ = provider.generate(prompt, system_prompt=system_prompt)

    cleaned = _clean_json_str(raw_response)
    try:
        data = json.loads(cleaned)
        return model_class.model_validate(data)
    except (json.JSONDecodeError, ValidationError) as err:
        logger.warning(f"[ProjectGenerator] Schema validation failed for {model_class.__name__}: {err}. Retrying once with error correction...")
        correction_prompt = (
            f"Your previous JSON response was invalid for model {model_class.__name__}.\n"
            f"Validation Error: {err}\n\n"
            f"Please output ONLY valid JSON matching this JSON schema:\n"
            f"{json.dumps(model_class.model_json_schema(), indent=2)}\n\n"
            f"Original Request:\n{prompt}"
        )
        retry_response, _ = provider.generate(correction_prompt, system_prompt=system_prompt)
        retry_cleaned = _clean_json_str(retry_response)
        data = json.loads(retry_cleaned)
        return model_class.model_validate(data)


def _clean_json_str(text: str) -> str:
    """Removes markdown code fences from JSON text."""
    s = text.strip()
    if s.startswith("```json"):
        s = s[7:]
    elif s.startswith("```"):
        s = s[3:]
    if s.endswith("```"):
        s = s[:-3]
    return s.strip()


def _filter_duplicate_ideas(ideas: List[ProjectIdea], threshold: float = 0.85) -> List[ProjectIdea]:
    """Filters out project ideas that have cosine similarity >= threshold with an already accepted idea."""
    unique_ideas: List[ProjectIdea] = []
    unique_embs = []

    for idea in ideas:
        text = f"{idea.title}: {idea.description}"
        emb = generate_embedding(text)

        is_dup = False
        for prev_emb in unique_embs:
            sim = cosine_similarity(emb, prev_emb)
            if sim >= threshold:
                is_dup = True
                logger.info(f"[ProjectGenerator] Filtering duplicate idea (sim={sim:.3f}): '{idea.title}'")
                break

        if not is_dup:
            unique_ideas.append(idea)
            unique_embs.append(emb)

    return unique_ideas


# ============================================================================
# Core AI Project Generator Features
# ============================================================================

def generate_project_ideas(
    user_skills: List[str],
    weak_topics: List[str],
    interests: Optional[List[str]] = None,
    target_difficulty: Literal["beginner", "intermediate", "advanced"] = "intermediate",
    count: int = 5,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> List[ProjectIdea]:
    """
    1 & 2. generate_project_ideas(...) -> List[ProjectIdea]
       Generates personalized project ideas that primarily reinforce weak_topics using user_skills as technical foundation.
       Biases toward interests if provided.
       Applies vector embedding pairwise de-duplication check (>0.85 similarity), regenerating replacements until count is met.
    """
    provider = llm_provider or get_llm_provider(provider_name)
    user_interests = interests or []

    system_prompt = (
        "You are an expert AI curriculum and project design coach.\n"
        "Generate realistic, engaging project ideas tailored to a learner's background.\n"
        "STRICT DESIGN PRINCIPLES:\n"
        "1. Reinforce weak_topics primarily, using user_skills as the technical foundation.\n"
        "2. Do NOT require skills the user does not possess unless specified in weak_topics.\n"
        "3. Match the target_difficulty level exactly.\n"
        "4. Ensure all generated ideas are distinct and cover varied domains or problem types.\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(ProjectIdeasBatch.model_json_schema(), indent=2)}"
    )

    accepted_ideas: List[ProjectIdea] = []

    for attempt in range(3):
        needed = count - len(accepted_ideas)
        if needed <= 0:
            break

        user_prompt = (
            f"Learner's Existing Skills: {json.dumps(user_skills)}\n"
            f"Learner's Weak Topics to Reinforce: {json.dumps(weak_topics)}\n"
            f"Learner's Domain Interests: {json.dumps(user_interests)}\n"
            f"Target Difficulty: {target_difficulty}\n"
            f"Number of distinct ideas to generate: {needed + 2}\n"
        )
        if accepted_ideas:
            existing_titles = [idea.title for idea in accepted_ideas]
            user_prompt += f"\nAlready accepted ideas (DO NOT REPEAT): {json.dumps(existing_titles)}"

        batch_result: ProjectIdeasBatch = _parse_and_validate_json(provider, user_prompt, system_prompt, ProjectIdeasBatch)
        fresh_ideas = _filter_duplicate_ideas(batch_result.ideas, threshold=0.85)

        for idea in fresh_ideas:
            # Check against already accepted ideas
            text = f"{idea.title}: {idea.description}"
            emb = generate_embedding(text)

            dup_with_accepted = False
            for acc in accepted_ideas:
                acc_text = f"{acc.title}: {acc.description}"
                acc_emb = generate_embedding(acc_text)
                if cosine_similarity(emb, acc_emb) >= 0.85:
                    dup_with_accepted = True
                    break

            if not dup_with_accepted:
                accepted_ideas.append(idea)
                if len(accepted_ideas) >= count:
                    break

    return accepted_ideas[:count]


def generate_project_roadmap(
    idea: ProjectIdea,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> ProjectRoadmap:
    """
    3. generate_project_roadmap(idea: ProjectIdea) -> ProjectRoadmap
       Breaks down the project idea into a step-by-step build sequence with concepts needed.
    """
    provider = llm_provider or get_llm_provider(provider_name)

    system_prompt = (
        "You are a senior software architect.\n"
        "Break down the provided project idea into a clear, sequential step-by-step build roadmap.\n"
        "Each step must outline order, title, detailed description, and concepts needed.\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(ProjectRoadmap.model_json_schema(), indent=2)}"
    )

    idea_dict = idea.model_dump() if hasattr(idea, "model_dump") else idea
    user_prompt = f"Project Idea:\n{json.dumps(idea_dict, indent=2)}\n\nGenerate sequential build roadmap."

    return _parse_and_validate_json(provider, user_prompt, system_prompt, ProjectRoadmap)
