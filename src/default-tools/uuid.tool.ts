import { randomUUID } from 'crypto';
import { z } from 'zod';
import { Tool } from '../final-answer.tool';

export const UuidSchema = z.object({});
export type UuidArgs = z.infer<typeof UuidSchema>;

export class UuidTool implements Tool<UuidArgs, string> {
  readonly name = 'uuid';
  readonly description = 'Generate a random UUID';
  readonly schema = UuidSchema;

  forward(): string {
    return randomUUID();
  }
}
