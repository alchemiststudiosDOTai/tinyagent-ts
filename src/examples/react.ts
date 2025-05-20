import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../decorators';
import { MultiStepAgent } from '../multiStepAgent';

@model('mistralai/mistral-small-3.1-24b-instruct:free')
class ToolCallingAgent extends MultiStepAgent<string, string> {
  @tool('Echo given text', z.object({ text: z.string() }))
  echo({ text }: { text: string }): string {
    return `Echo: ${text}`;
  }
}

async function runDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  const agent = new ToolCallingAgent();
  const question = 'Say hello using the echo tool then finish.';
  const answer = await agent.run(question, { trace: true });
  console.log('Final:', answer);
}

if (require.main === module) {
  runDemo();
}
