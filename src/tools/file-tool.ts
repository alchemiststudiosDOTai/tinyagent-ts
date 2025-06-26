import fs from 'fs';
import { z } from 'zod';
import { BaseTool } from './types';

/**
 * Schema for file operations
 */
export const FileToolSchema = z.object({
  action: z
    .enum(['read', 'write', 'append', 'delete'])
    .describe('The file operation to perform'),
  path: z.string().describe('The file path to operate on'),
  content: z
    .string()
    .optional()
    .describe('Content to write/append (required for write/append actions)'),
});

export type FileToolArgs = z.infer<typeof FileToolSchema>;

/**
 * File system tool supporting basic CRUD operations
 */
export class FileTool extends BaseTool {
  name = 'file';
  description = 'Read, write, append or delete a file on disk';
  schema = FileToolSchema;

  async execute(
    args: FileToolArgs,
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { action, path, content } = this.validateArgs(args);

    try {
      switch (action) {
        case 'read':
          if (abortSignal?.aborted) throw new Error('Operation was aborted');
          return fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '';

        case 'write':
          if (!content && content !== '') {
            throw new Error('Content is required for write action');
          }
          if (abortSignal?.aborted) throw new Error('Operation was aborted');
          fs.writeFileSync(path, content);
          return `Successfully wrote to ${path}`;

        case 'append':
          if (!content && content !== '') {
            throw new Error('Content is required for append action');
          }
          if (abortSignal?.aborted) throw new Error('Operation was aborted');
          fs.appendFileSync(path, content);
          return `Successfully appended to ${path}`;

        case 'delete':
          if (abortSignal?.aborted) throw new Error('Operation was aborted');
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
            return `Successfully deleted ${path}`;
          } else {
            return `File ${path} does not exist`;
          }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`File operation failed: ${String(error)}`);
    }
  }
}
