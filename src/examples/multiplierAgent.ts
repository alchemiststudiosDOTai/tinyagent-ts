import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import { z } from "zod";
import { Agent } from "../agent";
import { model, tool } from "../decorators";

/**
 * An example agent specifically designed to multiply numbers using a tool.
 * It demonstrates a focused agent with a single capability.
 */
@model("qwen/qwq-32b") // Specifies the LLM model for this agent
export class MultiplierAgent extends Agent<string, string> {
  /**
   * A tool that multiplies two numbers.
   * @param a - The first number.
   * @param b - The second number.
   * @returns A promise that resolves with a string describing the product.
   */
  @tool("Multiply two numbers", z.object({ a: z.number(), b: z.number() }))
  async multiply({ a, b }: { a: number; b: number }): Promise<string> {
    console.log(`MultiplierAgent: Called multiply tool with a=${a}, b=${b}`);
    const result = a * b;
    // Note: Tools ideally return raw data (like the number result),
    // letting the LLM formulate the final natural language response.
    // This example returns a formatted string directly for simplicity.
    return `The product of ${a} and ${b} is ${result}.`;
  }

  // Additional tools could be added here.
}

/**
 * Runs the MultiplierAgent demo if this script is executed directly.
 * Creates an instance of MultiplierAgent and asks it a multiplication question.
 */
async function runMultiplierAgent(): Promise<void> {
  // Check if the script is being run directly (not imported as a module)
  if (require.main === module) {
    // API key check is implicitly handled by the Agent constructor,
    // but an explicit check here provides a clearer error message early on.
    if (!process.env.OPENROUTER_API_KEY) {
      console.error(
        "💥 Error: OPENROUTER_API_KEY environment variable is not set. Please create a .env file or export the variable.",
      );
      process.exit(1); // Exit if the key is missing
    }

    const agent = new MultiplierAgent();
    const question = "What is 12 multiplied by 5? Use your tool."; // Example question
    console.log(`\n➡️  Querying MultiplierAgent: "${question}"`);
    try {
      const answer = await agent.run(question);
      console.log(`\n✖️  Agent reply → ${answer}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("💥 Error running MultiplierAgent:", message);
      // Don't exit(1) here, as the agent might handle errors internally
    }
  }
}

// Execute the demo function
runMultiplierAgent();
