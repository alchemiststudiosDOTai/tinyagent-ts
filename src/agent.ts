// src/agent.ts
import 'reflect-metadata';
import { META_KEYS, ToolMetadata } from './decorators';
import { PromptEngine } from './promptEngine';
import { FinalAnswerTool, FinalAnswerArgs } from './final-answer.tool';
import { AssistantReplySchema } from './schemas';
import { extractJson } from './utils/json';
import { truncateJson } from './utils/truncate';
import { z } from 'zod';

/**
 * Represents a tool's runtime information, including its metadata and
 * a callable function to execute it.
 * @internal
 */
interface ToolHandle {
  /** The metadata associated with the tool, as defined by the `@tool` decorator. */
  meta: ToolMetadata;
  /**
   * An asynchronous function that executes the tool's logic.
   * @param args - The arguments to pass to the tool, expected to conform to `meta.schema`.
   * @returns A promise that resolves with the result of the tool execution.
   */
  call: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Defines the expected structure of a successful response from the OpenRouter API.
 * @internal
 */
interface OpenRouterResponse {
  /** An array of choices, typically containing one primary response. */
  choices: Array<{
    /** The message object containing the content generated by the LLM. */
    message: {
      /** The textual content of the LLM's response. */
      content: string;
    };
  }>;
}

/**
 * Defines the structure for messages sent to the LLM.
 * @internal
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Abstract base class for creating AI agents.
 * Agents can be equipped with tools (defined by `@tool` decorator) and use an LLM
 * (specified by `@model` decorator) to process input and decide whether to use a tool
 * or respond directly.
 *
 * @template I - The type of the input the agent's `run` method accepts. Defaults to `string`.
 * @template O - The type of the output the agent's `run` method produces. Defaults to `string`.
 */
export abstract class Agent<I = string> {
  /** The API key for OpenRouter, loaded from environment variables. */
  private readonly apiKey: string;
  protected readonly customSystemPrompt?: string;
  protected readonly promptEngine: PromptEngine;
  /** Conversation memory for ReAct loop */
  protected readonly memory: LLMMessage[] = [];
  /** Simple logger with debug() method */
  protected readonly logger = console;

  /**
   * Initializes a new instance of the Agent.
   * It requires the `OPENROUTER_API_KEY` environment variable to be set.
   * @throws Error if `OPENROUTER_API_KEY` is not found in the environment variables.
   */
  constructor(
    options: { systemPrompt?: string; systemPromptFile?: string } = {}
  ) {
    const { systemPrompt, systemPromptFile } = options;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // TODO: Replace with AgentInitializationError
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
    this.customSystemPrompt = systemPrompt;
    this.promptEngine = new PromptEngine(
      {},
      systemPromptFile ? { agent: systemPromptFile } : {}
    );
  }

  /**
   * Retrieves the LLM model name associated with this agent class.
   * The model name is specified using the `@model` decorator.
   * @returns The model name string.
   * @throws Error if the `@model` decorator is missing on the agent class.
   * @internal
   */
  protected getModelName(): string {
    const id: string | undefined = Reflect.getMetadata(
      META_KEYS.MODEL,
      this.constructor
    );
    if (!id) {
      // TODO: Replace with AgentConfigurationError
      throw new Error('Missing @model decorator on the Agent class.');
    }
    return id;
  }

  /**
   * Builds a registry of tools available to this agent.
   * Tools are defined using the `@tool` decorator on methods of the agent class.
   * @returns A record mapping tool names to their `ToolHandle` (metadata and call function).
   * @internal
   */
  protected buildToolRegistry(): Record<string, ToolHandle> {
    const metaList: ToolMetadata[] =
      Reflect.getMetadata(META_KEYS.TOOLS, this.constructor) || [];

    const registry: Record<string, ToolHandle> = Object.fromEntries(
      metaList.map((m) => [
        m.name,
        {
          meta: m,
          call: async (args: Record<string, unknown>): Promise<unknown> => {
            try {
              const parsed = m.schema.parse(args);
              return await (this as any)[m.method](parsed);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);
              throw new Error(`Error executing tool "${m.name}": ${message}`);
            }
          },
        },
      ])
    );

