import { apiClient } from './api.client';

export interface CodeExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string;
  memory: number;
  status: {
    id: number;
    description: string;
  };
}

export const codeApi = {
  async executeCode(language_id: number, source_code: string, stdin?: string): Promise<CodeExecutionResult> {
    const res = await apiClient.post('/code/execute', {
      language_id,
      source_code,
      stdin,
    });
    return res.data.data;
  },
};
