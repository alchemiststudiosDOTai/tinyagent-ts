# Default Tools Overview

This document provides an overview of the default tools included in the `tinyAgent‑ts` framework. Each tool is demonstrated with clear, step-by-step examples to help you understand their capabilities and how to use them in your own agents.

---

## 1. File Tool

**Purpose:**  
Perform basic file operations such as creating, reading, appending to, and deleting files.

### Example Workflow

#### 1. Create a New File

**Task:** Create a new file called `notes.txt` with the content "Hello, world!"

```shell
Task: "Create a new file called notes.txt with the content 'Hello, world!'"
Result: The file notes.txt has been created with the content 'Hello, world!'.
```

#### 2. Read the File

**Task:** Read the content of `notes.txt`

```shell
Task: "Read the content of notes.txt"
Result: The content of notes.txt is: Hello, world!
```

#### 3. Append to the File

**Task:** Append "This is a new line." to `notes.txt`

```shell
Task: "Append 'This is a new line.' to notes.txt"
Result: The line 'This is a new line.' has been appended to notes.txt.
```

#### 4. Read the Updated File

**Task:** Read the updated content of `notes.txt`

```shell
Task: "Read the updated content of notes.txt"
Result: The updated content of notes.txt is: Hello, world!This is a new line.
```

#### 5. Delete the File

**Task:** Delete the file `notes.txt`

```shell
Task: "Delete the file notes.txt"
Result: The file notes.txt has been deleted.
```

---

## 2. Grep Tool

**Purpose:**  
Search for patterns in files, similar to the Unix `grep` command.

### Example Workflow

#### 1. Search for a Pattern in a File

**Task:** Find all lines containing "agent" in the `README.md` file

```shell
Task: "Find all lines containing 'agent' in README.md"
Result: 
3:**tinyAgent‑lite** is a minimal TypeScript port of the original Python-based **tinyAgent** framework. It demonstrates how decorators, metadata, and a single LLM call can create a fully functional AI agent that discovers and executes local tools, all in a compact codebase.
26:tinyagent-ts/
28:│   ├── agent.ts              # Base Agent class: LLM orchestration, tool runtime
31:│   ├── final-answer.tool.ts  # Tool for returning the agent's answer
34:│   ├── multiStepAgent.ts     # Multi-step agent logic (ReAct loop)
36:│   ├── runMultiStep.ts       # Entrypoint for multi-step agent runs
38:│   ├── ta.ts                 # (Legacy/experimental agent)
45:│   │           ├── agent.md
58:│   ├── math-agent.ts
61:│   ├── todo-agent.ts
65:│   ├── agent.final-answer.test.ts
66:│   ├── agent.integration.test.ts
104:cd tinyagent-ts
120:npx ts-node examples/math-agent.ts
122:npx ts-node examples/todo-agent.ts
135:- By default, the agent makes a single tool call. Increase `maxSteps` in `MultiStepAgent` or `runMultiStep` for longer chains.
142:The `/examples` directory contains ready-to-run agent scripts demonstrating various features and patterns:
144:- [`math-agent.ts`](examples/math-agent.ts:1):  
145:  Minimal agent with basic math tools (add, subtract, multiply, divide).
148:  Calculator agent using the ReAct pattern for stepwise reasoning.
151:  Minimal ReAct agent showing the Thought→Action→Observation loop.
153:- [`todo-agent.ts`](examples/todo-agent.ts:1):  
171:   The agent uses a dedicated `react` prompt template, requiring the model to output explicit `Thought`, `Action`, and `Observation` fields at each step.
174:   Interfaces like `ThoughtStep`, `ActionStep`, and `ObservationStep` keep the agent's memory structured and auditable.
186:   After each Observation, the agent can send a `Reflect:` message for self-critique and optional correction.
189:   - [`examples/react.ts`](examples/react.ts:1): Minimal ReAct agent.
200:A method decorated with `@tool`, exposing a function (with schema) that the agent can call.
206:Specifies which LLM backend/model to use for the agent.
212:A memory structure that records the sequence of Thought, Action, and Observation steps for the agent.
215:A reasoning loop where the agent alternates between thinking (Thought), acting (Action), and observing (Observation), inspired by the ReAct paper.
224:The framework includes a minimal `PromptEngine` for managing prompt templates. Markdown files under `src/core/prompts/system` are loaded automatically (e.g., `agent.md`, `retry.md`, `react.md`). You can override or add new templates by:
227:const engine = new PromptEngine({}, { agent: '/path/to/my.md' });
250:- **Dynamic agent factory** to auto‑generate new tools at runtime.
```

