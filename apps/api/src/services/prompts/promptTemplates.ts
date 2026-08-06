/**
 * Centralized Prompt Templates for AI Services.
 * Decouples prompt formatting logic from service execution.
 */

export function buildSummaryPrompt(transcript?: string, maxLength: string = 'medium'): string {
  return `Summarize the following transcript (${maxLength} length):\n\n${transcript || 'N/A'}`;
}

export function buildDoubtPrompt(question: string, context?: string): string {
  return `Answer the following question given the context.\nContext: ${context || 'N/A'}\nQuestion: ${question}`;
}

export function buildQuizPrompt(topic?: string, count: number = 3): string {
  return `Generate a multiple-choice quiz with ${count} questions on topic: ${topic || 'General Knowledge'}`;
}

export function buildFlashcardsPrompt(topic?: string, count: number = 3): string {
  return `Generate ${count} flashcards (front/back) on topic: ${topic || 'General Topic'}`;
}

export function buildMindMapPrompt(topic?: string): string {
  return `Generate a hierarchical mind map structure for topic: ${topic || 'Main Concept'}`;
}
