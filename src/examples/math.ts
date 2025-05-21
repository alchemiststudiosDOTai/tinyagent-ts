import * as dotenv from "dotenv";
dotenv.config(); // Load .env file

import { z } from "zod";
import { Agent } from "../agent";
import { model, tool } from "../decorators";

/**
 * A simple agent that can perform basic mathematical operations using tools.
 * Supports addition, subtraction, multiplication, and division.
 */
@model("anthropic/claude-3-sonnet")
export class MathAgent extends Agent<string> {
  /**
   * Adds two numbers.
   */
  @tool("Add two numbers", z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }): string {
    console.log(`MathAgent: Called add tool with a=${a}, b=${b}`);
    const result = a + b;
    return `${a} + ${b} = ${result}`;
  }

  /**
   * Subtracts two numbers.
   */
  @tool("Subtract two numbers", z.object({ a: z.number(), b: z.number() }))
  subtract({ a, b }: { a: number; b: number }): string {
    console.log(`MathAgent: Called subtract tool with a=${a}, b=${b}`);
    const result = a - b;
    return `${a} - ${b} = ${result}`;
  }

  /**
   * Multiplies two numbers.
   */
  @tool("Multiply two numbers", z.object({ a: z.number(), b: z.number() }))
  multiply({ a, b }: { a: number; b: number }): string {
    console.log(`MathAgent: Called multiply tool with a=${a}, b=${b}`);
    const result = a * b;
    return `${a} × ${b} = ${result}`;
  }

  /**
   * Divides two numbers.
   * Includes error handling for division by zero.
   */
  @tool("Divide two numbers", z.object({ a: z.number(), b: z.number() }))
  divide({ a, b }: { a: number; b: number }): string {
    console.log(`MathAgent: Called divide tool with a=${a}, b=${b}`);
    if (b === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    const result = a / b;
    return `${a} ÷ ${b} = ${result}`;
  }
}

/**
 * Demo function to run the MathAgent with a sample question.
 */
export async function runMathAgentDemo(): Promise<void> {
  // Ensure API key is available
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "💥 Error: OPENROUTER_API_KEY environment variable is not set. Please set it in your .env file.",
    );
    process.exit(1);
  }

  const agent = new MathAgent();
  const questions = [
    "What is 15 plus 7?",
    "What is 20 minus 8?",
    "What is 6 multiplied by 4?",
    "What is 15 divided by 3?",
  ];

  console.log("🧮 Running MathAgent Demo with multiple operations...\n");

  for (const question of questions) {
    console.log(`❓ Question: "${question}"`);
    try {
      const result = await agent.run(question);
      // With the new final_answer workflow, result will be an object with answer property
      const answer = typeof result === 'object' && result && 'answer' in result
        ? (result as { answer: string }).answer
        : String(result);
      console.log(`✅ Answer: ${answer}\n`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${message}\n`);
    }
  }
}

// Run the demo if this file is being run directly
if (require.main === module) {
  runMathAgentDemo();
}