**Explanation:**  
The tool returns all lines from the file that contain the search term, along with their line numbers and context.

#### 2. Search for a Pattern in Source Code

**Task:** Find all lines containing "tool" in the `src/decorators.ts` file

```shell
Task: "Find all lines containing 'tool' in src/decorators.ts"
Result: 
11:  /** Symbol for storing the list of tool metadata on an agent class. */
12:  TOOLS: Symbol("tools"),
32: * Interface defining the structure for metadata associated with a tool.
33: * This metadata is used by the agent to understand and execute the tool.
36:  /** The name of the tool, typically derived from the method name. */
38:  /** A human-readable description of what the tool does. */
40:  /** The name of the class method that implements the tool's logic. */
42:  /** A Zod schema defining the expected parameters for the tool. */
47: * Property decorator to define a class method as an agent tool.
48: * It stores metadata about the tool, including its description and parameter schema.
50: * @param description - A human-readable description of the tool's purpose.
51: * @param paramSchema - A Zod schema for validating the tool's input parameters. Defaults to an empty object schema.
56: *   @tool('Adds two numbers', z.object({ a: z.number(), b: z.number() }))
63:export function tool(
```

**Explanation:**  
This helps you quickly locate all references to "tool" in the code, useful for understanding how tools are defined and used.

#### 3. Search for a Pattern Not Present

**Task:** Search for "import" in `package.json`

```shell
Task: "Search for 'import' in package.json"
Result: There are no lines containing 'import' in the package.json file.
```

---

## 3. Human Loop Tool

**Purpose:**  
Interactively prompt a human for input during an agent's workflow.

### Example Workflow

#### 1. Ask for User Input

**Task:** Ask the human what their favorite color is

```shell
Task: "Ask the human what their favorite color is"
Human responded: red
Result: Your favorite color is red.
```

#### 2. Ask for Another Input

**Task:** Ask the human what they would like to do today

```shell
Task: "Ask the human what they would like to do today"
Human responded: work
Result: You would like to work today.
```

#### 3. Ask for an Opinion

**Task:** Ask the human for their opinion on AI assistants

```shell
Task: "Ask the human for their opinion on AI assistants"
Human responded: yuge
Result: The human's opinion on AI assistants is: yuge.
```

**Explanation:**  
The agent pauses and waits for human input, then continues the workflow using the provided response.

---

## 4. UUID Tool

**Purpose:**  
Generate random UUIDs for use as unique identifiers.

### Example Workflow

#### 1. Generate a New UUID

**Task:** Generate a new UUID

```shell
Task: "Generate a new UUID"
Result: The new UUID is 80ff7e1c-4a4a-4d75-a38a-651d480d95a1
```

#### 2. Create a Unique Identifier

**Task:** Create a unique identifier for me

```shell
Task: "Create a unique identifier for me"
Result: The unique identifier for you is b75132fb-99a7-48e9-b7b0-fd07e6a9ecb4
```

#### 3. Generate a UUID for a Database Entry

**Task:** I need a random UUID for my database entry

```shell
Task: "I need a random UUID for my database entry"
Result: The UUID for your database entry is 7b9d700a-6b44-47e2-996b-f53b93116d29
```

**Explanation:**  
Each request generates a new, random UUID, which can be used wherever a unique identifier is needed.

---

## 5. Python Execution Tool (Beta)

**Purpose:**
Run arbitrary Python-3 code snippets from within TypeScript/Node.js agents and return their standard output (stdout).

> **Beta Feature:**
> The Python Execution Tool is currently in beta. Its interface and constraints may change in future releases.

### Example Workflows

#### 1. Run a Python Code Snippet

**Task:** Execute a Python snippet to calculate the sum of numbers from 1 to 10

```shell
Task: "Run the following Python code and return its output:
print(sum(range(1, 11)))"
Result: 55
```

#### 2. Use in an Agent (from StockResearchAgent)

**Task:** Use the agent to run a Python snippet that prints the square of 7

```shell
Task: "Run this Python code: print(7 ** 2)"
Result: 49
```

#### 3. Multi-step Python Data Processing Example

**Task:** Demonstrate a multi-step workflow where Python code is executed in sequence, passing results between steps.

See [`examples/python-multistep.ts`](examples/python-multistep.ts:1) for a complete, well-commented example.