    const finalTool = new FinalAnswerTool();
    registry[finalTool.name] = {
      meta: {
        name: finalTool.name,
        description: finalTool.description,
        method: 'forward',
        schema: finalTool.schema,
      },
      call: async (args: Record<string, unknown>) => {
        const parsed = finalTool.schema.parse(args);
        return finalTool.forward(parsed);
      },
    };

    return registry;
  }

  /**
   * Makes a request to the OpenRouter API.
   * @param messages - An array of message objects to send to the LLM.
   * @param model - The name of the LLM model to use.
   * @returns A promise that resolves with the API response.
   * @throws Error if the API request fails or returns an error status.
   * @internal
   */
  protected async makeOpenRouterRequest(
    messages: LLMMessage[],
    model: string
  ): Promise<OpenRouterResponse> {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          // TODO: Make these configurable or remove/improve defaults
          'HTTP-Referer': 'https://github.com/yourusername/tinyagent-ts',
          'X-Title': 'TinyAgent-TS',
        },
        body: JSON.stringify({ model, messages }),
      });

      if (!res.ok) {
        let errorDetails: any = { message: 'Failed to parse error response' };
        try {
          errorDetails = await res.json();
        } catch (parseError) {
          // Ignore parsing error, use default message
        }
        // TODO: Replace with LLMCommunicationError
        throw new Error(
          `OpenRouter API error: ${res.status} ${res.statusText}. Details: ${JSON.stringify(errorDetails)}`
        );
      }

      // Explicitly type data after parsing JSON
      const data: any = await res.json();

      // Perform type checks before accessing properties
      if (
        !data ||
        typeof data !== 'object' ||
        !data.choices ||
        !Array.isArray(data.choices) ||
        data.choices.length === 0 ||
        typeof data.choices[0]?.message?.content !== 'string' // Check nested structure
      ) {
        console.error(
          'Invalid OpenRouter response structure:',
          JSON.stringify(data)
        );
        throw new Error(
          'Invalid response structure received from OpenRouter API'
        );
      }
      // Now it's safer to assert the type
      return data as OpenRouterResponse;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      // TODO: Replace with LLMCommunicationError
      throw new Error(`Failed to call OpenRouter API: ${message}`);
    }
  }

  /**
   * Main entry point for running the agent.
   * It processes the input, interacts with the LLM, and potentially uses tools
   * to generate a final output.
   * @param input - The input to be processed by the agent.
   * @returns A promise that resolves with the agent's final output.
   */
  async run(input: I): Promise<FinalAnswerArgs> {
    const modelName = this.getModelName();
    const tools = this.buildToolRegistry();
    const toolCatalog = Object.values(tools)
      .filter((t) => t.meta.name !== 'final_answer')
      .map((t) => `- ${t.meta.name}: ${t.meta.description}`)
      .join('\n');

    // Use new helper to build initial messages
    if (this.memory.length === 0) {
      const initialMessages = this.buildInitialMessages(input, toolCatalog);
      for (const msg of initialMessages) {
        this.memory.push(msg);
      }
    } else {
      this.memory.push({ role: 'user', content: String(input) });
    }

    const finalTool = new FinalAnswerTool();
    const maxSteps = 5;
    let usedTool = false;
    const MAX_BAD_CALLS = 2;
    let badToolCalls = 0;

    for (let step = 0; step < maxSteps; step++) {
      const responseBody = await this.makeOpenRouterRequest(
        this.memory,
        modelName
      );
      const rawReply = responseBody.choices[0]?.message?.content?.trim() ?? '';

      let parsed: any;
      let validation: any;
      const jsonText = extractJson(rawReply);
      if (jsonText) {
        try {
          parsed = JSON.parse(jsonText);
          validation = AssistantReplySchema.safeParse(parsed);
        } catch (err) {
          validation = { success: false, error: new Error('Invalid JSON') };
        }
      } else {
        validation = { success: false, error: new Error('Invalid JSON') };
      }

      if (!validation.success) {
        const { fixed, fixedParsed } = await this.retryWithFixRequest(
          rawReply,
          validation.error
        );
        if (!fixedParsed) {
          this.memory.push({
            role: 'assistant',
            content: `ERROR: Unable to produce valid schema output.`,
          });
          return { answer: String(fixed) };
        }
        parsed = fixedParsed;
        this.memory.push({
          role: 'assistant',
          content: JSON.stringify(parsed),
        });
      } else {
        this.memory.push({ role: 'assistant', content: rawReply });
      }

      const toolName = parsed.tool;
      const toolArgs = parsed.args;

      if (toolName === finalTool.name) {
        if (!usedTool) {
          console.warn('final_answer called before any other tool');
        }
        const validated = finalTool.schema.parse(toolArgs ?? {});
        const answer = await finalTool.forward(validated);
        return answer;
      }

      const selectedTool = tools[toolName];
      if (!selectedTool) {
        badToolCalls++;
        const msg = `Tool ${toolName} not found.`;
        if (badToolCalls >= MAX_BAD_CALLS) {
          return { answer: `${msg} (too many bad tool calls)` };
        }
        this.logger.debug(`step ${step} → ${toolName} ERROR`, msg);
        this.memory.push({
          role: 'assistant',
          content: JSON.stringify({ observation: msg }),
        });
        continue;
      }

      let toolResult;
      try {
        toolResult = await selectedTool.call(toolArgs);
        usedTool = true;
        const out = truncateJson(toolResult);
        this.logger.debug(`step ${step} → ${toolName}`, out);
        this.memory.push({
          role: 'assistant',
          content: JSON.stringify({ observation: out }),
        });
      } catch (error) {
        badToolCalls++;
        let msg = '';
        if (error instanceof z.ZodError) {
          const issue = error.issues[0];
          msg =
            `Tool ${toolName} failed: '${issue?.path.join('.')}' ${issue?.message}`.trim();
        } else {
          msg = `Tool ${toolName} failed: ${error instanceof Error ? error.message : String(error)}`;
        }
        if (badToolCalls >= MAX_BAD_CALLS) {
          return { answer: `${msg} (too many bad tool calls)` };
        }
        this.logger.debug(`step ${step} → ${toolName} ERROR`, msg);
        this.memory.push({
          role: 'assistant',
          content: JSON.stringify({ observation: msg }),
        });
      }
      continue;
    }

    throw new Error(
      `Loop exceeded ${maxSteps} steps without final_answer call.`
    );
  }
  /**
   * Helper to build the initial LLM messages (system + user).
   */
  private buildInitialMessages(input: I, toolCatalog: string): LLMMessage[] {
    const defaultPrompt = this.promptEngine.render('agent', {
      tools: toolCatalog,
    });
    const systemPrompt = this.customSystemPrompt ?? defaultPrompt;
    return [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: String(input) },
    ];
  }

  /**
   * Helper to retry LLM output with a fix request if schema validation fails.
   * Prompts the LLM to correct its output to match the AssistantReplySchema.
   */
  private async retryWithFixRequest(
    rawReply: string,
    error: unknown
  ): Promise<{ fixed: string; fixedParsed: any }> {
    // Compose a retry prompt
    const schemaString = AssistantReplySchema.toString();
    const errorMsg =
      error instanceof z.ZodError ? error.toString() : String(error);
    const retryPrompt: LLMMessage[] = [
      {
        role: 'system',
        content:
          'Your previous response did not match the required schema. Please fix your output to match the following schema exactly:\n\n' +
          schemaString +
          '\n\nValidation error:\n' +
          errorMsg,
      },
      { role: 'user', content: rawReply },
    ];
    // Call LLM with retry prompt
    const modelName = this.getModelName();
    const responseBody = await this.makeOpenRouterRequest(
      retryPrompt,
      modelName
    );
    const fixed = responseBody.choices[0]?.message?.content?.trim() ?? '';
    let fixedParsed: any = null;
    try {
      fixedParsed = JSON.parse(fixed);
      const validation = AssistantReplySchema.safeParse(fixedParsed);
      if (!validation.success) {
        fixedParsed = null;
      }
    } catch {
      fixedParsed = null;
    }
    return { fixed, fixedParsed };
  }
}
