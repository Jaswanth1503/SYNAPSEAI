"""
AI Mock Interview Engine Module for SYNAPSEAI.
Generates adaptive, resume/role-grounded interview questions with semantic duplicate prevention,
evaluates answers against concrete STAR/technical criteria, and compiles structured session reports.
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
# Pydantic Schemas for AI Mock Interview Outputs
# ============================================================================

class InterviewQuestion(BaseModel):
    question: str = Field(description="The interview question text")
    type: Literal["behavioral", "technical", "situational"] = Field(description="Type of interview question")
    targets: str = Field(description="Skill, competency, or topic probed by this question")
    difficulty: Literal["easy", "medium", "hard"] = Field(description="Difficulty level of the question")


class AnswerEvaluation(BaseModel):
    score: float = Field(description="Evaluation score from 0.0 to 100.0")
    strengths: List[str] = Field(description="Specific positive aspects of the candidate's answer")
    weaknesses: List[str] = Field(description="Specific missing elements or flaws in the answer")
    missing_points: List[str] = Field(description="Key concepts or STAR elements missed")
    improved_answer_example: str = Field(description="Concrete example of a high-scoring response")


class InterviewSessionPlan(BaseModel):
    target_role: str = Field(description="Target role for the mock interview")
    planned_questions_count: int = Field(description="Total planned questions in session")
    initial_question: InterviewQuestion = Field(description="First opening question for the candidate")


class InterviewReport(BaseModel):
    overall_score: float = Field(description="Aggregated overall session score from 0.0 to 100.0")
    category_scores: Dict[str, float] = Field(description="Average score per question category (behavioral, technical, situational)")
    key_improvement_areas: List[str] = Field(description="Top 2-3 weakest areas requiring improvement")
    strong_areas: List[str] = Field(description="Key strengths demonstrated during the interview")


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
        logger.warning(f"[MockInterview] Schema validation failed for {model_class.__name__}: {err}. Retrying once with error correction...")
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


def _is_duplicate_question(new_q: str, previous_qs: List[str], similarity_threshold: float = 0.82) -> bool:
    """Checks if new_q is semantically duplicate to any previous question using vector embeddings."""
    if not previous_qs or not new_q:
        return False
    new_emb = generate_embedding(new_q)
    for prev in previous_qs:
        prev_emb = generate_embedding(prev)
        sim = cosine_similarity(new_emb, prev_emb)
        if sim >= similarity_threshold:
            logger.info(f"[MockInterview] Semantic duplicate detected (sim={sim:.3f}): '{new_q}' vs '{prev}'")
            return True
    return False


# ============================================================================
# Core AI Mock Interview Functions
# ============================================================================

def generate_interview_question(
    resume: Optional[Any] = None,
    target_role: str = "Software Engineer",
    difficulty: Literal["easy", "medium", "hard"] = "medium",
    previous_questions: Optional[List[str]] = None,
    previous_answers: Optional[List[str]] = None,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> InterviewQuestion:
    """
    1. generate_interview_question(...) -> InterviewQuestion
       Generates a role/resume-grounded interview question adapted to candidate's previous performance.
       Checks vector embedding cosine similarity to avoid semantically duplicate questions.
    """
    provider = llm_provider or get_llm_provider(provider_name)
    prev_qs = previous_questions or []
    prev_ans = previous_answers or []

    system_prompt = (
        "You are an expert technical and behavioral interviewer.\n"
        "Generate a targeted, realistic interview question for the specified target role and candidate history.\n"
        "If previous answers were weak, probe deeper into that domain.\n"
        "DO NOT generate questions semantically similar to previously asked questions.\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(InterviewQuestion.model_json_schema(), indent=2)}"
    )

    resume_str = json.dumps(resume.to_dict() if hasattr(resume, "to_dict") else resume, indent=2) if resume else "No resume provided."

    # Try up to 3 times to generate a non-duplicate question
    for attempt in range(3):
        user_prompt = (
            f"Target Role: {target_role}\n"
            f"Desired Difficulty: {difficulty}\n"
            f"Candidate Resume Context:\n{resume_str}\n\n"
            f"Previous Questions Asked ({len(prev_qs)}):\n{json.dumps(prev_qs, indent=2)}\n"
            f"Previous Candidate Answers ({len(prev_ans)}):\n{json.dumps(prev_ans, indent=2)}\n"
        )
        if attempt > 0:
            user_prompt += f"\nNote: Attempt {attempt+1}. Ensure the question explores a NEW topic not covered previously."

        question_obj: InterviewQuestion = _parse_and_validate_json(provider, user_prompt, system_prompt, InterviewQuestion)

        if not _is_duplicate_question(question_obj.question, prev_qs):
            return question_obj

    return question_obj


def evaluate_answer(
    question: InterviewQuestion,
    answer_text: str,
    ideal_answer_points: Optional[List[str]] = None,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> AnswerEvaluation:
    """
    2. evaluate_answer(...) -> AnswerEvaluation
       Evaluates candidate answer on relevance, specificity (concrete examples vs vague generalities),
       STAR structure for behavioral questions, and technical correctness for technical questions.
    """
    provider = llm_provider or get_llm_provider(provider_name)

    system_prompt = (
        "You are a rigorous interview evaluator.\n"
        "Evaluate the candidate's answer based on:\n"
        "1. Relevance to the question asked\n"
        "2. Specificity: Reward concrete metrics, technologies, and clear examples. Penalize vague generalities.\n"
        "3. STAR Method (Situation, Task, Action, Result) for behavioral questions.\n"
        "4. Technical accuracy for technical questions.\n"
        "STRICT REQUIREMENTS:\n"
        "Every score (0.0 to 100.0) MUST trace directly to specific strengths and weaknesses in the answer text.\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(AnswerEvaluation.model_json_schema(), indent=2)}"
    )

    q_data = question.model_dump() if hasattr(question, "model_dump") else question
    user_prompt = (
        f"Interview Question:\n{json.dumps(q_data, indent=2)}\n\n"
        f"Candidate's Answer:\n\"{answer_text}\"\n\n"
        f"Ideal Answer Benchmarks: {json.dumps(ideal_answer_points or [], indent=2)}"
    )

    return _parse_and_validate_json(provider, user_prompt, system_prompt, AnswerEvaluation)


def run_interview_session(
    resume: Optional[Any] = None,
    target_role: str = "Software Engineer",
    question_count: int = 5,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> InterviewSessionPlan:
    """
    3. run_interview_session(...) -> InterviewSessionPlan
       Defines the session orchestration plan and generates the opening question.
    """
    opening_q = generate_interview_question(
        resume=resume,
        target_role=target_role,
        difficulty="easy",
        previous_questions=[],
        previous_answers=[],
        provider_name=provider_name,
        llm_provider=llm_provider
    )

    return InterviewSessionPlan(
        target_role=target_role,
        planned_questions_count=question_count,
        initial_question=opening_q
    )


def compile_interview_report(
    questions: List[InterviewQuestion],
    evaluations: List[AnswerEvaluation]
) -> InterviewReport:
    """
    4. compile_interview_report(questions, evaluations) -> InterviewReport
       Aggregates average scores by question category (behavioral, technical, situational),
       calculates overall session score, and identifies top improvement & strong areas.
    """
    if not evaluations:
        return InterviewReport(
            overall_score=0.0,
            category_scores={"behavioral": 0.0, "technical": 0.0, "situational": 0.0},
            key_improvement_areas=["No answers evaluated."],
            strong_areas=[]
        )

    cat_scores_sum: Dict[str, float] = {}
    cat_counts: Dict[str, int] = {}
    total_score_sum = 0.0

    weakest_topics = []
    strong_topics = []

    for q, ev in zip(questions, evaluations):
        q_type = q.type if hasattr(q, "type") else q.get("type", "technical")
        score = float(ev.score if hasattr(ev, "score") else ev.get("score", 0.0))

        cat_scores_sum[q_type] = cat_scores_sum.get(q_type, 0.0) + score
        cat_counts[q_type] = cat_counts.get(q_type, 0) + 1
        total_score_sum += score

        targets = q.targets if hasattr(q, "targets") else q.get("targets", "general")
        if score < 70.0:
            weakest_topics.append(f"{targets} (score: {score:.1f})")
        elif score >= 85.0:
            strong_topics.append(f"{targets} (score: {score:.1f})")

    avg_category_scores = {
        cat: round(cat_scores_sum[cat] / cat_counts[cat], 1)
        for cat in cat_scores_sum
    }

    overall_score = round(total_score_sum / len(evaluations), 1)

    key_improvements = weakest_topics[:3] if weakest_topics else ["Continue refining STAR framework details."]
    strong_areas = strong_topics[:3] if strong_topics else ["Good attempt on foundational concepts."]

    return InterviewReport(
        overall_score=overall_score,
        category_scores=avg_category_scores,
        key_improvement_areas=key_improvements,
        strong_areas=strong_areas
    )
