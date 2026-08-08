/**
 * Types for Transcript Service
 */

export interface ProcessTranscriptInput {
  rawTranscript: string;
  speakerLabels?: boolean;
}

export interface ProcessedTranscript {
  id: string;
  cleanedText: string;
  wordCount: number;
  durationSeconds?: number;
  segments: Array<{
    speaker?: string;
    timestamp: string;
    text: string;
  }>;
}
