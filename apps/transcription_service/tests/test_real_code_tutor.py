"""
Real Data Verification Script for AI Coding Tutor Backend Logic.
Executes explain_code, debug_code, generate_test_cases, and analyze_complexity against real non-trivial code snippets using the live Gemini provider.
"""

import os
import sys
import json
import logging
from pathlib import Path

# UTF-8 Console reconfigure
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("RealCodeTutorCheck")

# Auto-load .env
project_root = Path(__file__).resolve().parents[3]
api_env = project_root / "apps" / "api" / ".env"
root_env = project_root / ".env"

def load_env_file(env_path: Path):
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip("'\"")

if api_env.exists():
    load_env_file(api_env)
elif root_env.exists():
    load_env_file(root_env)

sys.path.insert(0, str(project_root))

from apps.transcription_service import (
    explain_code,
    debug_code,
    generate_test_cases,
    analyze_complexity,
    llm_providers
)


def run_real_code_tutor_verification():
    logger.info("=== STARTING REAL AI CODING TUTOR VERIFICATION ===")

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise llm_providers.ConfigurationError("Valid GEMINI_API_KEY required in apps/api/.env for live test.")

    # 1. explain_code: LRU Cache Implementation
    lru_cache_code = (
        "class Node:\n"
        "    def __init__(self, key, val):\n"
        "        self.key, self.val = key, val\n"
        "        self.prev = self.next = None\n\n"
        "class LRUCache:\n"
        "    def __init__(self, capacity: int):\n"
        "        self.cap = capacity\n"
        "        self.cache = {}\n"
        "        self.left, self.right = Node(0, 0), Node(0, 0)\n"
        "        self.left.next, self.right.prev = self.right, self.left\n\n"
        "    def remove(self, node):\n"
        "        prev, nxt = node.prev, node.next\n"
        "        prev.next, nxt.prev = nxt, prev\n\n"
        "    def insert(self, node):\n"
        "        prev, nxt = self.right.prev, self.right\n"
        "        prev.next = nxt.prev = node\n"
        "        node.prev, node.next = prev, nxt\n\n"
        "    def get(self, key: int) -> int:\n"
        "        if key in self.cache:\n"
        "            self.remove(self.cache[key])\n"
        "            self.insert(self.cache[key])\n"
        "            return self.cache[key].val\n"
        "        return -1\n"
    )

    logger.info("1. Executing explain_code() via live Gemini Provider...")
    explanation = explain_code(lru_cache_code, language="python", provider_name="gemini")

    print("\n=======================================================")
    print("1. EXPLAIN_CODE OUTPUT (LRU Cache)")
    print("=======================================================")
    print("INPUT CODE:\n", lru_cache_code)
    print("OUTPUT JSON:\n", json.dumps(explanation.model_dump(), indent=2))

    # 2. debug_code: Binary Search with Intentional Bug
    buggy_code = (
        "def binary_search(arr, target):\n"
        "    low = 0\n"
        "    high = len(arr)  # INTENTIONAL BUG: should be len(arr) - 1\n"
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
    error_msg = "IndexError: list index out of range at line 6 (arr[mid]) when searching target in single-element array [5]"

    logger.info("2. Executing debug_code() via live Gemini Provider...")
    debug_res = debug_code(
        code=buggy_code,
        language="python",
        error_message=error_msg,
        expected_behavior="Return correct 0-based index of target in sorted array arr, or -1 if target not found without IndexError.",
        provider_name="gemini"
    )

    print("\n=======================================================")
    print("2. DEBUG_CODE OUTPUT (Binary Search Off-by-One Bug)")
    print("=======================================================")
    print("INPUT CODE:\n", buggy_code)
    print("ERROR MSG:\n", error_msg)
    print("OUTPUT JSON:\n", json.dumps(debug_res.model_dump(), indent=2))

    # 3. generate_test_cases: Palindrome Function Signature
    palindrome_code = (
        "def is_palindrome(s: str) -> bool:\n"
        "    clean = [c.lower() for c in s if c.isalnum()]\n"
        "    return clean == clean[::-1]"
    )
    sig = "is_palindrome(s: str) -> bool"

    logger.info("3. Executing generate_test_cases() via live Gemini Provider...")
    test_cases = generate_test_cases(palindrome_code, language="python", function_signature=sig, provider_name="gemini")

    print("\n=======================================================")
    print("3. GENERATE_TEST_CASES OUTPUT (Palindrome)")
    print("=======================================================")
    print("FUNCTION SIGNATURE:", sig)
    print("OUTPUT JSON:\n", json.dumps([tc.model_dump() for tc in test_cases], indent=2))

    # 4. analyze_complexity: Nested Loop Matrix Multiplication O(n^3)
    matrix_code = (
        "def multiply_matrices(A, B):\n"
        "    n = len(A)\n"
        "    C = [[0] * n for _ in range(n)]\n"
        "    for i in range(n):\n"
        "        for j in range(n):\n"
        "            for k in range(n):\n"
        "                C[i][j] += A[i][k] * B[k][j]\n"
        "    return C"
    )

    logger.info("4. Executing analyze_complexity() via live Gemini Provider...")
    complexity = analyze_complexity(matrix_code, language="python", provider_name="gemini")

    print("\n=======================================================")
    print("4. ANALYZE_COMPLEXITY OUTPUT (Matrix Multiplication)")
    print("=======================================================")
    print("INPUT CODE:\n", matrix_code)
    print("OUTPUT JSON:\n", json.dumps(complexity.model_dump(), indent=2))

    logger.info("=== REAL AI CODING TUTOR VERIFICATION COMPLETE ===")


if __name__ == "__main__":
    run_real_code_tutor_verification()
