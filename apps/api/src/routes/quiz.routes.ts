import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect quiz endpoints with requireAuth & AI rate limiter
router.use(requireAuth);
router.use(aiLimiter);

// Dedicated top-level Quiz Attempt Submission endpoint: POST /api/v1/quizzes/:id/attempt
router.post('/:id/attempt', AIController.submitQuizAttempt);

export default router;
