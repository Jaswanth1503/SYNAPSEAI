import { Router } from 'express';
import { FlashcardController } from '../controllers/flashcard.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect flashcard endpoints with requireAuth
router.use(requireAuth);

router.get('/', FlashcardController.getFlashcards);
router.post('/generate/:videoId', FlashcardController.generateFlashcards);
router.post('/', FlashcardController.createFlashcard);
router.get('/due', FlashcardController.getDueFlashcards);
router.post('/:id/review', FlashcardController.reviewFlashcard);

export default router;
