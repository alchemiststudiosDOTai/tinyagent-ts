import * as dotenv from 'dotenv';
dotenv.config();

import { MathAgent } from './math';
import { WeatherAgent } from './onecall';
import { MultiplierAgent } from './multiplierAgent';
import { ReActAgent } from './react';

async function testAllAgents() {
  console.log('🧪 Testing all agents with final_answer workflow');
  console.log('================================================\n');

  // Check API key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('💥 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  // Test MathAgent
  console.log('🧮 Testing MathAgent...');
  const mathAgent = new MathAgent();
  const mathQuestion = 'What is 15 plus 7?';
  console.log(`❓ Question: "${mathQuestion}"`);
  try {
    const mathResult = await mathAgent.run(mathQuestion);
    const mathAnswer = typeof mathResult === 'object' && mathResult && 'answer' in mathResult
      ? (mathResult as { answer: string }).answer
      : String(mathResult);
    console.log(`✅ Answer: ${mathAnswer}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }

  // Test WeatherAgent
  console.log('🌦️ Testing WeatherAgent...');
  const weatherAgent = new WeatherAgent();
  const weatherQuery = "What's the weather like in Seattle?";
  console.log(`❓ Query: "${weatherQuery}"`);
  try {
    const weatherResult = await weatherAgent.run(weatherQuery);
    const weatherAnswer = typeof weatherResult === 'object' && weatherResult && 'answer' in weatherResult
      ? (weatherResult as { answer: string }).answer
      : String(weatherResult);
    console.log(`✅ Answer: ${weatherAnswer}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }

  // Test MultiplierAgent
  console.log('✖️ Testing MultiplierAgent...');
  const multiplierAgent = new MultiplierAgent();
  const multiplyQuestion = 'What is 12 multiplied by 5?';
  console.log(`❓ Question: "${multiplyQuestion}"`);
  try {
    const multiplyResult = await multiplierAgent.run(multiplyQuestion);
    const multiplyAnswer = typeof multiplyResult === 'object' && multiplyResult && 'answer' in multiplyResult
      ? (multiplyResult as { answer: string }).answer
      : String(multiplyResult);
    console.log(`✅ Answer: ${multiplyAnswer}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }

  // Test ReActAgent
  console.log('🧠 Testing ReActAgent...');
  const reactAgent = new ReActAgent();
  const reactQuery = 'Calculate 23 * 17 and then echo the result with a friendly message.';
  console.log(`❓ Query: "${reactQuery}"`);
  try {
    const reactResult = await reactAgent.run(reactQuery, { trace: true });
    const reactAnswer = typeof reactResult === 'object' && reactResult && 'answer' in reactResult
      ? (reactResult as { answer: string }).answer
      : String(reactResult);
    console.log(`✅ Final Answer: ${reactAnswer}\n`);
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
  }
}

// Run the test if this file is being run directly
if (require.main === module) {
  testAllAgents().catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}
