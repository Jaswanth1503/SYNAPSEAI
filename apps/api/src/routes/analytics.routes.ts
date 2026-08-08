import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Require Auth & Restrict to Org Admins or Instructors
router.use(requireAuth);
router.use(requireRole(['org_admin', 'instructor']));

router.get('/orgs/:id/analytics', AnalyticsController.getCohortAnalytics);

export default router;
