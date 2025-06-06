# tinyAgent-TS — Modern TypeScript Agent Framework

[![npm version](https://img.shields.io/npm/v/tinyagent-ts.svg)](https://www.npmjs.com/package/tinyagent-ts) [![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)

**tinyAgent-TS** is a modern TypeScript framework for building AI agents with a clean, modular architecture. It provides a unified agent system with pluggable tools, multiple execution modes, and seamless LLM integration.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Project Structure](#project-structure)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [Execution Modes](#execution-modes)
6. [Tool System](#tool-system)
7. [Examples](#examples)
8. [Python Integration](#python-integration--codeact-pattern)
9. [API Reference](#api-reference)
10. [Migration Guide](#migration-guide)
11. [License](#license)

---

## Key Features

- **Unified Agent Architecture**: Single configurable `Agent` class for all use cases
- **Modular Design**: Clean separation between models, agents, tools, and execution
- **Multiple Execution Modes**: Simple (direct LLM) and ReAct (reasoning + acting)
- **Pluggable Tool System**: Easy to add custom tools with Zod schema validation
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Default Tools**: File operations, web search, Python execution, and more
- **Flexible LLM Support**: Works with OpenRouter, OpenAI, Anthropic, and more

---

## Project Structure

The framework follows a clean modular architecture:

```
tinyagent-ts/
├── src/
│   ├── model/                  # LLM communication layer
│   │   ├── types.ts           # Model interfaces
│   │   ├── model-manager.ts   # Unified LLM communication
│   │   ├── openrouter-provider.ts # OpenRouter implementation
│   │   └── index.ts           # Exports
│   ├── agent/                 # Agent orchestration layer  
│   │   ├── types.ts           # Agent interfaces
│   │   ├── unified-agent.ts   # Single configurable agent
│   │   └── index.ts           # Exports
│   ├── tools/                 # Tool execution layer
│   │   ├── types.ts           # Tool interfaces
│   │   ├── registry.ts        # Tool management
│   │   ├── default-tools.ts   # Default tool collection
│   │   ├── file.ts            # File operations tool
│   │   ├── grep.ts            # Search tool
│   │   ├── web-search-tool.ts # Web search tool (Brave Search)
│   │   ├── pythonExec.ts      # Python execution tool
│   │   ├── uuid.ts            # UUID generation tool
│   │   ├── final_answer.ts    # Answer completion tool
│   │   └── index.ts           # Exports
│   ├── react/                 # ReAct reasoning layer
│   │   ├── types.ts           # ReAct interfaces
│   │   ├── engine.ts          # ReAct execution engine
│   │   ├── parser.ts          # Response parsing
│   │   ├── state.ts           # State management
│   │   └── index.ts           # Exports
│   ├── core/                  # Core utilities
│   └── index.ts               # Main framework exports
├── examples/                  # Usage examples
├── test/                      # Test suite
├── docs/                      # Documentation
└── package.json
```

---

## Quick Start

### Requirements
- Node.js (v16+ recommended)
- npm or yarn
- OpenRouter API key - [Get one here](https://openrouter.ai)

### Installation

```bash
npm install tinyagent-ts
```

### Basic Usage

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';

// Create an agent with simple mode (direct LLM responses)
const agent = new Agent({
  model: {
    name: 'openai/gpt-4o-mini',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY
  },
  mode: 'simple'
});

// Simple chat
const result = await agent.execute('What is the capital of France?');
console.log(result.data.answer); // "The capital of France is Paris."
```

### Using Tools with ReAct Mode

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';

// Create an agent with ReAct mode for tool usage
const agent = new Agent({
  model: {
    name: 'openai/gpt-4o-mini',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY
  },
  mode: 'react'  // Enable reasoning + acting
});

// Register default tools (file, grep, web search, Python, UUID)
const tools = getDefaultTools();
tools.forEach(tool => agent.registerTool(tool));

// Agent can now use tools to solve complex tasks
const result = await agent.execute('Search the web for the latest AI news and summarize it');
console.log(result.data.answer);
```

---

## Core Concepts

### Unified Agent

The framework provides a single `Agent` class that can be configured for different behaviors:

```typescript
const agent = new Agent({
  model: {
    name: 'your-model',
    provider: 'openrouter',
    apiKey: 'your-api-key'
  },
  mode: 'simple' | 'react',  // Execution mode
  systemPrompt: 'Optional custom system prompt',
  maxSteps: 10,              // Max reasoning steps for ReAct mode
  trace: true                // Enable debug logging
});
```

### Tool Interface

Tools follow a standard interface with Zod schema validation:

```typescript
interface Tool {
  name: string;
  description: string;
  schema: z.ZodSchema;
  execute: (args: any, abortSignal?: AbortSignal) => Promise<any>;
}
```

---

## Execution Modes

### Simple Mode
Direct LLM responses without tool usage:
```typescript
const agent = new Agent({ mode: 'simple', ...config });
const result = await agent.execute('Explain quantum computing');
```

### ReAct Mode
Full reasoning and acting cycle with tool usage:
```typescript
const agent = new Agent({ mode: 'react', ...config });
agent.registerTool(calculatorTool);
const result = await agent.execute('What is 123 * 456?');
// Agent will: Think → Use calculator tool → Observe result → Answer
```

---

## Tool System

### Default Tools

The framework includes these tools out of the box:

```typescript
import { getDefaultTools } from 'tinyagent-ts';

const tools = getDefaultTools();
// Includes: file, grep, duck_search, pythonExec, uuid, final_answer
```

### Creating Custom Tools

```typescript
import { Tool } from 'tinyagent-ts';
import { z } from 'zod';

const weatherTool: Tool = {
  name: 'weather',
  description: 'Get current weather for a location',
  schema: z.object({
    location: z.string().describe('City name or coordinates')
  }),
  execute: async ({ location }) => {
    // Implementation
    const weather = await fetchWeather(location);
    return `Weather in ${location}: ${weather.temp}°C, ${weather.condition}`;
  }
};

agent.registerTool(weatherTool);
```

### Tool Categories

Tools are organized by category for easy discovery:

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';

const agent = new Agent({ /* config */ });
getDefaultTools().forEach(tool => agent.registerTool(tool));

const registry = agent.getToolRegistry();
const allTools = registry.getAll();
console.log('Available tools:', allTools.map(t => t.name));
// ['file', 'grep', 'duck_search', 'pythonExec', 'uuid', 'human_loop', 'final_answer']
```

---

## Examples

The `/examples` directory contains ready-to-run agent scripts demonstrating various features and patterns:

- [`simple-agent.ts`](examples/simple-agent.ts):  
  Basic agent usage with default tools and ReAct mode.

- [`modes-example.ts`](examples/modes-example.ts):  
  Demonstrates different execution modes (simple vs ReAct) and tool discovery.

- [`custom-tools-example.ts`](examples/custom-tools-example.ts):  
  Shows how to create and register custom tools with the agent.

- [`python-integration-example.ts`](examples/python-integration-example.ts):  
  Python execution tool usage for computational tasks.

- [`custom-tool-react-test.ts`](examples/custom-tool-react-test.ts):  
  Complete ReAct workflow demonstration with custom calculator tool, showing multi-step reasoning, tool usage, and final answer generation.

Each example is self-contained and can be run with `npx tsx examples/<file>.ts`.

### ReAct Flow Demonstration

Experience the complete ReAct (Reasoning + Acting) workflow in action:

```bash
npx tsx examples/react-demo.ts
```

**Live output showcasing the Think → Act → Observe cycle:**
```
=== ReAct Workflow Demonstration ===

Available tools: final_answer, file, grep, uuid, human_loop, duck_search, pythonExec

Thought: I will start by generating a UUID as the first step. This will provide a unique identifier for the process.
Action: uuid({})
Observation: "40b4a2f1-b78e-4640-ae25-ee1fb5ad4371"

Thought: Next, I will calculate the expression 25 * 4 + 17 using Python to obtain the result. This will involve running a simple arithmetic calculation.
Action: pythonExec({"code":"result = 25 * 4 + 17; print(f'Calculation: 25 * 4 + 17 = {result}'); result"})
Observation: "Calculation: 25 * 4 + 17 = 117\n117"

Thought: Now I need to search for information about "TypeScript agents" to provide comprehensive information on this topic.
Action: duck_search({"query":"TypeScript agents AI frameworks"})
Observation: "TypeScript AI agents are becoming increasingly popular for building intelligent applications. Modern frameworks like LangChain, AutoGPT, and tinyAgent-TS provide robust tooling for creating autonomous agents that can reason, plan, and execute actions..."

Thought: I have successfully completed all three required tasks. Now I will provide the final answer containing all the results.
Action: final_answer({"answer":"Here are the results:\n1. UUID: 40b4a2f1-b78e-4640-ae25-ee1fb5ad4371\n2. Calculation: 25 * 4 + 17 = 117\n3. TypeScript Agents Info: TypeScript AI agents are powerful tools for building intelligent applications with frameworks providing autonomous reasoning and action capabilities."})

=== FINAL RESULT ===
Success: true
Data: {
  "answer": "Here are the results:\n1. UUID: 40b4a2f1-b78e-4640-ae25-ee1fb5ad4371\n2. Calculation: 25 * 4 + 17 = 117\n3. TypeScript Agents Info: TypeScript AI agents are powerful tools for building intelligent applications with frameworks providing autonomous reasoning and action capabilities."
}
Steps: 8
```

**This demonstrates the ReAct pattern's power:**
1. **🤔 Think**: Agent reasons about each step and plans the approach
2. **⚡ Act**: Executes tools (UUID generation, Python calculations, web search) 
3. **👁️ Observe**: Processes tool results and adapts next actions
4. **🎯 Deliver**: Synthesizes all results into a comprehensive final answer

The ReAct framework enables sophisticated multi-step problem solving by seamlessly combining LLM reasoning with tool execution capabilities.

### Python Integration & CodeAct Pattern

The framework includes robust Python integration through the `pythonExecTool`, enabling agents to execute Python code for complex computations, data analysis, and scientific computing tasks.

#### Basic Python Tool Usage

```typescript
import { Agent } from 'tinyagent-ts';
import { pythonExecTool } from 'tinyagent-ts';

const agent = new Agent({
  mode: 'react',
  model: {
    name: 'openai/gpt-4o-mini',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY,
  },
});

// Register the Python execution tool
agent.registerTool(pythonExecTool);

// Ask the agent to solve complex problems using Python
const result = await agent.execute('Calculate the fibonacci sequence up to 100 and find the largest prime number in it');
```

#### CodeAct Pattern (Advanced)

**CodeAct** is a powerful pattern where agents generate Python code as their primary action mechanism, enabling sophisticated reasoning through code execution:

```typescript
import { Agent } from 'tinyagent-ts';
import { pythonExecTool } from 'tinyagent-ts';

async function codeActExample() {
  const agent = new Agent({
    model: {
      name: 'google/gemini-2.5-flash-preview-05-20:thinking',
      provider: 'openrouter', 
      apiKey: process.env.OPENROUTER_API_KEY,
    },
    mode: 'simple',
  });

  agent.registerTool(pythonExecTool);

  // Task: Complex data analysis with JSON output
  const task = `
  Analyze laptop options and select the best value:
  - Laptop A: $1200, CPU benchmark 9500, 8-hour battery
  - Laptop B: $1000, CPU benchmark 8700, 10-hour battery  
  - Laptop C: $900, CPU benchmark 8000, 7-hour battery
  
  Use Python to score each laptop and return JSON with your selection and reasoning.
  `;

  const result = await agent.execute(task);
  console.log('Analysis Result:', result.data.answer);
}
```

#### Python Tool Features

- **Safe Execution**: Sandboxed Python environment with timeout controls
- **Rich Libraries**: Access to standard Python libraries (json, math, datetime, etc.)
- **Data Processing**: Perfect for calculations, transformations, and analysis
- **Structured Output**: Generate JSON, CSV, or any formatted data
- **Error Handling**: Graceful error reporting and debugging

#### Example Use Cases

```typescript
// Mathematical computations
await agent.execute('Use Python to solve: What is the compound interest on $1000 at 5% for 10 years?');

// Data analysis
await agent.execute('Process this sales data and calculate monthly growth rates: [100, 120, 115, 140, 160]');

// Scientific computing  
await agent.execute('Calculate the trajectory of a projectile launched at 45 degrees with initial velocity 20 m/s');

// JSON data manipulation
await agent.execute('Convert this CSV data to JSON and add calculated totals: name,sales\\nAlice,100\\nBob,150');
```

Run the Python integration example:

```bash
npx tsx examples/python-integration-example.ts
```

---

## API Reference

### Main Exports

```typescript
// Core agent class
import { Agent } from 'tinyagent-ts';

// Tool utilities
import { 
  Tool,
  getDefaultTools,
  StandardToolRegistry as ToolRegistry,
  pythonExecTool
} from 'tinyagent-ts';

// Individual tools (if needed)
import {
  FileTool,
  GrepTool,
  UuidTool,
  HumanLoopTool,
  DuckDuckGoSearchTool
} from 'tinyagent-ts';

// Types
import { 
  AgentConfig,
  AgentMode,
  ModelConfig,
  AgentResult
} from 'tinyagent-ts';
```

### Agent Methods

```typescript
class Agent {
  constructor(config: AgentConfig);
  
  // Tool management
  registerTool(tool: Tool): void;
  getToolRegistry(): StandardToolRegistry;
  
  // Execution
  execute(input: string, options?: AgentExecutionOptions): Promise<AgentResult>;
  
  // Configuration
  getConfig(): AgentConfig;
  getModelManager(): ModelManager;
}
```

---

## Migration Guide

If you're upgrading from an older version using decorators:

### Old Pattern (Deprecated)
```typescript
@model('openai/gpt-4')
class MyAgent extends Agent {
  @tool('Add numbers', schema)
  add(args) { ... }
}
```

### New Pattern (Current)
```typescript
const agent = new Agent({
  model: { name: 'openai/gpt-4', provider: 'openrouter' },
  mode: 'react'
});

const addTool: Tool = {
  name: 'add',
  description: 'Add numbers',
  schema: z.object({ a: z.number(), b: z.number() }),
  execute: async ({ a, b }) => a + b
};

agent.registerTool(addTool);
```

---

## Testing

The framework includes comprehensive tests:

```bash
# Run all tests
npm test

# Run specific test suites
npm test test/simple-agent.test.ts  # Simple mode tests
npm test test/react-agent.test.ts   # ReAct mode tests
npm test test/pythonExec.test.ts    # Python integration tests
```

---

## License

tinyAgent-TS is provided under the [Business Source License 1.1](LICENSE).

- **Free** for individuals and businesses with annual revenue below $1 million USD.
- **Paid license required** for businesses with annual revenue exceeding $1 million USD.
- For commercial licensing inquiries, visit: [https://alchemiststudios.ai/](https://alchemiststudios.ai/)

This license allows non-production use and ensures the project remains open while providing a sustainable business model for continued development.
