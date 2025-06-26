import { ModelManager } from '../model';
import { ReActEngine, ReActConfig } from '../react';
import { ToolRegistry } from '../tools';

/**
 * Error thrown when agent generation fails
 */
export class AgentGenerationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AgentGenerationError';
  }
}

/**
 * Agent execution mode
 */
export type AgentMode = 'simple' | 'react';

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Execution mode */
  mode?: AgentMode;

  /** Model configuration */
  model?: {
    name?: string;
    provider?: string;
    apiKey?: string;
  };

  /** ReAct configuration (when mode is 'react') */
  react?: ReActConfig;

  /** System prompt override */
  systemPrompt?: string;

  /** System prompt file override */
  systemPromptFile?: string;

  /** Enable debug logging */
  debug?: boolean;

  /** Custom logger */
  logger?: {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  };
}

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  /** Abort signal for cancellation */
  abortSignal?: AbortSignal;

  /** Override model for this execution */
  model?: string;

  /** Override system prompt for this execution */
  systemPrompt?: string;

  /** Enable trace mode for this execution */
  trace?: boolean;
}

/**
 * Agent execution result
 */
export interface AgentResult<T = any> {
  /** Whether execution was successful */
  success: boolean;

  /** The result data */
  data?: T;

  /** Error if execution failed */
  error?: Error;

  /** Execution metadata */
  metadata?: {
    mode: AgentMode;
    model?: string;
    executionTime?: number;
    steps?: any[];
    [key: string]: any;
  };
}

/**
 * Main agent interface
 */
export interface Agent {
  /**
   * Execute a task
   */
  execute<T = any>(
    input: string,
    options?: AgentExecutionOptions
  ): Promise<AgentResult<T>>;

  /**
   * Get the current configuration
   */
  getConfig(): AgentConfig;

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AgentConfig>): void;

  /**
   * Get the tool registry
   */
  getToolRegistry(): ToolRegistry;

  /**
   * Get the model manager
   */
  getModelManager(): ModelManager;

  /**
   * Get the ReAct engine (if available)
   */
  getReActEngine(): ReActEngine | undefined;
}
