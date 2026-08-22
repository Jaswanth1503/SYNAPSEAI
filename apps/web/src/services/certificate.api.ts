import { apiClient } from './api.client';

export interface CertificateItem {
  _id: string;
  certificateId: string;
  courseId: string;
  courseTitle: string;
  studentName: string;
  issueDate: string;
  pdfUrl?: string;
  pdfDataUrl?: string;
  verificationUrl: string;
  isValid: boolean;
}

export interface VerificationResponse {
  isValid: boolean;
  message: string;
  data?: {
    certificateId: string;
    studentName: string;
    courseTitle: string;
    issueDate: string;
    verificationUrl: string;
  };
}

export const certificateApi = {
  async getMyCertificates(): Promise<CertificateItem[]> {
    const res = await apiClient.get('/certificates/my-certificates');
    return res.data.data.certificates;
  },

  async generateCertificate(courseId: string = 'course_101'): Promise<CertificateItem> {
    const res = await apiClient.post('/certificates/generate', { courseId });
    return res.data.data;
  },

  async verifyCertificate(certificateId: string): Promise<VerificationResponse> {
    const res = await apiClient.get(`/certificates/verify/${certificateId}`);
    return res.data;
  },
};
