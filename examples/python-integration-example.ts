import { UnifiedAgent } from '../src/agent/unified-agent';
import { getDefaultTools } from '../src/tools/default-tools';
import 'dotenv/config';

async function main() {
  // Create a modern agent in react mode
  const agent = new UnifiedAgent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'react',
  });
  // Register default tools, including Python
  getDefaultTools().forEach((tool) => agent.registerTool(tool));

  const task = `Given the list [1, 2, 3, 4, 5], filter even numbers using Python, then sum them and print the result as JSON.`;
  console.log('Agent assigned:', task);
  const result = await agent.execute(task);
  console.log('Agent Output:', result.data);
}

main().catch(console.error);
