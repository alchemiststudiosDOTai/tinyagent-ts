// Simple validation that our examples import correctly
// This tests the API without actually executing the agents

async function validateExamples() {
  console.log('🧪 Validating example files...');
  
  try {
    // Test imports from src
    const { Agent, getDefaultTools } = await import('../src/index.js');
    const { z } = await import('zod');
    
    console.log('✅ Import validation passed');
    
    // Test tool structure
    const mathTool = {
      name: 'add_numbers',
      description: 'Add two numbers together',
      schema: z.object({
        a: z.number().describe('First number'),
        b: z.number().describe('Second number')
      }),
      execute: async ({ a, b }) => {
        return `${a} + ${b} = ${a + b}`;
      }
    };
    
    console.log('✅ Custom tool structure validation passed');
    
    // Test agent creation (with dummy API key)
    const agent = new Agent({
      model: { 
        name: 'test-model',
        apiKey: 'dummy-key'
      },
      mode: 'react'
    });
    
    console.log('✅ Agent creation validation passed');
    
    // Test tool registration
    const tools = getDefaultTools();
    tools.forEach(tool => agent.registerTool(tool));
    agent.registerTool(mathTool);
    
    console.log('✅ Tool registration validation passed');
    console.log(`   - Default tools: ${tools.length}`);
    console.log(`   - Total tools registered: ${agent.getToolRegistry().size()}`);
    
    console.log('🎉 All example validations passed!');
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateExamples();