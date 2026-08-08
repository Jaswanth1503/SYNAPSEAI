/**
 * Utility functions for AI Services.
 */

/**
 * Simulates network latency for asynchronous AI API calls.
 */
export function simulateDelay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON strings with fallback.
 */
export function safeParseJson<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}
