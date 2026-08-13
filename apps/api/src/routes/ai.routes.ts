import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect AI & Video routes with JWT Auth
router.use(requireAuth);

// Client-Direct Presigned Upload URL Endpoint (Prevents API gateway payload limits & timeouts)
router.post('/videos/presign', AIController.generatePresignedUploadUrl);

// AI Video Summarizer endpoint
router.post('/videos/:id/summarize', aiLimiter, AIController.summarizeVideo);

// RAG Doubt Assistant endpoint
router.post('/videos/:id/doubt', aiLimiter, AIController.askDoubt);

// Video management and processing endpoints
router.post('/videos', AIController.createAndProcessVideo);
router.get('/videos/:id', AIController.getVideoDetails);

export default router;
