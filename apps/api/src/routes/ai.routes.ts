import { Router, Request, Response } from 'express';
import {
  summarize as summarizeGemini,
  generateNotesFromTranscript,
  generateFlashcardsFromTranscript,
  answerWithAiTutor,
  analyzeSpeechTranscript,
  detectTopicVisualization,
  generatePersonalizedRoadmap,
  GeminiApiError,
} from '../services/ai/geminiService';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Endpoint: POST /ai/summarize (Uses Gemini API to summarize transcripts into { summary, keyPoints, importantConcepts })
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

// Endpoint: POST /ai/generate-notes (Uses Gemini API to generate { notes, keyPoints, learningObjectives })
const handleGenerateNotes = async (req: Request, res: Response) => {
  try {
    const transcriptText = req.body?.transcript || req.body?.text || (typeof req.body === 'string' ? req.body : '');
    
    if (!transcriptText || String(transcriptText).trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A non-empty "transcript" string field is required in request body.',
      });
    }

    const result = await generateNotesFromTranscript(transcriptText);
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/generate-notes Error]:', error);
    if (error instanceof GeminiApiError) {
      return res.status(500).json({ error: error.name, message: error.message });
    }
    return res.status(500).json({ error: 'Internal Error', message: error.message || 'An error occurred while generating notes.' });
  }
};

// Endpoint: POST /ai/flashcards (Uses Gemini API to generate flashcards [{ question, answer, difficulty, topic }])
const handleFlashcards = async (req: Request, res: Response) => {
  try {
    const transcriptText = req.body?.transcript || req.body?.text || (typeof req.body === 'string' ? req.body : '');
    const count = req.body?.count ? Number(req.body.count) : 3;

    if (!transcriptText || String(transcriptText).trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A non-empty "transcript" string field is required in request body.',
      });
    }

    const result = await generateFlashcardsFromTranscript({ transcript: transcriptText, count });
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/flashcards Error]:', error);
    if (error instanceof GeminiApiError) {
      return res.status(500).json({ error: error.name, message: error.message });
    }
    return res.status(500).json({ error: 'Internal Error', message: error.message || 'An error occurred while generating flashcards.' });
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

const handleAiTutor = async (req: Request, res: Response) => {
  try {
    const { question, transcript } = req.body || {};

    if (!question || !transcript) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Both "question" and "transcript" fields are required in request body.',
      });
    }

    const result = await answerWithAiTutor({ question, transcript });
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/tutor Error]:', error);
    return res.status(500).json({
      answer: "I couldn't find this in the uploaded content.",
      foundInTranscript: false,
    });
  }
};

const handleAnalyzeSpeech = async (req: Request, res: Response) => {
  try {
    const transcriptText = req.body?.transcript || req.body?.text || (typeof req.body === 'string' ? req.body : '');
    const durationSeconds = req.body?.durationSeconds ? Number(req.body.durationSeconds) : 120;

    if (!transcriptText || String(transcriptText).trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A non-empty "transcript" string field is required in request body.',
      });
    }

    const result = await analyzeSpeechTranscript({ transcript: transcriptText, durationSeconds });
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/analyze-speech Error]:', error);
    if (error instanceof GeminiApiError) {
      return res.status(500).json({ error: error.name, message: error.message });
    }
    return res.status(500).json({ error: 'Internal Error', message: error.message || 'An error occurred while analyzing speech.' });
  }
};

const handleVisualizeTopic = async (req: Request, res: Response) => {
  try {
    const topic = req.body?.topic || (typeof req.body === 'string' ? req.body : '');

    if (!topic || String(topic).trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A non-empty "topic" string field is required in request body.',
      });
    }

    const result = await detectTopicVisualization(topic);
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/visualize-topic Error]:', error);
    if (error instanceof GeminiApiError) {
      return res.status(500).json({ error: error.name, message: error.message });
    }
    return res.status(500).json({ error: 'Internal Error', message: error.message || 'An error occurred while visualizing topic.' });
  }
};

const handleGenerateRoadmap = async (req: Request, res: Response) => {
  try {
    const { transcript, quizScore, weakTopics } = req.body || {};

    const result = await generatePersonalizedRoadmap({
      transcript,
      quizScore: quizScore ? Number(quizScore) : undefined,
      weakTopics: Array.isArray(weakTopics) ? weakTopics : undefined,
    });
    return res.json(result);
  } catch (error: any) {
    console.error('[POST /ai/generate-roadmap Error]:', error);
    if (error instanceof GeminiApiError) {
      return res.status(500).json({ error: error.name, message: error.message });
    }
    return res.status(500).json({ error: 'Internal Error', message: error.message || 'An error occurred while generating roadmap.' });
  }
};

// Standalone AI endpoints
router.post(['/ai/summarize', '/summarize'], handleSummarize);
router.post(['/ai/generate-notes', '/generate-notes'], handleGenerateNotes);
router.post(['/ai/tutor', '/tutor'], handleAiTutor);
router.post(['/ai/analyze-speech', '/analyze-speech'], handleAnalyzeSpeech);
router.post(['/ai/visualize-topic', '/visualize-topic'], handleVisualizeTopic);
router.post(['/ai/generate-roadmap', '/generate-roadmap'], handleGenerateRoadmap);
router.post(['/ai/chat', '/chat'], handleChat);
router.post(['/ai/quiz', '/quiz'], handleQuiz);
router.post(['/ai/flashcards', '/flashcards'], handleFlashcards);

// Protected video & AI controller endpoints
router.post('/videos/:id/summarize', requireAuth, AIController.summarizeVideo);
router.post('/videos/:id/doubt', requireAuth, AIController.askDoubt);
router.post('/videos', requireAuth, AIController.createAndProcessVideo);
router.get('/videos/:id', requireAuth, AIController.getVideoDetails);

export default router;
