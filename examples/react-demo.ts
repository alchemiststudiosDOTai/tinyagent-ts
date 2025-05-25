import { Agent, getDefaultTools } from '../src';
import 'dotenv/config';

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('=== ReAct Workflow Demonstration ===\n');

  const agent = new Agent({
    model: { name: 'openai/gpt-4o-mini' },
    mode: 'react',
    react: {
      maxSteps: 10,
      enableTrace: true,
      enableReflexion: false,
    }
  });

  // Register default tools
  const tools = getDefaultTools();
  tools.forEach(tool => agent.registerTool(tool));

  console.log('Available tools:', agent.getToolRegistry().getAll().map(t => t.name).join(', '));
  console.log();

  try {
    const result = await agent.execute(`
      I need you to:
      1. Generate a UUID 
      2. Use Python to calculate 25 * 4 + 17
      3. Search for information about "TypeScript agents"
      4. Provide a final answer with all three results

      Use the tools available to complete each step.
    `);
    
    console.log('\n=== FINAL RESULT ===');
    console.log('Success:', result.success);
    console.log('Data:', JSON.stringify(result.data, null, 2));
    console.log('Steps:', result.metadata?.steps?.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);