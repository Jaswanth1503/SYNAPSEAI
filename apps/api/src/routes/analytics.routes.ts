import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Require Auth
router.use(requireAuth);

// Student Skill Gap Analytics Endpoint: GET /api/v1/analytics/skills/gap
router.get('/skills/gap', AnalyticsController.getSkillGapAnalytics);

// Student Personalized Career Roadmap Endpoint: GET /api/v1/analytics/career/roadmap
router.get('/career/roadmap', AnalyticsController.getCareerRoadmap);

// Student Personalized Recommendations Endpoint: GET /api/v1/analytics/recommendations
router.get('/recommendations', AnalyticsController.getRecommendations);

// Org Admins & Instructors Cohort Analytics Endpoint
router.get('/orgs/:id/analytics', requireRole(['org_admin', 'instructor']), AnalyticsController.getCohortAnalytics);

export default router;
