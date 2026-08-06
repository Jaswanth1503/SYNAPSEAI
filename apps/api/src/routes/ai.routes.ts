import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect AI routes with JWT Auth
router.use(requireAuth);

// AI Video Summarizer endpoint
router.post('/videos/:id/summarize', AIController.summarizeVideo);

// RAG Doubt Assistant endpoint
router.post('/videos/:id/doubt', AIController.askDoubt);

// Video management and processing endpoints
router.post('/videos', AIController.createAndProcessVideo);
router.get('/videos/:id', AIController.getVideoDetails);

export default router;
