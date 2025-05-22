import fs from 'fs';
import { z } from 'zod';
import { Tool } from '../final-answer.tool';

export const FileToolSchema = z.object({
  action: z.enum(['read', 'write', 'append', 'delete']),
  path: z.string(),
  content: z.string().optional(),
});
export type FileToolArgs = z.infer<typeof FileToolSchema>;
export type FileToolOutput = string;

/**
 * Simple file system tool supporting basic CRUD operations.
 */
export class FileTool implements Tool<FileToolArgs, FileToolOutput> {
  readonly name = 'file';
  readonly description = 'Read, write, append or delete a file on disk';
  readonly schema = FileToolSchema;

  async forward(args: FileToolArgs): Promise<FileToolOutput> {
    const { action, path, content } = FileToolSchema.parse(args);
    switch (action) {
      case 'read':
        return fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : '';
      case 'write':
        fs.writeFileSync(path, content ?? '');
        return 'ok';
      case 'append':
        fs.appendFileSync(path, content ?? '');
        return 'ok';
      case 'delete':
        if (fs.existsSync(path)) fs.unlinkSync(path);
        return 'ok';
      default:
        return 'unknown action';
    }
  }
}
