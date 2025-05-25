import { Agent, getDefaultTools } from '../src';
import { z } from 'zod';
import 'dotenv/config';

// Define a custom math tool
const mathTool = {
  name: 'add_numbers',
  description: 'Add two numbers together',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }),
  execute: async ({ a, b }: { a: number; b: number }) => {
    const result = a + b;
    return `Adding ${a} + ${b} = ${result}`;
  }
};

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  // Create agent
  const agent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'react',
  });

  // Register all default tools (file, search, uuid, etc.)
  // Note: final_answer tool is automatically registered by the agent
  const defaultTools = getDefaultTools();
  defaultTools.forEach(tool => agent.registerTool(tool));
  
  // Register our custom math tool
  agent.registerTool(mathTool);

  try {
    // Test custom tool
    console.log('=== Testing Custom Math Tool ===');
    const mathResult = await agent.execute('What is 15 + 27? Use the add_numbers tool and provide the final answer.');
    console.log('Math Answer:', mathResult.data?.answer || mathResult.data || 'No response received');

    console.log('\n=== Testing Default Tools ===');
    // Test default tools
    const uuidResult = await agent.execute('Generate a UUID for me');
    console.log('UUID Answer:', uuidResult.data?.answer || uuidResult.data || 'No response received');

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);