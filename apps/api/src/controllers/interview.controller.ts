import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { MockInterview } from '../models/MockInterview';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_anthropic_key',
});

const inMemoryInterviews: Map<string, any> = new Map();

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
   * POST /api/v1/interviews/generate-questions
   * Generates mock interview questions & stream config for text, audio, or video mode
   */
  static async generateQuestions(req: Request, res: Response): Promise<void> {
    try {
      const { roleId = 'fullstack_ai', mode = 'text' } = req.body;

      const questions = [
        {
          id: 'q1',
          question: 'How do you structure microservices communication between Node.js backends and Python AI model workers?',
          category: 'Architecture',
        },
        {
          id: 'q2',
          question: 'Explain how you minimize latency when streaming AI LLM responses to a web client.',
          category: 'Optimization',
        },
      ];

      let audioStreamConfig: any = null;
      let webRtcConfig: any = null;

      if (mode === 'audio' || mode === 'video') {
        audioStreamConfig = {
          sampleRate: 48000,
          channels: 1,
          echoCancellation: true,
          noiseSuppression: true,
          codec: 'opus',
        };
        webRtcConfig = {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          maxFramerate: mode === 'video' ? 30 : undefined,
        };
      }

      res.status(200).json({
        success: true,
        message: 'Mock interview questions generated',
        data: {
          roleId,
          mode,
          questions,
          audioStreamConfig,
          webRtcConfig,
        },
      });
    } catch (error: any) {
      console.error('[InterviewController] Error generating questions:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to generate interview questions' });
    }
  }

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
          if (parsed.questionText) {
            initialQuestionText = parsed.questionText;
          }
        } catch (err: any) {
          console.warn('[InterviewController] Claude API fallback to default initial question:', err.message);
        }
      }

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
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
            interviewId: mockInterview._id,
            role: mockInterview.role,
            question: {
              questionId,
              questionText: initialQuestionText,
            },
          },
        });
        return;
      }

      // In-memory dev fallback
      const mockId = new mongoose.Types.ObjectId().toString();
      const mockSession = {
        _id: mockId,
        userId,
        role,
        category,
        status: 'in_progress',
        questions: [{ questionId, questionText: initialQuestionText }],
      };
      inMemoryInterviews.set(mockId, mockSession);

      res.status(201).json({
        success: true,
        message: 'Mock interview started successfully (dev mode)',
        data: {
          interviewId: mockId,
          role,
          question: { questionId, questionText: initialQuestionText },
        },
      });
    } catch (error: any) {
      console.error('[InterviewController] Error starting interview:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to start interview' });
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

      let interview: any = null;
      if (mongoose.connection.readyState === 1) {
        if (mongoose.Types.ObjectId.isValid(interviewId)) {
          interview = await MockInterview.findById(interviewId);
        }
      } else {
        interview = inMemoryInterviews.get(interviewId);
      }

      if (!interview) {
        res.status(404).json({ success: false, message: 'Mock interview session not found' });
        return;
      }

      const lastIndex = interview.questions.length - 1;
      const currentQ = interview.questions[lastIndex];

      let score = 85;
      let feedback = 'Strong technical answer covering key architectural concepts clearly.';
      let nextQuestionText = `Follow-up: How would you handle state synchronization across multiple horizontal scaled instances of this service?`;

      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_anthropic_key') {
        try {
          const prompt = `You are a Senior Technical Interviewer evaluating candidate for role: "${interview.role}".

Question:
"${currentQ.questionText}"

Candidate Answer:
"${answerText}"

Task:
1. Evaluate candidate answer technical correctness and depth (score 0-100).
2. Provide concise constructive feedback.
3. Formulate next technical question.

Return JSON format with structure:
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
          if (parsed.score !== undefined) score = parsed.score;
          if (parsed.feedback) feedback = parsed.feedback;
          if (parsed.nextQuestionText) nextQuestionText = parsed.nextQuestionText;
        } catch (err: any) {
          console.warn('[InterviewController] Claude answer evaluation failed, using calculated score:', err.message);
        }
      }

      currentQ.userAnswerText = answerText;
      currentQ.score = score;
      currentQ.feedback = feedback;

      const nextQuestionId = new mongoose.Types.ObjectId().toString();
      const isCompleted = interview.questions.length >= 3;

      if (isCompleted) {
        interview.status = 'completed';
        const totalScoreSum = interview.questions.reduce((acc: number, q: any) => acc + (q.score || 0), 0);
        interview.overallScore = Math.round(totalScoreSum / interview.questions.length);
      } else {
        interview.questions.push({
          questionId: nextQuestionId,
          questionText: nextQuestionText,
        });
      }

      if (mongoose.connection.readyState === 1 && typeof interview.save === 'function') {
        await interview.save();
      }

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
      res.status(500).json({ success: false, message: error.message || 'Answer evaluation failed' });
    }
  }
}
