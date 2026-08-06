import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Express Router for AI endpoints returning mock JSON.
 * No Gemini integration yet.
 * 
 * Routes:
 * - POST /ai/summarize
 * - POST /ai/chat
 * - POST /ai/quiz
 * - POST /ai/flashcards
 */

const handleSummarize = (req: Request, res: Response) => {
  const { text, maxLength = 'medium' } = req.body || {};
  res.json({
    success: true,
    data: {
      title: 'AI Summary (Mock Response)',
      summary: text
        ? `Mock summary generated for provided text (${text.length} characters).`
        : 'This is a mock summary response generated without external API dependencies.',
      maxLength,
      keyTakeaways: [
        'Clean Express router architecture decouples routing from AI services.',
        'Mock JSON responses facilitate seamless frontend development.',
        'No external Gemini or LLM API calls are triggered in this stage.',
      ],
      sentiment: 'positive',
      estimatedReadTimeMinutes: 2,
    },
  });
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

// Support both /ai/... routes and sub-mounted /... routes
router.post(['/ai/summarize', '/summarize'], handleSummarize);
router.post(['/ai/chat', '/chat'], handleChat);
router.post(['/ai/quiz', '/quiz'], handleQuiz);
router.post(['/ai/flashcards', '/flashcards'], handleFlashcards);

export default router;
