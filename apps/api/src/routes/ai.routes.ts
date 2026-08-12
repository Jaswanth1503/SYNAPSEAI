import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect AI routes with JWT Auth and AI Rate Limiter (10 req / 1 min)
router.use(requireAuth);
router.use(aiLimiter);

// Transcript Endpoint
router.get('/videos/:id/transcript', AIController.getTranscript);

// AI Video Summarizer endpoint
router.post('/videos/:id/summarize', AIController.summarizeVideo);

// RAG Doubt Assistant endpoint
router.post('/videos/:id/doubt', AIController.askDoubt);

// AI Quiz Generator endpoint
router.post('/videos/:id/quiz', AIController.generateQuiz);

// Quiz Attempt Submission endpoint
router.post('/quizzes/:id/attempt', AIController.submitQuizAttempt);

// Video management and processing endpoints
router.post('/videos', AIController.createAndProcessVideo);
router.get('/videos/:id', AIController.getVideoDetails);

export default router;
