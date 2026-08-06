import dotenv from 'dotenv';

dotenv.config();

export type LLMProviderType = 'gemini' | 'openai';

export interface LLMRouterOptions {
  defaultProvider?: LLMProviderType;
  geminiApiKey?: string;
  openaiApiKey?: string;
}

export interface SummarizeParams {
  text: string;
  maxLength?: 'short' | 'medium' | 'detailed';
  language?: string;
}

export interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatParams {
  message: string;
  context?: string;
  history?: ChatMessage[];
}

export interface ChatResult {
  reply: string;
  suggestedFollowUps?: string[];
}

export interface QuizParams {
  topic?: string;
  transcript?: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  quizTitle: string;
  difficulty: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }>;
}

export interface FlashcardsParams {
  topic?: string;
  transcript?: string;
  count?: number;
}

export interface FlashcardsResult {
  deckTitle: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
  }>;
}

export interface LLMResponse<T> {
  provider: LLMProviderType;
  model: string;
  data: T;
  timestamp: string;
}

/**
 * Provider interface following strategy pattern for LLMs
 */
export interface ILLMProvider {
  name: LLMProviderType;
  summarize(params: SummarizeParams): Promise<SummaryResult>;
  chat(params: ChatParams): Promise<ChatResult>;
  quiz(params: QuizParams): Promise<QuizResult>;
  flashcards(params: FlashcardsParams): Promise<FlashcardsResult>;
}

/**
 * Gemini LLM Provider Implementation
 */
export class GeminiProvider implements ILLMProvider {
  public name: LLMProviderType = 'gemini';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      console.warn('[GeminiProvider] Notice: GEMINI_API_KEY is using mock default. Set GEMINI_API_KEY in .env for live API usage.');
    }
  }

  public async summarize(params: SummarizeParams): Promise<SummaryResult> {
    return {
      title: 'Gemini Summary: AI Architecture',
      summary: `[Gemini Mock Response] Summary of input text (${params.text.length} characters).`,
      keyPoints: [
        'Gemini API integrated cleanly into LLMRouter class.',
        'Supports configurable parameters and prompt templates.',
        'Ready for live Google GenAI SDK integration.',
      ],
    };
  }

  public async chat(params: ChatParams): Promise<ChatResult> {
    return {
      reply: `[Gemini Mock Response] Received message: "${params.message}". How can I help you further?`,
      suggestedFollowUps: ['Explain LLMRouter structure', 'How to switch to OpenAI provider?'],
    };
  }

  public async quiz(params: QuizParams): Promise<QuizResult> {
    const topic = params.topic || 'General Knowledge';
    return {
      quizTitle: `[Gemini Mock Quiz] ${topic}`,
      difficulty: params.difficulty || 'medium',
      questions: [
        {
          id: 'gemini-q1',
          question: `What makes LLMRouter flexible in TypeScript?`,
          options: [
            'It locks you into a single AI provider',
            'It uses provider interface abstractions for easy switching',
            'It requires hardcoding API keys in source code',
            'It does not support async operations',
          ],
          correctOptionIndex: 1,
          explanation: 'Provider interface abstractions enable hot-swapping providers like Gemini and OpenAI.',
        },
      ],
    };
  }

  public async flashcards(params: FlashcardsParams): Promise<FlashcardsResult> {
    const topic = params.topic || 'AI & Cloud';
    return {
      deckTitle: `[Gemini Mock Deck] ${topic}`,
      cards: [
        {
          id: 'g-fc-1',
          front: 'What is Gemini 1.5 Pro?',
          back: 'Google’s multimodal LLM featuring a 1M+ token context window.',
        },
        {
          id: 'g-fc-2',
          front: 'What is LLMRouter?',
          back: 'A unified manager routing LLM requests across multiple backend providers.',
        },
      ],
    };
  }
}

/**
 * OpenAI LLM Provider Implementation (Pluggable)
 */
