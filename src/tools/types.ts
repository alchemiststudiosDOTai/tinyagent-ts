import { z } from 'zod';

/**
 * Standard tool interface for the agent framework
 */
export interface Tool {
  /** Unique name for the tool */
  name: string;
  
  /** Human-readable description of what the tool does */
  description: string;
  
  /** Zod schema for validating tool arguments */
  schema: z.ZodSchema<any>;
  
  /**
   * Execute the tool with the given arguments
   * @param args - Validated arguments for the tool
   * @param abortSignal - Optional signal to abort the operation
   * @returns Promise resolving to the tool's result
   */
  execute(args: any, abortSignal?: AbortSignal): Promise<any>;
}

/**
 * Tool metadata for registration and discovery
 */
export interface ToolMetadata {
  name: string;
  description: string;
  schema: z.ZodSchema<any>;
  category?: string;
  tags?: string[];
  version?: string;
}

/**
 * Tool execution context
 */
export interface ToolContext {
  abortSignal?: AbortSignal;
  logger?: {
    debug(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  };
  [key: string]: any;
}

/**
 * Tool execution result
 */
export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executionTime?: number;
    [key: string]: any;
  };
}

/**
 * Tool registry interface
 */
export interface ToolRegistry {
  /**
   * Register a tool
   */
  register(tool: Tool): void;
  
  /**
   * Unregister a tool
   */
  unregister(name: string): void;
  
  /**
   * Get a tool by name
   */
  get(name: string): Tool | undefined;
  
  /**
   * Get all registered tools
   */
  getAll(): Tool[];
  
  /**
   * Get tools by category
   */
  getByCategory(category: string): Tool[];
  
  /**
   * Check if a tool is registered
   */
  has(name: string): boolean;
}

/**
 * Base class for implementing tools
 */
export abstract class BaseTool implements Tool {
  abstract name: string;
  abstract description: string;
  abstract schema: z.ZodSchema<any>;
  
  abstract execute(args: any, abortSignal?: AbortSignal): Promise<any>;
  
  /**
   * Validate arguments against the tool's schema
   */
  protected validateArgs(args: any): any {
    return this.schema.parse(args);
  }
  
  /**
   * Create a successful result
   */
  protected success<T>(data: T, metadata?: any): ToolResult<T> {
    return {
      success: true,
      data,
      metadata,
    };
  }
  
  /**
   * Create an error result
   */
  protected error(message: string, metadata?: any): ToolResult {
    return {
      success: false,
      error: message,
      metadata,
    };
  }
} 