import { Router, Request, Response } from 'express';
import { summarize as summarizeGemini, GeminiApiError } from '../services/ai/geminiService';

const router = Router();

/**
 * Express Router for AI endpoints.
 * 
 * Endpoints:
 * - POST /ai/summarize (Uses Gemini API to summarize transcripts into { summary, keyPoints, importantConcepts })
 * - POST /ai/chat
 * - POST /ai/quiz
 * - POST /ai/flashcards
 */

const handleSummarize = async (req: Request, res: Response) => {
  try {
    const transcriptText = req.body?.transcript || req.body?.text || (typeof req.body === 'string' ? req.body : '');
    
    if (!transcriptText || String(transcriptText).trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A non-empty "transcript" string field is required in request body.',
      });
    }

    const result = await summarizeGemini(transcriptText);
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/summarize Error]:', error);
    if (error instanceof GeminiApiError) {
      return res.status(500).json({ error: error.name, message: error.message });
    }
    return res.status(500).json({ error: 'Internal Error', message: error.message || 'An error occurred while summarizing.' });
  }
};

const handleChat = (req: Request, res: Response) => {
  const { message, context } = req.body || {};
  res.json({
    success: true,
    data: {
      question: message || 'Hello AI',
      context: context || null,
      reply: message
        ? `Mock AI Chat response to: "${message}". How can I help you further?`
        : 'Hello! I am your AI assistant (Mock response).',
      confidenceScore: 0.98,
      suggestedFollowUps: [
        'Can you summarize the key concepts?',
        'Generate a quiz on this topic',
      ],
    },
  });
};

const handleQuiz = (req: Request, res: Response) => {
  const { topic = 'General Knowledge', numQuestions = 2 } = req.body || {};
  res.json({
    success: true,
    data: {
      quizTitle: `Quiz: ${topic}`,
      difficulty: 'medium',
      totalQuestions: numQuestions,
      questions: [
        {
          id: 'q1',
          question: `Sample question 1 about ${topic}?`,
          options: [
            'Option A (Incorrect)',
            'Option B (Correct Answer)',
            'Option C (Incorrect)',
            'Option D (Incorrect)',
          ],
          correctOptionIndex: 1,
          explanation: 'Option B is the correct choice according to the mock dataset.',
        },
        {
          id: 'q2',
          question: 'What is the primary role of an Express Router in Node.js?',
          options: [
            'Managing database transactions',
            'Grouping route handlers for modular application structure',
            'Compiling TypeScript code to WebAssembly',
            'Handling CSS layout styling',
          ],
          correctOptionIndex: 1,
          explanation: 'Express Router creates modular, mountable route handlers.',
        },
      ],
    },
  });
};

const handleFlashcards = (req: Request, res: Response) => {
  const { topic = 'Software Architecture', count = 2 } = req.body || {};
  res.json({
    success: true,
    data: {
      deckTitle: `Flashcards: ${topic}`,
      totalCards: count,
      flashcards: [
        {
          id: 'fc-1',
          front: 'What is an Express Router?',
          back: 'A mini Express application capable only of performing middleware and routing functions.',
        },
        {
          id: 'fc-2',
          front: 'Why use mock JSON in backend development?',
          back: 'It unblocks frontend UI construction before live API integrations are connected.',
        },
      ],
    },
  });
};

// Route definitions
router.post(['/ai/summarize', '/summarize'], handleSummarize);
router.post(['/ai/chat', '/chat'], handleChat);
router.post(['/ai/quiz', '/quiz'], handleQuiz);
router.post(['/ai/flashcards', '/flashcards'], handleFlashcards);

export default router;
