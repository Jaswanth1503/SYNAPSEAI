import { Router } from 'express';
import { ResumeController } from '../controllers/resume.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect resume endpoints with requireAuth
router.use(requireAuth);

router.post('/tailor', ResumeController.tailorResume);

export default router;
