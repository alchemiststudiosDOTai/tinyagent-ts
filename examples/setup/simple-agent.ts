import { Agent, model, tool } from 'tinyagent-ts';
import { z } from 'zod';
import 'dotenv/config';

// Define a custom agent with tools
@model('openai/gpt-4')
class SimpleAgent extends Agent {
  // Add a simple calculator tool
  @tool('Add two numbers together', z.object({ a: z.number(), b: z.number() }))
  async add(args: { a: number; b: number }) {
    return { result: args.a + args.b };
  }
}

// Use the agent
async function main() {
  // Make sure you have an OPENROUTER_API_KEY in your .env file
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  const agent = new SimpleAgent();
  const question = 'What is 24 + 18?';
  
  try {
    const answer = await agent.run(question);
    console.log(`Question: ${question}`);
    console.log(`Answer: ${answer}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
