import { Agent, getDefaultTools } from '../src';
import 'dotenv/config';

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('=== Minimal ReAct Test ===\n');

  const agent = new Agent({
    model: { name: 'openai/gpt-4o-mini' },
    mode: 'react',
    react: {
      maxSteps: 5,
      enableTrace: true, // Enable trace to see what's happening
      enableReflexion: false,
    }
  });

  // Register tools
  const tools = getDefaultTools();
  tools.forEach(tool => agent.registerTool(tool));

  try {
    const result = await agent.execute('Generate a UUID and tell me what it is. Use the final_answer tool to provide your response.');
    
    console.log('\n=== FINAL RESULT ===');
    console.log('Success:', result.success);
    console.log('Data:', JSON.stringify(result.data, null, 2));
    console.log('Steps:', result.metadata?.steps?.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error); 