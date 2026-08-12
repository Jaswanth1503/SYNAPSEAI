"""
Swappable LLM Provider Abstraction Layer for SYNAPSEAI Content Generator.
Supports Anthropic, Gemini, OpenAI, and Mock providers with token usage tracking.
"""

import os
import sys
import time
import json
import logging
from abc import ABC, abstractmethod
from typing import Tuple, Dict, Any, Optional

logger = logging.getLogger(__name__)


class ConfigurationError(Exception):
    """Custom exception raised when an API key is missing or set to a placeholder value."""
    pass


class BaseLLMProvider(ABC):
    """Abstract base class for swappable LLM providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, Dict[str, int]]:
        """
        Executes LLM generation call.
        Returns:
            Tuple[response_text: str, token_usage: Dict[str, int]]
        """
        pass


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude API Provider (claude-3-5-sonnet-20241022)."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.environ.get("ANTHROPIC_API_KEY", "")).strip()
        self.model_name = "claude-3-5-sonnet-20241022"

    @property
    def name(self) -> str:
        return "anthropic"

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, Dict[str, int]]:
        if not self.api_key or self.api_key in ("your_anthropic_api_key_here", "dummy_anthropic_key"):
            raise ConfigurationError(
                "ANTHROPIC_API_KEY is not set or is a placeholder. "
                "Set a valid Anthropic API key in your environment/.env file to use AnthropicProvider."
            )

        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            
            messages = [{"role": "user", "content": prompt}]
            kwargs: Dict[str, Any] = {
                "model": self.model_name,
                "max_tokens": 4000,
                "messages": messages,
            }
            if system_prompt:
                kwargs["system"] = system_prompt

            response = client.messages.create(**kwargs)
            text_content = response.content[0].text if response.content else ""

            prompt_tokens = response.usage.input_tokens if hasattr(response, "usage") else len(prompt) // 4
            completion_tokens = response.usage.output_tokens if hasattr(response, "usage") else len(text_content) // 4

            token_usage = {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens}
            logger.info(f"[AnthropicProvider] Used {prompt_tokens} input tokens, {completion_tokens} output tokens.")
            return text_content, token_usage
        except Exception as e:
            if isinstance(e, ConfigurationError):
                raise e
            logger.error(f"[AnthropicProvider] API error: {e}")
            raise e


class GeminiProvider(BaseLLMProvider):
    """Google Gemini API Provider (gemini-2.5-flash / gemini-2.0-flash)."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.environ.get("GEMINI_API_KEY", "")).strip()
        self.model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

    @property
    def name(self) -> str:
        return "gemini"

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, Dict[str, int]]:
        if not self.api_key or self.api_key in ("your_gemini_api_key_here", "dummy_gemini_key"):
            raise ConfigurationError(
                "GEMINI_API_KEY is not set or is a placeholder. "
                "Set a valid Gemini API key in your environment/.env file to use GeminiProvider."
            )

        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)

            full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

            # Try primary model_name, with fallback to gemini-2.0-flash / gemini-flash-latest
            models_to_try = [self.model_name, "gemini-2.0-flash", "gemini-flash-latest"]
            last_err = None
            text_content = ""

            for m_name in models_to_try:
                # Retry loop for 429 Rate Limits
                for attempt in range(4):
                    try:
                        model = genai.GenerativeModel(
                            model_name=m_name,
                            generation_config={"response_mime_type": "application/json"}
                        )
                        response = model.generate_content(full_prompt)
                        text_content = response.text or ""
                        if text_content:
                            break
                    except Exception as m_err:
                        last_err = m_err
                        err_msg = str(m_err).lower()
                        if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg:
                            sleep_time = (attempt + 1) * 30.0
                            logger.warning(f"[GeminiProvider] 429 Rate Limit hit on '{m_name}'. Waiting {sleep_time}s for free tier quota reset (attempt {attempt+1}/4)...")
                            time.sleep(sleep_time)
                        else:
                            logger.debug(f"[GeminiProvider] Model '{m_name}' failed: {m_err}. Trying next model...")
                            break
                if text_content:
                    break

            if not text_content and last_err:
                raise last_err

            prompt_tokens = len(full_prompt) // 4
            completion_tokens = len(text_content) // 4
            token_usage = {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens}

            logger.info(f"[GeminiProvider] Used ~{prompt_tokens} prompt tokens, ~{completion_tokens} completion tokens.")
            return text_content, token_usage
        except Exception as e:
            if isinstance(e, ConfigurationError):
                raise e
            logger.error(f"[GeminiProvider] API error: {e}")
            raise e


