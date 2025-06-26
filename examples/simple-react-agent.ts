import { Agent, getDefaultTools } from '../src';
import 'dotenv/config';
async function main() {
  const agent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20' },
    mode: 'react',
  });
  const tools = getDefaultTools();
  tools.forEach((tool) => agent.registerTool(tool));
  try {
    const result = await agent.execute(
      `      1. Generate a UUID       2. Use Python to calculate 25 * 4 + 17      3. Provide a final answer with both results.    `
    );
    console.log('\n=== FINAL RESULT ===');
    console.log('Success:', result.success);
    console.log('Data:', JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}
main().catch(console.error);
