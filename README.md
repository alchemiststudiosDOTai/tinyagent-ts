# tinyAgent-TS — Minimal TypeScript Agent Framework

[![npm version](https://img.shields.io/npm/v/tinyagent-ts.svg)](https://www.npmjs.com/package/tinyagent-ts) [![License: BSL 1.1](https://img.shields.io/badge/License-BSL%201.1-blue.svg)](LICENSE)

**tinyAgent-TS** is a minimal TypeScript framework for building custom AI agents. It demonstrates how decorators, metadata, and a single LLM call can create a fully functional AI agent that discovers and executes local tools, all in a compact codebase.

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
│   ├── default-tools/        # Suite of built-in tools
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
- Node.js (v16+ recommended)
- npm
- OpenRouter API key - [Get one here](https://openrouter.ai)

### Installation

**1. Install the package from npm:**
```bash
npm install tinyagent-ts
```

**2. Create a simple agent:**

Create a file named `simple-agent.ts`:

```typescript
import { Agent, model, tool } from 'tinyagent-ts';
import { z } from 'zod';
import 'dotenv/config';

// Define a custom agent with tools
@model('google/gemini-2.5-flash-preview-05-20:thinking')
class MathAgent extends Agent {
  // Add math operation tools
  @tool('Add two numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }) {
    return `${a} + ${b} = ${a + b}`;
  }

  @tool('Subtract two numbers', z.object({ a: z.number(), b: z.number() }))
  subtract({ a, b }: { a: number; b: number }) {
    return `${a} - ${b} = ${a - b}`;
  }
}

// Use the agent
async function main() {
  // Make sure you have an OPENROUTER_API_KEY in your .env file
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY environment variable is required');
    process.exit(1);
  }

  const agent = new MathAgent();
  const question = 'What is 24 + 18? Also, what is 30 - 12?';
  
  try {
    const result = await agent.run(question);
    console.log(`Question: ${question}`);
    console.log(`Answer: ${result.answer}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

**3. Set up your OpenRouter API key:**
```bash
echo 'OPENROUTER_API_KEY="sk-or-..."' > .env
```

**4. Run your agent:**
```bash
npx tsx simple-agent.ts
```

### More Examples

The package includes several example implementations in the GitHub repository:

```bash
git clone https://github.com/alchemiststudiosDOTai/tinyagent-ts
cd tinyagent-ts
npm install
npx ts-node examples/math-agent.ts    # Basic math operations
npx ts-node examples/react.ts        # ReAct pattern with thinking steps
npx ts-node examples/todo-agent.ts   # Simple stateful agent
```

#### 🔬 Beta Feature: CodeAct Pattern

**CodeAct** is an experimental pattern where the agent uses code (Python in this case) as its reasoning and action mechanism instead of traditional tool calls.

```typescript
// Example: CodeAct Pattern - Python Code as Action (Beta Feature)
import 'dotenv/config';

import { Agent, PythonExec, LLMMessage } from 'tinyagent-ts';
import { model } from 'tinyagent-ts';

/**
 * This example demonstrates the CodeAct paradigm:
 * - The agent receives a task and emits Python code directly as its action, not a tool call.
 * - The system executes the emitted code and returns the result.
 * - All reasoning, control flow, and decision logic are handled in the code itself.
 */
@model('google/gemini-2.5-flash-preview-05-20:thinking')  // You can use any model that's good at coding
class PythonCodeActAgent extends Agent<string> {
  py = new PythonExec();

  /**
   * The agent's "action" is to emit Python code as a string.
   * The system executes this code and returns the result.
   * No tool call is made; code is the action.
   */
  async actWithPythonCode(task: string): Promise<any> {
    // Define messages for the LLM request
    const messages: LLMMessage[] = [
      { 
        role: 'system', 
        content: `You are a Python programming expert. When given a task, respond with ONLY executable Python code that solves the task.
        No explanations, comments, or surrounding text. Begin your code with import statements if needed.
        Your code should be complete, concise, and performant.`
      },
      { role: 'user', content: task }
    ];

    // Make the request to get Python code from the LLM
    const modelName = this.getModelName();
    const response = await this.makeOpenRouterRequest(messages, modelName);
    
    // Extract the Python code from the response and strip markdown formatting
    let pythonCode = response.choices[0]?.message?.content?.trim() ?? '';
    
    // Remove markdown code block formatting if present
    pythonCode = pythonCode.replace(/^```python\s*|^```\s*|```$/gm, '');
    
    console.log('Generated Python Code (after cleanup):');
    console.log('----------------------------------------');
    console.log(pythonCode);
    console.log('----------------------------------------');
    
    // Execute the code and return the result
    const result = await this.py.pythonExec({ code: pythonCode, timeoutMs: 5000 });
    return result;
  }
}

async function main() {
  const agent = new PythonCodeActAgent();

  // The agent is given a task and emits Python code as the action (not a tool call)
  const task = `
You are an expert laptop selection agent. Use Python code as your reasoning and action mechanism.
Here are the laptop options (as a Python list of dicts):

Laptop A: $1200, CPU benchmark 9500, 8-hour battery
Laptop B: $1000, CPU benchmark 8700, 10-hour battery
Laptop C: $900, CPU benchmark 8000, 7-hour battery

Your job:
- Use Python code to score each laptop for best value (higher CPU and battery are better, lower price is better).
- Select the best laptop and explain your reasoning.
- Output a JSON object with the selected laptop, all scores, and a reasoning string.
`;

  console.log('Submitting task to CodeAct agent...');
  
  // The agent emits Python code as the action, which is executed directly
  const result = await agent.actWithPythonCode(task);

  // Print the agent's output
  console.log('Agent Output:', result);
}

main().catch(console.error);
```

Run the CodeAct example:

```bash
npx tsx codeact-python-agent.ts
```

### TypeScript Configuration

Simply extend the base config included in the package:

```json
// tsconfig.json
{
  "extends": "./node_modules/tinyagent-ts/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
    // Add your custom options here
  },
  "include": ["*.ts"]
}
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
### CLI Usage

```bash
# basic chat (defaults shown)
npx tinyagent --model openai/gpt-4o-mini --trace

# custom system prompt
npx tinyagent -p ./prompts/customer-support.md
```

*Run `tinyagent --help` for all options.*


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

## Acknowledgments & Inspirations

- **my wife**
- [HuggingFace SmoLAgents](https://github.com/huggingface/smolagents)
- And many other open-source contributors in the AI agent community! 


---

## License

tinyAgent-TS is provided under the [Business Source License 1.1](LICENSE).

- **Free** for individuals and businesses with annual revenue below $1 million USD.
- **Paid license required** for businesses with annual revenue exceeding $1 million USD.
- For commercial licensing inquiries, visit: [https://alchemiststudios.ai/](https://alchemiststudios.ai/)

This license allows non-production use and ensures the project remains open while providing a sustainable business model for continued development.
