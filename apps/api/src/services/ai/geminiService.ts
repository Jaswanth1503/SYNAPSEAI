import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export interface SummarizeInput {
  transcript: string;
}

export interface SummarizeOutput {
  summary: string;
  keyPoints: string[];
  importantConcepts: string[];
}

export interface GenerateNotesInput {
  transcript: string;
}

export interface GenerateNotesOutput {
  notes: string;
  keyPoints: string[];
  learningObjectives: string[];
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
 * Connects to Gemini API to generate a transcript summary.
 * 
 * Input: transcript string or object containing transcript
 * Output JSON structure:
 * {
 *   summary: string,
 *   keyPoints: string[],
 *   importantConcepts: string[]
 * }
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
- "summary": A concise overview paragraph summarizing the transcript.
- "keyPoints": An array of strings representing key points and bullet takeaways.
- "importantConcepts": An array of strings listing important concepts, topics, or technical terms mentioned.

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
        keyPoints: Array.isArray(parsedJson.keyPoints) ? parsedJson.keyPoints : [],
        importantConcepts: Array.isArray(parsedJson.importantConcepts) ? parsedJson.importantConcepts : [],
      };
    } catch (parseError) {
      throw new GeminiApiError('Failed to parse structured JSON from Gemini API response.', parseError);
    }
  } catch (error: any) {
    if (error instanceof GeminiApiError) {
      throw error;
    }
    throw new GeminiApiError(`Gemini API execution error: ${error.message}`, error);
  }
}

/**
 * Generates Notes, Key Points, and Learning Objectives from a transcript using Gemini API.
 * 
 * Input: transcript string or { transcript: string }
 * Output JSON:
 * {
 *   notes: string,
 *   keyPoints: string[],
 *   learningObjectives: string[]
 * }
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
