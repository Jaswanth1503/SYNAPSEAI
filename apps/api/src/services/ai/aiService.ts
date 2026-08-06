import {
  SummarizeInput,
  SummaryResponse,
  AnswerDoubtInput,
  AnswerDoubtResponse,
  GenerateQuizInput,
  GenerateQuizResponse,
  GenerateFlashcardsInput,
  GenerateFlashcardsResponse,
  GenerateMindMapInput,
  GenerateMindMapResponse,
} from './ai.types';
import { simulateDelay } from '../utils';
import {
  buildSummaryPrompt,
  buildDoubtPrompt,
  buildQuizPrompt,
  buildFlashcardsPrompt,
  buildMindMapPrompt,
} from '../prompts';

/**
 * AI Service implementation providing stub functions returning mock JSON.
 * Follows clean architecture principles for easy LLM / external API integration.
 */

/**
 * Generates a structured summary from a transcript or text content.
 */
export async function summarize(input?: SummarizeInput): Promise<SummaryResponse> {
  await simulateDelay(100);

  const _prompt = buildSummaryPrompt(input?.transcript, input?.maxLength);

  return {
    title: 'Executive Summary: Artificial Intelligence Architecture',
    summary:
      'This document provides an overview of Node.js, Express, TypeScript, and Clean Architecture for scalable AI-driven web applications.',
    keyTakeaways: [
      'Clean architecture decouples core business logic from framework dependencies.',
      'TypeScript ensures type safety across service request and response contracts.',
      'Modular folders (ai, transcript, prompts, utils) enable clear separation of concerns.',
    ],
    actionItems: [
      'Define domain interfaces and DTOs.',
      'Implement service stubs with mock JSON data.',
      'Integrate LLM API providers in future iterations.',
    ],
    sentiment: 'positive',
    estimatedReadTimeMinutes: 3,
  };
}

/**
 * Answers a user doubt or question given transcript context.
 */
export async function answerDoubt(input?: AnswerDoubtInput): Promise<AnswerDoubtResponse> {
  await simulateDelay(100);

  const _prompt = buildDoubtPrompt(input?.question || 'What is clean architecture?', input?.context);

  return {
    question: input?.question || 'How does clean architecture benefit Node.js applications?',
    answer:
      'Clean architecture separates business logic into distinct layers. This makes the codebase maintainable, testable, and independent of external frameworks or APIs.',
    confidenceScore: 0.95,
    sources: [
      {
        timestamp: '02:15',
        textSnippet: 'Clean architecture emphasizes software design principles like SoC and dependency inversion.',
      },
    ],
    relatedQuestions: [
      'What are the main layers of clean architecture?',
      'How to structure TypeScript services in Express?',
    ],
  };
}

/**
 * Generates a multiple-choice quiz based on given text or topic.
 */
export async function generateQuiz(input?: GenerateQuizInput): Promise<GenerateQuizResponse> {
  await simulateDelay(100);

  const _prompt = buildQuizPrompt(input?.topic || 'General Knowledge', input?.numQuestions || 2);

  return {
    quizTitle: `Quiz: ${input?.topic || 'TypeScript & Clean Architecture'}`,
    difficulty: input?.difficulty || 'medium',
    totalQuestions: 2,
    questions: [
      {
        id: 'q1',
        question: 'What is the primary objective of clean architecture?',
        options: [
          'To couple business logic with database frameworks',
          'To separate core business rules from external details',
          'To write single-file monolith applications',
          'To avoid using TypeScript interfaces',
        ],
        correctOptionIndex: 1,
        explanation: 'Clean architecture isolates business rules so they do not depend on external frameworks or UI.',
      },
      {
        id: 'q2',
        question: 'Which directory should house prompt formatting templates in the AI service?',
        options: ['services/utils', 'services/prompts', 'services/transcript', 'services/ai'],
        correctOptionIndex: 1,
        explanation: 'Prompt templates belong in services/prompts for clear separation of concerns.',
      },
    ],
  };
}

/**
 * Generates study flashcards from a topic or transcript.
 */
export async function generateFlashcards(input?: GenerateFlashcardsInput): Promise<GenerateFlashcardsResponse> {
  await simulateDelay(100);

  const _prompt = buildFlashcardsPrompt(input?.topic || 'Architecture Concepts', input?.count || 3);

  return {
    deckTitle: `Flashcards: ${input?.topic || 'Node.js & AI Integration'}`,
    totalCards: 3,
    flashcards: [
      {
        id: 'fc-1',
        front: 'What is a stub function?',
        back: 'A temporary or placeholder function implementation returning mock data for testing or architectural design.',
        category: 'Software Engineering',
      },
      {
        id: 'fc-2',
        front: 'What does SoC stand for in software design?',
        back: 'Separation of Concerns - dividing a computer program into distinct sections.',
        category: 'Architecture',
      },
      {
        id: 'fc-3',
        front: 'Why use mock JSON in early development?',
        back: 'It allows frontend and API consumer development to proceed concurrently before backend AI APIs are fully integrated.',
        category: 'Best Practices',
      },
    ],
  };
}

/**
 * Generates a hierarchical mind map structure.
 */
export async function generateMindMap(input?: GenerateMindMapInput): Promise<GenerateMindMapResponse> {
  await simulateDelay(100);

  const _prompt = buildMindMapPrompt(input?.topic || 'AI Service Architecture');

  return {
    root: {
      id: 'root-1',
      label: input?.topic || 'AI Service Architecture',
      notes: 'Root node for AI backend service module',
      children: [
        {
          id: 'node-1',
          label: 'Core Services',
          children: [
            { id: 'node-1-1', label: 'services/ai (Stub Functions)' },
            { id: 'node-1-2', label: 'services/transcript (Transcript Processing)' },
          ],
        },
        {
          id: 'node-2',
          label: 'Supporting Modules',
          children: [
            { id: 'node-2-1', label: 'services/prompts (Prompt Templates)' },
            { id: 'node-2-2', label: 'services/utils (Helpers & Utilities)' },
          ],
        },
        {
          id: 'node-3',
          label: 'Mock Responses',
          children: [
            { id: 'node-3-1', label: 'Typed DTOs' },
            { id: 'node-3-2', label: 'Simulated Async Delays' },
          ],
        },
      ],
    },
  };
}
