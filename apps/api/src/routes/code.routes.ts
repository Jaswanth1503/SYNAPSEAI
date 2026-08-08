import { Router } from 'express';
import { CodeController } from '../controllers/code.controller';
import { requireAuth } from '../middleware/auth';
import { codeExecLimiter } from '../middleware/rateLimiter';

const router = Router();

// Protect execution endpoint with JWT Auth and Code Execution Rate Limiter (20 req / 1 min)
router.use(requireAuth);
router.use(codeExecLimiter);

router.post('/execute', CodeController.executeCode);

export default router;
