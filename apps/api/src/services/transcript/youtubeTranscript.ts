/**
 * Custom Error Class for Invalid YouTube URLs
 */
export class InvalidYouTubeUrlError extends Error {
  constructor(message: string = 'Invalid YouTube URL provided.') {
    super(message);
    this.name = 'InvalidYouTubeUrlError';
  }
}

export interface YouTubeTranscriptOptions {
  language?: string;
}

export interface YouTubeTranscriptResponse {
  videoId: string;
  url: string;
  transcript: string;
  wordCount: number;
}

/**
 * Extracts YouTube Video ID from various YouTube URL formats.
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim();
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})(?:\S+)?$/;
  const match = trimmedUrl.match(regExp);

  return match && match[1] ? match[1] : null;
}

/**
 * Validates whether a given string is a valid YouTube URL.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Asynchronously fetches complete transcript text for a YouTube video URL.
 * 
 * @param url YouTube video URL
 * @param options Optional configuration
 * @returns Promise resolving to the complete transcript text string
 * @throws InvalidYouTubeUrlError if the provided URL is invalid
 */
export async function getYouTubeTranscript(
  url: string,
  _options?: YouTubeTranscriptOptions
): Promise<string> {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    throw new InvalidYouTubeUrlError(`The URL "${url}" is not a valid YouTube URL.`);
  }

  // Simulate async processing (ready for youtube-transcript / API provider integration)
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Structured mock transcript output
  const mockTranscript =
    "Welcome to this tutorial on AI architecture and software design. In today's video, we are building a clean, scalable Node.js backend using Express and TypeScript. We will cover separation of concerns, modular services, prompt templates, and transcript processing. Make sure to subscribe and check the links in the description for the full source code repository.";

  return mockTranscript;
}

/**
 * Asynchronously fetches YouTube transcript details including metadata.
 * 
 * @param url YouTube video URL
 * @param options Optional configuration
 * @returns Promise resolving to YouTubeTranscriptResponse object
 * @throws InvalidYouTubeUrlError if the provided URL is invalid
 */
export async function getYouTubeTranscriptDetails(
  url: string,
  options?: YouTubeTranscriptOptions
): Promise<YouTubeTranscriptResponse> {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    throw new InvalidYouTubeUrlError(`The URL "${url}" is not a valid YouTube URL.`);
  }

  const transcript = await getYouTubeTranscript(url, options);
  const words = transcript.split(/\s+/).filter(Boolean);

  return {
    videoId,
    url,
    transcript,
    wordCount: words.length,
  };
}
