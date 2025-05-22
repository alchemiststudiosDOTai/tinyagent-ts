# CodeAct Python Agent: Using Code as the Action Mechanism


THIS IS NOT READY FOR PRODUCTION USE

HEAVILY INSPIRED BY https://huggingface.co/papers/2402.01030 & SMOLAGENT
THANK YOU TO THE HUGGINGFACE TEAM FOR KEEPING THE AI AGENT OS COMMUNITY ALIVE



This documentation explains the CodeAct pattern implemented in the TinyAgent TypeScript framework, specifically focusing on the Python agent example in `examples/codeact-python-agent.ts`.

## What is the CodeAct Paradigm?

CodeAct is a novel approach to LLM-based agents where **code itself is the action mechanism**, rather than a structured tool call or JSON/text output.

### Traditional LLM Agent Pattern vs. CodeAct

**Traditional Agent Pattern:**
- Agent makes decisions through text reasoning
- Agent calls specific tools with structured parameters
- Control flow is managed by the agent's reasoning in text
- Each action is discrete and often requires multiple steps for complex tasks

**CodeAct Pattern:**
- Agent emits executable code as its action
- The code itself contains the reasoning, control flow, and decision logic
- Execution environment runs the code and returns results directly
- Complex operations can be expressed more naturally in code

