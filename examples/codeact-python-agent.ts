import * as dotenv from 'dotenv';
dotenv.config();
// Example: CodeAct Pattern — Python Code as Action (Not a Tool Call)

import { Agent } from '../src/agent';
import { model } from '../src/decorators';
import { PythonExec } from '../src/tools/pythonExec';
import { LLMMessage } from '../src/agent';

/**
 * This example demonstrates the CodeAct paradigm:
 * - The agent receives a task and emits Python code directly as its action, not a tool call.
 * - The system executes the emitted code and returns the result.
 * - All reasoning, control flow, and decision logic are handled in the code itself.
 * 
 * This is in contrast to traditional LLM agent patterns, where each step is a tool call or JSON/text action.
 * 
 * CodeAct enables more efficient, expressive, and compositional reasoning.
 */

@model('google/gemini-2.5-flash-preview-05-20:thinking')
class PythonCodeActAgent extends Agent<string> {
  py = new PythonExec();

  /**
   * The agent's "action" is to emit Python code as a string.
   * The system executes this code and returns the result.
   * No tool call is made; code is the action.
   */
  async actWithPythonCode(task: string): Promise<any> {
    // Define messages for the LLM request
    const messages: LLMMessage[] = [
      { 
        role: 'system', 
        content: `You are a Python programming expert. When given a task, respond with ONLY executable Python code that solves the task. 
        No explanations, comments, or surrounding text. Begin your code with import statements if needed. 
        Your code should be complete, concise, and performant.`
      },
      { role: 'user', content: task }
    ];

    // Make the request to get Python code from the LLM
    const modelName = this.getModelName();
    const response = await this.makeOpenRouterRequest(messages, modelName);
    
    // Extract the Python code from the response and strip markdown formatting
    let pythonCode = response.choices[0]?.message?.content?.trim() ?? '';
    
    // Remove markdown code block formatting if present
    pythonCode = pythonCode.replace(/^```python\s*|^```\s*|```$/gm, '');
    
    console.log('Generated Python Code (after cleanup):');
    console.log('----------------------------------------');
    console.log(pythonCode);
    console.log('----------------------------------------');
    
    // Execute the code and return the result
    const result = await this.py.pythonExec({ code: pythonCode, timeoutMs: 5000 });
    return result;
  }
}

async function main() {
  const agent = new PythonCodeActAgent();

  // The agent is given a task and emits Python code as the action (not a tool call)
  const task = `
You are an expert laptop selection agent. Use Python code as your reasoning and action mechanism.
Here are the laptop options (as a Python list of dicts):

Here are the laptop options:

Laptop A: $1200, CPU benchmark 9500, 8-hour battery
Laptop B: $1000, CPU benchmark 8700, 10-hour battery
Laptop C: $900, CPU benchmark 8000, 7-hour battery

Your job:
- Use Python code to score each laptop for best value (higher CPU and battery are better, lower price is better).
- Select the best laptop and explain your reasoning.
- Output a JSON object with the selected laptop, all scores, and a reasoning string.
`;

  console.log('Submitting task to CodeAct agent...');
  
  // The agent emits Python code as the action, which is executed directly
  const result = await agent.actWithPythonCode(task);

  // Print the agent's output
  console.log('Agent Output:', result);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});