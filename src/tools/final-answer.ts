import { z } from 'zod';
import { BaseTool } from './types';

/**
 * Schema for final answer arguments
 */
export const FinalAnswerSchema = z.object({
  answer: z.string().describe('The final answer to provide to the user'),
});

export type FinalAnswerArgs = z.infer<typeof FinalAnswerSchema>;

/**
 * Tool for providing final answers in ReAct loops
 */
export class FinalAnswerTool extends BaseTool {
  name = 'final_answer';
  description = "Provide the final answer to the user's question or task";
  schema = FinalAnswerSchema;

  async execute(args: FinalAnswerArgs): Promise<FinalAnswerArgs> {
    const validated = this.validateArgs(args);
    return validated;
  }
}
