"""
Artifact Data Models & Schemas for AI Content Generator in SYNAPSEAI.
Provides Pydantic models when pydantic is available, with dataclass fallbacks.
"""

from typing import List, Literal, Optional, Dict, Any
from dataclasses import dataclass, field
import json

try:
    from pydantic import BaseModel, Field, ValidationError
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False
    BaseModel = object  # type: ignore
    Field = lambda *args, **kwargs: None  # type: ignore
    ValidationError = Exception  # type: ignore


if HAS_PYDANTIC:
    class SummarySection(BaseModel):
        title: str = Field(description="Title of the transcript section")
        summary: str = Field(description="Summary paragraph of the section")
        start_time: float = Field(description="Start timestamp in seconds", default=0.0)

    class SummaryArtifact(BaseModel):
        tldr: str = Field(description="High-level TL;DR summary string")
        key_points: List[str] = Field(description="Array of key bullet points")
        sections: List[SummarySection] = Field(description="Timestamped summary sections")

    class NotesSection(BaseModel):
        heading: str = Field(description="Markdown heading title")
        bullets: List[str] = Field(description="Detailed bullet points under this heading")
        start_time: float = Field(description="Start timestamp in seconds", default=0.0)

    class NotesArtifact(BaseModel):
        sections: List[NotesSection] = Field(description="Structured study notes sections")

    class FlashcardItem(BaseModel):
        question: str = Field(description="Study question")
        answer: str = Field(description="Concise answer")
        difficulty: Literal["easy", "medium", "hard"] = Field(description="Difficulty level")

    class FlashcardsArtifact(BaseModel):
        cards: List[FlashcardItem] = Field(description="List of 10-20 study flashcard items")

    class QuizQuestion(BaseModel):
        question: str = Field(description="Multiple-choice question stem")
        options: List[str] = Field(description="List of 4 candidate options")
        correct_index: int = Field(description="Zero-based index of the correct option (0, 1, 2, or 3)")
        explanation: str = Field(description="Detailed explanation of the correct choice")

    class QuizArtifact(BaseModel):
        questions: List[QuizQuestion] = Field(description="List of 5-10 multiple-choice quiz questions")

    class MindMapNode(BaseModel):
        label: str = Field(description="Node label or concept name")
        children: List['MindMapNode'] = Field(default_factory=list, description="Child nodes (max depth 3)")

    MindMapNode.model_rebuild()

    class MindMapArtifact(BaseModel):
        root: str = Field(description="Root topic name")
        children: List[MindMapNode] = Field(default_factory=list, description="Top-level concept branches")

    class RoadmapStep(BaseModel):
        order: int = Field(description="Step order sequence (1, 2, 3...)")
        title: str = Field(description="Title of the learning step")
        description: str = Field(description="Detailed overview of what to learn")
        prerequisite_of: List[str] = Field(default_factory=list, description="List of step titles this step is a prerequisite for")

    class RoadmapArtifact(BaseModel):
        steps: List[RoadmapStep] = Field(description="Sequential learning roadmap steps")

    class VisualClassification(BaseModel):
        needs_visual: bool = Field(description="Whether this transcript chunk benefits from a visual concept rendering")
        type: Literal["flowchart", "3d_model", "animation", "diagram", "none"] = Field(description="Recommended visual visualization type")
        concept: str = Field(description="Core concept or topic to be visually depicted")

