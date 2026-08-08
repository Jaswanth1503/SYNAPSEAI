import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public Verification Endpoint
router.get('/verify/:id', CertificateController.verifyCertificate);

// Protected Certificate Generation Route
router.post('/generate', requireAuth, CertificateController.generateCertificate);

export default router;
