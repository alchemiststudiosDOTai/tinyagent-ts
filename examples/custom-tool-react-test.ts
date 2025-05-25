import { Agent, getDefaultTools } from '../src';
import { Tool } from '../src/tools/types';
import { z } from 'zod';
import 'dotenv/config';

// Custom tool that calculates simple math operations
const calculatorTool: Tool = {
  name: 'calculator',
  description: 'Performs basic arithmetic operations (add, subtract, multiply, divide)',
  schema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The arithmetic operation to perform'),
    a: z.number().describe('The first number'),
    b: z.number().describe('The second number')
  }),
  execute: async (args) => {
    const { operation, a, b } = args;
    console.log(`Calculator: ${a} ${operation} ${b}`);
    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide':
        if (b === 0) throw new Error('Division by zero is not allowed');
        return a / b;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
};

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('=== ReAct Test with Custom Calculator Tool ===\n');

  const agent = new Agent({
    model: { name: 'openai/gpt-4o-mini' },
    mode: 'react',
    react: {
      maxSteps: 8,
      enableTrace: true,
      enableReflexion: false,
    }
  });

  // Register default tools
  const tools = getDefaultTools();
  tools.forEach(tool => agent.registerTool(tool));
  
  // Register custom calculator tool
  agent.registerTool(calculatorTool);

  try {
    console.log('Registered tools:', agent.getToolRegistry().getAll().map(t => t.name));
    
    const result = await agent.execute('Calculate 25 * 4, then add 17 to the result. Generate a UUID and include both the math result and UUID in your final answer.');
    
    console.log('\n=== FINAL RESULT ===');
    console.log('Success:', result.success);
    console.log('Data:', JSON.stringify(result.data, null, 2));
    console.log('Steps:', result.metadata?.steps?.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);