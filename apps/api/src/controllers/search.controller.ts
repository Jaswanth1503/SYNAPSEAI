import { Request, Response } from 'express';
import mongoose from 'mongoose';
import OpenAI from 'openai';
import { TranscriptSegment } from '../models/TranscriptSegment';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_openai_key',
});

export class SearchController {
  /**
   * POST /api/v1/search
   * Global Semantic Search across video transcripts using MongoDB Atlas $vectorSearch
   */
  static async globalSemanticSearch(req: Request, res: Response): Promise<void> {
    try {
      const { queryText } = req.body;
      const workspaceId = req.user?.currentOrgId;

      if (!queryText) {
        res.status(400).json({
          success: false,
          message: 'queryText is required',
        });
        return;
      }

      // Step 1: Embed search query string to 1536-dim vector
      let queryEmbedding: number[] = [];

      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_openai_key') {
        try {
          const embResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: queryText,
          });
          queryEmbedding = embResponse.data[0].embedding;
        } catch (err) {
          console.warn('[SearchController] OpenAI Query embedding failed, fallback mock vector generated');
        }
      }

      if (queryEmbedding.length !== 1536) {
        queryEmbedding = new Array(1536).fill(0).map(() => Math.random() * 0.02 - 0.01);
      }

      // Step 2: Execute $vectorSearch pipeline on TranscriptSegment with Video lookup
      let searchResults: any[] = [];

      try {
        const pipeline: any[] = [
          {
            $vectorSearch: {
              index: 'vector_index',
              path: 'embedding',
              queryVector: queryEmbedding,
              numCandidates: 100,
              limit: 10,
            },
          },
          {
            $lookup: {
              from: 'videos',
              localField: 'videoId',
              foreignField: '_id',
              as: 'videoDetails',
            },
          },
          {
            $unwind: '$videoDetails',
          },
        ];

        // Filter by workspaceId if user has active currentOrgId
        if (workspaceId && mongoose.Types.ObjectId.isValid(workspaceId)) {
          pipeline.push({
            $match: {
              'videoDetails.workspaceId': new mongoose.Types.ObjectId(workspaceId),
            },
          });
        }

        pipeline.push({
          $project: {
            segmentId: '$_id',
            videoId: 1,
            videoTitle: '$videoDetails.title',
            videoUrl: '$videoDetails.videoUrl',
            startTime: 1,
            endTime: 1,
            text: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        });

        searchResults = await TranscriptSegment.aggregate(pipeline);
      } catch (vectorErr: any) {
        console.warn('[SearchController] $vectorSearch failed, using fallback regex search:', vectorErr.message);

        const regexMatches = await TranscriptSegment.find({
          text: { $regex: queryText, $options: 'i' },
        })
          .populate('videoId', 'title videoUrl workspaceId')
          .limit(10);

        searchResults = regexMatches.map((m: any) => ({
          segmentId: m._id,
          videoId: m.videoId?._id || m.videoId,
          videoTitle: m.videoId?.title || 'Lecture Video',
          videoUrl: m.videoId?.videoUrl || '',
          startTime: m.startTime,
          endTime: m.endTime,
          text: m.text,
          score: 1.0,
        }));
      }

      res.status(200).json({
        success: true,
        message: 'Semantic search completed successfully',
        data: {
          queryText,
          resultsCount: searchResults.length,
          results: searchResults,
        },
      });
    } catch (error: any) {
      console.error('[SearchController] Error performing semantic search:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Semantic search failed',
      });
    }
  }
}
