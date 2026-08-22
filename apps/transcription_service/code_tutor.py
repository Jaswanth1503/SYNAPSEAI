"""
AI Coding Tutor Backend Logic Module for SYNAPSEAI.
Provides section-by-section code explanations, error/intent-grounded debugging,
function signature-aligned test case generation, and algorithmic complexity analysis.
Uses strict Pydantic validation with retry-once error correction logic.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError

from .llm_providers import get_llm_provider, BaseLLMProvider

logger = logging.getLogger(__name__)


# ============================================================================
# Pydantic Schemas for AI Coding Tutor Outputs
# ============================================================================

class LineExplanation(BaseModel):
    lines: str = Field(description="Line number range or code snippet")
    explanation: str = Field(description="Clear breakdown of what these lines do")


class CodeExplanation(BaseModel):
    summary: str = Field(description="High-level summary of what the code does")
    line_by_line: List[LineExplanation] = Field(description="Section-by-section line explanation")
    concepts_used: List[str] = Field(description="Programming concepts, algorithms, or data structures used")


class DebugIssue(BaseModel):
    description: str = Field(description="Description of the bug or logic issue")
    line_reference: str = Field(description="Line number or snippet where the issue occurs")
    suggested_fix: str = Field(description="Specific recommendation to fix the issue")


class DebugResult(BaseModel):
    likely_issues: List[DebugIssue] = Field(description="List of detected bugs or logic mismatches")
    corrected_code: Optional[str] = Field(description="Corrected code snippet fixing all identified issues")


class TestCase(BaseModel):
    input: Any = Field(description="Input arguments or payload for the function")
    expected_output: Any = Field(description="Expected return value or output")
    case_type: str = Field(description="Type of test case: 'typical', 'edge', or 'invalid'")
    reasoning: str = Field(description="Rationale behind this test case")


class TestCasesResult(BaseModel):
    test_cases: List[TestCase] = Field(description="List of generated test cases")


class ComplexityAnalysis(BaseModel):
    time_complexity: str = Field(description="Big-O time complexity, e.g., O(n), O(n log n), O(n^2)")
    space_complexity: str = Field(description="Big-O space complexity, e.g., O(1), O(n)")
    reasoning: str = Field(description="Detailed explanation based on loops, recursion, or data structure operations")
    potential_optimizations: Optional[List[str]] = Field(description="Possible algorithmic or memory optimizations")


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
        logger.warning(f"[CodeTutor] Schema validation failed for {model_class.__name__}: {err}. Retrying once with error correction...")
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


# ============================================================================
# Core AI Coding Tutor Features
# ============================================================================

def explain_code(
    code: str,
    language: str,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> CodeExplanation:
    """
    1. explain_code(code: str, language: str) -> CodeExplanation
       Breaks down code section by section with summary and concepts used.
    """
    provider = llm_provider or get_llm_provider(provider_name)

    system_prompt = (
        "You are an expert programming tutor.\n"
        "Explain the provided code line-by-line / section-by-section so a beginner can follow along.\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(CodeExplanation.model_json_schema(), indent=2)}"
    )

    user_prompt = f"Language: {language}\n\nCode to explain:\n```{language}\n{code}\n```"
    return _parse_and_validate_json(provider, user_prompt, system_prompt, CodeExplanation)


def debug_code(
    code: str,
    language: str,
    error_message: Optional[str] = None,
    expected_behavior: Optional[str] = None,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> DebugResult:
    """
    2. debug_code(code: str, language: str, error_message=None, expected_behavior=None) -> DebugResult
       Grounds diagnosis in error_message or expected_behavior. Identifies likely issues and provides corrected code.
    """
    provider = llm_provider or get_llm_provider(provider_name)

    system_prompt = (
        "You are a master software debugging engineer.\n"
        "Analyze the provided code for bugs, runtime errors, or logic mismatches.\n"
        "If an error_message is provided, ground your diagnosis strictly in that error.\n"
        "If expected_behavior is provided, actively search for logic gaps between the code and stated intent.\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(DebugResult.model_json_schema(), indent=2)}"
    )

    user_prompt = f"Language: {language}\n\nCode:\n```{language}\n{code}\n```\n"
    if error_message:
        user_prompt += f"\nRuntime / Execution Error:\n{error_message}\n"
    if expected_behavior:
        user_prompt += f"\nExpected Behavior / Stated Intent:\n{expected_behavior}\n"

    return _parse_and_validate_json(provider, user_prompt, system_prompt, DebugResult)


def generate_test_cases(
    code: str,
    language: str,
    function_signature: str,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> List[TestCase]:
    """
    3. generate_test_cases(code: str, language: str, function_signature: str) -> List[TestCase]
       Generates test cases covering typical inputs, edge cases (empty, zero, negative), and invalid inputs.
    """
    provider = llm_provider or get_llm_provider(provider_name)

    system_prompt = (
        "You are a software quality assurance engineer.\n"
        "Generate realistic, runnable test cases for the function signature provided.\n"
        "Ensure test cases cover:\n"
        "1. Typical input (standard expected usage)\n"
        "2. Edge cases (empty arrays, zero, negative values, boundary limits)\n"
        "3. Invalid input (wrong type or null if applicable)\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(TestCasesResult.model_json_schema(), indent=2)}"
    )

    user_prompt = (
        f"Language: {language}\n"
        f"Target Function Signature: `{function_signature}`\n\n"
        f"Code:\n```{language}\n{code}\n```"
    )

    result: TestCasesResult = _parse_and_validate_json(provider, user_prompt, system_prompt, TestCasesResult)
    return result.test_cases


def analyze_complexity(
    code: str,
    language: str,
    provider_name: Optional[str] = None,
    llm_provider: Optional[BaseLLMProvider] = None
) -> ComplexityAnalysis:
    """
    4. analyze_complexity(code: str, language: str) -> ComplexityAnalysis
       Determines Big-O time and space complexity via structural algorithm analysis.
    """
    provider = llm_provider or get_llm_provider(provider_name)

    system_prompt = (
        "You are an algorithm performance analyst.\n"
        "Analyze the time and space complexity of the provided code based on loops, recursion, and data structures.\n"
        "STRICT REQUIREMENTS:\n"
        "Output ONLY a valid JSON object matching this schema:\n"
        f"{json.dumps(ComplexityAnalysis.model_json_schema(), indent=2)}"
    )

    user_prompt = f"Language: {language}\n\nCode to analyze:\n```{language}\n{code}\n```"
    return _parse_and_validate_json(provider, user_prompt, system_prompt, ComplexityAnalysis)
