import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect search routes with requireAuth
router.use(requireAuth);

router.post('/', SearchController.globalSemanticSearch);

export default router;
