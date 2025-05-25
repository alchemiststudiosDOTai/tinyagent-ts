import readline from 'readline';
import { z } from 'zod';
import { BaseTool } from './types';

/**
 * Schema for human loop operations
 */
export const HumanLoopToolSchema = z.object({
  prompt: z.string().default('Need input:').describe('The prompt to show to the human operator'),
});

export type HumanLoopToolArgs = z.infer<typeof HumanLoopToolSchema>;

/**
 * Human loop tool for getting input from human operators
 */
export class HumanLoopTool extends BaseTool {
  name = 'human_loop';
  description = 'Pause and ask the human operator for guidance or input';
  schema = HumanLoopToolSchema;

  async execute(args: HumanLoopToolArgs, abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { prompt } = this.validateArgs(args);

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Handle abort signal
      const cleanup = () => {
        rl.close();
      };

      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          cleanup();
          reject(new Error('Operation was aborted'));
        });
      }

      rl.question(`${prompt} `, (answer) => {
        cleanup();
        if (abortSignal?.aborted) {
          reject(new Error('Operation was aborted'));
          return;
        }
        resolve(answer.trim());
      });
    });
  }
} 