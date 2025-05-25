import { randomUUID } from 'crypto';
import { z } from 'zod';
import { BaseTool } from './types';

/**
 * Schema for UUID generation (no arguments needed)
 */
export const UuidToolSchema = z.object({
  version: z.literal(4).optional().describe('UUID version (only v4 supported)'),
});

export type UuidToolArgs = z.infer<typeof UuidToolSchema>;

/**
 * UUID generation tool
 */
export class UuidTool extends BaseTool {
  name = 'uuid';
  description = 'Generate a random UUID v4';
  schema = UuidToolSchema;

  async execute(args: UuidToolArgs, abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    // Validate args even though they're optional
    this.validateArgs(args);

    return randomUUID();
  }
} 