import { Agent } from './src';
import { getBrowserTools } from './src/tools/browser-tools';

async function testSchemaEnhancement() {
  console.log('🔧 Testing Enhanced Zod Schema Integration\n');

  // Create an agent
  const agent = new Agent({
    model: {
      name: 'openai/gpt-4o-mini',
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    mode: 'react',
  });

  // Register browser tools
  const browserTools = getBrowserTools();
  browserTools.forEach((tool) => agent.registerTool(tool));

  // Test the enhanced tool catalog
  const registry = agent.getToolRegistry();

  console.log('📋 ENHANCED TOOL CATALOG (with Zod schemas):');
  console.log('='.repeat(60));
  console.log(registry.getCatalog());
  console.log('='.repeat(60));

  console.log('\n📋 DETAILED TOOL CATALOG:');
  console.log('='.repeat(60));
  console.log(registry.getDetailedCatalog());
  console.log('='.repeat(60));

  console.log('\n📋 LEGACY CATALOG (for comparison):');
  console.log('='.repeat(60));
  console.log(registry.getLegacyCatalog());
  console.log('='.repeat(60));

  // Test with a simple task to see if parameters are used correctly
  console.log('\n🤖 Testing parameter usage with enhanced schema...\n');

  const simpleTask =
    'Visit the URL https://example.com and tell me the page title';

  try {
    const result = await agent.execute(simpleTask);

    console.log('✅ SUCCESS! Enhanced schema working correctly.');
    console.log(`Result: ${result.data?.answer || 'No answer'}`);
  } catch (error) {
    console.error(
      '❌ Error:',
      error instanceof Error ? error.message : String(error)
    );
  }
}

if (require.main === module) {
  testSchemaEnhancement().catch(console.error);
}
