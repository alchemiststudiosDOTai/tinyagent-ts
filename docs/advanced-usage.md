# Advanced Usage Guide

This guide covers advanced patterns and strategies for extending, optimizing, and debugging agents and tools in this framework.

---

## 1. Custom Tool Creation

Custom tools allow you to extend agent capabilities with domain-specific logic or external integrations.

**Patterns for Creating Custom Tools:**
- **Define a Tool Interface:** Tools should implement a clear interface, specifying input parameters, output schema, and error handling.
- **Use Decorators:** Leverage decorators (e.g., `@Tool`) to register tools and provide metadata.
- **Stateless Functions:** Prefer stateless, idempotent functions for tool logic to ensure reliability and testability.
- **Input Validation:** Validate all inputs using schemas (see [`src/schemas.ts`](src/schemas.ts:1)) to prevent runtime errors.
- **Error Reporting:** Return structured error objects or throw exceptions that can be caught by the agent for robust error handling.

**Example:**
```typescript
import { Tool, ToolContext } from './tooling';

@Tool({
  name: 'math.add',
  description: 'Add two numbers',
  inputSchema: { a: 'number', b: 'number' }
})
export function add({ a, b }: { a: number, b: number }, ctx: ToolContext) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Invalid input');
  }
  return { result: a + b };
}
```

---

## 2. LLM Providers

Agents can interact with various Large Language Model (LLM) providers (e.g., OpenAI, Anthropic, local models).

**Working with Different LLM Providers:**
- **Provider Abstraction:** Use a provider abstraction layer to switch between LLMs without changing agent logic.
- **API Key Management:** Store API keys securely (e.g., in `.env` files) and load them at runtime.
- **Provider-Specific Options:** Expose configurable parameters (model, temperature, max tokens) for each provider.
- **Fallback Strategies:** Implement fallback logic to switch providers if one fails or rate limits.

**Example:**
```typescript
import { OpenAIProvider, AnthropicProvider } from './llmProviders';

const provider = process.env.LLM_PROVIDER === 'anthropic'
  ? new AnthropicProvider({ apiKey: process.env.ANTHROPIC_API_KEY })
  : new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });

const response = await provider.generate(prompt, options);
```

---

## 3. ReAct Pattern Implementation

The ReAct pattern enables agents to reason and act iteratively, combining tool use with intermediate reasoning steps.

**Implementing the ReAct Pattern:**
- **Prompt Engineering:** Use prompts that instruct the LLM to alternate between "Thought", "Action", and "Observation".
- **Scratchpad:** Maintain a scratchpad (see [`src/utils/scratchpad.ts`](src/utils/scratchpad.ts:1)) to track intermediate steps and results.
- **Tool Invocation:** Parse LLM outputs to detect when to invoke tools, then feed results back into the next reasoning step.
- **Final Answer Enforcement:** Require the agent to explicitly signal when it has reached a final answer (see [`src/final-answer.tool.ts`](src/final-answer.tool.ts:1)).

**Example Prompt Structure:**
```
Thought: I need to look up the current weather.
Action: weather.lookup(city="London")
Observation: The weather in London is 15°C and cloudy.
Thought: Now I can answer the user.
Final Answer: It is 15°C and cloudy in London.
```

---

## 4. Multi-step Agents

Multi-step agents can plan and execute sequences of actions to solve complex tasks.

**Creating and Managing Multi-step Agents:**
- **Step Management:** Use a step manager (see [`src/multiStepAgent.ts`](src/multiStepAgent.ts:1)) to track progress and state.
- **State Persistence:** Persist agent state between steps for long-running or asynchronous tasks.
- **Dynamic Planning:** Allow agents to re-plan or adjust steps based on intermediate results or errors.
- **Tool Chaining:** Enable agents to chain multiple tool invocations within a single session.

**Example:**
```typescript
import { runMultiStep } from './runMultiStep';

await runMultiStep(agent, initialInput, {
  onStep: (step) => { /* handle step result */ },
  onError: (err) => { /* handle error */ }
});
```

---

## 5. Error Handling

Robust error handling is essential for reliable agent operation.

**Error Handling and Debugging Strategies:**
- **Structured Errors:** Use structured error objects with codes and messages for all tool and agent errors.
- **Logging:** Log all errors and key events for traceability (consider integrating with external logging services).
- **Retry Logic:** Implement automatic retries for transient errors (e.g., network issues, rate limits).
- **Debugging Tools:** Use debugging utilities and verbose logging during development (see [`src/utils/validator.ts`](src/utils/validator.ts:1)).
- **User Feedback:** Surface meaningful error messages to users, not just stack traces.

---

## 6. Performance Optimization

Optimize agent and tool performance for responsiveness and scalability.

**Tips for Performance Optimization:**
- **Batch Requests:** Where possible, batch tool or LLM requests to reduce latency.
- **Caching:** Cache frequent LLM responses or tool outputs to avoid redundant computation.
- **Async Operations:** Use asynchronous I/O and non-blocking patterns throughout agent and tool code.
- **Resource Limits:** Set sensible limits on LLM token usage, step counts, and tool invocations.
- **Profiling:** Profile agent runs to identify and address bottlenecks.

---

For more examples and reference implementations, see the [`examples/`](examples/:1) directory and related documentation.