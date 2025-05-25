import { Agent, getDefaultTools } from '../src';
import 'dotenv/config';

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('=== Demonstrating Agent Modes & Tool Discovery ===\n');

  // 1. Simple Mode - Direct LLM response (no tools)
  console.log('1. SIMPLE MODE (Direct LLM Response)');
  const simpleAgent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20' },
    mode: 'simple'
  });

  try {
    const simple = await simpleAgent.execute('Hello! Tell me a joke.');
    console.log('Response:', simple.data.answer);
    console.log('');
  } catch (error) {
    console.error('Simple mode error:', error);
  }

  // 2. ReAct Mode - Reasoning with tool execution
  console.log('2. REACT MODE (Reasoning + Tool Execution)');
  const reactAgent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20' },
    mode: 'react'
  });

  // Register tools for ReAct mode
  // Note: final_answer tool is automatically registered by the agent
  const tools = getDefaultTools();
  tools.forEach(tool => reactAgent.registerTool(tool));

  try {
    const react = await reactAgent.execute('Generate a UUID and tell me what it looks like. Use the final_answer tool to provide your response.');
    console.log('Response:', react.data?.answer || react.data || 'No response received');
    console.log('Steps taken:', react.metadata?.steps?.length || 0);
    console.log('');
  } catch (error) {
    console.error('ReAct mode error:', error);
  }

  // 3. Tool Discovery - List available capabilities
  console.log('3. TOOL DISCOVERY (Available Capabilities)');
  console.log('Available tools:');
  reactAgent.getToolRegistry().getAll().forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.description}`);
  });
}

main().catch(console.error);