import { apiClient } from './api.client';

export interface FlashcardItem {
  _id: string;
  front: string;
  back: string;
  repetitionCount?: number;
  interval?: number;
  easeFactor?: number;
  nextReviewDate?: string;
  isMastered?: boolean;
}

export const flashcardApi = {
  async getFlashcards(): Promise<FlashcardItem[]> {
    const res = await apiClient.get('/flashcards');
    return res.data.data.flashcards;
  },

  async generateFlashcards(videoId: string = 'demo_video'): Promise<FlashcardItem[]> {
    const res = await apiClient.post(`/flashcards/generate/${videoId}`);
    return res.data.data.flashcards;
  },

  async createFlashcard(front: string, back: string): Promise<FlashcardItem> {
    const res = await apiClient.post('/flashcards', { front, back });
    return res.data.data.flashcard;
  },

  async reviewFlashcard(id: string, rating: number): Promise<void> {
    await apiClient.post(`/flashcards/${id}/review`, { rating });
  },
};
