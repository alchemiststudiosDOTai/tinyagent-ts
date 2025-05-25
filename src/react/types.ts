import { LLMMessage } from '../model';

/**
 * Represents a step in the ReAct reasoning process
 */
export interface ReActStep {
  type: 'thought' | 'action' | 'observation' | 'reflexion';
  text: string;
  timestamp?: Date;
}

/**
 * Represents an action step with tool information
 */
export interface ActionStep extends ReActStep {
  type: 'action';
  mode: 'json' | 'code';
  tool: string;
  args?: Record<string, unknown>;
}

/**
 * Configuration for ReAct loop execution
 */
export interface ReActConfig {
  maxSteps?: number;
  enableReflexion?: boolean;
  enableTrace?: boolean;
  onStep?: (step: ReActStep) => void;
  onComplete?: (result: any) => void;
}

/**
 * Result of parsing a ReAct response
 */
export interface ParsedReActResponse {
  thought?: string;
  action?: ActionStep;
  reflexion?: string;
}

/**
 * Interface for ReAct state management
 */
export interface ReActState {
  /**
   * Get all steps in the current session
   */
  getSteps(): ReActStep[];

  /**
   * Add a thought step
   */
  addThought(thought: string): void;

  /**
   * Add an action step
   */
  addAction(action: ActionStep): void;

  /**
   * Add an observation step
   */
  addObservation(observation: string): void;

  /**
   * Add a reflexion step
   */
  addReflexion(reflexion: string): void;

  /**
   * Clear all steps
   */
  clear(): void;

  /**
   * Set the current task
   */
  setTask(task: string): void;

  /**
   * Get the current task
   */
  getTask(): string;

  /**
   * Convert state to LLM messages format
   */
  toMessages(systemPrompt: string): LLMMessage[];

  /**
   * Get the last used value for a specific argument key
   */
  getLastArgValue(key: string): unknown;
}

/**
 * Interface for tool execution in ReAct context
 */
export interface ReActTool {
  name: string;
  description: string;
  schema?: any;
  execute(args: Record<string, unknown>, abortSignal?: AbortSignal): Promise<unknown>;
}

/**
 * ReAct execution result
 */
export interface ReActResult {
  success: boolean;
  result?: any;
  error?: Error;
  steps: ReActStep[];
  finalAnswer?: any;
} 