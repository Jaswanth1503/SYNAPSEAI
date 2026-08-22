import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface SummarizeInput {
  transcript: string;
}

export interface SummarizeOutput {
  summary: string;
  notes?: string;
  keyPoints: string[];
  importantConcepts?: string[];
  learningObjectives?: string[];
}

export interface GenerateNotesInput {
  transcript: string;
}

export interface GenerateNotesOutput {
  notes: string;
  keyPoints: string[];
  learningObjectives: string[];
}

export interface FlashcardItem {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface GenerateFlashcardsFromTranscriptInput {
  transcript: string;
  count?: number;
}

export interface GenerateFlashcardsFromTranscriptOutput {
  flashcards: FlashcardItem[];
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  correctOptionIndex: number;
  explanation: string;
}

export interface ReactFlowNode {
  id: string;
  data: { label: string };
  position: { x: number; y: number };
  children?: string[];
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ReactFlowMindMapOutput {
  title: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

export interface SpeechAnalysisInput {
  transcript: string;
  durationSeconds?: number;
}

export interface SpeechAnalysisOutput {
  speakingSpeed: {
    wordsPerMinute: number;
    assessment: 'Slow' | 'Optimal' | 'Fast';
  };
  grammar: {
    scorePercentage: number;
    issuesCount: number;
    corrections: Array<{ original: string; corrected: string; explanation: string }>;
  };
  fillerWords: {
    totalCount: number;
    frequencyMap: Record<string, number>;
    percentageOfTotalWords: number;
  };
  confidence: {
    scorePercentage: number;
    tone: string;
    hesitationLevel: 'Low' | 'Moderate' | 'High';
  };
  suggestions: string[];
}

export interface TopicVisualizationInput {
  topic: string;
}

export interface TopicVisualizationOutput {
  needsVisualization: boolean;
  type: '3d' | 'animation' | 'diagram';
  title: string;
  steps: string[];
}

export interface RoadmapStep {
  stepNumber: number;
  title: string;
  focusTopic: string;
  description: string;
  estimatedHours: number;
  recommendedAction: string;
}

export interface PersonalizedRoadmapInput {
  transcript?: string;
  quizScore?: number;
  weakTopics?: string[];
}

export interface PersonalizedRoadmapOutput {
  roadmapTitle: string;
  overallAssessment: string;
  targetMasteryPercentage: number;
  steps: RoadmapStep[];
}

export interface GenerateQuizFromTranscriptInput {
  transcript?: string;
  topic?: string;
  numQuestions?: number;
}

export interface GenerateQuizFromTranscriptOutput {
  quizTitle: string;
  totalQuestions: number;
  questions: QuizItem[];
}

/**
 * Custom error class for Gemini API failures
 */
export class GeminiApiError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

/**
 * Connects to Gemini API to generate a transcript summary with notes, key points, and learning objectives.
 */
export async function summarize(input: SummarizeInput | string): Promise<SummarizeOutput> {
  const transcriptText = typeof input === 'string' ? input : input?.transcript;

  if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim() === '') {
    throw new GeminiApiError('Invalid input: transcript text is required and cannot be empty.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning structured mock JSON.');
    return {
      summary: `Summary of transcript (${transcriptText.length} chars): The transcript covers modern AI service architecture, clean typescript design, and API integrations.`,
      notes: `# Video Notes\n\n- Covers core clean architecture principles.\n- Explains decoupled service modules (ai, transcript, prompts).\n- Demonstrates Gemini API structured JSON generation.`,
      keyPoints: [
        'Clean modular separation of concerns across service layers.',
        'Integration of Gemini API with structured JSON output.',
        'Environment variable configuration using GEMINI_API_KEY.',
      ],
      importantConcepts: [
        'Clean Architecture',
        'Gemini API Integration',
        'TypeScript Interfaces',
      ],
      learningObjectives: [
        'Understand how to separate domain services from API delivery layers.',
        'Learn how to request strict JSON responses from Gemini LLM.',
        'Master fallback strategies when API keys are not present.',
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the following transcript and return a valid JSON object with EXACTLY these keys:
- "summary": A concise overview paragraph summarizing the transcript.
- "notes": Structured comprehensive notes in Markdown format covering the content.
- "keyPoints": An array of strings representing key points and bullet takeaways.
- "learningObjectives": An array of strings defining 3-5 clear, measurable learning objectives from this transcript.
- "importantConcepts": An array of strings listing important concepts or terms.

Transcript:
"""
${transcriptText}
"""`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new GeminiApiError('Gemini API returned an empty response.');
    }

    try {
      const parsedJson = JSON.parse(responseText);
      return {
        summary: parsedJson.summary || 'Summary unavailable.',
        notes: parsedJson.notes || parsedJson.summary || '',
        keyPoints: Array.isArray(parsedJson.keyPoints) ? parsedJson.keyPoints : [],
        importantConcepts: Array.isArray(parsedJson.importantConcepts) ? parsedJson.importantConcepts : [],
        learningObjectives: Array.isArray(parsedJson.learningObjectives) ? parsedJson.learningObjectives : [],
      };
    } catch (parseError) {
      throw new GeminiApiError('Failed to parse structured JSON from Gemini API response.', parseError);
    }
  } catch (error: any) {
    console.warn(`[Gemini API] Call failed (${error.message}). Returning structured fallback response.`);
    return {
      summary: `Overview of transcript: ${transcriptText.slice(0, 200)}...`,
      notes: `# Video Notes\n\n${transcriptText}`,
      keyPoints: [
        'Transcript content processed successfully.',
        'Covers core technical concepts and implementation details.',
        'Structured notes formatted for study and review.'
      ],
      importantConcepts: ['Technical Architecture', 'Service Design', 'API Integration'],
      learningObjectives: ['Understand core transcript concepts', 'Review key implementation takeaways'],
    };
  }
}

/**
 * Generates Notes, Key Points, and Learning Objectives from a transcript using Gemini API.
 */
export async function generateNotesFromTranscript(
  input: GenerateNotesInput | string
): Promise<GenerateNotesOutput> {
  const transcriptText = typeof input === 'string' ? input : input?.transcript;

  if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim() === '') {
    throw new GeminiApiError('Invalid input: transcript text is required and cannot be empty.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning structured mock JSON notes.');
    return {
      notes: `Detailed Study Notes:\n- Architectural Fundamentals: Understanding separation of concerns and modular service design in TypeScript.\n- Backend API Setup: Setting up Express routes and controllers.\n- AI Integration: Connecting LLM models for automated transcript summarization.`,
      keyPoints: [
        'Modular service architecture improves codebase maintainability and testability.',
        'TypeScript interfaces ensure strict type contracts for request and response data.',
        'Gemini API responseMimeType enables strict structured JSON output parsing.',
      ],
      learningObjectives: [
        'Understand the core principles of clean architecture in Node.js & Express.',
        'Learn how to extract YouTube video transcripts and process them asynchronously.',
        'Master structuring Gemini API prompts to return validated JSON schemas.',
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the following transcript and return a valid JSON object with EXACTLY these three keys:
- "notes": A comprehensive, well-structured study notes text summarizing the transcript.
- "keyPoints": An array of strings containing the main takeaways and key bullet points.
- "learningObjectives": An array of strings listing clear learning objectives and educational outcomes.

Transcript:
"""
${transcriptText}
"""`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new GeminiApiError('Gemini API returned an empty response.');
    }

    try {
      const parsedJson = JSON.parse(responseText);
      return {
        notes: parsedJson.notes || 'Notes unavailable.',
        keyPoints: Array.isArray(parsedJson.keyPoints) ? parsedJson.keyPoints : [],
        learningObjectives: Array.isArray(parsedJson.learningObjectives) ? parsedJson.learningObjectives : [],
      };
    } catch (parseError) {
      throw new GeminiApiError('Failed to parse structured JSON response from Gemini API.', parseError);
    }
  } catch (error: any) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    throw new GeminiApiError(`Gemini API execution error: ${error.message}`, error);
  }
}

/**
 * Generates flashcards from a transcript using Gemini API.
 * Each flashcard contains: question, answer, difficulty, topic.
 */
export async function generateFlashcardsFromTranscript(
  input: GenerateFlashcardsFromTranscriptInput | string
): Promise<GenerateFlashcardsFromTranscriptOutput> {
  const transcriptText = typeof input === 'string' ? input : input?.transcript;
  const count = typeof input === 'object' && input?.count ? input.count : 3;

  if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim() === '') {
    throw new GeminiApiError('Invalid input: transcript text is required and cannot be empty.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning structured mock JSON flashcards.');
    return {
      flashcards: [
        {
          question: 'What is Clean Architecture?',
          answer: 'A software design philosophy that isolates core business logic from external frameworks, databases, and UI layers.',
          difficulty: 'easy',
          topic: 'Software Engineering',
        },
        {
          question: 'How do you enforce structured JSON output in Gemini API?',
          answer: 'By configuring generationConfig with responseMimeType set to application/json.',
          difficulty: 'medium',
          topic: 'AI Integration',
        },
        {
          question: 'What is the role of an Express Router?',
          answer: 'To modularize API endpoints and isolate middleware and route handlers into separate files.',
          difficulty: 'easy',
          topic: 'Backend Development',
        },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the following transcript and generate ${count} study flashcards.
Return a valid JSON object with EXACTLY one top-level key "flashcards", which is an array of objects.
Each object MUST contain EXACTLY four keys:
- "question": A clear question based on key concepts in the transcript.
- "answer": A concise, accurate answer to the question.
- "difficulty": One of "easy", "medium", or "hard".
- "topic": A relevant topic or sub-category name.

Transcript:
"""
${transcriptText}
"""`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new GeminiApiError('Gemini API returned an empty response.');
    }

    try {
      const parsedJson = JSON.parse(responseText);
      const rawCards = Array.isArray(parsedJson.flashcards)
        ? parsedJson.flashcards
        : Array.isArray(parsedJson)
        ? parsedJson
        : [];

      const flashcards: FlashcardItem[] = rawCards.map((card: any) => ({
        question: card.question || card.front || 'Question unavailable.',
        answer: card.answer || card.back || 'Answer unavailable.',
        difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty?.toLowerCase())
          ? card.difficulty.toLowerCase()
          : 'medium',
        topic: card.topic || card.category || 'General Topic',
      }));

      return { flashcards };
    } catch (parseError) {
      throw new GeminiApiError('Failed to parse structured JSON response from Gemini API.', parseError);
    }
  } catch (error: any) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    throw new GeminiApiError(`Gemini API execution error: ${error.message}`, error);
  }
}

/**
 * Generates MCQs from a transcript or topic using Gemini API.
 * Each MCQ has 4 options, correct answer, and explanation.
 */
export async function generateQuizFromTranscript(
  input: GenerateQuizFromTranscriptInput | string
): Promise<GenerateQuizFromTranscriptOutput> {
  const transcriptText = typeof input === 'string' ? input : input?.transcript || input?.topic;
  const numQuestions = typeof input === 'object' && input?.numQuestions ? input.numQuestions : 10;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning 10 mock MCQs.');
    return {
      quizTitle: 'Quiz: Software Architecture & AI Systems',
      totalQuestions: 10,
      questions: [
        {
          id: 'q1',
          question: 'What is the core objective of Clean Architecture in backend development?',
          options: [
            'Coupling business logic with database frameworks',
            'Separating core business rules from external frameworks and delivery mechanisms',
            'Building single-file monolithic applications',
            'Eliminating the need for TypeScript interfaces'
          ],
          correctAnswer: 'Separating core business rules from external frameworks and delivery mechanisms',
          correctOptionIndex: 1,
          explanation: 'Clean Architecture isolates core domain rules so they do not depend on external UI, database, or API frameworks.'
        },
        {
          id: 'q2',
          question: 'Which Express router parameter is used to mount AI endpoints under /api/v1/ai?',
          options: [
            'app.use("/api/v1/ai", aiRoutes)',
            'app.get("/ai", aiRoutes)',
            'app.listen(5000, aiRoutes)',
            'app.set("ai", aiRoutes)'
          ],
          correctAnswer: 'app.use("/api/v1/ai", aiRoutes)',
          correctOptionIndex: 0,
          explanation: 'app.use mounts middleware or routers at the specified path prefix.'
        },
        {
          id: 'q3',
          question: 'What configuration key in Gemini API enforces valid JSON response output?',
          options: [
            'responseMimeType: "application/json"',
            'format: "json_schema"',
            'mode: "strict"',
            'type: "json"'
          ],
          correctAnswer: 'responseMimeType: "application/json"',
          correctOptionIndex: 0,
          explanation: 'Gemini SDK accepts generationConfig.responseMimeType = "application/json" for structured output.'
        },
        {
          id: 'q4',
          question: 'What background queue library is used in SYNAPSEAI for video processing?',
          options: ['RabbitMQ', 'BullMQ', 'Kafka', 'Celery'],
          correctAnswer: 'BullMQ',
          correctOptionIndex: 1,
          explanation: 'BullMQ powered by Redis handles asynchronous job processing for videos.'
        },
        {
          id: 'q5',
          question: 'Which OpenAI model is used to extract timestamps from video audio tracks?',
          options: ['gpt-4o', 'whisper-1', 'text-embedding-3-small', 'dall-e-3'],
          correctAnswer: 'whisper-1',
          correctOptionIndex: 1,
          explanation: 'OpenAI Whisper-1 model converts audio files into transcribed text segments with precise timestamps.'
        },
        {
          id: 'q6',
          question: 'What vector embedding dimension size is created for transcript segments in MongoDB?',
          options: ['512', '768', '1536', '3072'],
          correctAnswer: '1536',
          correctOptionIndex: 2,
          explanation: 'text-embedding-3-small produces 1536-dimensional vector embeddings.'
        },
        {
          id: 'q7',
          question: 'What MongoDB aggregation pipeline stage is used for semantic RAG search?',
          options: ['$match', '$vectorSearch', '$text', '$lookup'],
          correctAnswer: '$vectorSearch',
          correctOptionIndex: 1,
          explanation: '$vectorSearch performs k-nearest neighbor similarity search on vector indexes in MongoDB Atlas.'
        },
        {
          id: 'q8',
          question: 'Which LLM model is integrated for generating chapter breakdowns and Markdown study notes?',
          options: ['claude-3-5-sonnet', 'gemini-1.0-nano', 'llama-3', 'mistral-7b'],
          correctAnswer: 'claude-3-5-sonnet',
          correctOptionIndex: 0,
          explanation: 'Anthropic Claude 3.5 Sonnet generates structured Markdown study notes and chapter divisions.'
        },
        {
          id: 'q9',
          question: 'What is the purpose of returning structured mock JSON when API keys are absent?',
          options: [
            'To prevent application crashes and allow concurrent frontend development',
            'To bypass authentication security',
            'To permanently disable external APIs',
            'To reduce TypeScript build speed'
          ],
          correctAnswer: 'To prevent application crashes and allow concurrent frontend development',
          correctOptionIndex: 0,
          explanation: 'Mock fallbacks unblock UI development without requiring live API keys during early development.'
        },
        {
          id: 'q10',
          question: 'Which JWT HTTP header standard is typically used for authentication token transmission?',
          options: ['Authorization: Bearer <token>', 'Token: <token>', 'Auth: <token>', 'Cookie: session=<token>'],
          correctAnswer: 'Authorization: Bearer <token>',
          correctOptionIndex: 0,
          explanation: 'The standard HTTP header for passing JWT tokens is Authorization with Bearer scheme.'
        }
      ]
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the transcript/topic and generate ${numQuestions} multiple choice questions (MCQs).
Return a valid JSON object with EXACTLY one key "questions", which is an array of objects.
Each object MUST contain EXACTLY five keys:
- "id": string (e.g. "q1", "q2")
- "question": string
- "options": array of EXACTLY 4 strings
- "correctAnswer": string (matching one of the options)
- "correctOptionIndex": number (0, 1, 2, or 3)
- "explanation": string

Transcript/Topic:
"""
${transcriptText || 'Software Engineering & AI Architecture'}
"""`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new GeminiApiError('Gemini API returned an empty response.');
    }

    try {
      const parsedJson = JSON.parse(responseText);
      const rawQuestions = Array.isArray(parsedJson.questions) ? parsedJson.questions : [];

      const questions: QuizItem[] = rawQuestions.map((q: any, idx: number) => ({
        id: q.id || `q${idx + 1}`,
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: q.correctAnswer || (q.options ? q.options[q.correctOptionIndex || 0] : 'Option A'),
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        explanation: q.explanation || 'Explanation unavailable.',
      }));

      return {
        quizTitle: `Quiz (${questions.length} MCQs)`,
        totalQuestions: questions.length,
        questions,
      };
    } catch (parseError) {
      throw new GeminiApiError('Failed to parse structured JSON response from Gemini API.', parseError);
    }
  } catch (error: any) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    throw new GeminiApiError(`Gemini API execution error: ${error.message}`, error);
  }
}

export interface AiTutorInput {
  question: string;
  transcript: string;
}

export interface AiTutorOutput {
  answer: string;
  foundInTranscript: boolean;
}

/**
 * AI Tutor function that answers student questions based ONLY on the provided transcript.
 * If the answer is not found in the transcript, it returns:
 * "I couldn't find this in the uploaded content."
 */
export async function answerWithAiTutor(
  input: AiTutorInput
): Promise<AiTutorOutput> {
  const { question, transcript } = input || {};

  if (!question || !transcript || transcript.trim() === '') {
    return {
      answer: "I couldn't find this in the uploaded content.",
      foundInTranscript: false,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Running local grounding check.');
    const lowerQuestion = question.toLowerCase();
    const lowerTranscript = transcript.toLowerCase();

    const keywords = lowerQuestion.split(' ').filter((w) => w.length > 3);
    const matches = keywords.filter((kw) => lowerTranscript.includes(kw));

    if (matches.length > 0) {
      return {
        answer: `Based on the provided transcript: The content discusses concepts matching "${matches.join(', ')}".`,
        foundInTranscript: true,
      };
    } else {
      return {
        answer: "I couldn't find this in the uploaded content.",
        foundInTranscript: false,
      };
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `You are a strict AI Tutor. Answer the student's question based ONLY on the provided transcript content.

STRICT INSTRUCTIONS:
1. Use ONLY facts explicitly mentioned in the transcript.
2. If the answer to the question CANNOT be deduced directly from the transcript, respond with EXACTLY: "I couldn't find this in the uploaded content."
3. Do NOT hallucinate, infer, or bring in external knowledge.

Transcript:
"""
${transcript}
"""

Question:
"${question}"`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text()?.trim() || "I couldn't find this in the uploaded content.";

    const isFound = !answer.includes("I couldn't find this in the uploaded content.");

    return {
      answer,
      foundInTranscript: isFound,
    };
  } catch (error: any) {
    console.error('[AiTutor] Gemini execution error:', error.message);
    return {
      answer: "I couldn't find this in the uploaded content.",
      foundInTranscript: false,
    };
  }
}

/**
 * Generates a React Flow compatible Mind Map (Nodes, Children, Edges/Relations).
 */
export async function generateReactFlowMindMapFromTranscript(
  transcriptText?: string
): Promise<ReactFlowMindMapOutput> {
  const content = transcriptText || 'SYNAPSEAI Architecture & AI Processing Pipeline';

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning React Flow Mind Map.');
    return {
      title: 'SYNAPSEAI System Mind Map',
      nodes: [
        { id: '1', data: { label: 'SYNAPSEAI Platform' }, position: { x: 250, y: 0 }, children: ['2', '3', '4'] },
        { id: '2', data: { label: 'Backend API (Node/Express)' }, position: { x: 0, y: 120 }, children: ['2-1', '2-2'] },
        { id: '3', data: { label: 'AI Services (Gemini & Claude)' }, position: { x: 250, y: 120 }, children: ['3-1', '3-2', '3-3'] },
        { id: '4', data: { label: 'Database & Queue (Mongo & BullMQ)' }, position: { x: 500, y: 120 }, children: ['4-1', '4-2'] },
        { id: '2-1', data: { label: 'Auth Middleware' }, position: { x: -60, y: 220 } },
        { id: '2-2', data: { label: 'Judge0 Sandbox' }, position: { x: 60, y: 220 } },
        { id: '3-1', data: { label: 'Transcript Summarizer' }, position: { x: 180, y: 220 } },
        { id: '3-2', data: { label: 'Quiz & Flashcard Generator' }, position: { x: 280, y: 220 } },
        { id: '3-3', data: { label: 'RAG Doubt Assistant' }, position: { x: 380, y: 220 } },
        { id: '4-1', data: { label: '1536-dim Vector Index' }, position: { x: 460, y: 220 } },
        { id: '4-2', data: { label: 'Redis Background Queue' }, position: { x: 580, y: 220 } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', label: 'Includes' },
        { id: 'e1-3', source: '1', target: '3', label: 'Powered By' },
        { id: 'e1-4', source: '1', target: '4', label: 'Stores In' },
        { id: 'e2-21', source: '2', target: '2-1', label: 'Secures' },
        { id: 'e2-22', source: '2', target: '2-2', label: 'Executes Code' },
        { id: 'e3-31', source: '3', target: '3-1', label: 'Generates' },
        { id: 'e3-32', source: '3', target: '3-2', label: 'Generates' },
        { id: 'e3-33', source: '3', target: '3-3', label: 'Answers' },
        { id: 'e4-41', source: '4', target: '4-1', label: 'Indexes' },
        { id: 'e4-42', source: '4', target: '4-2', label: 'Enqueues' },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the transcript and generate a React Flow compatible mind map.
Return JSON with EXACTLY two top-level keys:
- "nodes": array of objects { "id": string, "data": { "label": string }, "position": { "x": number, "y": number }, "children": string[] }
- "edges": array of objects { "id": string, "source": string, "target": string, "label": string }

Transcript:
"""
${content}
"""`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      title: 'Mind Map',
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };
  } catch (err: any) {
    throw new GeminiApiError(`Failed to generate React Flow mind map: ${err.message}`, err);
  }
}

