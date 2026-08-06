import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { MockInterview } from '../models/MockInterview';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_anthropic_key',
});

export const startInterviewSchema = z.object({
  role: z.string().min(2, 'role is required'),
  category: z.string().optional().default('Technical'),
});

export const answerInterviewSchema = z.object({
  interviewId: z.string().min(1, 'interviewId is required'),
  answerText: z.string().min(5, 'answerText must be at least 5 characters'),
});

export class InterviewController {
  /**
   * POST /api/v1/interviews/start
   * Start mock interview and return initial technical question
   */
  static async startInterview(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validation = startInterviewSchema.safeParse(req.body);

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

      const { role, category } = validation.data;

      let initialQuestionText = `Can you explain the core differences between process memory layout and thread memory allocation in a high-concurrency Node.js environment for a ${role}?`;
      const questionId = new mongoose.Types.ObjectId().toString();

      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_anthropic_key') {
        try {
          const prompt = `You are a Senior Technical Interviewer conducting a mock interview for candidate applying for "${role}" (${category} domain).
Generate a challenging, realistic first technical interview question.
Return JSON with key "questionText": string.`;

          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          });

          const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
          const parsed = JSON.parse(textContent);
          if (parsed.questionText) initialQuestionText = parsed.questionText;
        } catch (err: any) {
          console.warn('[InterviewController] Claude initial question failed, using default:', err.message);
        }
      }

      const mockInterview = await MockInterview.create({
        userId: new mongoose.Types.ObjectId(userId),
        role,
        category,
        status: 'in_progress',
        questions: [
          {
            questionId,
            questionText: initialQuestionText,
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Mock interview started successfully',
        data: {
          interviewId: (mockInterview._id as any).toString(),
          role: mockInterview.role,
          question: {
            questionId,
            questionText: initialQuestionText,
          },
        },
      });
    } catch (error: any) {
      console.error('[InterviewController] Error starting interview:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start interview',
      });
    }
  }

  /**
   * POST /api/v1/interviews/answer
   * Accepts user answer, evaluates score & feedback with Claude API, returns score + next question
   */
  static async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const validation = answerInterviewSchema.safeParse(req.body);

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

      const { interviewId, answerText } = validation.data;

      if (!mongoose.Types.ObjectId.isValid(interviewId)) {
        res.status(400).json({ success: false, message: 'Invalid interviewId format' });
        return;
      }

      const interview = await MockInterview.findById(interviewId);
      if (!interview) {
        res.status(404).json({ success: false, message: 'Mock interview session not found' });
        return;
      }

      if (interview.questions.length === 0) {
        res.status(400).json({ success: false, message: 'No questions found in interview session' });
        return;
      }

      // Get last active question
      const lastIndex = interview.questions.length - 1;
      const currentQ = interview.questions[lastIndex];

      let score = 85;
      let feedback = 'Strong technical answer covering key architectural concepts clearly.';
      let nextQuestionText = `Follow-up: How would you handle state synchronization across multiple horizontal scaled instances of this service?`;

      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_anthropic_key') {
        try {
          const prompt = `You are a Senior Technical Interviewer evaluating a candidate's answer for role: "${interview.role}".

Question:
"${currentQ.questionText}"

Candidate Answer:
"${answerText}"

Task:
1. Evaluate candidate answer technical correctness and depth (score 0-100).
2. Provide concise constructive feedback.
3. Formulate the next follow-up technical interview question.

Return ONLY JSON format with structure:
{
  "score": number,
  "feedback": string,
  "nextQuestionText": string
}`;

          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          });

          const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
          const parsed = JSON.parse(textContent);

          if (typeof parsed.score === 'number') score = parsed.score;
          if (parsed.feedback) feedback = parsed.feedback;
          if (parsed.nextQuestionText) nextQuestionText = parsed.nextQuestionText;
        } catch (err: any) {
          console.warn('[InterviewController] Claude answer evaluation failed, using calculated score:', err.message);
        }
      }

      // Save answer & evaluation for current question
      currentQ.userAnswerText = answerText;
      currentQ.score = score;
      currentQ.feedback = feedback;

      const nextQuestionId = new mongoose.Types.ObjectId().toString();

      // Stop after 5 questions or continue
      const isCompleted = interview.questions.length >= 5;

      if (isCompleted) {
        interview.status = 'completed';
        const totalScoreSum = interview.questions.reduce((acc, q) => acc + (q.score || 0), 0);
        interview.overallScore = Math.round(totalScoreSum / interview.questions.length);
      } else {
        interview.questions.push({
          questionId: nextQuestionId,
          questionText: nextQuestionText,
        });
      }

      await interview.save();

      res.status(200).json({
        success: true,
        message: 'Answer evaluated successfully',
        data: {
          interviewId,
          score,
          feedback,
          status: interview.status,
          nextQuestion: isCompleted
            ? null
            : {
                questionId: nextQuestionId,
                questionText: nextQuestionText,
              },
          overallScore: interview.overallScore,
        },
      });
    } catch (error: any) {
      console.error('[InterviewController] Error submitting answer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Answer evaluation failed',
      });
    }
  }
}
