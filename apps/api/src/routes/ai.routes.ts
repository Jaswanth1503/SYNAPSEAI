import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect AI & Video routes with JWT Auth
router.use(requireAuth);

// Client-Direct Presigned Upload URL Endpoint (Prevents API gateway payload limits & timeouts)
router.post('/videos/presign', AIController.generatePresignedUploadUrl);

// Transcript Endpoint
router.get('/videos/:id/transcript', AIController.getTranscript);

// AI Video Summarizer endpoint
router.post('/videos/:id/summarize', aiLimiter, AIController.summarizeVideo);

// RAG Doubt Assistant endpoint
router.post('/videos/:id/doubt', aiLimiter, AIController.askDoubt);

// AI Quiz Generator endpoint
router.post('/videos/:id/quiz', AIController.generateQuiz);

// AI Mind Map Generator endpoint (Phase 5 Step 2)
router.post('/mindmap/:videoId', AIController.generateMindMap);

// Video management and processing endpoints
router.post('/videos', AIController.createAndProcessVideo);
router.get('/videos/:id', AIController.getVideoDetails);

export default router;
