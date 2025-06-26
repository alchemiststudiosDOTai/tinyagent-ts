import {
  ModelProvider,
  LLMMessage,
  ModelConfig,
  ModelResponse,
  ModelError,
  ModelAbortError,
} from './types';

/**
 * OpenRouter API response structure
 */
interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * OpenRouter model provider implementation
 */
export class OpenRouterProvider implements ModelProvider {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  getName(): string {
    return 'openrouter';
  }

  async chat(
    messages: LLMMessage[],
    config: ModelConfig,
    abortSignal?: AbortSignal
  ): Promise<ModelResponse> {
    if (abortSignal?.aborted) {
      throw new ModelAbortError();
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/yourusername/tinyagent-ts',
          'X-Title': 'TinyAgent-TS',
        },
        signal: abortSignal,
        body: JSON.stringify({
          model: config.model,
          messages,
        }),
      });

      if (!response.ok) {
        let errorDetails: any = { message: 'Failed to parse error response' };
        try {
          errorDetails = await response.json();
        } catch (parseError) {
          // Ignore parsing error, use default message
        }
        throw new ModelError(
          `OpenRouter API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorDetails)}`,
          response.status
        );
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices[0]?.message?.content?.trim() ?? '';

      return {
        content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof ModelError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ModelAbortError();
      }

      throw new ModelError(
        `Failed to communicate with OpenRouter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