class OpenAIProvider(BaseLLMProvider):
    """OpenAI API Provider (gpt-4o)."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.environ.get("OPENAI_API_KEY", "")).strip()
        self.model_name = "gpt-4o"

    @property
    def name(self) -> str:
        return "openai"

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, Dict[str, int]]:
        if not self.api_key or self.api_key in ("your_openai_api_key_here", "dummy_openai_key"):
            raise ConfigurationError(
                "OPENAI_API_KEY is not set or is a placeholder. "
                "Set a valid OpenAI API key in your environment/.env file to use OpenAIProvider."
            )

        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                response_format={"type": "json_object"}
            )
            text_content = response.choices[0].message.content or ""
            usage = response.usage
            prompt_tokens = usage.prompt_tokens if usage else len(prompt) // 4
            completion_tokens = usage.completion_tokens if usage else len(text_content) // 4

            token_usage = {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens}
            logger.info(f"[OpenAIProvider] Used {prompt_tokens} prompt tokens, {completion_tokens} completion tokens.")
            return text_content, token_usage
        except Exception as e:
            if isinstance(e, ConfigurationError):
                raise e
            logger.error(f"[OpenAIProvider] API error: {e}")
            raise e


class MockProvider(BaseLLMProvider):
    """Deterministic Mock Provider for testing and offline usage."""

    @property
    def name(self) -> str:
        return "mock"

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> Tuple[str, Dict[str, int]]:
        lower = prompt.lower()
        token_usage = {"prompt_tokens": len(prompt) // 4, "completion_tokens": 150}

        if "summary" in lower or "tldr" in lower:
            mock_data = {
                "tldr": "SYNAPSEAI is a comprehensive platform combining transcription, clean architecture, and AI artifact generation.",
                "key_points": [
                    "Modular Python architecture with clean separation of concerns.",
                    "Map-reduce summarization for handling long transcripts.",
                    "Pydantic schema validation for structured JSON artifacts."
                ],
                "sections": [
                    {
                        "title": "Platform Overview",
                        "summary": "Covers core architectural layout and LLM integrations.",
                        "start_time": 0.0
                    }
                ]
            }
        elif "notes" in lower:
            mock_data = {
                "sections": [
                    {
                        "heading": "Core Architectural Concepts",
                        "bullets": [
                            "Isolated transcription service in apps/transcription_service.",
                            "Swappable LLM providers (Anthropic, Gemini, OpenAI, Mock).",
                            "Pydantic artifact validation with 1-step error correction."
                        ],
                        "start_time": 0.0
                    }
                ]
            }
        elif "cards" in lower or "flashcards" in lower:
            mock_data = {
                "cards": [
                    {
                        "question": "What is Map-Reduce summarization?",
                        "answer": "Splitting long text into chunks, summarizing each chunk (Map), then summarizing chunk summaries (Reduce).",
                        "difficulty": "medium"
                    },
                    {
                        "question": "What does Pydantic validation guarantee?",
                        "answer": "That LLM JSON responses conform strictly to defined data types before returning.",
                        "difficulty": "easy"
                    }
                ]
            }
        elif "interviewquestion" in lower or "interviewer" in lower or "target role:" in lower or "candidate history" in lower:
            mock_data = {
                "question": "Tell me about a time you resolved a major production incident under tight deadline pressures.",
                "type": "behavioral",
                "targets": "Incident Response & Communication",
                "difficulty": "medium"
            }
        elif "quiz" in lower or "questions" in lower:
            mock_data = {
                "questions": [
                    {
                        "question": "What is the primary role of the swappable LLM provider abstraction?",
                        "options": [
                            "Hardcoding API keys in code",
                            "Allowing seamless switching between Anthropic, Gemini, and OpenAI",
                            "Deleting temporary files",
                            "Parsing YouTube URLs"
                        ],
                        "correct_index": 1,
                        "explanation": "Provider abstraction decouples generator logic from specific LLM vendors."
                    }
                ]
            }
        elif "mind_map" in lower or "mind map" in lower or "root" in lower:
            mock_data = {
                "root": "SYNAPSEAI Architecture",
                "children": [
                    {
                        "label": "Transcription Service",
                        "children": [
                            {"label": "faster-whisper STT", "children": []},
                            {"label": "pyannote.audio Diarization", "children": []}
                        ]
                    },
                    {
                        "label": "Content Generator",
                        "children": [
                            {"label": "Pydantic Schemas", "children": []},
                            {"label": "Async Parallel Tasks", "children": []}
                        ]
                    }
                ]
            }
        elif "projectideasbatch" in lower or "project ideas" in lower or "learner's existing skills" in lower or "weak topics to reinforce" in lower:
            mock_data = {
                "ideas": [
                    {
                        "title": "Financial Portfolio API & Analytics Service",
                        "description": "Build a REST API to fetch stock price data, compute portfolio returns using pandas, and authenticate users.",
                        "skills_reinforced": ["APIs", "authentication"],
                        "difficulty": "intermediate",
                        "estimated_time": "8-10 hours",
                        "key_features": ["JWT authentication", "Stock price endpoint", "Pandas analytics"],
                        "stretch_goals": ["OAuth2 integration", "Cache analytics in Redis"]
                    },
                    {
                        "title": "Automated Budget Tracking API",
                        "description": "Create a backend system to ingest expense CSVs into pandas DataFrames and serve summary endpoints.",
                        "skills_reinforced": ["APIs", "authentication"],
                        "difficulty": "intermediate",
                        "estimated_time": "6-8 hours",
                        "key_features": ["File upload endpoint", "Expense analytics", "Role-based access"],
                        "stretch_goals": ["Export PDF reports"]
                    }
                ]
            }
        elif "projectroadmap" in lower or "generate sequential build roadmap" in lower:
            mock_data = {
                "title": "Financial Portfolio API & Analytics Service",
                "steps": [
                    {
                        "order": 1,
                        "title": "Set up Database & Authentication Models",
                        "description": "Implement user schema and JWT authentication middleware.",
                        "concepts_needed": ["Python", "JWT", "Authentication"]
                    },
                    {
                        "order": 2,
                        "title": "Build Pandas Financial Analytics Engine",
                        "description": "Write pandas routines to compute rolling returns and portfolio volatility.",
                        "concepts_needed": ["pandas", "DataFrames", "APIs"]
                    }
                ]
            }
        elif "roadmap" in lower or "steps" in lower:
            mock_data = {
                "steps": [
                    {
                        "order": 1,
                        "title": "Master Audio Processing",
                        "description": "Understand FFmpeg 16kHz mono WAV extraction and 5-min overlapping chunking.",
                        "prerequisite_of": [2]
                    },
                    {
                        "order": 2,
                        "title": "Implement Content Generation",
                        "description": "Build swappable LLM providers and Pydantic artifact schemas.",
                        "prerequisite_of": []
                    }
                ]
            }
        elif "topics" in lower or "topic" in lower or "extract" in lower:
            mock_data = {
                "topics": ["Kubernetes", "Docker Containers", "PyTorch Models", "Clean Architecture"]
            }
        elif "tutor" in lower or "student question" in lower or "video context chunks" in lower:
            ungrounded_triggers = ["recipe", "baking", "france", "cookie", "world cup", "jupiter", "engine", "out_of_scope"]
            if any(t in lower for t in ungrounded_triggers):
                mock_data = {
                    "answer": "I don't have enough information from this video",
                    "citations": []
                }
            else:
                mock_data = {
                    "answer": "Clean architecture separates core business logic from framework dependencies.",
                    "citations": [
                        {
                            "start": 0.0,
                            "end": 15.0,
                            "text_snippet": "Clean architecture separates core business logic from framework dependencies."
                        }
                    ]
                }
        elif "codeexplanation" in lower or "explain" in lower or "beginner can follow" in lower:
            mock_data = {
                "summary": "This code defines a function that performs the requested operation.",
                "line_by_line": [
                    {"lines": "Line 1", "explanation": "Defines function signature and parameters."},
                    {"lines": "Line 2", "explanation": "Executes core logic and returns result."}
                ],
                "concepts_used": ["Functions", "Variables", "Control Flow"]
            }
        elif "debugresult" in lower or "debug" in lower or "error_message" in lower or "stated intent" in lower:
            mock_data = {
                "likely_issues": [
                    {
                        "description": "Index out of range / boundary condition issue.",
                        "line_reference": "high = len(arr)",
                        "suggested_fix": "Change high = len(arr) to high = len(arr) - 1."
                    }
                ],
                "corrected_code": "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1"
            }
        elif "testcasesresult" in lower or "test cases" in lower or "target function signature" in lower:
            mock_data = {
                "test_cases": [
                    {
                        "input": {"s": "racecar"},
                        "expected_output": True,
                        "case_type": "typical",
                        "reasoning": "Standard palindrome string."
                    },
                    {
                        "input": {"s": ""},
                        "expected_output": True,
                        "case_type": "edge",
                        "reasoning": "Empty string boundary condition."
                    }
                ]
            }
        elif "complexityanalysis" in lower or "complexity" in lower or "big-o" in lower or "space complexity" in lower:
            mock_data = {
                "time_complexity": "O(n)",
                "space_complexity": "O(1)",
                "reasoning": "Single loop iterating through n elements.",
                "potential_optimizations": ["Early return if target found."]
            }
        elif "interviewquestion" in lower or "interviewer" in lower or "target role:" in lower:
            mock_data = {
                "question": "Tell me about a time you resolved a major production incident under tight deadline pressures.",
                "type": "behavioral",
                "targets": "Incident Response & Communication",
                "difficulty": "medium"
            }
        elif "answerevaluation" in lower or "evaluator" in lower or "candidate's answer" in lower:
            if "vague" in lower or "i fixed it" in lower or "some bugs" in lower:
                mock_data = {
                    "score": 45.0,
                    "strengths": ["Acknowledged the question topic."],
                    "weaknesses": ["Lack of specific metrics or concrete details.", "Missing STAR method structure."],
                    "missing_points": ["Quantifiable impact", "Specific actions taken"],
                    "improved_answer_example": "When production latency spiked to 5s, I isolated the unindexed query and added a composite B-tree index, dropping p99 latency to 45ms."
                }
            else:
                mock_data = {
                    "score": 92.0,
                    "strengths": ["Excellent STAR structure", "Clear technical metrics"],
                    "weaknesses": ["Minor detail missing on load balancer config."],
                    "missing_points": ["Rollback strategy details"],
                    "improved_answer_example": "In addition to adding the composite index, mention automated health checks."
                }
        elif "projectideasbatch" in lower or "project ideas" in lower or "learner's existing skills" in lower:
            mock_data = {
                "ideas": [
                    {
                        "title": "Financial Portfolio API & Analytics Service",
                        "description": "Build a REST API to fetch stock price data, compute portfolio returns using pandas, and authenticate users.",
                        "skills_reinforced": ["APIs", "authentication"],
                        "difficulty": "intermediate",
                        "estimated_time": "8-10 hours",
                        "key_features": ["JWT authentication", "Stock price endpoint", "Pandas analytics"],
                        "stretch_goals": ["OAuth2 integration", "Cache analytics in Redis"]
                    },
                    {
                        "title": "Automated Budget Tracking API",
                        "description": "Create a backend system to ingest expense CSVs into pandas DataFrames and serve summary endpoints.",
                        "skills_reinforced": ["APIs", "authentication"],
                        "difficulty": "intermediate",
                        "estimated_time": "6-8 hours",
                        "key_features": ["File upload endpoint", "Expense analytics", "Role-based access"],
                        "stretch_goals": ["Export PDF reports"]
                    }
                ]
            }
        elif "projectroadmap" in lower or "build roadmap" in lower or "sequential build roadmap" in lower:
            mock_data = {
                "title": "Financial Portfolio API & Analytics Service",
                "steps": [
                    {
                        "order": 1,
                        "title": "Set up Database & Authentication Models",
                        "description": "Implement user schema and JWT authentication middleware.",
                        "concepts_needed": ["Python", "JWT", "Authentication"]
                    },
                    {
                        "order": 2,
                        "title": "Build Pandas Financial Analytics Engine",
                        "description": "Write pandas routines to compute rolling returns and portfolio volatility.",
                        "concepts_needed": ["pandas", "DataFrames", "APIs"]
                    }
                ]
            }
        else:
            mock_data = {"status": "ok", "message": "Mock generation success"}

        return json.dumps(mock_data), token_usage


def get_llm_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    """Factory function resolving configured LLM provider instance (defaults to Gemini API for v1)."""
    name = (provider_name or os.environ.get("LLM_PROVIDER", "gemini")).lower()

    if name == "gemini":
        return GeminiProvider()
    elif name == "anthropic":
        return AnthropicProvider()
    elif name == "openai":
        return OpenAIProvider()
    elif name == "mock":
        return MockProvider()

    logger.info(f"[LLMProvider] Defaulting to GeminiProvider for v1 (requested '{name}').")
    return GeminiProvider()
