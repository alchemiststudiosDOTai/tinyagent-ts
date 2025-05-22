# API Reference

This document provides a comprehensive reference for the core classes, decorators, utility functions, and configuration options in the TinyAgent-TS framework.

---

## Core Classes

### `Agent<I = string>`

Defined in [`src/agent.ts`](src/agent.ts:60)

The abstract base class for all agents. Handles LLM communication, tool integration, and conversation memory.

**Constructor:**
```ts
constructor(options?: { systemPrompt?: string; systemPromptFile?: string })
```
- `systemPrompt`: Custom system prompt string.
- `systemPromptFile`: Path to a file containing the system prompt.

**Properties:**
- `memory: LLMMessage[]` — Conversation memory for the ReAct loop.
- `promptEngine: PromptEngine` — Renders and manages prompt templates.
- `logger` — Simple logger (defaults to `console`).

**Key Methods:**
- `run(input: I): Promise<FinalAnswerArgs>`  
  Main entry point for running the agent. Processes input, interacts with the LLM, and uses tools to generate output.
- `protected getModelName(): string`  
  Retrieves the LLM model name (set by `@model` decorator).
- `protected buildToolRegistry(): Record<string, ToolHandle>`  
  Builds a registry of available tools (methods decorated with `@tool`).
- `protected async makeOpenRouterRequest(messages: LLMMessage[], model: string): Promise<OpenRouterResponse>`  
  Makes a request to the OpenRouter API.
- (private) `buildInitialMessages`, `retryWithFixRequest` — Internal helpers for message construction and schema validation.

---

### `MultiStepAgent<I = string>`

Defined in [`src/multiStepAgent.ts`](src/multiStepAgent.ts:14)

Extends `Agent` to support multi-step reasoning and tool use with a scratchpad and reflexion.

**Constructor:**
```ts
constructor(options?: MultiStepOptions)
```

**Properties:**
- `scratchpad: Scratchpad` — Stores thoughts, actions, and observations.
- `maxSteps: number` — Maximum reasoning steps per run.
- `trace: boolean` — Enables step-by-step logging.
- `onStep?: (pad: Scratchpad) => void` — Optional callback after each step.

**Key Methods:**
- `async run(task: I, opts?: Partial<MultiStepOptions>): Promise<FinalAnswerArgs>`  
  Runs the agent in a multi-step loop, supporting reflexion and tool chaining.

---

### `TriageAgent`

Defined in [`src/triageAgent.ts`](src/triageAgent.ts:13)

A simple agent subclass using a specific LLM model. Example usage of the `@model` decorator.

---

## Decorators

### `@model(name: string): ClassDecorator`

Defined in [`src/decorators.ts`](src/decorators.ts:27)

Associates an LLM model name with an agent class. Required for all agent classes.

**Usage:**
```ts
@model("qwen/qwen2-72b-instruct")
class MyAgent extends Agent {}
```

---

### `@tool(description: string, paramSchema?: ZodSchema): PropertyDecorator`

Defined in [`src/decorators.ts`](src/decorators.ts:63)

Marks a class method as a tool callable by the agent. Stores metadata and validates input with a Zod schema.

**Usage:**
```ts
class MyAgent extends Agent {
  @tool('Adds two numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }): string {
    return String(a + b);
  }
}
```

---

## Utility Functions & Classes

### JSON Utilities ([`src/utils/json.ts`](src/utils/json.ts:1))
- `findFirstJson(text: string): string | null` — Finds the first JSON object in a string.
- `safeJsonParse<T>(str: string): T | null` — Safely parses JSON, returns `null` on error.
- `extractJson(text: string): string | null` — Extracts a JSON object from text.

### `Scratchpad` ([`src/utils/scratchpad.ts`](src/utils/scratchpad.ts:12))
Stores the agent's reasoning steps (thoughts, actions, observations, reflexions).

**Key Methods:**
- `clear()`
- `getLastObservation()`
- `getLastToolResult(toolName: string)`
- `getLastArgValue(argKey: string)`
- `toMessages(systemPrompt: string): LLMMessage[]`

### Step Types ([`src/utils/steps.ts`](src/utils/steps.ts:1))
- `TaskStep`, `ThoughtStep`, `JsonAction`, `CodeAction`, `ObservationStep`, `ReflexionStep`, `ToolResultStep`, `ScratchStep` — Interfaces for reasoning steps.

### Other Utilities
- `parseThoughtAction(text: string)` ([`src/utils/scratchpad.ts`](src/utils/scratchpad.ts:137)) — Parses LLM output into thought/action objects.
- `truncateJson(value: unknown, maxLen = 3000): string` ([`src/utils/truncate.ts`](src/utils/truncate.ts:1)) — Truncates JSON for logging.
- `compileValidator<T>(schema: ZodSchema<T>)` ([`src/utils/validator.ts`](src/utils/validator.ts:7)) — Compiles a Zod schema into a validator function.

---

## Configuration Options

### Agent Constructor Options
- `systemPrompt?: string` — Custom system prompt for the agent.
- `systemPromptFile?: string` — Path to a file containing the system prompt.

### `MultiStepOptions` ([`src/multiStepAgent.ts`](src/multiStepAgent.ts:6))
- `maxSteps?: number` — Maximum number of reasoning steps (default: 5).
- `trace?: boolean` — Enable step-by-step logging (default: false).
- `onStep?: (pad: Scratchpad) => void` — Callback after each step.
- `systemPrompt?: string` — Custom system prompt.
- `systemPromptFile?: string` — Path to a file containing the system prompt.

---

For more advanced usage and examples, see [`docs/advanced-usage.md`](docs/advanced-usage.md:1).