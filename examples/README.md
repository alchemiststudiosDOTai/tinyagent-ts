# Examples

This directory contains a set of example agents and demos illustrating various features and use cases of the agent framework. Each example includes an overview, instructions for running, sample output, and a summary of key concepts demonstrated.

---

## 1. `math-agent.ts`

**Overview:**  
A simple agent that can perform basic math operations (addition, subtraction, multiplication, division) by interpreting natural language questions and invoking corresponding tools.

**How to Run:**
```bash
OPENROUTER_API_KEY=your-key npx ts-node examples/math-agent.ts
```
Requires a valid `OPENROUTER_API_KEY` in your environment.

**Sample Output:**
```
🧮 Running MathAgent Demo with multiple operations...

❓ Question: "What is 15 plus 7?"
✅ Answer: 15 + 7 = 22

❓ Question: "What is 20 minus 8?"
✅ Answer: 20 - 8 = 12

❓ Question: "What is 6 multiplied by 4?"
✅ Answer: 6 × 4 = 24

❓ Question: "What is 15 divided by 3?"
✅ Answer: 15 ÷ 3 = 5
```

**Key Concepts:**
- Defining agent tools for arithmetic operations
- Model integration for natural language understanding
- Error handling (e.g., division by zero)
- Running agents with natural language input

---

## 2. `react-calculator.ts`

**Overview:**  
Demonstrates a calculator agent using the ReAct (Reasoning + Acting) loop, which shows step-by-step reasoning and tool use for solving a math problem.

**How to Run:**
```bash
OPENROUTER_API_KEY=your-key npx ts-node examples/react-calculator.ts
```

**Sample Output:**
```
❓ What is (5 * 3) + 10?
🤔 [Thoughts and reasoning steps...]
🛠️  multiply({"a":5,"b":3})
👁️  15
🤔 [Further reasoning...]
🛠️  add({"a":15,"b":10})
👁️  25
✅ Final Answer: 25
```

**Key Concepts:**
- ReAct pattern: Thought → Action → Observation loop
- Tool invocation and step tracing
- Multi-step reasoning with agent frameworks

---

## 3. `react.ts`

**Overview:**  
An example of a ReAct agent that demonstrates the Thought → Action → Observation loop using both an echo tool and a calculator tool (for evaluating math expressions).

**How to Run:**
```bash
OPENROUTER_API_KEY=your-key npx ts-node examples/react.ts
```

**Sample Output:**
```
🧠 Running ReAct Agent Demo...
❓ Query: "Calculate 23 * 17 and then echo the result with a friendly message."
🤔 Thought: [Agent's reasoning...]
🛠️  Action: calculate({"expression":"23*17"})
👁️  Observation: Result: 391
🤔 Thought: [Agent's next step...]
🛠️  Action: echo({"text":"391 is the answer! 🎉"})
👁️  Observation: Echo: 391 is the answer! 🎉
✅ Final Answer: Echo: 391 is the answer! 🎉
```

**Key Concepts:**
- ReAct agent design and multi-step reasoning
- Tool use for both calculation and text manipulation
- Step-by-step trace output

---

## 4. `todo-agent.ts`

**Overview:**  
A simple todo list agent that illustrates tool-based state management, allowing you to add, remove, and list todo items via natural language instructions.

**How to Run:**
```bash
OPENROUTER_API_KEY=your-key npx ts-node examples/todo-agent.ts
```

**Sample Output:**
```
❓ Add buy milk and walk the dog. Then list items.
✅ Final Answer: buy milk
walk the dog
```

**Key Concepts:**
- Tool-based state management within an agent
- Multi-step task execution
- Simple persistent state in agent memory

---

## 5. `web-search.ts`

**Overview:**  
A StockResearch agent that performs live web search and data extraction to generate a research note on a given stock, including current price, percent change, market cap, and a summary of the latest news article. The output is formatted as a JSON object.

**How to Run:**
```bash
OPENROUTER_API_KEY=your-key npx ts-node examples/web-search.ts
```
Requires internet access and a valid API key.

**Sample Output:**
```
🔥 Starting StockResearch demo
💬 Query to agent: Create a concise research note on AMC Entertainment (ticker AMC): ...
🕐 Starting agent.run() at 10:00:00 AM
🕐 Finished agent.run() at 10:00:10 AM
💾 Response type: object

=== GENERATED REPORT ===
{
  "stockInformation": {
    "symbol": "AMC",
    "price": "4.50",
    "percentChange": "+2.3%",
    "marketCap": "2.3B"
  },
  "latestNewsSummary": "AMC Entertainment announced a new partnership with XYZ Studios..."
}
```

**Key Concepts:**
- Tool orchestration for web search and data extraction
- JSON output formatting
- Integrating external APIs and live data

---

## 6. `wiki-summary.ts`

**Overview:**  
An agent that fetches a web page (e.g., a Wikipedia article) and summarizes its content, demonstrating web scraping and summarization capabilities.

**How to Run:**
```bash
OPENROUTER_API_KEY=your-key npx ts-node examples/wiki-summary.ts
```
Requires internet access.

**Sample Output:**
```
❓ Summarize the first paragraph of https://en.wikipedia.org/wiki/Turing_Award
✅ Final Answer: The Turing Award is an annual prize given by the Association for Computing Machinery (ACM) to individuals for contributions of lasting importance to computing...
```

**Key Concepts:**
- Web scraping and content extraction
- Summarization using agent tools
- Integrating third-party libraries (e.g., `node-fetch`, `jsdom`)

---