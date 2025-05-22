# tinyAgent‑lite — Minimal TypeScript Agent Framework

**tinyAgent‑lite** is a minimal TypeScript port of the original Python-based **tinyAgent** framework. It demonstrates how decorators, metadata, and a single LLM call can create a fully functional AI agent that discovers and executes local tools, all in a compact codebase.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Quick Start](#quick-start)
3. [Examples](#examples)
4. [ReAct Implementation](#react-implementation)
5. [Concepts](#concepts)
6. [Prompt Templates](#prompt-templates)
7. [Design Highlights](#design-highlights)
8. [Next Steps](#next-steps)
9. [License](#license)

---

## Project Structure

The project is organized for clarity and extensibility. Below is the current structure:

```
tinyagent-ts/
├── src/
│   ├── agent.ts              # Base Agent class: LLM orchestration, tool runtime
│   ├── cli.ts                # CLI entry point
│   ├── decorators.ts         # @model and @tool decorators + metadata registry
│   ├── final-answer.tool.ts  # Tool for returning the agent's answer
│   ├── index.ts              # Demo CalcAgent with math tools
│   ├── multiStepAgent.ts     # Multi-step agent logic (ReAct loop)
│   ├── promptEngine.ts       # Prompt template engine
│   ├── runMultiStep.ts       # Entrypoint for multi-step agent runs
│   ├── schemas.ts            # Zod schemas for tool validation
│   ├── ta.ts                 # (Legacy/experimental agent)
│   ├── triageAgent.ts        # Agent for manual tool selection
│   ├── core/
│   │   └── prompts/
│   │       ├── final_answer_flow.md
│   │       ├── retry_after_invalid_output.md
│   │       └── system/
│   │           ├── agent.md
│   │           ├── example.md
│   │           ├── react.md
│   │           └── retry.md
│   ├── types/
│   │   └── .gitkeep
│   └── utils/
│       ├── json.ts
│       ├── scratchpad.ts
│       ├── steps.ts
│       ├── truncate.ts
│       └── validator.ts
├── examples/
│   ├── math-agent.ts
│   ├── react-calculator.ts
│   ├── react.ts
│   ├── todo-agent.ts
│   ├── web-search.ts
│   └── wiki-summary.ts
├── test/
│   ├── agent.final-answer.test.ts
│   ├── agent.integration.test.ts
│   ├── finalAnswerTool.test.ts
│   ├── json.utils.test.ts
│   ├── promptEngine.test.ts
│   ├── runMultiStep.test.ts
│   ├── schemas.test.ts
│   ├── scratchpad.test.ts
│   └── fixtures/
│       └── customAgent.md
├── logistics/
│   ├── plans/
│   ├── notes/
│   ├── project_workflow.md
│   └── qa/
├── types/
│   └── globals.d.ts
├── .env.example
├── .gitignore
├── .prettierrc.js
├── eslint.config.js
├── jest.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## Quick Start

**Requirements:**  
- Node.js (v18+ recommended)
- npm

**1. Clone the repository and install dependencies:**
```bash
git clone <repository-url>
cd tinyagent-ts
npm install
```

**2. Set up your OpenRouter API key:**
```bash
echo 'OPENROUTER_API_KEY="sk-or-..."' > .env
```

**3. Run the CalcAgent demo:**
```bash
npx ts-node src/index.ts
```

**4. Try other examples:**
```bash
npx ts-node examples/math-agent.ts
npx ts-node examples/react.ts
npx ts-node examples/todo-agent.ts
```

**Interaction Example:**
```text
{"tool":"add","args":{"a":1,"b":2}}
{"observation":"3"}
{"tool":"final_answer","args":{"answer":"3"}}
```
- Every tool call is followed by an `{ "observation": ... }` message.
- Reply with another JSON action or finish with `final_answer`.

**Notes:**
- By default, the agent makes a single tool call. Increase `maxSteps` in `MultiStepAgent` or `runMultiStep` for longer chains.
- Every conversation **must** terminate with `{ "tool": "final_answer", "args": { "answer": "..." } }`. Plain text replies are rejected.

---

## Examples

The `/examples` directory contains ready-to-run agent scripts demonstrating various features and patterns:

- [`math-agent.ts`](examples/math-agent.ts:1):  
  Minimal agent with basic math tools (add, subtract, multiply, divide).

- [`react-calculator.ts`](examples/react-calculator.ts:1):  
  Calculator agent using the ReAct pattern for stepwise reasoning.

- [`react.ts`](examples/react.ts:1):  
  Minimal ReAct agent showing the Thought→Action→Observation loop.

- [`todo-agent.ts`](examples/todo-agent.ts:1):  
  Agent that manages a simple in-memory todo list.

- [`web-search.ts`](examples/web-search.ts:1):  
  Agent with a web search tool, demonstrating tool integration.

- [`wiki-summary.ts`](examples/wiki-summary.ts:1):  
  Agent that fetches and summarizes Wikipedia articles.

Each example is self-contained and can be run with `npx ts-node examples/<file>.ts`.

---

## ReAct Implementation

tinyAgent‑ts implements the strict [ReAct](https://arxiv.org/abs/2210.03629) (Reasoning + Acting) loop, enforcing a Thought→Action→Observation cycle:

1. **Prompt & Reasoning:**  
   The agent uses a dedicated `react` prompt template, requiring the model to output explicit `Thought`, `Action`, and `Observation` fields at each step.

2. **Typed Steps:**  
   Interfaces like `ThoughtStep`, `ActionStep`, and `ObservationStep` keep the agent's memory structured and auditable.

3. **Scratchpad Memory:**  
   The `Scratchpad` class renders the sequence of steps as chat messages, maintaining context for the LLM.

4. **Execution Loop:**  
   The `MultiStepAgent` cycles through the scratchpad, invoking tools and collecting observations, until a `final_answer` action is returned.

5. **Debugging & Transparency:**  
   Pass `--trace` (or `trace: true`) to log each Thought/Action/Observation triple for debugging.

6. **Reflexion:**  
   After each Observation, the agent can send a `Reflect:` message for self-critique and optional correction.

7. **See Examples:**  
   - [`examples/react.ts`](examples/react.ts:1): Minimal ReAct agent.
   - [`examples/react-calculator.ts`](examples/react-calculator.ts:1): Calculator with ReAct reasoning.

---

## Concepts

**Agent:**  
A class that orchestrates LLM calls, tool selection, and execution.

**Tool:**  
A method decorated with `@tool`, exposing a function (with schema) that the agent can call.

**@tool Decorator:**  
Registers a method as a callable tool, including its name, description, and argument schema.

**@model Decorator:**  
Specifies which LLM backend/model to use for the agent.

**Zod Schema:**  
Used for runtime validation of tool arguments, ensuring type safety.

**Scratchpad:**  
A memory structure that records the sequence of Thought, Action, and Observation steps for the agent.

**ReAct Pattern:**  
A reasoning loop where the agent alternates between thinking (Thought), acting (Action), and observing (Observation), inspired by the ReAct paper.

**PromptEngine:**  
A utility for loading and managing prompt templates from markdown files.

---

## Prompt Templates

The framework includes a minimal `PromptEngine` for managing prompt templates. Markdown files under `src/core/prompts/system` are loaded automatically (e.g., `agent.md`, `retry.md`, `react.md`). You can override or add new templates by:

```ts
const engine = new PromptEngine({}, { agent: '/path/to/my.md' });
```

Registering an existing key throws an error unless you use `overwrite()`.

---

## Design Highlights

| Decision                        | Rationale                                                   |
| ------------------------------- | ----------------------------------------------------------- |
| Decorators + `reflect‑metadata` | Zero boilerplate for users; rich runtime metadata.          |
| Zod schemas on tools            | Strong arg validation and IDE‑friendly typings.             |
| Two‑turn tool loop              | Lets the model _act → observe → refine_ like ReAct pattern. |
| Single file per concern         | Keeps cognitive load minimal; ideal teaching skeleton.      |

---

## Next Steps

- **Streaming** responses (`streamText`) for UI‑friendly progress.
- **Retry / back‑off** wrapper for transient LLM errors.
- **Rate‑limiting & caching** per tool (mirroring the Python original).
- **Dynamic agent factory** to auto‑generate new tools at runtime.

---

## License

MIT — free to fork, hack, and grow.
