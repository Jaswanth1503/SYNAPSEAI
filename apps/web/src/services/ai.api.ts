import { apiClient } from './api.client';

export interface TranscriptSegmentRecord {
  startTime: number;
  endTime: number;
  text: string;
}

export interface VideoSummaryData {
  videoId: string;
  notesMarkdown: string;
  chapters: Array<{
    title: string;
    startTime: number;
    endTime: number;
    summary: string;
  }>;
}

export interface AskDoubtResponseData {
  videoId: string;
  question: string;
  answer: string;
  retrievedSegments: TranscriptSegmentRecord[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizAnswerPayload {
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
}

export interface QuizAttemptRecord {
  _id: string;
  userId: string;
  videoId: string;
  score: number;
  totalQuestions: number;
  userAnswers: QuizAnswerPayload[];
  completedAt: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  parentId: string | null;
  category: 'root' | 'pillar' | 'subconcept';
  description: string;
}

export const aiApi = {
  async getTranscript(videoId: string): Promise<TranscriptSegmentRecord[]> {
    const res = await apiClient.get(`/ai/videos/${videoId}/transcript`);
    return res.data.data.transcriptSegments;
  },

  async summarizeVideo(videoId: string): Promise<VideoSummaryData> {
    const res = await apiClient.post(`/ai/videos/${videoId}/summarize`);
    return res.data.data;
  },

  async askDoubt(videoId: string, question: string): Promise<AskDoubtResponseData> {
    const res = await apiClient.post(`/ai/videos/${videoId}/doubt`, { question });
    return res.data.data;
  },

  async generateQuiz(videoId: string): Promise<{ videoId: string; questions: QuizQuestion[] }> {
    const res = await apiClient.post(`/ai/videos/${videoId}/quiz`);
    return res.data.data;
  },

  async submitQuizAttempt(videoId: string, answers: QuizAnswerPayload[]): Promise<QuizAttemptRecord> {
    const res = await apiClient.post(`/quizzes/${videoId}/attempt`, { answers });
    return res.data.data.attempt;
  },

  async generateMindMap(videoId: string): Promise<{ videoId: string; nodes: MindMapNode[] }> {
    const res = await apiClient.post(`/ai/mindmap/${videoId}`);
    return res.data.data;
  },
};
