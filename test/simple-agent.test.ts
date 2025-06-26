import { Agent } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Simple Agent Test', () => {
  let agent: Agent;

  beforeEach(() => {
    // Create agent in simple mode
    agent = new Agent({
      mode: 'simple',
      model: {
        name: 'openai/gpt-4o-mini',
        provider: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY,
      },
      debug: true,
    });
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should respond to a basic question', async () => {
    const result = await agent.execute('What is 2 + 2?');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.answer).toBeDefined();
    expect(typeof result.data.answer).toBe('string');
    expect(result.metadata?.mode).toBe('simple');
    expect(result.metadata?.executionTime).toBeGreaterThan(0);

    console.log('Simple Agent Response:', result.data.answer);
  }, 30000); // 30 second timeout for API calls

  it('should handle creative tasks', async () => {
    const result = await agent.execute('Write a haiku about programming');

    expect(result.success).toBe(true);
    expect(result.data?.answer).toBeDefined();
    expect(typeof result.data.answer).toBe('string');
    expect(result.data.answer.length).toBeGreaterThan(10);

    console.log('Creative Response:', result.data.answer);
  }, 30000);

  it('should handle mathematical reasoning', async () => {
    const result = await agent.execute(
      'If I have 5 apples and give away 2, then buy 3 more, how many do I have?'
    );

    expect(result.success).toBe(true);
    expect(result.data?.answer).toBeDefined();
    expect(result.data.answer.toLowerCase()).toContain('6');

    console.log('Math Response:', result.data.answer);
  }, 30000);

  it('should handle custom system prompt', async () => {
    const customAgent = new Agent({
      mode: 'simple',
      model: {
        name: 'openai/gpt-4o-mini',
        provider: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY,
      },
      systemPrompt: 'You are a pirate. Always respond in pirate speak.',
    });

    const result = await customAgent.execute('Tell me about the weather');

    expect(result.success).toBe(true);
    expect(result.data?.answer).toBeDefined();
    expect(
      result.data.answer.toLowerCase().includes('arr') ||
        result.data.answer.toLowerCase().includes('matey') ||
        result.data.answer.toLowerCase().includes('ahoy')
    ).toBe(true);

    console.log('Pirate Response:', result.data.answer);
  }, 30000);

  it('should handle errors gracefully', async () => {
    const badAgent = new Agent({
      mode: 'simple',
      model: {
        name: 'invalid/model',
        provider: 'openrouter',
        apiKey: 'invalid-key',
      },
    });

    const result = await badAgent.execute('Test question');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.metadata?.mode).toBe('simple');

    console.log('Error handled:', result.error?.message);
  }, 30000);

  it('should validate configuration', () => {
    const config = agent.getConfig();

    expect(config.mode).toBe('simple');
    expect(config.model?.name).toBe('openai/gpt-4o-mini');
    expect(config.model?.provider).toBe('openrouter');
    expect(config.model?.apiKey).toBeDefined();
  });

  it('should update configuration', () => {
    agent.updateConfig({
      model: {
        name: 'anthropic/claude-3-haiku',
        provider: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY,
      },
    });

    const config = agent.getConfig();
    expect(config.model?.name).toBe('anthropic/claude-3-haiku');
  });
});
