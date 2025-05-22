# ReAct Pattern Example

## Detailed Explanation

This example demonstrates the **ReAct** (Reasoning and Acting) pattern for building agents that solve problems through an iterative loop of **Thought → Action → Observation**. The ReAct pattern enables agents to reason step-by-step, take actions (such as calling tools), observe the results, and continue reasoning until a final answer is produced. This approach is especially powerful for complex tasks that require multiple steps, tool usage, or intermediate calculations.

In this example, the agent is implemented using the [`MultiStepAgent`](../src/multiStepAgent.ts) framework and exposes two tools: an echo tool and a calculator tool. The agent interacts with a language model (OpenAI GPT-4.1) and demonstrates how the ReAct loop can be orchestrated programmatically, with each step (thought, action, observation) being visible and traceable.

---

## Code Breakdown

### 1. Agent Definition and Tools

The agent is defined as a class decorated with `@model('openai/gpt-4.1')`, inheriting from `MultiStepAgent<string>`. It exposes two tools:

- **Echo Tool**  
  ```ts
  @tool('Echo given text', z.object({ text: z.string() }))
  echo({ text }: { text: string }): string {
    return `Echo: ${text}`;
  }
  ```
  This tool simply returns the input text, prefixed with "Echo:".

- **Calculator Tool**  
  ```ts
  @tool('Calculate math expression', z.object({ expression: z.string() }))
  calculate({ expression }: { expression: string }): string {
    try {
      // WARNING: Never use eval in production code - this is just for demonstration
      const result = eval(expression);
      return `Result: ${result}`;
    } catch (error) {
      return `Error calculating: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  ```
  This tool evaluates a math expression using JavaScript's `eval`. **Note:** This is for demonstration only; never use `eval` in production.

### 2. Step Display Callback

The function `displayReActSteps` takes a `Scratchpad` (which records the agent's reasoning steps) and prints the latest step in a human-readable format:
- 🤔 Thought: The agent's reasoning step.
- 🛠️  Action: The tool call and its arguments.
- 👁️  Observation: The result of the action.

### 3. Demo Runner

The `runDemo` function orchestrates the agent's execution:
- Checks for the required `OPENROUTER_API_KEY` environment variable.
- Instantiates the agent.
- Defines a multi-step query:  
  `"Calculate 23 * 17 and then echo the result with a friendly message."`
- Runs the agent with tracing enabled and the step display callback.
- Prints the final answer or any errors.

The script runs the demo if executed directly.

---

## Customization Instructions

You can customize or extend this ReAct agent in several ways:

1. **Add New Tools:**  
   Define new methods in the agent class and decorate them with `@tool`. For example, add a web search tool or a database query tool.

2. **Modify Reasoning Behavior:**  
   Change the prompt or model used by editing the `@model` decorator or the agent's logic.

3. **Change Step Display:**  
   Update the `displayReActSteps` function to log steps differently or to integrate with a UI.

4. **Handle More Complex Tasks:**  
   Adjust the agent's logic to support more advanced workflows, such as multi-agent collaboration or memory.

5. **Secure Tool Implementations:**  
   Replace the demo `eval`-based calculator with a safe math parser for production use.

---

## Use Cases and Practical Applications

The ReAct pattern is useful for:

- **Complex Question Answering:**  
  Where intermediate reasoning and tool use are required (e.g., math, data lookup, multi-step logic).

- **Tool-Augmented Agents:**  
  Agents that need to call APIs, search the web, or interact with external systems.

- **Transparent Reasoning:**  
  Applications where step-by-step reasoning and traceability are important (e.g., education, debugging, compliance).

- **Interactive Assistants:**  
  Agents that can explain their reasoning and actions to users in real time.

- **Research and Prototyping:**  
  Exploring new agent behaviors, tool integrations, or reasoning strategies.

---

**See [`examples/react.ts`](../react.ts) for the full implementation.**