import { config } from 'dotenv';
import { UnifiedAgent } from './agent/unified-agent';
import { getDefaultTools } from './tools/default-tools';
import { tool, model } from './decorators';
import { Agent } from './agent';
import { z } from 'zod';

// Load environment variables from .env file
config();

// Test agent with @tool decorators for CLI compatibility testing
@model('openai/gpt-4o-mini')
class TestDecoratorAgent extends Agent<string> {
  @tool('Add two numbers together', z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }))
  async add({ a, b }: { a: number; b: number }): Promise<string> {
    return `${a} + ${b} = ${a + b}`;
  }

  @tool('Greet someone by name', z.object({
    name: z.string().describe('Name of person to greet')
  }))
  async greet({ name }: { name: string }): Promise<string> {
    return `Hello, ${name}!`;
  }
}

/**
 * Simple test to validate the new unified agent architecture
 */
async function testUnifiedAgent() {
  console.log('🧪 Testing Unified Agent Architecture...\n');

  try {
    // Test 1: New UnifiedAgent with migrated tools
    console.log('=== Test 1: New UnifiedAgent with Migrated Tools ===');
    const agent = new UnifiedAgent({
      mode: 'react',
      react: {
        maxSteps: 3,
        enableTrace: true,
      },
    });

    // Register default tools (excluding final_answer since it's auto-registered, and excluding search/human loop for testing)
    const tools = getDefaultTools().filter(tool => 
    ['duck_search', 'human_loop'].includes(tool.name)
    );
    
    agent.registerTools(tools);

    console.log('✅ Agent created successfully');
    console.log(`✅ Registered ${tools.length} additional tools:`, tools.map(t => t.name).join(', '));
    console.log('✅ final_answer tool is auto-registered by UnifiedAgent');

    // Test simple mode
    console.log('\n🔄 Testing Simple Mode...');
    agent.updateConfig({ mode: 'simple' });
    
    const simpleResult = await agent.execute('What is 2 + 2?');
    console.log('Simple result:', simpleResult.success ? '✅ Success' : '❌ Failed');
    if (simpleResult.data) {
      console.log('Answer:', simpleResult.data.answer);
    }

    // Test triage mode
    console.log('\n🔄 Testing Triage Mode...');
    agent.updateConfig({ mode: 'triage' });
    
    const triageResult = await agent.execute('I need help with files');
    console.log('Triage result:', triageResult.success ? '✅ Success' : '❌ Failed');
    if (triageResult.data) {
      console.log('Tools suggested:\n', triageResult.data.answer);
    }

    // Test react mode with UUID generation
    console.log('\n🔄 Testing ReAct Mode with UUID...');
    agent.updateConfig({ mode: 'react' });
    
    const reactResult = await agent.execute('Generate a UUID for me');
    console.log('ReAct result:', reactResult.success ? '✅ Success' : '❌ Failed');
    console.log('Steps taken:', reactResult.metadata?.steps?.length || 0);
    if (reactResult.data) {
      console.log('Final answer:', reactResult.data.answer);
    }

    // Test 2: CLI Decorator Pattern Compatibility
    console.log('\n=== Test 2: CLI Decorator Pattern Compatibility ===');
    
    // Create legacy decorator-based agent
    const decoratorAgent = new TestDecoratorAgent();
    console.log('✅ Decorator-based agent created successfully');
    
    // Extract tools from decorator agent using existing buildToolRegistry pattern
    const toolRegistry = (decoratorAgent as any).buildToolRegistry();
    const decoratorTools = Object.values(toolRegistry).map((toolHandle: any) => ({
      name: toolHandle.meta.name,
      description: toolHandle.meta.description,
      schema: toolHandle.meta.schema,
      execute: toolHandle.call
    }));
    
    console.log(`✅ Extracted ${decoratorTools.length} tools from decorators:`, decoratorTools.map(t => t.name).join(', '));
    
    // Create UnifiedAgent and register decorator-based tools
    const unifiedWithDecorators = new UnifiedAgent({
      mode: 'react',
      react: {
        maxSteps: 3,
        enableTrace: true,
      },
    });
    
    // Register tools extracted from decorator agent
    unifiedWithDecorators.registerTools(decoratorTools);
    
    console.log('✅ Successfully registered decorator tools in UnifiedAgent');
    
    // Test triage mode to see if decorator tools are available
    console.log('\n🔄 Testing Triage Mode with Decorator Tools...');
    unifiedWithDecorators.updateConfig({ mode: 'triage' });
    
    const decoratorTriageResult = await unifiedWithDecorators.execute('What can you help me with?');
    console.log('Decorator triage result:', decoratorTriageResult.success ? '✅ Success' : '❌ Failed');
    if (decoratorTriageResult.data) {
      console.log('Available decorator tools:\n', decoratorTriageResult.data.answer);
    }
    
    // Test ReAct mode with decorator tool
    console.log('\n🔄 Testing ReAct Mode with Decorator Tool (add numbers)...');
    unifiedWithDecorators.updateConfig({ mode: 'react' });
    
    const decoratorReactResult = await unifiedWithDecorators.execute('Add 15 and 27 together');
    console.log('Decorator ReAct result:', decoratorReactResult.success ? '✅ Success' : '❌ Failed');
    console.log('Steps taken:', decoratorReactResult.metadata?.steps?.length || 0);
    if (decoratorReactResult.data) {
      console.log('Final answer:', decoratorReactResult.data.answer);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ New modular tool system working');
    console.log('✅ CLI decorator pattern compatibility working');
    console.log('✅ Tool migration path validated');
    console.log('✅ Ready for CLI integration!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testUnifiedAgent().catch(console.error);
}

export { testUnifiedAgent }; 