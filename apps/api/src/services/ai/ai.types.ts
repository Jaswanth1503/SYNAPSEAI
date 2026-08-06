/**
 * Types and DTOs for AI Service
 */

// Summarize
export interface SummarizeInput {
  transcript: string;
  maxLength?: 'short' | 'medium' | 'detailed';
  language?: string;
}

export interface SummaryResponse {
  title: string;
  summary: string;
  keyTakeaways: string[];
  actionItems: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  estimatedReadTimeMinutes: number;
}

// Answer Doubt
export interface AnswerDoubtInput {
  question: string;
  context?: string;
  transcriptId?: string;
}

export interface AnswerDoubtResponse {
  question: string;
  answer: string;
  confidenceScore: number;
  sources: Array<{
    timestamp?: string;
    textSnippet: string;
  }>;
  relatedQuestions: string[];
}

// Generate Quiz
export interface GenerateQuizInput {
  topic?: string;
  transcript?: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface GenerateQuizResponse {
  quizTitle: string;
  difficulty: string;
  totalQuestions: number;
  questions: QuizQuestion[];
}

// Generate Flashcards
export interface GenerateFlashcardsInput {
  topic?: string;
  transcript?: string;
  count?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface GenerateFlashcardsResponse {
  deckTitle: string;
  totalCards: number;
  flashcards: Flashcard[];
}

// Generate Mind Map
export interface GenerateMindMapInput {
  topic?: string;
  transcript?: string;
  depth?: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  notes?: string;
  children?: MindMapNode[];
}

export interface GenerateMindMapResponse {
  root: MindMapNode;
}
