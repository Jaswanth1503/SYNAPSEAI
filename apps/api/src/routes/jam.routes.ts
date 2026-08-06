import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { JamController } from '../controllers/jam.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
});

// Protect JAM routes with requireAuth
router.use(requireAuth);

router.post('/evaluate', upload.single('audio'), JamController.evaluateJamSession);

export default router;
