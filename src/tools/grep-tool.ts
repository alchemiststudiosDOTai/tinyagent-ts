import { exec } from 'child_process';
import { z } from 'zod';
import { BaseTool } from './types';

/**
 * Schema for grep operations
 */
export const GrepToolSchema = z.object({
  pattern: z.string().describe('The pattern to search for'),
  file: z.string().describe('The file to search in'),
  flags: z
    .string()
    .optional()
    .describe('Additional grep flags (e.g., -i for case insensitive)'),
});

export type GrepToolArgs = z.infer<typeof GrepToolSchema>;

/**
 * Grep tool for searching patterns in files
 */
export class GrepTool extends BaseTool {
  name = 'grep';
  description = 'Search for a pattern in a file using grep';
  schema = GrepToolSchema;

  async execute(
    args: GrepToolArgs,
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { pattern, file, flags = '' } = this.validateArgs(args);

    return new Promise((resolve, reject) => {
      // Escape the pattern to prevent shell injection
      const escapedPattern = pattern.replace(/'/g, "\\'");
      const command = `grep ${flags} -n '${escapedPattern}' '${file}'`;

      const childProcess = exec(command, (error, stdout, stderr) => {
        if (abortSignal?.aborted) {
          childProcess.kill();
          reject(new Error('Operation was aborted'));
          return;
        }

        if (error) {
          // Grep returns exit code 1 when no matches found, which is not an error
          if (error.code === 1) {
            resolve('No matches found');
            return;
          }
          reject(new Error(`Grep failed: ${stderr.trim() || error.message}`));
          return;
        }

        resolve(stdout.trim() || 'No matches found');
      });

      // Handle abort signal
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          childProcess.kill();
          reject(new Error('Operation was aborted'));
        });
      }
    });
  }
}
