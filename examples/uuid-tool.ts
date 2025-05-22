/**
 * Example: Using UuidTool with an Agent to generate random UUIDs.
 *
 * Requirements:
 *   - Set the OPENROUTER_API_KEY environment variable with your API key.
 *   - Optionally, create a `.env` file with OPENROUTER_API_KEY for local development.
 *   - Run this example with: `ts-node examples/uuid-tool.ts`
 *
 * This script demonstrates how to use the UuidTool in an agent workflow.
 */

import * as dotenv from 'dotenv';
// Load environment variables from .env if present (for local development)
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';
import { UuidTool } from '../src/default-tools';

/**
 * UuidAgent demonstrates how to use the UuidTool to generate random UUIDs.
 */
@model('openai/gpt-4.1-nano')
export class UuidAgent extends Agent<string> {
  private uuidTool = new UuidTool();

  @tool('Generate a random UUID', z.object({}))
  async uuid() {
    // The UuidTool does not require any input.
    const result = await this.uuidTool.forward();
    return `Generated UUID: ${result}`;
  }
}

async function runUuidAgentDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('🛑 Error: OPENROUTER_API_KEY not set. Please set it in your environment or .env file.');
    process.exit(1);
  }

  const agent = new UuidAgent();
  const tasks = [
    'Generate a new UUID',
    'Create a unique identifier for me',
    'I need a random UUID for my database entry'
  ];

  console.log('🅿️ Running UuidAgent Demo for UUID generation...');
  console.log('This demo will generate random UUIDs for various requests.\n');

  for (const task of tasks) {
    console.log(`❓ Task: "${task}"`);
    try {
      const result = await agent.run(task);
      // The result may be an object with an 'answer' property or a string.
      const answer =
        typeof result === 'object' && result && 'answer' in result
          ? (result as { answer: string }).answer
          : String(result);
      console.log(`✅ Result: ${answer}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${message}\n`);
    }
  }
}

// Run the demo if this file is executed directly.
if (require.main === module) {
  runUuidAgentDemo();
}
