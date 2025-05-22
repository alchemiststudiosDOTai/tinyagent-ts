import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';
import { GrepTool } from '../src/default-tools';

/**
 * GrepAgent demonstrates how to use the GrepTool to search for patterns in files.
 */
@model('openai/gpt-4.1-mini')
export class GrepAgent extends Agent<string> {
  private grepTool = new GrepTool();

  @tool('Search for patterns in files', z.object({
    pattern: z.string(),
    file: z.string()
  }))
  async grep(args: { pattern: string, file: string }) {
    const result = await this.grepTool.forward(args);
    return result || 'No matches found';
  }
}

async function runGrepAgentDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('🛑 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  const agent = new GrepAgent();
  const tasks = [
    'Find all lines containing "agent" in the README.md file',
    'Find all lines containing "tool" in the src/decorators.ts file',
    'Search for "import" in package.json'
  ];

  console.log('🔍 Running GrepAgent Demo for pattern searching...');
  console.log('This demo will search for patterns in various files.\n');

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
  runGrepAgentDemo();
}
