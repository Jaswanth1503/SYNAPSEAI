"""
Unit tests for Communication Coaching ML Analysis Component (coaching_analyzer.py).
Validates WPM calculation accuracy, filler word counting correctness, grounded confidence score deductions,
and compiled coaching report generation.
"""

import unittest
from apps.transcription_service import (
    analyze_speech_metrics,
    analyze_confidence,
    analyze_visual_signals,
    compile_report,
    TranscriptResult,
    Segment,
)


class TestCoachingAnalyzer(unittest.TestCase):
    def setUp(self):
        # 120 words spoken in 60 seconds = 120.0 WPM ("good")
        sample_words = ["word"] * 120
        text = " ".join(sample_words)
        self.good_transcript = TranscriptResult(
            video_id="speech_test_1",
            duration_sec=60.0,
            segments=[Segment(start=0.0, end=60.0, text=text, speaker="[Speaker 00]")]
        )

    def test_wpm_calculation_accuracy_and_status(self):
        metrics = analyze_speech_metrics(self.good_transcript, provider_name="mock")
        self.assertEqual(metrics["wpm"], 120.0)
        self.assertEqual(metrics["wpm_status"], "good")
        self.assertEqual(metrics["total_words"], 120)

        # 200 words in 60 seconds = 200 WPM ("too_fast")
        fast_text = " ".join(["fast"] * 200)
        fast_t = TranscriptResult(
            video_id="f1", duration_sec=60.0,
            segments=[Segment(start=0.0, end=60.0, text=fast_text, speaker="[Speaker 00]")]
        )
        fast_m = analyze_speech_metrics(fast_t, provider_name="mock")
        self.assertEqual(fast_m["wpm_status"], "too_fast")

        # 60 words in 60 seconds = 60 WPM ("too_slow")
        slow_text = " ".join(["slow"] * 60)
        slow_t = TranscriptResult(
            video_id="s1", duration_sec=60.0,
            segments=[Segment(start=0.0, end=60.0, text=slow_text, speaker="[Speaker 00]")]
        )
        slow_m = analyze_speech_metrics(slow_t, provider_name="mock")
        self.assertEqual(slow_m["wpm_status"], "too_slow")

    def test_filler_word_counting_correctness(self):
        filler_text = "Um hello, uh I like think you know this is, um, so good."
        t = TranscriptResult(
            video_id="fillers_1", duration_sec=60.0,
            segments=[Segment(start=0.0, end=60.0, text=filler_text, speaker="[Speaker 00]")]
        )
        metrics = analyze_speech_metrics(t, provider_name="mock")

        self.assertGreater(metrics["total_fillers"], 0)
        self.assertIn("um", metrics["filler_breakdown"])
        self.assertIn("uh", metrics["filler_breakdown"])
        self.assertEqual(metrics["fillers_per_minute"], float(metrics["total_fillers"]))

    def test_confidence_score_deduction_on_hedging_phrases(self):
        # Assertive text (no hedging)
        assertive_t = TranscriptResult(
            video_id="c1", duration_sec=60.0,
            segments=[Segment(start=0.0, end=60.0, text="Our quarterly results exceeded targets by 20 percent. We deployed three new features.", speaker="[Speaker 00]")]
        )
        assertive_m = analyze_speech_metrics(assertive_t, provider_name="mock")
        c_assertive = analyze_confidence(assertive_t, assertive_m)

        # Hedging text
        hedging_t = TranscriptResult(
            video_id="c2", duration_sec=60.0,
            segments=[Segment(start=0.0, end=60.0, text="I think maybe sort of we guess our results were kind of good probably.", speaker="[Speaker 00]")]
        )
        hedging_m = analyze_speech_metrics(hedging_t, provider_name="mock")
        c_hedging = analyze_confidence(hedging_t, hedging_m)

        # Hedging speech should score significantly lower confidence than assertive speech
        self.assertGreater(c_assertive["score"], c_hedging["score"])
        self.assertGreater(c_hedging["hedging_count"], 0)

    def test_compile_report(self):
        metrics = analyze_speech_metrics(self.good_transcript, provider_name="mock")
        conf = analyze_confidence(self.good_transcript, metrics)
        report = compile_report(metrics, conf, grammar_issues=[])

        self.assertIn("overall_score", report)
        self.assertIn("actionable_feedback", report)
        self.assertIsInstance(report["actionable_feedback"], list)
        self.assertLessEqual(len(report["actionable_feedback"]), 3)


if __name__ == "__main__":
    unittest.main()
