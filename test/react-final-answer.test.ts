import { Agent } from '../src';
import 'dotenv/config';

describe('ReAct Final Answer Enforcement', () => {
  let agent: Agent;

  beforeEach(() => {
    agent = new Agent({
      model: {
        name: 'google/gemini-2.5-flash-preview-05-20',
        apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
      },
      mode: 'react',
      react: {
        maxSteps: 3, // Keep it short for testing
        enableReflexion: false,
        enableTrace: false,
      },
    });
  });

  it('should always return a proper final_answer object and never undefined', async () => {
    const result = await agent.execute('ping');

    // The result should never be undefined
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).not.toBeNull();

    // The result should have an answer property
    expect(result.data).toHaveProperty('answer');
    expect(result.data.answer).toBeDefined();
    expect(result.data.answer).not.toBeNull();

    // The answer should be a string or object, never undefined
    expect(
      typeof result.data.answer === 'string' ||
        typeof result.data.answer === 'object'
    ).toBe(true);
  }, 30000);

  it('should enforce final_answer even with simple tasks', async () => {
    const result = await agent.execute('What is 2+2?');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toHaveProperty('answer');
    expect(result.data.answer).toBeDefined();
  }, 30000);

  it('should enforce final_answer even when max steps are reached', async () => {
    // Create agent with very low max steps to force early termination
    const limitedAgent = new Agent({
      model: {
        name: 'google/gemini-2.5-flash-preview-05-20',
        apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
      },
      mode: 'react',
      react: {
        maxSteps: 1, // Very low to force termination
        enableReflexion: false,
        enableTrace: false,
      },
    });

    const result = await limitedAgent.execute(
      'Generate a UUID and analyze its format'
    );

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data).toHaveProperty('answer');
    expect(result.data.answer).toBeDefined();
  }, 30000);
});
