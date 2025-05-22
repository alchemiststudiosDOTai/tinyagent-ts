# MathAgent Example

## Detailed Explanation

The `MathAgent` example demonstrates how to build a simple AI agent capable of performing basic arithmetic operations—addition, subtraction, multiplication, and division—using the agent and tool framework provided in this project. This example showcases:

- How to define an agent class with multiple tools (actions) using decorators.
- How to use schema validation for tool inputs with Zod.
- How to orchestrate tool selection and execution via natural language queries.
- How to run and interact with the agent programmatically.

The example is designed to be both a learning resource and a template for building more complex agents with custom tools.

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
import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';
```
- `zod` is used for input validation.
- `model` and `tool` are decorators for agent configuration.
- `Agent` is the base class for all agents.

### 3. MathAgent Class

```ts
@model('openai/gpt-4.1-nano')
export class MathAgent extends Agent<string> {
  ...
}
```
- The `@model` decorator specifies the LLM backend.
- The class extends `Agent<string>`, meaning it processes string inputs.

### 4. Tool Methods

Each math operation is defined as a method decorated with `@tool`, which:
- Provides a description for the tool.
- Specifies the input schema using Zod.

Example: Addition tool
```ts
@tool('Add two numbers', z.object({ a: z.number(), b: z.number() }))
add({ a, b }: { a: number; b: number }) {
  return `${a} + ${b} = ${a + b}`;
}
```
Other tools (`subtract`, `multiply`, `divide`) follow the same pattern. The `divide` tool includes a check for division by zero.

### 5. Demo Runner

```ts
async function runMathAgentDemo() {
  ...
  const agent = new MathAgent();
  const questions = [
    'What is 15 plus 7?',
    'What is 20 minus 8?',
    'What is 6 multiplied by 4?',
    'What is 15 divided by 3?'
  ];
  ...
  for (const question of questions) {
    const result = await agent.run(question);
    ...
  }
}
```
- Instantiates the agent.
- Runs a set of math questions through the agent.
- Prints the results to the console.

The script checks for the `OPENROUTER_API_KEY` environment variable before running.

---

## Customization Instructions

You can customize the `MathAgent` example in several ways:

1. **Add New Operations:**  
   Define new methods in the `MathAgent` class, decorate them with `@tool`, and provide appropriate Zod schemas and logic.

2. **Change the Model:**  
   Modify the argument to the `@model` decorator to use a different LLM backend.

3. **Adjust Tool Descriptions or Schemas:**  
   Update the descriptions or input validation schemas to match your requirements.

4. **Integrate with Other Systems:**  
   Extend the agent to call external APIs, perform more complex calculations, or interact with other services.

5. **Modify the Demo:**  
   Change the questions in the `questions` array or adapt the demo runner for interactive CLI or web use.

---

## Use Cases and Practical Applications

- **Educational Tools:**  
  Build interactive math tutors or calculators for students.

- **Chatbots:**  
  Integrate math capabilities into conversational agents.

- **Automation:**  
  Use as a backend service for applications requiring dynamic math computation.

- **Template for Custom Agents:**  
  Use the structure as a starting point for agents with domain-specific tools (e.g., finance, science, engineering).

---