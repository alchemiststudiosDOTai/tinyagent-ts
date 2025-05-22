# TodoAgent Example

## Detailed Explanation

The `TodoAgent` example demonstrates how to build a simple AI agent that manages a todo list using tool-based state management. This example showcases:

- How to define an agent class with multiple tools (actions) using decorators.
- How to use schema validation for tool inputs with Zod.
- How to maintain and manipulate internal state (the todo list) within an agent.
- How to orchestrate tool selection and execution via natural language queries.
- How to run and interact with the agent programmatically.

This example serves as both a learning resource and a template for building agents that require persistent, modifiable state and user-driven workflows.

---

## Code Breakdown

### 1. Environment Setup

```ts
import * as dotenv from 'dotenv';
dotenv.config();
```
Loads environment variables, such as API keys, from a `.env` file.

### 2. Imports and Agent Definition

```ts
import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { z } from 'zod';
```
- `model` and `tool` are decorators for agent configuration and tool registration.
- `MultiStepAgent` is a base class supporting multi-step tool invocation and stateful workflows.
- `zod` is used for input validation.

### 3. TodoAgent Class

```ts
@model('openai/gpt-4.1-mini')
class TodoAgent extends MultiStepAgent<string> {
  private todos: string[] = [];
  ...
}
```
- The `@model` decorator specifies the LLM backend.
- The class extends `MultiStepAgent<string>`, enabling multi-step reasoning and tool use.
- The `todos` array holds the current todo list in memory.

### 4. Tool Methods

Each todo operation is defined as a method decorated with `@tool`, which:
- Provides a description for the tool.
- Specifies the input schema using Zod.

#### Add Tool

```ts
@tool('Add a todo item', z.object({ item: z.string() }))
add({ item }: { item: string }): string {
  this.todos.push(item);
  return `Added: ${item}`;
}
```
Adds a new item to the todo list.

#### Remove Tool

```ts
@tool('Remove a todo item by index', z.object({ index: z.number() }))
remove({ index }: { index: number }): string {
  if (index < 0 || index >= this.todos.length) {
    return 'Invalid index';
  }
  const [removed] = this.todos.splice(index, 1);
  return `Removed: ${removed}`;
}
```
Removes an item from the todo list by its index, with bounds checking.

#### List Tool

```ts
@tool('List all todo items', z.object({}))
list(): string {
  return this.todos.join('\n');
}
```
Returns a string listing all current todo items.

### 5. Demo Runner

```ts
async function runDemo() {
  const agent = new TodoAgent();
  const task = 'Add buy milk and walk the dog. Then list items.';
  console.log(`❓ ${task}`);
  const result = await agent.run(task, { trace: true });
  console.log('✅ Final Answer:', result);
}

if (require.main === module) {
  runDemo();
}
```
- Instantiates the agent.
- Defines a sample task for the agent to process.
- Runs the agent and prints the result to the console.
- Allows the script to be run directly from the command line.

---

## Customization Instructions

You can customize the `TodoAgent` example in several ways:

1. **Add New Tools:**  
   Define new methods in the `TodoAgent` class, decorate them with `@tool`, and provide appropriate Zod schemas and logic (e.g., mark items as done, clear the list).

2. **Change the Model:**  
   Modify the argument to the `@model` decorator to use a different LLM backend.

3. **Adjust Tool Descriptions or Schemas:**  
   Update the descriptions or input validation schemas to match your requirements.

4. **Persist State:**  
   Replace the in-memory `todos` array with persistent storage (e.g., a database or file) for long-term todo management.

5. **Integrate with Other Systems:**  
   Extend the agent to interact with external APIs, notification systems, or user interfaces.

6. **Modify the Demo:**  
   Change the sample task or adapt the demo runner for interactive CLI or web use.

---

## Use Cases and Practical Applications

- **Task Automation:**  
  Automate the management of todo lists or similar stateful workflows.

- **Interactive Bots:**  
  Build chatbots or assistants that help users manage tasks, reminders, or shopping lists.

- **Educational Tools:**  
  Demonstrate stateful agent design and tool-based reasoning for learning and teaching.

- **Template for Custom Agents:**  
  Use the structure as a starting point for agents with domain-specific state and tools (e.g., project management, inventory tracking).

---