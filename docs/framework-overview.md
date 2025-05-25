# TinyAgent-TS Framework Overview

## Pure TypeScript Framework

TinyAgent-TS is a modern TypeScript framework designed for building AI agents in any JavaScript/TypeScript application. It provides a clean, modular architecture that makes it easy to integrate intelligent agents into your projects.

## Core Philosophy

1. **Framework First**: Built as a library for integration, not a standalone application
2. **Composition Over Configuration**: Use simple, composable patterns instead of complex inheritance
3. **Type Safety**: Full TypeScript support with comprehensive type definitions
4. **Modular Design**: Clean separation of concerns across different layers
5. **Developer Experience**: Minimal boilerplate with maximum functionality

## Architecture Layers

### Model Layer (`/model`)
- Handles all LLM communication
- Provider abstraction (OpenRouter, OpenAI, etc.)
- Retry logic and error handling
- Streaming support

### Agent Layer (`/agent`)
- Unified `Agent` class for all use cases
- Configuration-driven behavior
- Execution modes (simple, react)
- Tool orchestration

### Tools Layer (`/tools`)
- Standardized `Tool` interface
- Tool registry for discovery
- Default tools collection
- Easy custom tool creation

### ReAct Layer (`/react`)
- Reasoning and acting engine
- State management
- Response parsing
- Step tracking

## Usage Patterns

### Basic Integration
```typescript
import { Agent } from 'tinyagent-ts';

const agent = new Agent({
  model: { name: 'gpt-4', provider: 'openrouter' },
  mode: 'simple'
});

const response = await agent.execute('Hello!');
```

### With Tools
```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';

const agent = new Agent({
  model: { name: 'gpt-4', provider: 'openrouter' },
  mode: 'react'
});

// Register tools
getDefaultTools().forEach(tool => agent.registerTool(tool));

// Execute with tool usage
const result = await agent.execute('Search for AI news and summarize');
```

### Custom Tools
```typescript
import { Tool } from 'tinyagent-ts';
import { z } from 'zod';

const customTool: Tool = {
  name: 'my_tool',
  description: 'Does something useful',
  schema: z.object({ input: z.string() }),
  execute: async ({ input }) => {
    // Tool implementation
    return `Processed: ${input}`;
  }
};

agent.registerTool(customTool);
```

## Integration Examples

### Next.js API Route
```typescript
// app/api/agent/route.ts
import { Agent, getDefaultTools } from 'tinyagent-ts';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  
  const agent = new Agent({
    model: { name: 'gpt-4', provider: 'openrouter' },
    mode: 'react'
  });
  
  getDefaultTools().forEach(tool => agent.registerTool(tool));
  
  const result = await agent.execute(prompt);
  return Response.json(result);
}
```

### Express Server
```typescript
import express from 'express';
import { Agent, getDefaultTools } from 'tinyagent-ts';

const app = express();
app.use(express.json());

app.post('/agent', async (req, res) => {
  const agent = new Agent({
    model: { name: 'gpt-4', provider: 'openrouter' },
    mode: 'react'
  });
  
  getDefaultTools().forEach(tool => agent.registerTool(tool));
  
  const result = await agent.execute(req.body.prompt);
  res.json(result);
});
```

### Browser Bundle (with bundler)
```typescript
// Assuming proper bundler configuration
import { Agent } from 'tinyagent-ts';

async function runAgent() {
  const agent = new Agent({
    model: { 
      name: 'gpt-4', 
      provider: 'openrouter',
      apiKey: 'your-api-key' // In production, use secure key management
    },
    mode: 'simple'
  });
  
  const result = await agent.execute('Explain quantum computing');
  console.log(result.data.answer);
}
```

## Benefits

1. **Easy Integration**: Drop into any TypeScript/JavaScript project
2. **Flexible Architecture**: Use as much or as little as you need
3. **Production Ready**: Built with error handling, retries, and abort signals
4. **Extensible**: Easy to add custom tools and providers
5. **Well Typed**: Full TypeScript support for better DX

## Migration from CLI

If you were using the old CLI version:

**Before (CLI)**:
```bash
npx tinyagent --model gpt-4 "Your prompt"
```

**After (Framework)**:
```typescript
import { Agent } from 'tinyagent-ts';

const agent = new Agent({
  model: { name: 'gpt-4', provider: 'openrouter' },
  mode: 'simple'
});

const result = await agent.execute('Your prompt');
console.log(result.data.answer);
```

## Next Steps

1. Install the package: `npm install tinyagent-ts`
2. Set up your API keys (OpenRouter, etc.)
3. Create your first agent
4. Add tools as needed
5. Build amazing AI-powered applications!

For more examples, see the `/examples` directory in the repository. 