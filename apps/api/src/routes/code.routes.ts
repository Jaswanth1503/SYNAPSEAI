import { Router } from 'express';
import { CodeController } from '../controllers/code.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect execution endpoint with JWT Auth
router.use(requireAuth);

router.post('/execute', CodeController.executeCode);

export default router;
