import { ModelProvider, LLMMessage, ModelConfig, ModelResponse, ModelError } from './types';
import { OpenRouterProvider } from './openrouter-provider';

/**
 * Configuration for the model manager
 */
export interface ModelManagerConfig {
  defaultProvider?: string;
  defaultModel?: string;
  apiKey?: string;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Manages model providers and handles communication with LLMs
 */
export class ModelManager {
  private providers = new Map<string, ModelProvider>();
  private config: Required<ModelManagerConfig>;

  constructor(config: ModelManagerConfig = {}) {
    this.config = {
      defaultProvider: config.defaultProvider || 'openrouter',
      defaultModel: config.defaultModel || 'openai/gpt-4o-mini',
      apiKey: config.apiKey || process.env.OPENROUTER_API_KEY || '',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
    };

    if (!this.config.apiKey) {
      throw new ModelError('API key is required. Set OPENROUTER_API_KEY environment variable or provide apiKey in config.');
    }

    // Register default providers
    this.registerProvider('openrouter', new OpenRouterProvider());
  }

  /**
   * Register a new model provider
   */
  registerProvider(name: string, provider: ModelProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Get a registered provider
   */
  getProvider(name: string): ModelProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Send messages to a model with retry logic
   */
  async chat(
    messages: LLMMessage[],
    options: {
      model?: string;
      provider?: string;
      apiKey?: string;
      maxRetries?: number;
      abortSignal?: AbortSignal;
    } = {}
  ): Promise<ModelResponse> {
    const providerName = options.provider || this.config.defaultProvider;
    const provider = this.getProvider(providerName);
    
    if (!provider) {
      throw new ModelError(`Unknown provider: ${providerName}`);
    }

    const modelConfig: ModelConfig = {
      model: options.model || this.config.defaultModel,
      apiKey: options.apiKey || this.config.apiKey,
      maxRetries: options.maxRetries || this.config.maxRetries,
    };

    const maxRetries = modelConfig.maxRetries || 0;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await provider.chat(messages, modelConfig, options.abortSignal);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Don't retry on abort or certain error types
        if (lastError.name === 'ModelAbortError' || 
            lastError.name === 'AbortError' ||
            (error instanceof ModelError && error.statusCode === 401)) {
          throw lastError;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        if (this.config.retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ModelManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ModelManagerConfig {
    return { ...this.config };
  }
} 