# React Calculator Example

## Detailed Explanation

The `react-calculator` example demonstrates how to build a simple, multi-step agent using the ReAct (Reasoning + Acting) pattern. This agent can perform basic arithmetic operations—addition, subtraction, multiplication, and division—by leveraging tool functions. It showcases how to use the `MultiStepAgent` class, tool decorators, and a step-by-step reasoning process to solve a math problem interactively. The example also illustrates how to trace the agent's reasoning and actions in real time, making it a practical reference for building more complex agents that require intermediate reasoning steps.

## Code Breakdown

### 1. Environment Setup

```typescript
import * as dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { Scratchpad } from '../src/utils/scratchpad';
```
- Loads environment variables and imports necessary modules for agent definition, type validation, and step tracking.

### 2. CalculatorAgent Class

```typescript
@model('openai/gpt-4.1')
class CalculatorAgent extends MultiStepAgent<string> {
  @tool('Add two numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }): string {
    return String(a + b);
  }
  // ... other operations
}
```
- The `CalculatorAgent` class extends `MultiStepAgent` and is decorated with a model specification.
- Four tool methods are defined: `add`, `subtract`, `multiply`, and `divide`, each decorated with `@tool` and input validation using `zod`.
- The `divide` method handles division by zero gracefully.

### 3. Step Display Function

```typescript
function displaySteps(pad: Scratchpad) {
  const last = pad.getSteps()[pad.getSteps().length - 1];
  if (last.type === 'thought') {
    console.log(`🤔 ${last.text}`);
  } else if (last.type === 'action') {
    if (last.mode === 'json') {
      console.log(`🛠️  ${last.tool}(${JSON.stringify(last.args)})`);
    } else {
      console.log('🛠️  [code action]');
    }
  } else if (last.type === 'observation') {
    console.log(`👁️  ${last.text}`);
  }
}
```
- This function prints each step of the agent's reasoning process, distinguishing between thoughts, actions, and observations.

### 4. Running the Demo

```typescript
async function runDemo() {
  const agent = new CalculatorAgent();
  const question = 'What is (5 * 3) + 10?';
  console.log(`❓ ${question}`);
  const result = await agent.run(question, { trace: true, onStep: displaySteps });
  console.log('✅ Final Answer:', result);
}

if (require.main === module) {
  runDemo();
}
```
- Instantiates the agent and runs it on a sample question.
- Traces each reasoning step using `displaySteps`.
- Prints the final answer.

## Customization Instructions

- **Add New Operations:**  
  To add more mathematical operations (e.g., exponentiation, modulus), define a new method in the `CalculatorAgent` class, decorate it with `@tool`, and specify the input schema.
- **Change the Model:**  
  Modify the `@model` decorator to use a different language model as needed.
- **Adjust Step Display:**  
  Update the `displaySteps` function to customize how reasoning steps are presented or logged.
- **Integrate with Other Agents:**  
  Extend the agent to call external APIs or interact with other tools by adding new methods and tool decorators.

## Use Cases

- **Educational Tools:**  
  Interactive math tutors or step-by-step problem solvers.
- **Automated Reasoning Agents:**  
  Agents that need to break down complex tasks into smaller, traceable steps.
- **Testing ReAct Patterns:**  
  A sandbox for experimenting with reasoning and acting loops in agent design.
- **Backend Calculation Services:**  
  Modular, extensible calculation engines for web or API services.