import { Router } from 'express';
import multer from 'multer';
import { VideoController } from '../controllers/video.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Configure Multer in-memory buffer storage for Cloudinary stream uploads (100MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max video upload size
  },
});

// All video routes require JWT authentication
router.use(requireAuth);

// Routes
router.post('/upload', upload.single('video'), VideoController.uploadVideo);
router.get('/', VideoController.listVideos);
router.get('/:id', VideoController.getVideoById);

export default router;
