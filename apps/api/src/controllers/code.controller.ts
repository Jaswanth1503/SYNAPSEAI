import { Request, Response } from 'express';
import axios from 'axios';

const JUDGE0_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY || '';
const JUDGE0_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

export interface ExecuteCodeBody {
  language_id: number;
  source_code: string;
  stdin?: string;
}

export class CodeController {
  /**
   * POST /api/v1/code/execute
   * Proxy request to Judge0 Code Execution Engine
   */
  static async executeCode(req: Request, res: Response): Promise<void> {
    try {
      const { language_id, source_code, stdin }: ExecuteCodeBody = req.body;

      if (!language_id || !source_code) {
        res.status(400).json({
          success: false,
          message: 'language_id and source_code are required',
        });
        return;
      }

      // Configure headers for RapidAPI or self-hosted Judge0
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (JUDGE0_KEY) {
        headers['X-RapidAPI-Key'] = JUDGE0_KEY;
        headers['X-RapidAPI-Host'] = JUDGE0_HOST;
      }

      // Judge0 Submission payload with 5s CPU limit and 128MB (128000 KB) memory limit
      const payload = {
        language_id,
        source_code,
        stdin: stdin || '',
        cpu_time_limit: 5.0,
        memory_limit: 128000,
      };

      // Call Judge0 with wait=true to get synchronous execution result
      const endpoint = `${JUDGE0_URL}/submissions?wait=true&fields=stdout,stderr,compile_output,time,memory,status`;

      const response = await axios.post(endpoint, payload, {
        headers,
        timeout: 10000, // 10s HTTP timeout
      });

      const { stdout, stderr, compile_output, time, memory, status } = response.data;

      res.status(200).json({
        success: true,
        data: {
          stdout: stdout || null,
          stderr: stderr || null,
          compile_output: compile_output || null,
          time: time || '0',
          memory: memory || 0,
          status: status || { id: 3, description: 'Accepted' },
        },
      });
    } catch (error: any) {
      console.error('[CodeController] Execution error:', error?.response?.data || error.message);

      // Handle Judge0 API or timeout errors cleanly
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error.message;

      res.status(500).json({
        success: false,
        message: `Code execution service error: ${errorMessage}`,
      });
    }
  }
}
