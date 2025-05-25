import { Agent, getDefaultTools } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('ReAct Agent Test', () => {
  let agent: Agent;

  beforeEach(() => {
    // Create agent in react mode
    agent = new Agent({
      mode: 'react',
      model: {
        name: 'openai/gpt-4o-mini',
        provider: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY,
      },
      debug: true,
    });

    // Register default tools except DuckDuckGo search
    const tools = getDefaultTools().filter(tool => 
      tool.name !== 'duckSearch' && tool.name !== 'final_answer'
    );
    tools.forEach(tool => agent.registerTool(tool));
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should use tools and provide final answer', async () => {
    const result = await agent.execute('Generate a UUID and tell me what it is');
    
    console.log('Full result object:', JSON.stringify(result, null, 2));
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.metadata?.mode).toBe('react');
    expect(result.metadata?.steps).toBeDefined();
    expect(result.metadata?.steps?.length).toBeGreaterThan(0);
    
    // Should have used tools and ended with final_answer
    const steps = result.metadata?.steps || [];
    const stepTypes = steps.map((step: any) => step.type);
    expect(stepTypes).toContain('action');
    expect(stepTypes).toContain('observation');
    
    console.log('ReAct Agent Final Answer:', result.data);
    console.log('Steps taken:', steps.length);
    
    // Log the reasoning process
    steps.forEach((step: any, index: number) => {
      if (step.type === 'thought') {
        console.log(`Step ${index + 1} - Thought: ${step.text}`);
      } else if (step.type === 'action') {
        console.log(`Step ${index + 1} - Action: ${step.tool}(${JSON.stringify(step.args)})`);
      } else if (step.type === 'observation') {
        console.log(`Step ${index + 1} - Observation: ${step.text}`);
      }
    });
  }, 30000); // 30 second timeout

  it('should validate ReAct configuration', () => {
    const config = agent.getConfig();
    
    expect(config.mode).toBe('react');
    expect(config.react?.maxSteps).toBeDefined();
    expect(config.react?.enableReflexion).toBeDefined();
    expect(config.model?.name).toBe('openai/gpt-4o-mini');
  });

  it('should have registered tools', () => {
    const toolRegistry = agent.getToolRegistry();
    const tools = toolRegistry.getAll();
    
    // Should have basic tools but not DuckDuckGo
    const toolNames = tools.map(tool => tool.name);
    expect(toolNames).toContain('uuid');
    expect(toolNames).toContain('file');
    expect(toolNames).toContain('grep');
    expect(toolNames).not.toContain('duckSearch');
    
    console.log('Registered tools:', toolNames);
  });
}); 