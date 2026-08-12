"""
Unit tests for AI Mock Interview Engine (mock_interview.py).
Validates semantic duplicate question prevention, answer evaluation score differentiation (vague vs STAR specific),
and report category score aggregation.
"""

import unittest
from apps.transcription_service import (
    generate_interview_question,
    evaluate_answer,
    run_interview_session,
    compile_interview_report,
    InterviewQuestion,
    AnswerEvaluation,
    InterviewSessionPlan,
    InterviewReport,
)
from apps.transcription_service.mock_interview import _is_duplicate_question


class TestMockInterview(unittest.TestCase):

    def test_semantic_duplicate_question_prevention(self):
        q1 = "Tell me about a time you handled a difficult production bug."
        q2 = "Describe a situation where you fixed a tough production issue under pressure."

        # Vector embedding cosine similarity should recognize these as semantically duplicate
        is_dup = _is_duplicate_question(q2, [q1], similarity_threshold=0.75)
        self.assertTrue(is_dup)

        different_q = "How do you optimize SQL database query performance?"
        is_not_dup = _is_duplicate_question(different_q, [q1], similarity_threshold=0.85)
        self.assertFalse(is_not_dup)

    def test_vague_vs_specific_answer_evaluation_scores(self):
        question = InterviewQuestion(
            question="Tell me about a time you optimized a slow system.",
            type="behavioral",
            targets="Performance Optimization",
            difficulty="medium"
        )

        vague_answer = "I fixed it when it was slow. I looked at the code and made some changes and then it ran faster."
        specific_star_answer = (
            "Situation: Our API p99 latency spiked to 4.2 seconds during peak traffic.\n"
            "Task: I was tasked with bringing response times under 200ms.\n"
            "Action: I profiled the query execution plan, identified an unindexed JOIN on user_id, "
            "and added a composite B-tree index while implementing Redis caching for read-heavy routes.\n"
            "Result: Reduced p99 latency by 95% down to 110ms and saved $3k/month in cloud infrastructure costs."
        )

        eval_vague = evaluate_answer(question, vague_answer, provider_name="mock")
        eval_specific = evaluate_answer(question, specific_star_answer, provider_name="mock")

        # Specific STAR answer must score higher than vague answer
        self.assertGreater(eval_specific.score, eval_vague.score)
        self.assertGreater(len(eval_vague.weaknesses), 0)

    def test_compile_interview_report_category_averaging(self):
        qs = [
            InterviewQuestion(question="Q1", type="behavioral", targets="Leadership", difficulty="medium"),
            InterviewQuestion(question="Q2", type="behavioral", targets="Conflict", difficulty="medium"),
            InterviewQuestion(question="Q3", type="technical", targets="System Design", difficulty="hard")
        ]

        evals = [
            AnswerEvaluation(score=80.0, strengths=["Good"], weaknesses=[], missing_points=[], improved_answer_example="Ex"),
            AnswerEvaluation(score=60.0, strengths=["Okay"], weaknesses=["Vague"], missing_points=[], improved_answer_example="Ex"),
            AnswerEvaluation(score=90.0, strengths=["Great STAR"], weaknesses=[], missing_points=[], improved_answer_example="Ex")
        ]

        report = compile_interview_report(qs, evals)

        self.assertIsInstance(report, InterviewReport)
        # Behavioral avg: (80 + 60) / 2 = 70.0
        # Technical avg: 90.0 / 1 = 90.0
        # Overall avg: (80 + 60 + 90) / 3 = 76.7
        self.assertEqual(report.category_scores["behavioral"], 70.0)
        self.assertEqual(report.category_scores["technical"], 90.0)
        self.assertEqual(report.overall_score, 76.7)

    def test_run_interview_session_initialization(self):
        plan = run_interview_session(resume=None, target_role="Backend Engineer", question_count=4, provider_name="mock")
        self.assertIsInstance(plan, InterviewSessionPlan)
        self.assertEqual(plan.target_role, "Backend Engineer")
        self.assertEqual(plan.planned_questions_count, 4)
        self.assertIsInstance(plan.initial_question, InterviewQuestion)


if __name__ == "__main__":
    unittest.main()
