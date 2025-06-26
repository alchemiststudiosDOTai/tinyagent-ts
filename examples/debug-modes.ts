import { Agent, getDefaultTools } from '../src';
import 'dotenv/config';

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('=== Debugging ReAct Mode ===\n');

  // ReAct Mode - Reasoning with tool execution
  console.log('REACT MODE (Reasoning + Tool Execution)');
  const reactAgent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'react',
  });

  // Register tools for ReAct mode
  const tools = getDefaultTools();
  tools.forEach((tool) => reactAgent.registerTool(tool));

  try {
    const react = await reactAgent.execute(
      'Generate a UUID and tell me what it looks like'
    );

    console.log('Full result:', JSON.stringify(react, null, 2));
    console.log('react.data:', react.data);
    console.log('react.data?.answer:', react.data?.answer);
    console.log('typeof react.data:', typeof react.data);
  } catch (error) {
    console.error('ReAct mode error:', error);
  }
}

main().catch(console.error);
