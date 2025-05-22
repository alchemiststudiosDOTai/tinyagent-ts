import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';
import { FileTool } from '../src/default-tools';

/**
 * FileAgent demonstrates how to use the FileTool for basic file operations.
 */
@model('openai/gpt-4.1-mini')
export class FileAgent extends Agent<string> {
  private fileTool = new FileTool();

  @tool('Perform file operations', z.object({
    action: z.enum(['read', 'write', 'append', 'delete']),
    path: z.string(),
    content: z.string().optional()
  }))
  async file(args: { action: 'read' | 'write' | 'append' | 'delete', path: string, content?: string }) {
    const result = await this.fileTool.forward(args);
    return result;
  }
}

async function runFileAgentDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('🛑 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  const agent = new FileAgent();
  const tasks = [
    'Create a new file called notes.txt with the content "Hello, world!"',
    'Read the content of notes.txt',
    'Append "This is a new line." to notes.txt',
    'Read the updated content of notes.txt',
    'Delete the file notes.txt'
  ];

  console.log('📂 Running FileAgent Demo with file operations...');
  console.log('This demo will create, read, append to, and delete a file called notes.txt.\n');

  for (const task of tasks) {
    console.log(`❓ Task: "${task}"`);
    try {
      const result = await agent.run(task);
      const answer = typeof result === 'object' && result && 'answer' in result
        ? (result as { answer: string }).answer
        : String(result);
      console.log(`✅ Result: ${answer}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${message}\n`);
    }
  }
}

if (require.main === module) {
  runFileAgentDemo();
}
