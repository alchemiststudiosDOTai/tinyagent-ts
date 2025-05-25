import { Agent, getDefaultTools } from '../src';
import 'dotenv/config';

async function main() {
  // Create agent with ReAct mode for reasoning + tool execution
  const agent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20' },
    mode: 'react',
  });

  // Register default tools (file, search, uuid, human-loop, etc.)
  // Note: final_answer tool is automatically registered by the agent
  const tools = getDefaultTools();
  tools.forEach(tool => agent.registerTool(tool));

  try {
    // Simple task execution
    const result = await agent.execute('Generate a UUID and tell me what it is. Use the final_answer tool to provide your response.');
    console.log('Question: Generate a UUID and tell me what it is');
    console.log('Answer:', result.data?.answer || result.data || 'No response received');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the agent
main().catch(console.error); 