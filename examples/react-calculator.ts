import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { Scratchpad } from '../src/utils/scratchpad';

/**
 * CalculatorAgent demonstrates the ReAct loop with math tools.
 */
@model('openai/gpt-4.1')
class CalculatorAgent extends MultiStepAgent<string> {
  @tool('Add two numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }): string {
    return String(a + b);
  }

  @tool('Subtract two numbers', z.object({ a: z.number(), b: z.number() }))
  subtract({ a, b }: { a: number; b: number }): string {
    return String(a - b);
  }

  @tool('Multiply two numbers', z.object({ a: z.number(), b: z.number() }))
  multiply({ a, b }: { a: number; b: number }): string {
    return String(a * b);
  }

  @tool('Divide two numbers', z.object({ a: z.number(), b: z.number() }))
  divide({ a, b }: { a: number; b: number }): string {
    return b === 0 ? 'Error: Division by zero' : String(a / b);
  }
}

function displaySteps(pad: Scratchpad) {
  const last = pad.getSteps()[pad.getSteps().length - 1];
  if (last.type === 'thought') {
    console.log(`🤔 ${last.text}`);
  } else if (last.type === 'action') {
    if (last.mode === 'json') {
      console.log(`🛠️  ${last.tool}(${JSON.stringify(last.args)})`);
    } else {
      console.log('🛠️  [code action]');
    }
  } else if (last.type === 'observation') {
    console.log(`👁️  ${last.text}`);
  }
}

async function runDemo() {
  const agent = new CalculatorAgent();
  const question = 'What is (5 * 3) + 10?';
  console.log(`❓ ${question}`);
  const result = await agent.run(question, { trace: true, onStep: displaySteps });
  console.log('✅ Final Answer:', result);
}

if (require.main === module) {
  runDemo();
}
