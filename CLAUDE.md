# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Run development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript (outputs to dist/)
- `npm test` - Run Jest test suite
- `npm run test:live` - Run tests with live API calls (requires RUN_LIVE=true)
- `npm run lint` - Run ESLint on TypeScript files
- `npm run format` - Format code with Prettier

### Running Examples
- `npx ts-node src/index.ts` - Run the default CalcAgent demo
- `npx ts-node examples/<filename>.ts` - Run specific example agents

## Architecture Overview

This is a minimal TypeScript framework for building AI agents with tool use capabilities. The key architectural principle is **decorator-based tool registration** with a **single LLM call per step**.

### Core Components

1. **Agent** (`src/agent.ts`) - Abstract base class that:
   - Manages LLM communication via OpenRouter API
   - Enforces all responses must end with `final_answer` tool
   - Handles tool discovery and execution through decorators

2. **MultiStepAgent** (`src/multiStepAgent.ts`) - Implements ReAct pattern:
   - Extends Agent for multi-turn conversations
   - Uses Scratchpad for conversation memory
   - Enforces Thought→Action→Observation cycles

3. **Decorators** (`src/decorators.ts`):
   - `@model("provider/model-name")` - Associates LLM with agent
   - `@tool(name, description, zodSchema)` - Registers methods as tools

4. **Schemas** (`src/schemas.ts`) - Zod validation for:
   - Tool call structure validation
   - Enforcing JSON responses with specific format
   - Special handling for required `final_answer` tool

### Key Patterns

- **Tool Registration**: Methods decorated with `@tool` are automatically discovered
- **Response Format**: All agent responses must be valid JSON ending with `final_answer`
- **ReAct Loop**: Thought→Action→Observation cycles for reasoning
- **Prompt Templates**: Markdown-based templates in `src/core/prompts/`

### Testing Approach

- Unit tests mock LLM responses for deterministic testing
- Integration tests verify agent execution flow
- Live tests (with RUN_LIVE=true) test actual API integration
- All tests use Jest with ts-jest preset

### Development Workflow

The project follows a structured workflow (see `logistics/project_workflow.md`):
1. Phase 0: Task understanding
2. Phase 1: Planning (create plans in `logistics/plans/`)
3. Phase 2: Implementation (log progress in `logistics/notes/`)
4. Phase 3: QA (log results in `logistics/qa/`)
5. Phase 4: Completion

### Important Constraints

- Every agent response MUST end with `{"tool": "final_answer", "args": {"answer": "..."}}`
- Plain text responses are rejected - everything must be structured JSON
- Tools must have Zod schemas for argument validation
- OpenRouter API key must be set in .env file