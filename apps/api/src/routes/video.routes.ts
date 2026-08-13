import { Router } from 'express';
import { VideoController } from '../controllers/video.controller';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect video routes with JWT Auth
router.use(requireAuth);

// Presigned Cloudinary upload endpoint (Client-Direct Video Upload)
router.post('/presign', VideoController.generatePresignedUploadUrl);

// Video CRUD & Status Polling endpoints
router.post('/', VideoController.createVideo);
router.get('/', VideoController.listVideos);
router.get('/:id', VideoController.getVideoById);
router.delete('/:id', VideoController.deleteVideo);

export default router;
