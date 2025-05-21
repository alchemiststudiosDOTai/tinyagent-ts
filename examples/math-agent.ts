import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';

/**
 * MathAgent can perform basic math operations: add, subtract, multiply, divide.
 */
@model('openai/gpt-4.1-nano')
export class MathAgent extends Agent<string> {
  @tool('Add two numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }) {
    return `${a} + ${b} = ${a + b}`;
  }

  @tool('Subtract two numbers', z.object({ a: z.number(), b: z.number() }))
  subtract({ a, b }: { a: number; b: number }) {
    return `${a} - ${b} = ${a - b}`;
  }

  @tool('Multiply two numbers', z.object({ a: z.number(), b: z.number() }))
  multiply({ a, b }: { a: number; b: number }) {
    return `${a} × ${b} = ${a * b}`;
  }

  @tool('Divide two numbers', z.object({ a: z.number(), b: z.number() }))
  divide({ a, b }: { a: number; b: number }) {
    if (b === 0) return 'Error: Division by zero';
    return `${a} ÷ ${b} = ${a / b}`;
  }
}

async function runMathAgentDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('🛑 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  const agent = new MathAgent();
  const questions = [
    'What is 15 plus 7?',
    'What is 20 minus 8?',
    'What is 6 multiplied by 4?',
    'What is 15 divided by 3?'
  ];

  console.log('🧮 Running MathAgent Demo with multiple operations...\n');

  for (const question of questions) {
    console.log(`❓ Question: "${question}"`);
    try {
      const result = await agent.run(question);
      const answer = typeof result === 'object' && result && 'answer' in result
        ? (result as { answer: string }).answer
        : String(result);
      console.log(`✅ Answer: ${answer}\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${message}\n`);
    }
  }
}

if (require.main === module) {
  runMathAgentDemo();
}
