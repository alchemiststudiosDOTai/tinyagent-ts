import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { Agent } from '../agent';
import { model, tool } from '../decorators';

/**
 * Example agent that demonstrates the proper use of the final_answer tool.
 * This agent shows how to implement a simple tool and then use final_answer
 * to return the final result to the user.
 */
@model('mistralai/mistral-small-3.1-24b-instruct:free')
export class FinalAnswerDemoAgent extends Agent<string, any> {
  /**
   * A simple addition tool
   */
  @tool('Add two numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }): string {
    console.log(`FinalAnswerDemoAgent: Called add tool with a=${a}, b=${b}`);
    const result = a + b;
    return `The sum of ${a} and ${b} is ${result}`;
  }

  /**
   * A simple multiplication tool
   */
  @tool('Multiply two numbers', z.object({ a: z.number(), b: z.number() }))
  multiply({ a, b }: { a: number; b: number }): string {
    console.log(`FinalAnswerDemoAgent: Called multiply tool with a=${a}, b=${b}`);
    const result = a * b;
    return `The product of ${a} and ${b} is ${result}`;
  }
}

/**
 * Run the FinalAnswerDemoAgent to demonstrate proper usage of the final_answer tool.
 */
async function runFinalAnswerDemo() {
  // Check for API key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('💥 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  console.log('🎯 Running FinalAnswerDemo...');
  
  const agent = new FinalAnswerDemoAgent();
  const question = 'What is 7 + 3, and then multiply the result by 5?';
  console.log(`❓ Question: "${question}"`);
  
  try {
    // The agent.run() method will return the result of the final_answer tool
    // which is an object with an 'answer' property
    const result = await agent.run(question);
    // Extract the answer from the result
    const answer = typeof result === 'object' && result && 'answer' in result
      ? (result as { answer: string }).answer
      : String(result);
    console.log(`✅ Final Answer: ${answer}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${message}`);
  }
}

// Run the demo if this file is being run directly
if (require.main === module) {
  runFinalAnswerDemo();
}
