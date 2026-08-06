import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Flashcard } from '../models/Flashcard';

export const reviewFlashcardSchema = z.object({
  rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
});

export const createFlashcardSchema = z.object({
  front: z.string().min(1, 'front content is required'),
  back: z.string().min(1, 'back content is required'),
  workspaceId: z.string().optional(),
});

export class FlashcardController {
  /**
   * POST /api/v1/flashcards
   * Create a new flashcard
   */
  static async createFlashcard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validation = createFlashcardSchema.safeParse(req.body);

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Invalid request body',
          errors: validation.error.format(),
        });
        return;
      }

      const { front, back, workspaceId } = validation.data;

      const flashcard = await Flashcard.create({
        userId: new mongoose.Types.ObjectId(userId),
        workspaceId: workspaceId && mongoose.Types.ObjectId.isValid(workspaceId) ? new mongoose.Types.ObjectId(workspaceId) : undefined,
        front,
        back,
        repetitionCount: 0,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Flashcard created successfully',
        data: { flashcard },
      });
    } catch (error: any) {
      console.error('[FlashcardController] createFlashcard error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create flashcard',
      });
    }
  }

  /**
   * POST /api/v1/flashcards/:id/review
   * Applies SuperMemo-2 (SM-2) Spaced Repetition algorithm
   */
  static async reviewFlashcard(req: Request, res: Response): Promise<void> {
    try {
      const cardId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
      const validation = reviewFlashcardSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 0 and 5',
          errors: validation.error.format(),
        });
        return;
      }

      const { rating } = validation.data;

      if (!mongoose.Types.ObjectId.isValid(cardId)) {
        res.status(400).json({ success: false, message: 'Invalid flashcard ID' });
        return;
      }

      const card = await Flashcard.findById(cardId);
      if (!card) {
        res.status(404).json({ success: false, message: 'Flashcard not found' });
        return;
      }

      // --- SuperMemo-2 (SM-2) Algorithm ---
      let { repetitionCount, interval, easeFactor } = card;

      // 1. Calculate new Ease Factor (EF)
      // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      const newEaseFactor = Math.max(
        1.3,
        easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
      );

      // 2. Calculate new Repetition Count and Interval (I)
      if (rating < 3) {
        // Incorrect response: reset repetition count & interval to 1 day
        repetitionCount = 0;
        interval = 1;
      } else {
        // Correct response: increment repetitions and compute next interval
        if (repetitionCount === 0) {
          interval = 1;
        } else if (repetitionCount === 1) {
          interval = 6;
        } else {
          interval = Math.round(interval * newEaseFactor);
        }
        repetitionCount += 1;
      }

      // 3. Compute nextReviewDate = Current Date + Interval Days
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + interval);

      // Save updated SM-2 parameters
      card.easeFactor = Number(newEaseFactor.toFixed(2));
      card.repetitionCount = repetitionCount;
      card.interval = interval;
      card.nextReviewDate = nextReviewDate;

      await card.save();

      res.status(200).json({
        success: true,
        message: 'Flashcard review processed successfully via SM-2 algorithm',
        data: {
          flashcardId: card._id,
          rating,
          repetitionCount: card.repetitionCount,
          interval: card.interval,
          easeFactor: card.easeFactor,
          nextReviewDate: card.nextReviewDate,
        },
      });
    } catch (error: any) {
      console.error('[FlashcardController] reviewFlashcard error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to review flashcard',
      });
    }
  }

  /**
   * GET /api/v1/flashcards/due
   * Queries flashcards where nextReviewDate <= current date
   */
  static async getDueFlashcards(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const now = new Date();

      const dueCards = await Flashcard.find({
        userId: new mongoose.Types.ObjectId(userId),
        nextReviewDate: { $lte: now },
      }).sort({ nextReviewDate: 1 });

      res.status(200).json({
        success: true,
        message: 'Due flashcards retrieved successfully',
        data: {
          dueCount: dueCards.length,
          flashcards: dueCards,
        },
      });
    } catch (error: any) {
      console.error('[FlashcardController] getDueFlashcards error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch due flashcards',
      });
    }
  }
}
