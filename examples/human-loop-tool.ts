import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';
import { HumanLoopTool } from '../src/default-tools';

/**
 * HumanLoopAgent demonstrates how to use the HumanLoopTool to interact with human operators.
 */
@model('openai/gpt-4.1-nano')
export class HumanLoopAgent extends Agent<string> {
  private humanLoopTool = new HumanLoopTool();

  @tool('Ask human for input', z.object({
    prompt: z.string().default('Need input:')
  }))
  async askHuman(args: { prompt: string }) {
    const result = await this.humanLoopTool.forward(args);
    return `Human responded: ${result}`;
  }
}

async function runHumanLoopAgentDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('🛑 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  const agent = new HumanLoopAgent();
  const tasks = [
    'Ask the human what their favorite color is',
    'Ask the human what they would like to do today',
    'Ask the human for their opinion on AI assistants'
  ];

  console.log('👤 Running HumanLoopAgent Demo for interactive prompts...');
  console.log('This demo will pause and ask for your input at each step.\n');

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
  runHumanLoopAgentDemo();
}