else:
    # Dataclass Fallbacks when Pydantic is not installed
    @dataclass
    class SummarySection:
        title: str
        summary: str
        start_time: float = 0.0

    @dataclass
    class SummaryArtifact:
        tldr: str
        key_points: List[str]
        sections: List[SummarySection]

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            sections = [SummarySection(**s) if isinstance(s, dict) else s for s in data.get("sections", [])]
            return cls(tldr=str(data["tldr"]), key_points=list(data["key_points"]), sections=sections)

        def model_dump(self) -> Dict[str, Any]:
            return {
                "tldr": self.tldr,
                "key_points": self.key_points,
                "sections": [{"title": s.title, "summary": s.summary, "start_time": s.start_time} for s in self.sections]
            }

    @dataclass
    class NotesSection:
        heading: str
        bullets: List[str]
        start_time: float = 0.0

    @dataclass
    class NotesArtifact:
        sections: List[NotesSection]

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            sections = [NotesSection(**s) if isinstance(s, dict) else s for s in data.get("sections", [])]
            return cls(sections=sections)

        def model_dump(self) -> Dict[str, Any]:
            return {
                "sections": [{"heading": s.heading, "bullets": s.bullets, "start_time": s.start_time} for s in self.sections]
            }

    @dataclass
    class FlashcardItem:
        question: str
        answer: str
        difficulty: str

    @dataclass
    class FlashcardsArtifact:
        cards: List[FlashcardItem]

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            cards = [FlashcardItem(**c) if isinstance(c, dict) else c for c in data.get("cards", [])]
            return cls(cards=cards)

        def model_dump(self) -> Dict[str, Any]:
            return {"cards": [{"question": c.question, "answer": c.answer, "difficulty": c.difficulty} for c in self.cards]}

    @dataclass
    class QuizQuestion:
        question: str
        options: List[str]
        correct_index: int
        explanation: str

    @dataclass
    class QuizArtifact:
        questions: List[QuizQuestion]

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            questions = [QuizQuestion(**q) if isinstance(q, dict) else q for q in data.get("questions", [])]
            return cls(questions=questions)

        def model_dump(self) -> Dict[str, Any]:
            return {
                "questions": [
                    {"question": q.question, "options": q.options, "correct_index": q.correct_index, "explanation": q.explanation}
                    for q in self.questions
                ]
            }

    @dataclass
    class MindMapNode:
        label: str
        children: List['MindMapNode'] = field(default_factory=list)

    @dataclass
    class MindMapArtifact:
        root: str
        children: List[MindMapNode] = field(default_factory=list)

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            def parse_node(d: Dict[str, Any]) -> MindMapNode:
                ch = [parse_node(c) if isinstance(c, dict) else c for c in d.get("children", [])]
                return MindMapNode(label=str(d.get("label", "")), children=ch)

            children = [parse_node(c) if isinstance(c, dict) else c for c in data.get("children", [])]
            return cls(root=str(data.get("root", "")), children=children)

        def model_dump(self) -> Dict[str, Any]:
            def dump_node(n: MindMapNode) -> Dict[str, Any]:
                return {"label": n.label, "children": [dump_node(c) for c in n.children]}
            return {"root": self.root, "children": [dump_node(c) for c in self.children]}

    @dataclass
    class RoadmapStep:
        order: int
        title: str
        description: str
        prerequisite_of: List[int] = field(default_factory=list)

    @dataclass
    class RoadmapArtifact:
        steps: List[RoadmapStep]

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            steps = [RoadmapStep(**st) if isinstance(st, dict) else st for st in data.get("steps", [])]
            return cls(steps=steps)

        def model_dump(self) -> Dict[str, Any]:
            return {
                "steps": [
                    {
                        "order": s.order,
                        "title": s.title,
                        "description": s.description,
                        "prerequisite_of": s.prerequisite_of
                    } for s in self.steps
                ]
            }

    @dataclass
    class VisualClassification:
        needs_visual: bool
        type: str
        concept: str

        @classmethod
        def model_validate(cls, data: Dict[str, Any]):
            v_type = str(data.get("type", "none")).lower()
            if v_type not in ("flowchart", "3d_model", "animation", "diagram", "none"):
                v_type = "none"
            return cls(
                needs_visual=bool(data.get("needs_visual", False)),
                type=v_type,
                concept=str(data.get("concept", ""))
            )

        def model_dump(self) -> Dict[str, Any]:
            return {
                "needs_visual": self.needs_visual,
                "type": self.type,
                "concept": self.concept
            }
