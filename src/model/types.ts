/**
 * Message structure for LLM communication
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Configuration for model requests
 */
export interface ModelConfig {
  model: string;
  apiKey: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Response from LLM model
 */
export interface ModelResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Abstract interface for LLM model providers
 */
export interface ModelProvider {
  /**
   * Send messages to the model and get a response
   */
  chat(
    messages: LLMMessage[],
    config: ModelConfig,
    abortSignal?: AbortSignal
  ): Promise<ModelResponse>;

  /**
   * Get the provider name
   */
  getName(): string;
}

/**
 * Model error types
 */
export class ModelError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ModelError';
  }
}

export class ModelTimeoutError extends ModelError {
  constructor(message: string = 'Model request timed out') {
    super(message);
    this.name = 'ModelTimeoutError';
  }
}

export class ModelAbortError extends ModelError {
  constructor(message: string = 'Model request was aborted') {
    super(message);
    this.name = 'ModelAbortError';
  }
}
