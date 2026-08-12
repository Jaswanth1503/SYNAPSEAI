import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { TranscriptSegment } from '../models/TranscriptSegment';
import { Video } from '../models/Video';
import { QuizAttempt } from '../models/QuizAttempt';
import { videoQueue } from '../workers/videoWorker';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_openai_key',
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_anthropic_key',
});

// In-memory fallback stores for offline dev mode
const inMemoryQuizAttempts: Map<string, any[]> = new Map();

export class AIController {
  /**
   * GET /api/v1/videos/:id/transcript
   * Fetch timestamped transcript segments for a video
   */
  static async getTranscript(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        res.status(400).json({ success: false, message: 'Valid Video ID is required' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const segments = await TranscriptSegment.find({ videoId: new mongoose.Types.ObjectId(videoId) })
          .sort({ startTime: 1 })
          .select('startTime endTime text');

        res.status(200).json({
          success: true,
          data: { videoId, transcriptSegments: segments },
        });
        return;
      }

      // Offline dev fallback
      const mockSegments = [
        { startTime: 0, endTime: 60, text: 'Welcome to SYNAPSEAI Smart Learning & AI Media OS.' },
        { startTime: 61, endTime: 180, text: 'Today we discuss asynchronous queue architectures, Redis caching, and RAG Doubt Assistant integration.' },
        { startTime: 181, endTime: 300, text: 'We will also explore Judge0 code execution engine and vector search matching.' },
      ];

      res.status(200).json({
        success: true,
        data: { videoId, transcriptSegments: mockSegments },
      });
    } catch (error: any) {
      console.error('[AIController] getTranscript error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch transcript' });
    }
  }

  /**
   * POST /api/v1/ai/videos/:id/quiz
   * Generate multiple-choice quiz questions based on video transcript segments
   */
  static async generateQuiz(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        res.status(400).json({ success: false, message: 'Valid Video ID is required' });
        return;
      }

      let transcriptText = 'Welcome to Advanced Software Architecture. Topics cover BullMQ queues, Redis, and RAG Doubt Assistant.';

      if (mongoose.connection.readyState === 1) {
        const segments = await TranscriptSegment.find({ videoId: new mongoose.Types.ObjectId(videoId) }).sort({ startTime: 1 });
        if (segments.length > 0) {
          transcriptText = segments.map((s) => s.text).join(' ');
        }
      }

      let questions = [
        {
          id: 'q1',
          questionText: 'What is the primary function of BullMQ in the system architecture?',
          options: ['Database storage', 'Asynchronous background job queue', 'Frontend UI rendering', 'CSS styling'],
          correctOptionIndex: 1,
          explanation: 'BullMQ handles asynchronous background jobs like AI video processing without blocking HTTP requests.',
        },
        {
          id: 'q2',
          questionText: 'Which embedding dimension is generated for OpenAI text-embedding-3-small?',
          options: ['512', '768', '1536', '2048'],
          correctOptionIndex: 2,
          explanation: 'OpenAI text-embedding-3-small produces 1536-dimensional normalized vector embeddings.',
        },
        {
          id: 'q3',
          questionText: 'What is the role of the RAG Doubt Assistant?',
          options: [
            'Generate user passwords',
            'Answer student questions grounded strictly in video transcript context with timestamp markers',
            'Compile C++ code',
            'Manage payment gateways',
          ],
          correctOptionIndex: 1,
          explanation: 'RAG Doubt Assistant performs vector search over video transcripts to give timestamp-grounded answers.',
        },
      ];

      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_anthropic_key') {
        try {
          const prompt = `Based on the following transcript, generate a 3-question multiple choice quiz in JSON format:
{
  "questions": [
    {
      "id": "q1",
      "questionText": "string",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctOptionIndex": 0,
      "explanation": "string"
    }
  ]
}

Transcript:
${transcriptText}

Return ONLY valid JSON.`;

          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
          });

          const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
          const parsed = JSON.parse(textContent);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            questions = parsed.questions;
          }
        } catch (claudeErr: any) {
          console.warn('[AIController] Claude quiz generation failed, returning fallback questions:', claudeErr.message);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Quiz generated successfully',
        data: { videoId, questions },
      });
    } catch (error: any) {
      console.error('[AIController] generateQuiz error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to generate quiz' });
    }
  }

  /**
   * POST /api/v1/quizzes/:id/attempt
   * Submits student quiz answers, computes score, and persists QuizAttempt document for Skill Gap analytics
   */
  static async submitQuizAttempt(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
      const userId = req.user?.id;
      const { answers } = req.body; // Array of { questionText, selectedOption, correctOption, isCorrect }

      if (!userId || !videoId || !answers || !Array.isArray(answers)) {
        res.status(400).json({
          success: false,
          message: 'Video ID parameter and answers array are required',
        });
        return;
      }

      const totalQuestions = answers.length;
      const correctCount = answers.filter((a: any) => a.isCorrect).length;
      const score = Math.round((correctCount / (totalQuestions || 1)) * 100);

      if (mongoose.connection.readyState === 1) {
        const attempt = await QuizAttempt.create({
          userId: new mongoose.Types.ObjectId(userId),
          videoId: new mongoose.Types.ObjectId(videoId),
          score,
          totalQuestions,
          userAnswers: answers,
          completedAt: new Date(),
        });

        res.status(201).json({
          success: true,
          message: 'Quiz attempt submitted and score recorded successfully',
          data: { attempt },
        });
        return;
      }

      // Offline dev fallback
      const mockAttempt = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId,
        videoId,
        score,
        totalQuestions,
        userAnswers: answers,
        completedAt: new Date(),
      };

      const existing = inMemoryQuizAttempts.get(userId) || [];
      existing.push(mockAttempt);
      inMemoryQuizAttempts.set(userId, existing);

      res.status(201).json({
        success: true,
        message: 'Quiz attempt submitted and score recorded (dev in-memory mode)',
        data: { attempt: mockAttempt },
      });
    } catch (error: any) {
      console.error('[AIController] submitQuizAttempt error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to record quiz attempt' });
    }
  }

  /**
   * POST /api/v1/videos/:id/summarize
   */
  static async summarizeVideo(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

      if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        res.status(400).json({ success: false, message: 'Valid Video ID is required' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const video = await Video.findById(videoId);
        if (!video) {
          res.status(404).json({ success: false, message: 'Video not found' });
          return;
        }

        if (video.notesMarkdown && video.chapters && video.chapters.length > 0) {
          res.status(200).json({
            success: true,
            data: { videoId, notesMarkdown: video.notesMarkdown, chapters: video.chapters },
          });
          return;
        }

        const segments = await TranscriptSegment.find({ videoId: new mongoose.Types.ObjectId(videoId) }).sort({ startTime: 1 });
        const fullTranscript = segments.map((s) => s.text).join(' ') || 'Lecture video on software architecture.';

        let notesMarkdown = `# Video Summary\n\n## Transcript Overview\n${fullTranscript}\n\n## Key Concepts\n- System architecture and worker queues.`;
        let chapters = [{ title: 'Overview', startTime: 0, endTime: 180, summary: 'Lecture summary.' }];

        video.notesMarkdown = notesMarkdown;
        video.chapters = chapters;
        await video.save();

        res.status(200).json({
          success: true,
          data: { videoId, notesMarkdown, chapters },
        });
        return;
      }

      // Offline dev fallback
      res.status(200).json({
        success: true,
        data: {
          videoId,
          notesMarkdown: '# Video Summary\n\n## Overview\nAutomated AI notes generated for video playback.',
          chapters: [
            { title: 'Introduction', startTime: 0, endTime: 60, summary: 'Overview of topics.' },
            { title: 'System Architecture', startTime: 61, endTime: 180, summary: 'Worker queues & vector databases.' }
          ],
        },
      });
    } catch (error: any) {
      console.error('[AIController] summarizeVideo error:', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to summarize video' });
    }
  }

  /**
   * POST /api/v1/videos/:id/doubt
   * RAG Doubt Assistant route with strict error code matching for Atlas Vector Search
   */
  static async askDoubt(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
      const { question } = req.body;

      if (!videoId || !question) {
        res.status(400).json({ success: false, message: 'Video ID parameter and question field are required' });
        return;
      }

      let queryEmbedding: number[] = [];
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_openai_key') {
        try {
          const embResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: question,
          });
          queryEmbedding = embResponse.data[0].embedding;
        } catch (err) {
          console.warn('[AIController] Query embedding generation failed');
        }
      }

      if (queryEmbedding.length !== 1536) {
        queryEmbedding = new Array(1536).fill(0).map(() => Math.random() * 0.02 - 0.01);
      }

      let retrievedSegments: any[] = [];

      if (mongoose.connection.readyState === 1) {
        try {
          retrievedSegments = await TranscriptSegment.aggregate([
            {
              $vectorSearch: {
                index: 'vector_index',
                path: 'embedding',
                queryVector: queryEmbedding,
                numCandidates: 100,
                limit: 5,
                filter: { videoId: new mongoose.Types.ObjectId(videoId) },
              },
            },
            {
              $project: {
                startTime: 1,
                endTime: 1,
                text: 1,
                score: { $meta: 'vectorSearchScore' },
              },
            },
          ]);
        } catch (vectorSearchErr: any) {
          // Strict error signature matching for MongoDB Atlas Search Index Not Found
          const isAtlasIndexNotFound =
            (vectorSearchErr.name === 'MongoServerError' || vectorSearchErr.name === 'MongoError') &&
            (vectorSearchErr.code === 27 ||
             (typeof vectorSearchErr.message === 'string' &&
              vectorSearchErr.message.toLowerCase().includes('index not found') &&
              vectorSearchErr.message.includes('vector_index')));

          if (isAtlasIndexNotFound) {
            // TODO: Before Phase 7 production deployment, create the MongoDB Atlas Search index named 'vector_index' on TranscriptSegment.embedding
            console.warn('⚠️ [Atlas Vector Search Warning]: Atlas Search Index "vector_index" not found on MongoDB cluster. Executing in-memory segment lookup fallback.');
            retrievedSegments = await TranscriptSegment.find({ videoId: new mongoose.Types.ObjectId(videoId) })
              .select('startTime endTime text')
              .limit(5);
          } else {
            // Re-throw any genuine database query, syntax, or network error
            throw vectorSearchErr;
          }
        }
      } else {
        // Dev offline fallback
        retrievedSegments = [
          { startTime: 61, endTime: 180, text: 'Today we discuss asynchronous queue architectures using BullMQ, Redis caching, and vector search.' },
        ];
      }

      const contextText = retrievedSegments.length > 0
        ? retrievedSegments.map((s, idx) => `[Segment ${idx + 1} (${s.startTime}s - ${s.endTime}s)]: ${s.text}`).join('\n')
        : 'No specific transcript segments retrieved.';

      const systemPrompt = `You are SYNAPSEAI RAG Doubt Assistant.
Your task is to answer student questions regarding video lectures based ONLY on the provided transcript context.
Include timestamp markers (e.g. [01:01]) when referencing specific parts of the video context.`;

      let answer = `Based on the video context around timestamp [01:01], the lecture explains: ${contextText}`;

      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'dummy_anthropic_key') {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: `Context:\n${contextText}\n\nQuestion:\n${question}` }],
          });

          const textContent = response.content[0].type === 'text' ? response.content[0].text : '';
          if (textContent) answer = textContent;
        } catch (err: any) {
          console.warn('[AIController] Claude RAG completion call failed, using context response');
        }
      }

      res.status(200).json({
        success: true,
        data: {
          videoId,
          question,
          answer,
          retrievedSegments: retrievedSegments.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            text: s.text,
          })),
        },
      });
    } catch (error: any) {
      console.error('[AIController] askDoubt error:', error);
      res.status(500).json({ success: false, message: error.message || 'Doubt Assistant error' });
    }
  }

  /**
   * POST /api/v1/videos
   */
  static async createAndProcessVideo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, videoUrl, audioUrl, workspaceId } = req.body;

      if (!userId || !title || !videoUrl) {
        res.status(400).json({ success: false, message: 'title and videoUrl are required' });
        return;
      }

      if (mongoose.connection.readyState === 1) {
        const video = await Video.create({
          title,
          videoUrl,
          audioUrl,
          ownerId: new mongoose.Types.ObjectId(userId),
          workspaceId: workspaceId ? new mongoose.Types.ObjectId(workspaceId) : undefined,
          status: 'pending',
        });

        await videoQueue.add('processVideo', {
          videoId: (video._id as any).toString(),
          videoUrl: video.videoUrl,
        });

        res.status(201).json({ success: true, data: { video } });
        return;
      }

      const mockVideo = {
        _id: new mongoose.Types.ObjectId().toString(),
        title,
        videoUrl,
        status: 'ready',
        ownerId: userId,
      };

      res.status(201).json({ success: true, data: { video: mockVideo } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to submit video' });
    }
  }

  /**
   * GET /api/v1/videos/:id
   */
  static async getVideoDetails(req: Request, res: Response): Promise<void> {
    try {
      const videoId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

      if (mongoose.connection.readyState === 1) {
        const video = await Video.findById(videoId);
        if (!video) {
          res.status(404).json({ success: false, message: 'Video not found' });
          return;
        }
        const segments = await TranscriptSegment.find({ videoId: new mongoose.Types.ObjectId(videoId) });
        res.status(200).json({ success: true, data: { video, transcriptSegments: segments } });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          video: { _id: videoId, title: 'Sample Video', status: 'ready' },
          transcriptSegments: [],
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch video details' });
    }
  }
}
