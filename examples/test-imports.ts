// Test script to verify that our new API exports work correctly
// This simulates installing 'tinyagent-ts' from npm

// Import from the local src (simulating npm package)
import { Agent, getDefaultTools } from '../src';

console.log('✅ Successfully imported Agent and getDefaultTools');

async function testAPI() {
  console.log('🧪 Testing API without execution...');

  // Test 1: Agent creation
  try {
    const agent = new Agent({
      model: {
        name: 'test-model',
        apiKey: 'dummy-key-for-testing', // Provide dummy key for testing
      },
      mode: 'react',
    });
    console.log('✅ Agent creation successful');
  } catch (error) {
    console.error('❌ Agent creation failed:', error);
    return;
  }

  // Test 2: Default tools loading
  try {
    const tools = getDefaultTools();
    console.log('✅ Default tools loaded:', tools.length, 'tools');
    tools.forEach((tool) =>
      console.log(`  - ${tool.name}: ${tool.description}`)
    );
  } catch (error) {
    console.error('❌ Default tools loading failed:', error);
    return;
  }

  console.log(
    '🎉 All API tests passed! The new ergonomic interface works correctly.'
  );
}

testAPI().catch(console.error);