export class OpenAIProvider implements ILLMProvider {
  public name: LLMProviderType = 'openai';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      console.warn('[OpenAIProvider] Notice: OPENAI_API_KEY is using mock default. Set OPENAI_API_KEY in .env for live API usage.');
    }
  }

  public async summarize(params: SummarizeParams): Promise<SummaryResult> {
    return {
      title: 'OpenAI Summary: AI Architecture',
      summary: `[OpenAI Mock Response] Summary breakdown of input text.`,
      keyPoints: [
        'OpenAI provider integrated cleanly into LLMRouter class.',
        'Extends ILLMProvider contract seamlessly.',
        'Ready for live OpenAI SDK binding.',
      ],
    };
  }

  public async chat(params: ChatParams): Promise<ChatResult> {
    return {
      reply: `[OpenAI Mock Response] Received message: "${params.message}".`,
      suggestedFollowUps: ['Show code example for OpenAI integration'],
    };
  }

  public async quiz(params: QuizParams): Promise<QuizResult> {
    return {
      quizTitle: `[OpenAI Mock Quiz] ${params.topic || 'General Topic'}`,
      difficulty: params.difficulty || 'medium',
      questions: [
        {
          id: 'oai-q1',
          question: 'How do you add a new provider to LLMRouter?',
          options: [
            'Implement the ILLMProvider interface and register it in LLMRouter',
            'Rewrite the entire backend code',
            'Delete all environment variables',
            'Avoid using TypeScript',
          ],
          correctOptionIndex: 0,
          explanation: 'Implementing ILLMProvider allows seamless registration of new AI models/providers.',
        },
      ],
    };
  }

  public async flashcards(params: FlashcardsParams): Promise<FlashcardsResult> {
    return {
      deckTitle: `[OpenAI Mock Deck] ${params.topic || 'General Topic'}`,
      cards: [
        {
          id: 'oai-fc-1',
          front: 'What is GPT-4o?',
          back: 'OpenAI’s flagship omni-model for text, audio, and vision processing.',
        },
      ],
    };
  }
}

/**
 * Reusable LLMRouter Class
 * Manages routing across Gemini, OpenAI, and future LLM providers.
 */
export class LLMRouter {
  private activeProviderName: LLMProviderType;
  private providers: Map<LLMProviderType, ILLMProvider>;

  constructor(options: LLMRouterOptions = {}) {
    const defaultProviderEnv = (process.env.DEFAULT_LLM_PROVIDER as LLMProviderType) || 'gemini';
    this.activeProviderName = options.defaultProvider || defaultProviderEnv;

    this.providers = new Map<LLMProviderType, ILLMProvider>();

    // Register default providers
    this.registerProvider(new GeminiProvider(options.geminiApiKey));
    this.registerProvider(new OpenAIProvider(options.openaiApiKey));
  }

  /**
   * Registers a provider instance for easy extension (e.g. Anthropic, Cohere, Local LLM).
   */
  public registerProvider(provider: ILLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Switches default provider dynamically ('gemini' | 'openai')
   */
  public setProvider(providerName: LLMProviderType): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`[LLMRouter] Provider '${providerName}' is not registered.`);
    }
    this.activeProviderName = providerName;
  }

  /**
   * Gets current active provider name
   */
  public getActiveProvider(): LLMProviderType {
    return this.activeProviderName;
  }

  /**
   * Resolves target provider instance
   */
  private getProviderInstance(override?: LLMProviderType): ILLMProvider {
    const targetProvider = override || this.activeProviderName;
    const provider = this.providers.get(targetProvider);

    if (!provider) {
      throw new Error(`[LLMRouter] Provider '${targetProvider}' is not available.`);
    }
    return provider;
  }

  /**
   * Summarizes text using active or specified LLM provider
   */
  public async summarize(
    params: SummarizeParams,
    providerOverride?: LLMProviderType
  ): Promise<LLMResponse<SummaryResult>> {
    const provider = this.getProviderInstance(providerOverride);
    const data = await provider.summarize(params);

    return {
      provider: provider.name,
      model: provider.name === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Chat / Q&A using active or specified LLM provider
   */
  public async chat(
    params: ChatParams,
    providerOverride?: LLMProviderType
  ): Promise<LLMResponse<ChatResult>> {
    const provider = this.getProviderInstance(providerOverride);
    const data = await provider.chat(params);

    return {
      provider: provider.name,
      model: provider.name === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates quiz using active or specified LLM provider
   */
  public async quiz(
    params: QuizParams,
    providerOverride?: LLMProviderType
  ): Promise<LLMResponse<QuizResult>> {
    const provider = this.getProviderInstance(providerOverride);
    const data = await provider.quiz(params);

    return {
      provider: provider.name,
      model: provider.name === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates flashcards using active or specified LLM provider
   */
  public async flashcards(
    params: FlashcardsParams,
    providerOverride?: LLMProviderType
  ): Promise<LLMResponse<FlashcardsResult>> {
    const provider = this.getProviderInstance(providerOverride);
    const data = await provider.flashcards(params);

    return {
      provider: provider.name,
      model: provider.name === 'gemini' ? 'gemini-1.5-pro' : 'gpt-4o',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
