import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect mock interview endpoints with requireAuth
router.use(requireAuth);

router.post('/start', InterviewController.startInterview);
router.post('/answer', InterviewController.submitAnswer);

export default router;
