"""
Unit tests for AI Coding Tutor Backend Logic (code_tutor.py).
Validates explain_code, debug_code, generate_test_cases, and analyze_complexity using mock LLM provider.
"""

import unittest
from apps.transcription_service import (
    explain_code,
    debug_code,
    generate_test_cases,
    analyze_complexity,
    CodeExplanation,
    DebugResult,
    TestCase,
    ComplexityAnalysis,
)


class TestCodeTutor(unittest.TestCase):

    def test_explain_code_structure(self):
        code = "def add(a, b):\n    return a + b"
        result = explain_code(code, language="python", provider_name="mock")
        self.assertIsInstance(result, CodeExplanation)
        self.assertTrue(hasattr(result, "summary"))
        self.assertTrue(hasattr(result, "line_by_line"))
        self.assertTrue(hasattr(result, "concepts_used"))

    def test_debug_code_broken_snippet(self):
        # Off-by-one bug in binary search
        broken_binary_search = (
            "def binary_search(arr, target):\n"
            "    low = 0\n"
            "    high = len(arr)  # Bug: should be len(arr) - 1\n"
            "    while low <= high:\n"
            "        mid = (low + high) // 2\n"
            "        if arr[mid] == target:\n"
            "            return mid\n"
            "        elif arr[mid] < target:\n"
            "            low = mid + 1\n"
            "        else:\n"
            "            high = mid - 1\n"
            "    return -1"
        )
        error_msg = "IndexError: list index out of range at line 6"
        result = debug_code(
            code=broken_binary_search,
            language="python",
            error_message=error_msg,
            provider_name="mock"
        )

        self.assertIsInstance(result, DebugResult)
        self.assertGreater(len(result.likely_issues), 0)

    def test_generate_test_cases_signature(self):
        code = "def is_palindrome(s: str) -> bool:\n    return s == s[::-1]"
        sig = "is_palindrome(s: str) -> bool"
        test_cases = generate_test_cases(code, language="python", function_signature=sig, provider_name="mock")

        self.assertIsInstance(test_cases, list)
        self.assertGreater(len(test_cases), 0)
        for tc in test_cases:
            self.assertIsInstance(tc, TestCase)
            self.assertIn(tc.case_type, ["typical", "edge", "invalid"])

    def test_analyze_complexity_single_vs_nested(self):
        # Single loop -> O(n)
        single_loop_code = "def find_max(arr):\n    m = arr[0]\n    for x in arr:\n        if x > m:\n            m = x\n    return m"
        single_comp = analyze_complexity(single_loop_code, language="python", provider_name="mock")
        self.assertIsInstance(single_comp, ComplexityAnalysis)

        # Nested loops -> O(n^2)
        nested_loop_code = "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]"
        nested_comp = analyze_complexity(nested_loop_code, language="python", provider_name="mock")
        self.assertIsInstance(nested_comp, ComplexityAnalysis)


if __name__ == "__main__":
    unittest.main()
