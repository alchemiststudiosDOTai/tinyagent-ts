import { exec } from 'child_process';
import { z } from 'zod';
import { Tool } from '../final-answer.tool';

export const GrepToolSchema = z.object({
  pattern: z.string(),
  file: z.string(),
});
export type GrepToolArgs = z.infer<typeof GrepToolSchema>;

export class GrepTool implements Tool<GrepToolArgs, string> {
  readonly name = 'grep';
  readonly description = 'Search for a pattern in a file using grep';
  readonly schema = GrepToolSchema;

  async forward(args: GrepToolArgs): Promise<string> {
    const { pattern, file } = GrepToolSchema.parse(args);
    return new Promise((resolve, _reject) => {
      exec(
        `grep -n ${pattern.replace(/"/g, '\"')} ${file}`,
        (err, stdout, stderr) => {
          if (err) {
            resolve(stderr.trim());
            return;
          }
          resolve(stdout.trim());
        }
      );
    });
  }
}
