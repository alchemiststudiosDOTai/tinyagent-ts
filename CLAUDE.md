# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Test
- `npm run build` - Build the project using Rollup and TypeScript
- `npm test` - Run Jest tests in band mode
- `npm test:live` - Run tests with live API calls (set RUN_LIVE=true)
- `npm run lint` - Run ESLint with TypeScript and Prettier rules
- `npm run format` - Format code with Prettier

### Development
- `npm run dev` - Run development mode (uses tsx with new-docs/simple-agent.ts)
- `npx tsx examples/<file>.ts` - Run specific example files

### Testing Individual Components
- `npm test test/simple-agent.test.ts` - Test simple mode agents
- `npm test test/react-agent.test.ts` - Test ReAct mode agents  
- `npm test test/pythonExec.test.ts` - Test Python integration
- `npm test test/file-tool.test.ts` - Test file operations tool

## Architecture Overview

TinyAgent-TS is a modern TypeScript framework for building AI agents with a unified, modular architecture:

### Core Layers
1. **Model Layer** (`src/model/`) - LLM communication and provider abstraction
2. **Agent Layer** (`src/agent/`) - Unified agent orchestration with configurable modes
3. **Tools Layer** (`src/tools/`) - Pluggable tool system with standardized interfaces
4. **ReAct Layer** (`src/react/`) - Reasoning and Acting execution engine
5. **Core Utilities** (`src/core/`) - Prompt management and shared utilities

### Key Components

#### UnifiedAgent (`src/agent/unified-agent.ts`)
- Single configurable agent class supporting multiple execution modes
- Mode-based behavior: 'simple' (direct LLM) or 'react' (reasoning + tools)
- Built-in tool registry and model management

#### Tool System (`src/tools/`)
- Standardized `Tool` interface with Zod schema validation
- Default tools: file operations, grep, web search, Python execution, UUID generation
- Tools are registered with the agent and called during ReAct execution

#### ReAct Engine (`src/react/`)
- Implements the ReAct (Reasoning + Acting) pattern
- Multi-step reasoning with tool usage and observation cycles
- Configurable max steps, reflexion, and tracing

#### Model Management (`src/model/`)
- Provider abstraction supporting OpenRouter, OpenAI, Anthropic
- Unified ModelManager with retry logic and error handling
- Default model: `openai/gpt-4o-mini` via OpenRouter

## Configuration Patterns

### Agent Configuration
```typescript
const agent = new Agent({
  model: {
    name: 'openai/gpt-4o-mini',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY
  },
  mode: 'react', // or 'simple'
  react: {
    maxSteps: 5,
    enableReflexion: true,
    enableTrace: false
  }
});
```

### Tool Registration
Tools follow a standard interface and are registered with the agent:
```typescript
import { getDefaultTools } from 'tinyagent-ts';
const tools = getDefaultTools();
tools.forEach(tool => agent.registerTool(tool));
```

## Environment Setup

### Required Environment Variables
- `OPENROUTER_API_KEY` - Primary LLM provider API key

### Test Environment
- Tests use Jest with ts-jest preset
- Live tests require API keys and use `RUN_LIVE=true` environment variable
- Test files follow pattern `**/test/**/*.test.ts`

## Important Implementation Details

### Execution Modes
- **Simple Mode**: Direct LLM responses without tool usage
- **ReAct Mode**: Full reasoning cycle with tool usage, observation, and multi-step problem solving

### Tool Development
- Tools must implement the `Tool` interface with name, description, Zod schema, and execute function
- Default tools include: file operations, grep search, DuckDuckGo web search, Python execution, UUID generation, human loop, and final answer

### Python Integration
- `pythonExecTool` enables code execution within agent workflows
- Supports the CodeAct pattern where agents generate Python code as primary actions
- Safe execution with timeout controls and error handling

### Final Answer Pattern
- ReAct mode requires explicit `final_answer` tool usage to complete tasks
- Validates structured responses and ensures proper task completion

## Project Structure Notes

- Main exports are in `src/index.ts` with the UnifiedAgent exported as `Agent`
- Examples in `/examples` directory demonstrate various usage patterns
- Documentation in `/docs` provides deep-dive explanations
- Logistics folder contains project management and planning materials
- Built files output to `/dist` directory with both CJS and ESM formats