import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { Scratchpad } from '../src/utils/scratchpad';

/**
 * Example of a ReAct agent that demonstrates the Thought → Action → Observation loop
 * using JSON tool calls.
 */
@model('openai/gpt-4.1')
export class ReActAgent extends MultiStepAgent<string> {
  /**
   * Simple echo tool that returns the input text
   */
  @tool('Echo given text', z.object({ text: z.string() }))
  echo({ text }: { text: string }): string {
    return `Echo: ${text}`;
  }
  
  /**
   * Simple calculator tool that evaluates a math expression
   */
  @tool('Calculate math expression', z.object({ expression: z.string() }))
  calculate({ expression }: { expression: string }): string {
    try {
      // WARNING: Never use eval in production code - this is just for demonstration
      const result = eval(expression);
      return `Result: ${result}`;
    } catch (error) {
      return `Error calculating: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}

/**
 * Callback to display the ReAct steps in a readable format
 */
function displayReActSteps(pad: Scratchpad): void {
  const steps = pad.getSteps();
  const lastStep = steps[steps.length - 1];
  
  if (lastStep.type === 'thought') {
    console.log(`🤔 Thought: ${lastStep.text}`);
  } else if (lastStep.type === 'action') {
    if (lastStep.mode === 'json') {
      console.log(`🛠️  Action: ${lastStep.tool}(${JSON.stringify(lastStep.args)})`);
    } else {
      console.log(`🛠️  Action: [Code Action]`);
    }
  } else if (lastStep.type === 'observation') {
    console.log(`👁️  Observation: ${lastStep.text}`);
  }
}

async function runDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('💥 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  console.log('🧠 Running ReAct Agent Demo...');
  
  const agent = new ReActAgent();
  // This query requires multiple steps to solve
  const question = 'Calculate 23 * 17 and then echo the result with a friendly message.';
  console.log(`❓ Query: "${question}"`);
  
  try {
    const result = await agent.run(question, { 
      trace: true,
      onStep: displayReActSteps
    });
    // With the new final_answer workflow, result will be an object with answer property
    const answer = typeof result === 'object' && result && 'answer' in result
      ? (result as { answer: string }).answer
      : String(result);
    console.log(`✅ Final Answer: ${answer}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${message}`);
  }
}

if (require.main === module) {
  runDemo();
}
