#!/usr/bin/env node
import "dotenv/config";
import { Agent, model } from "./index";
import { createInterface } from "readline";

/**
 * Basic chat agent that just forwards messages to the LLM
 */
@model("anthropic/claude-3-sonnet")
class ChatAgent extends Agent<string> {
  constructor() {
    super();
    (this as any).promptEngine.overwrite("agent", () => `You are a helpful AI assistant. You aim to be:
- Helpful and friendly
- Concise but informative
- Direct in your responses
You should avoid:
- Making things up
- Being overly verbose
- Using unnecessary pleasantries`);
  }
}

async function startChat() {
  console.log(`
🤖 TinyAgent Chat
Type your messages and press Enter. Type 'exit' or press Ctrl+C to quit.
---------------------------------------------------------`);

  const agent = new ChatAgent();
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (query: string): Promise<string> =>
    new Promise((resolve) => rl.question(query, resolve));

  try {
    while (true) {
      const input = await prompt("\nYou: ");
      if (input.toLowerCase() === "exit") {
        break;
      }

      try {
        const response = await agent.run(input);
        console.log("\n🤖:", response.answer);
      } catch (error) {
        console.error("\n❌ Error:", error instanceof Error ? error.message : error);
      }
    }
  } finally {
    rl.close();
    console.log("\nGoodbye! 👋");
  }
}

// Start chat if run directly
if (require.main === module) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ Error: OPENROUTER_API_KEY environment variable is not set");
    process.exit(1);
  }
  startChat().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
} 