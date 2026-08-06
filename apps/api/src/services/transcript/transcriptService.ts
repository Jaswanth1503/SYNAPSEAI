import { ProcessTranscriptInput, ProcessedTranscript } from './transcript.types';
import { simulateDelay } from '../utils';

/**
 * Stub service for processing video and audio transcripts.
 */
export async function processTranscript(input: ProcessTranscriptInput): Promise<ProcessedTranscript> {
  await simulateDelay(50);

  const words = input.rawTranscript.trim().split(/\s+/).filter(Boolean);

  return {
    id: `tx_${Date.now()}`,
    cleanedText: input.rawTranscript.trim(),
    wordCount: words.length,
    durationSeconds: Math.round(words.length / 2.5),
    segments: [
      {
        speaker: input.speakerLabels ? 'Speaker 1' : undefined,
        timestamp: '00:00',
        text: input.rawTranscript.slice(0, 100) || 'Mock transcript segment content.',
      },
    ],
  };
}
