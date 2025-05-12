// src/index.ts
import "dotenv/config"; // Ensures .env variables are loaded
import { Agent } from "./agent";
import { model, tool } from "./decorators";
import { z } from "zod";

/**
 * An example agent that can perform addition and multiplication using tools.
 * It demonstrates the use of `@model` and `@tool` decorators.
 */
@model("qwen/qwen2-72b-instruct") // Specifies the LLM model to be used by this agent
class CalcAgent extends Agent<string, string> {
  /**
   * A tool that sums two numbers.
   * @param a - The first number.
   * @param b - The second number.
   * @returns The sum of a and b as a string.
   */
  @tool("Sum two numbers", z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }): string {
    console.log(`CalcAgent: Called add tool with a=${a}, b=${b}`);
    return String(a + b);
  }

  /**
   * A tool that multiplies two numbers.
   * @param x - The first number.
   * @param y - The second number.
   * @returns The product of x and y as a string.
   */
  @tool("Multiply two numbers", z.object({ x: z.number(), y: z.number() }))
  mul({ x, y }: { x: number; y: number }): string {
    console.log(`CalcAgent: Called mul tool with x=${x}, y=${y}`);
    return String(x * y);
  }
}

/**
 * IIFE to run the CalcAgent demo.
 * This function creates an instance of CalcAgent and runs it with a sample query.
 */
(async () => {
  try {
    const agent = new CalcAgent();
    const question =
      "What is five times seven, and then add three to the result? Use tools if useful.";
    console.log(`\n➡️  Querying CalcAgent: "${question}"`);
    const answer = await agent.run(question);
    console.log("\n🧮  Agent reply →", answer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("💥 Error running CalcAgent:", message);
    process.exit(1);
  }
})();
