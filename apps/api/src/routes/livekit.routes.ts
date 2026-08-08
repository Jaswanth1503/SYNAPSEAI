import { Router } from 'express';
import { LiveKitController } from '../controllers/livekit.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect LiveKit token endpoints with requireAuth
router.use(requireAuth);

router.post('/token', LiveKitController.createToken);

export default router;
