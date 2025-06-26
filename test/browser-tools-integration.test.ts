// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return; // Ignore punycode warnings
  }
  console.warn(warning);
});

import { Agent } from '../src';
import { getBrowserTools } from '../src/tools/browser-tools';

describe('Browser Tools Integration', () => {
  it('should work with ReAct agent to browse websites', async () => {
    if (!process.env.RUN_LIVE || !process.env.OPENROUTER_API_KEY) {
      console.log('Skipping integration test - set RUN_LIVE=true and OPENROUTER_API_KEY to enable');
      return;
    }

    await testBrowserWithTinyAgent();
  }, 60000); // 60 second timeout for live test
});

async function testBrowserWithTinyAgent() {
  console.log('🌐 Testing Browser Tools with TinyAgent.xyz\n');

  // Create an agent with ReAct mode
  const agent = new Agent({
    model: {
      name: 'openai/gpt-4o-mini',
      provider: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    mode: 'react',
    react: {
      maxSteps: 8,
      enableTrace: true,
    },
  });

  // Register browser tools
  const browserTools = getBrowserTools();
  console.log('🔧 Available browser tools:');
  browserTools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description.slice(0, 60)}...`);
  });
  console.log();

  // Register all browser tools with the agent
  browserTools.forEach(tool => agent.registerTool(tool));

  // Test task: Visit tinyagent.xyz and explore
  const task = 'Visit https://tinyagent.xyz/ and tell me what you find there. Describe the main content, any key features mentioned, and what the site is about.';
  
  try {
    console.log('🎯 Task:', task);
    console.log('\n' + '='.repeat(60));
    console.log('🤖 Agent starting...\n');
    
    const result = await agent.execute(task);
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL RESULT');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${result.success}`);
    
    if (result.data?.answer) {
      console.log(`\n📝 Answer:\n${result.data.answer}`);
    }
    
    if (result.data?.steps) {
      console.log(`\n🔄 Steps taken: ${result.data.steps}`);
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

// Run the test
if (require.main === module) {
  testBrowserWithTinyAgent().catch(console.error);
}

export { testBrowserWithTinyAgent };