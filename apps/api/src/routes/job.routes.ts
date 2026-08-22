import { Router } from 'express';
import { JobController } from '../controllers/job.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/applications', JobController.getJobApplications);
router.post('/applications', JobController.createJobApplication);
router.patch('/applications/:id/status', JobController.updateApplicationStatus);

export default router;
