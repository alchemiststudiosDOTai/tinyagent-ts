# Ergonomic Modern Example

This example demonstrates the new modular architecture with clean, simple usage.

## Simple Agent Creation

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';
import 'dotenv/config';

async function main() {
  // Create agent
  const agent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'react'
  });

  // Register default tools (file, search, uuid, etc.)
  // Note: final_answer tool is automatically registered by the agent
  const tools = getDefaultTools().filter(tool => tool.name !== 'final_answer');
  tools.forEach(tool => agent.registerTool(tool));

  // Ask the agent to perform a task
  const result = await agent.execute('Create a UUID and write it to a file called output.txt');
  console.log(result.data);
}

main().catch(console.error);
```

## Custom Tools

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';
import { z } from 'zod';
import 'dotenv/config';

// Define custom tools
const mathTool = {
  name: 'add_numbers',
  description: 'Add two numbers together',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }),
  execute: async ({ a, b }: { a: number; b: number }) => {
    return `${a} + ${b} = ${a + b}`;
  }
};

async function main() {
  // Create agent
  const agent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'react'
  });

  // Register default tools + custom tool
  // Note: final_answer tool is automatically registered by the agent
  const defaultTools = getDefaultTools().filter(tool => tool.name !== 'final_answer');
  defaultTools.forEach(tool => agent.registerTool(tool));
  agent.registerTool(mathTool);

  const result = await agent.execute('What is 15 + 27?');
  console.log(result.data);
}

main().catch(console.error);
```

## Different Execution Modes

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';
import 'dotenv/config';

async function main() {
  // Simple mode - direct LLM response
  const simpleAgent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'simple'
  });

  // ReAct mode - reasoning and tool execution (default)
  const reactAgent = new Agent({
    model: { name: 'google/gemini-2.5-flash-preview-05-20:thinking' },
    mode: 'react'
  });

  // Register tools for ReAct mode
  const tools = getDefaultTools().filter(tool => tool.name !== 'final_answer');
  tools.forEach(tool => reactAgent.registerTool(tool));

  // Simple response
  const simple = await simpleAgent.execute('Hello!');
  console.log('Simple:', simple.data);

  // ReAct response with tools
  const react = await reactAgent.execute('Generate a UUID and tell me what it is');
  console.log('ReAct:', react.data);

  // Tool discovery
  console.log('Available tools:', reactAgent.getToolRegistry().getAll().map(t => t.name));
}

main().catch(console.error);
```

## Key Benefits

1. **Clean API**: Single `Agent` class handles all use cases
2. **Modular Tools**: Easy to add/remove tools via registry
3. **Two Clear Modes**: Simple (chat) or ReAct (agent with tools)
4. **Type Safety**: Full TypeScript support throughout
5. **Ergonomic**: Minimal boilerplate, maximum functionality

## Migration from Legacy

If upgrading from the old architecture:

```typescript
// OLD (legacy)
import { MultiStepAgent } from 'tinyagent-ts';
const agent = new MultiStepAgent(/* complex setup */);

// NEW (ergonomic)
import { Agent, defaultTools } from 'tinyagent-ts';
const agent = new Agent({
  model: { name: 'your-model' },
  tools: defaultTools
});
```

The new architecture is cleaner, more maintainable, and easier to extend!