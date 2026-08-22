import { apiClient } from './api.client';

export interface StartInterviewResponseData {
  interviewId: string;
  role: string;
  question: {
    questionId: string;
    questionText: string;
  };
}

export interface SubmitAnswerResponseData {
  interviewId: string;
  score: number;
  feedback: string;
  status: 'in_progress' | 'completed';
  nextQuestion: {
    questionId: string;
    questionText: string;
  } | null;
  overallScore?: number;
}

export const interviewApi = {
  async startInterview(role: string, category: string = 'Technical'): Promise<StartInterviewResponseData> {
    const res = await apiClient.post('/interviews/start', { role, category });
    return res.data.data;
  },

  async submitAnswer(interviewId: string, answerText: string): Promise<SubmitAnswerResponseData> {
    const res = await apiClient.post('/interviews/answer', { interviewId, answerText });
    return res.data.data;
  },
};