**Workflow:**
- Step 1: Generate a list of numbers in Python.
- Step 2: Filter the list in Python (e.g., keep only even numbers).
- Step 3: Compute statistics (sum, mean) on the filtered list in Python.
- Step 4: Handle errors and process results in TypeScript.

**Excerpt:**
```typescript
import { PythonExec } from '../src/tools/pythonExec';

async function runPythonStep(py: PythonExec, code: string, input?: any) {
  // ...see full example for details...
}

async function multiStepPythonWorkflow() {
  const py = new PythonExec();
  const numbers = await runPythonStep(py, `
result = list(range(1, 21))
  `);
  const evenNumbers = await runPythonStep(py, `
result = [n for n in input if n % 2 == 0]
  `, numbers);
  const stats = await runPythonStep(py, `
total = sum(input)
mean = total / len(input) if input else 0
result = {'sum': total, 'mean': mean, 'count': len(input)}
  `, evenNumbers);
  // ...handle stats in TypeScript...
}
```
This example demonstrates:
- Multiple sequential Python executions
- Passing results between steps
- Error handling in both Python and TypeScript
- A practical data processing workflow

### Explanation

The Python Execution Tool allows agents (or direct callers) to execute Python-3 code snippets and capture their standard output. This is useful for leveraging Python's ecosystem, performing calculations, or running custom logic not easily expressed in TypeScript.

- **Integration:**
  - Exposed as a decorated method (e.g., `@tool("Run a Python-3 snippet and return its stdout", ...)`)
  - Can be called directly or integrated into agent workflows
  - Demonstrated in [`examples/web-search.ts`](examples/web-search.ts:167) as part of the `StockResearchAgent`
  - Demonstrated in [`examples/python-multistep.ts`](examples/python-multistep.ts:1) for multi-step workflows

- **Usage:**
  - Provide a string of Python code to execute (required)
  - Optionally specify a timeout in milliseconds (`timeoutMs`)
  - The tool returns the captured stdout as a string

- **Limitations & Constraints:**
  - Maximum code length and output size are enforced (see implementation for current limits)
  - Only stdout is captured; stderr and exceptions are not returned
  - Uses a custom `PYTHONPATH` to include project stubs
  - Intended for short, stateless code snippets (no persistent state between calls)
  - Security: Arbitrary code execution is sandboxed but should not be exposed to untrusted input

- **Example Integration:**
  - See [`examples/web-search.ts`](examples/web-search.ts:167) for a real-world usage in an agent
  - See [`examples/python-multistep.ts`](examples/python-multistep.ts:1) for a multi-step data processing workflow

---
 
#### 4. Python-Driven Agent Reasoning Example

**Task:** Demonstrate an agent that uses Python as its primary reasoning engine, handling all control flow, data processing, and decision logic within a single Python script.

See [`examples/python-agent-reasoning.ts`](examples/python-agent-reasoning.ts:1) for a complete, well-commented example.

**Workflow:**
- The agent is given a decision-making task (e.g., selecting the best laptop from several options based on price, performance, and battery life).
- Instead of orchestrating logic in TypeScript and calling Python for isolated calculations, the agent passes the entire reasoning process to Python.
- The Python script processes the data, applies scoring, makes the decision, and returns a structured result.

**Excerpt:**
```typescript
import { PythonExec } from '../src/tools/pythonExec';

const pythonReasoning = `
# ...Python code that processes options, scores them, and selects the best...
`;

async function main() {
  const py = new PythonExec();
  const output = await py.pythonExec({ code: pythonReasoning, timeoutMs: 5000 });
  const result = JSON.parse(output);
  // Use result.selected, result.scores, result.reasoning
}
```

**How this differs from isolated or multi-step Python computations:**
- The agent's entire reasoning process—including control flow, data processing, and decision logic—is handled in Python.
- This enables more complex, flexible, and transparent reasoning, as the agent can leverage Python's data structures and control flow for multi-step logic and structured output.
- The TypeScript layer simply passes the reasoning task to Python and interprets the result, rather than orchestrating the logic itself.
- This pattern is especially powerful for tasks that require multi-criteria decision making, iterative comparisons, or dynamic control flow.

See [`examples/python-agent-reasoning.ts`](examples/python-agent-reasoning.ts:1) for the full example and commentary.

---
 
## Summary

These examples demonstrate the core default tools available in `tinyAgent‑ts`. Each tool is designed to be simple, composable, and easy to use within agent workflows. For more advanced usage and customization, see the other documentation files in the `docs/` directory.