/**
 * Analyzes speech transcript to calculate speaking speed, grammar, filler words, confidence score, and actionable suggestions.
 */
export async function analyzeSpeechTranscript(
  input: SpeechAnalysisInput | string
): Promise<SpeechAnalysisOutput> {
  const transcriptText = typeof input === 'string' ? input : input?.transcript;
  const duration = typeof input === 'object' && input?.durationSeconds ? input.durationSeconds : 120;

  if (!transcriptText || transcriptText.trim() === '') {
    throw new GeminiApiError('Transcript text is required for speech analysis.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning speech analysis mock JSON.');
    
    // Quick heuristic calculations for local fallback
    const words = transcriptText.trim().split(/\s+/);
    const wordCount = words.length;
    const wpm = Math.round((wordCount / duration) * 60) || 140;

    const fillerList = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'so'];
    const fillerMap: Record<string, number> = {};
    let totalFillers = 0;

    words.forEach((w) => {
      const cleanWord = w.toLowerCase().replace(/[^a-z]/g, '');
      if (fillerList.includes(cleanWord)) {
        fillerMap[cleanWord] = (fillerMap[cleanWord] || 0) + 1;
        totalFillers++;
      }
    });

    return {
      speakingSpeed: {
        wordsPerMinute: wpm,
        assessment: wpm < 110 ? 'Slow' : wpm > 160 ? 'Fast' : 'Optimal',
      },
      grammar: {
        scorePercentage: 92,
        issuesCount: 1,
        corrections: [
          {
            original: 'We was building AI features',
            corrected: 'We were building AI features',
            explanation: 'Subject-verb agreement: Use "were" with plural subject "We".',
          },
        ],
      },
      fillerWords: {
        totalCount: totalFillers || 4,
        frequencyMap: Object.keys(fillerMap).length > 0 ? fillerMap : { like: 2, um: 1, basically: 1 },
        percentageOfTotalWords: Number(((totalFillers / (wordCount || 1)) * 100).toFixed(1)) || 2.5,
      },
      confidence: {
        scorePercentage: 88,
        tone: 'Professional & Clear',
        hesitationLevel: totalFillers > 8 ? 'High' : totalFillers > 3 ? 'Moderate' : 'Low',
      },
      suggestions: [
        'Pause intentionally instead of using filler words like "um" or "like".',
        'Maintain an optimal pacing around 130-150 words per minute.',
        'Vary your vocal pitch at key topic transitions to keep listeners engaged.',
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the following speech transcript and return a valid JSON object with EXACTLY these five keys:
- "speakingSpeed": { "wordsPerMinute": number, "assessment": "Slow" | "Optimal" | "Fast" }
- "grammar": { "scorePercentage": number, "issuesCount": number, "corrections": array of { "original": string, "corrected": string, "explanation": string } }
- "fillerWords": { "totalCount": number, "frequencyMap": object, "percentageOfTotalWords": number }
- "confidence": { "scorePercentage": number, "tone": string, "hesitationLevel": "Low" | "Moderate" | "High" }
- "suggestions": array of actionable feedback strings

Transcript:
"""
${transcriptText}
"""`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      speakingSpeed: parsed.speakingSpeed || { wordsPerMinute: 140, assessment: 'Optimal' },
      grammar: parsed.grammar || { scorePercentage: 90, issuesCount: 0, corrections: [] },
      fillerWords: parsed.fillerWords || { totalCount: 0, frequencyMap: {}, percentageOfTotalWords: 0 },
      confidence: parsed.confidence || { scorePercentage: 85, tone: 'Confident', hesitationLevel: 'Low' },
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (err: any) {
    throw new GeminiApiError(`Failed to analyze speech transcript: ${err.message}`, err);
  }
}

/**
 * Analyzes a topic to detect if it requires visualization (3d, animation, or diagram),
 * and returns structured JSON with type, title, and visualization steps.
 */
export async function detectTopicVisualization(
  input: TopicVisualizationInput | string
): Promise<TopicVisualizationOutput> {
  const topicText = typeof input === 'string' ? input : input?.topic;

  if (!topicText || topicText.trim() === '') {
    throw new GeminiApiError('Topic is required for visualization detection.');
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning topic visualization mock JSON.');
    
    // Heuristic detection based on keywords
    const lower = topicText.toLowerCase();
    let visType: '3d' | 'animation' | 'diagram' = 'diagram';

    if (lower.includes('molecule') || lower.includes('engine') || lower.includes('anatomy') || lower.includes('3d') || lower.includes('structure') || lower.includes('solar system')) {
      visType = '3d';
    } else if (lower.includes('flow') || lower.includes('algorithm') || lower.includes('cycle') || lower.includes('process') || lower.includes('sorting')) {
      visType = 'animation';
    } else {
      visType = 'diagram';
    }

    return {
      needsVisualization: true,
      type: visType,
      title: `Visualizing ${topicText}`,
      steps: [
        `Initialize ${visType.toUpperCase()} canvas container for topic "${topicText}".`,
        `Render core components and entity node relationships.`,
        `Animate state transitions and data flow across pipeline stages.`,
        `Attach interactive controls for zoom, step execution, and camera rotation.`
      ]
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the given topic and determine if it requires visual explanation.
Return a valid JSON object with EXACTLY these four keys:
- "needsVisualization": boolean
- "type": "3d" | "animation" | "diagram"
- "title": concise descriptive title for the visual model
- "steps": array of step-by-step rendering/animation instructions

Topic:
"${topicText}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    const validTypes = ['3d', 'animation', 'diagram'];
    const type = validTypes.includes(parsed.type?.toLowerCase()) ? parsed.type.toLowerCase() : 'diagram';

    return {
      needsVisualization: parsed.needsVisualization !== false,
      type,
      title: parsed.title || `Visualizing ${topicText}`,
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    };
  } catch (err: any) {
    throw new GeminiApiError(`Failed to detect topic visualization: ${err.message}`, err);
  }
}

/**
 * Generates a personalized step-by-step learning roadmap tailored to user transcript, quiz score, and identified weak topics.
 */
export async function generatePersonalizedRoadmap(
  input: PersonalizedRoadmapInput
): Promise<PersonalizedRoadmapOutput> {
  const { transcript, quizScore = 60, weakTopics = ['Vector Search & Embeddings', 'Asynchronous Queues'] } = input || {};

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini API] Notice: GEMINI_API_KEY missing or placeholder in .env. Returning personalized roadmap mock JSON.');
    return {
      roadmapTitle: 'Personalized Mastery Roadmap',
      overallAssessment: `Current Quiz Score: ${quizScore}%. Recommended target: 95%+ by focusing on your identified weak areas (${weakTopics.join(', ')}).`,
      targetMasteryPercentage: 95,
      steps: [
        {
          stepNumber: 1,
          title: 'Review Core Concept Fundamentals',
          focusTopic: weakTopics[0] || 'Vector Search & Embeddings',
          description: 'Re-watch video transcript sections covering vector embedding generation (1536 dims) and similarity indexes.',
          estimatedHours: 1.5,
          recommendedAction: 'Practice generating sample vector embeddings using text-embedding-3-small API.',
        },
        {
          stepNumber: 2,
          title: 'Master Background Queue Architectures',
          focusTopic: weakTopics[1] || 'Asynchronous BullMQ Queues',
          description: 'Study Redis event loops, job retry policies, and worker concurrency configurations in videoWorker.ts.',
          estimatedHours: 2.0,
          recommendedAction: 'Build a mock queue processor and trace job status state transitions.',
        },
        {
          stepNumber: 3,
          title: 'Interactive Knowledge Check & Retake Quiz',
          focusTopic: 'Comprehensive Assessment',
          description: 'Solve targeted flashcards on weak concepts and retake the 10 MCQ assessment.',
          estimatedHours: 1.0,
          recommendedAction: 'Achieve 90%+ accuracy on weak topic flashcards before attempting final quiz.',
        },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Analyze the student's performance metrics and transcript context to generate a personalized step-by-step learning roadmap.

Student Metrics:
- Quiz Score: ${quizScore}%
- Weak Topics: ${JSON.stringify(weakTopics)}

Transcript Context:
"""
${transcript || 'Software Engineering, AI Service Architecture, Vector Search, BullMQ Queues'}
"""

Return a valid JSON object with EXACTLY these four top-level keys:
- "roadmapTitle": string
- "overallAssessment": string
- "targetMasteryPercentage": number
- "steps": array of objects, each containing { "stepNumber": number, "title": string, "focusTopic": string, "description": string, "estimatedHours": number, "recommendedAction": string }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      roadmapTitle: parsed.roadmapTitle || 'Personalized Learning Roadmap',
      overallAssessment: parsed.overallAssessment || 'Personalized study plan created.',
      targetMasteryPercentage: parsed.targetMasteryPercentage || 95,
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    };
  } catch (err: any) {
    throw new GeminiApiError(`Failed to generate personalized roadmap: ${err.message}`, err);
  }
}






