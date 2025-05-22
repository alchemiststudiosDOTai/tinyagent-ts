import readline from 'readline';
import { z } from 'zod';
import { Tool } from '../final-answer.tool';

export const HumanLoopSchema = z.object({
  prompt: z.string().default('Need input:'),
});
export type HumanLoopArgs = z.infer<typeof HumanLoopSchema>;

/**
 * Tool that pauses execution and asks the human for input.
 */
export class HumanLoopTool implements Tool<HumanLoopArgs, string> {
  readonly name = 'human_loop';
  readonly description = 'Pause and ask the human operator for guidance';
  readonly schema = HumanLoopSchema;

  async forward(args: HumanLoopArgs): Promise<string> {
    const { prompt } = HumanLoopSchema.parse(args);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = await new Promise<string>((resolve) => {
      rl.question(`${prompt} `, (ans) => {
        rl.close();
        resolve(ans);
      });
    });
    return answer;
  }
}