![CodeAct Pattern](https://cdn-lfs.hf.co/datasets/huggingface/documentation-images/2d3c40c6213af765c3caff5a18210cd75f5722ce6a012f99a5eb4cb6536965fc?response-content-disposition=inline%3B+filename*%3DUTF-8%27%27code_vs_json_actions.png%3B+filename%3D%22code_vs_json_actions.png%22%3B&response-content-type=image%2Fpng&Expires=1747926791&Policy=eyJTdGF0ZW1lbnQiOlt7IkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc0NzkyNjc5MX19LCJSZXNvdXJjZSI6Imh0dHBzOi8vY2RuLWxmcy5oZi5jby9kYXRhc2V0cy9odWdnaW5nZmFjZS9kb2N1bWVudGF0aW9uLWltYWdlcy8yZDNjNDBjNjIxM2FmNzY1YzNjYWZmNWExODIxMGNkNzVmNTcyMmNlNmEwMTJmOTlhNWViNGNiNjUzNjk2NWZjP3Jlc3BvbnNlLWNvbnRlbnQtZGlzcG9zaXRpb249KiZyZXNwb25zZS1jb250ZW50LXR5cGU9KiJ9XX0_&Signature=MxwdKrwrvPONyVRtiso%7EY0lEhdgAipHfEn5qSXwYZLOJw7CsokT2VLC-ZX5NovZnRnsh1OeSLSJK-015-pVwMFTsRiglqAjyQegI4ORF8uzBVSFQlRwJtKTOyl38WEbAFhdmv%7EbfL3-gE%7EimmZQHLkJFz%7EMHBwXOBkqkqDVwMiq8yzSo1QCGDj7W1CnYQkpQEAVZvUCRMMGkdGcfxDnkX4uTXABqJbeRfcwFbcVzvby6EiAozLVDpFfVBjZbJGwLnSSmDIQ40qh-6T3uXn%7ErBjHkYWZXrBxoFfMmt-jJnme-fvzEoKqUK82MxH8flDt06TIcVWSN08OP3qaPB59reA__&Key-Pair-Id=K3RPWS32NSSJCE)


## Benefits of Using Python Code as the Action Mechanism

1. **Expressiveness**: Code can express complex logic, data transformations, and control flow more naturally than text-based reasoning.

2. **Efficiency**: Operations that would require multiple tool calls in traditional agents can be handled in a single code execution.

3. **Composability**: Functions and operations can be composed naturally in code, enabling more sophisticated reasoning.

4. **Readability**: For technical users, code can be a more precise and unambiguous way to express intent than natural language.

5. **Extensibility**: Code can leverage libraries and frameworks, providing the agent with powerful capabilities without custom tool development.

## How the CodeAct Python Agent Works

### Implementation Overview

The CodeAct Python agent is implemented in `examples/codeact-python-agent.ts`. Here's a breakdown of its key components:

1. **PythonCodeActAgent Class**: Extends the base `Agent` class and includes the Python execution capability.

2. **actWithPythonCode Method**: This method:
   - Takes a task description as input
   - Prompts the LLM to generate Python code that solves the task
   - Executes the generated code using the `PythonExec` class
   - Returns the execution result

3. **System Prompt Engineering**: The prompt instructs the LLM to respond with *only* executable Python code - no explanations or surrounding text.

### The Python Execution Environment

The Python execution is handled by the `PythonExec` class in `src/tools/pythonExec.ts`, which:

- Sets up a secure execution environment for Python code
- Uses `execa` to spawn a Python process and feed it the generated code
- Captures the standard output from the Python execution
- Handles errors and timeouts gracefully
- Returns the result to the calling agent

## Execution Flow

1. **Task Submission**: The agent receives a task description (in natural language)
2. **Code Generation**: The LLM generates Python code to solve the task
3. **Code Execution**: The generated code is executed in a Python environment
4. **Result Handling**: The output from the Python execution is captured and returned

This flow is a direct implementation of the CodeAct paradigm: the LLM's "action" is the Python code it generates, which is then executed to produce the result.

## Example: Laptop Selection Agent

The example in `codeact-python-agent.ts` demonstrates a practical application: selecting the best laptop from a set of options based on a value scoring formula.

### Task Description

The agent is given information about three laptops with different specifications:
- Laptop A: $1200, CPU benchmark 9500, 8-hour battery
- Laptop B: $1000, CPU benchmark 8700, 10-hour battery
- Laptop C: $900, CPU benchmark 8000, 7-hour battery

The agent needs to:
1. Score each laptop based on CPU, battery, and price
2. Select the best laptop
3. Return the result as a JSON object with scores and reasoning

### Generated Python Code

When given this task, the LLM generates Python code like this:

```python
import json

laptops = [
    {"name": "Laptop A", "price": 1200, "cpu": 9500, "battery": 8},
    {"name": "Laptop B", "price": 1000, "cpu": 8700, "battery": 10},
    {"name": "Laptop C", "price": 900, "cpu": 8000, "battery": 7}
]

scores = {}
for laptop in laptops:
    score = (laptop["cpu"] * laptop["battery"]) / laptop["price"]
    scores[laptop["name"]] = score

selected = max(scores, key=scores.get)
reasoning = (
    f"{selected} has the highest computed score of {scores[selected]:.2f} using the formula "
    "(CPU benchmark * battery life) / price, indicating it provides the best performance "
    "and battery combination for its cost."
)

result = {
    "selected_laptop": selected,
    "scores": scores,
    "reasoning": reasoning
}

print(json.dumps(result))
```

### Agent Output

The execution of this code produces the following output:

```json
{
  "selected_laptop": "Laptop B",
  "scores": {
    "Laptop A": 63.333333333333336,
    "Laptop B": 87.0,
    "Laptop C": 62.22222222222222
  },
  "reasoning": "Laptop B has the highest computed score of 87.00 using the formula (CPU benchmark * battery life) / price, indicating it provides the best performance and battery combination for its cost."
}
```

## How This Demonstrates the CodeAct Pattern

This example shows the key advantages of the CodeAct pattern:

1. **All reasoning happens in code**: The scoring logic, comparison, and selection are all expressed directly in Python code.

2. **Natural data manipulation**: The code naturally handles lists, dictionaries, and calculations in a way that would be cumbersome with text-based reasoning.

3. **Single-step solution**: What might require multiple reasoning steps and tool calls in a traditional agent is handled in a single code execution.

4. **Clear, auditable logic**: The reasoning is explicit in the code, making it easy to understand and verify how the decision was made.

## Comparison with Other Agent Patterns

### CodeAct vs. ReAct

ReAct (Reasoning + Acting) involves the agent alternating between reasoning steps and action steps. In contrast, CodeAct embeds the reasoning directly into the code that serves as the action.

### CodeAct vs. Function Calling

Function calling allows the LLM to call predefined functions with structured parameters. CodeAct is more flexible as it allows the LLM to write arbitrary code that can define its own functions and control flow.

### CodeAct vs. Structured Output

Structured output (like JSON) constrains the LLM's response format but still relies on the agent's text-based reasoning. CodeAct allows the reasoning to be expressed in code, which can be more natural for certain tasks.

## Potential Applications and Extensions

The CodeAct pattern is particularly well-suited for:

1. **Data Analysis**: Analyzing and visualizing data using libraries like pandas and matplotlib.

2. **Algorithm Development**: Implementing and testing algorithms for optimization, search, or machine learning.

3. **Multi-step Reasoning**: Tasks that require complex, multi-step reasoning with intermediate calculations.

4. **System Automation**: Writing scripts to automate system tasks or configuration.

5. **Domain-Specific Applications**: Tasks in fields like finance, science, or engineering where calculations and simulations are common.

### Extensions of the Pattern

The CodeAct pattern could be extended in several ways:

1. **Multi-language CodeAct**: Support for languages beyond Python, such as JavaScript, R, or Julia.

2. **Interactive CodeAct**: Allowing the generated code to request additional information or clarification during execution.

3. **Hybrid Approaches**: Combining CodeAct with traditional tool-based approaches for tasks that require both code execution and external API calls.

4. **Persistent State**: Maintaining state between code executions to build up complex solutions over time.

5. **Collaborative CodeAct**: Multiple agents generating and reviewing code together to solve complex problems.

## Conclusion

The CodeAct pattern represents a powerful approach to LLM-based agents, particularly for tasks that involve complex reasoning, data manipulation, or algorithmic solutions. By using code as the action mechanism, agents can express their reasoning and solutions more naturally and effectively than with traditional text-based or tool-call approaches.

The Python agent example demonstrates the practical benefits of this approach, showing how a relatively simple task can be solved in a single step with clear, auditable logic. As LLMs continue to improve in their coding capabilities, the CodeAct pattern is likely to become an increasingly important approach for building effective, capable agents.