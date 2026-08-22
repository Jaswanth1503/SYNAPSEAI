import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/firebase', AuthController.firebaseAuth);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

// Protected auth routes
router.get('/me', requireAuth, AuthController.getMe);

export default router;
