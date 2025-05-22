# Customization Guide

This guide provides advanced users and developers with strategies and best practices for customizing `tinyagent-ts` to fit specialized workflows, integrate with external systems, and extend agent capabilities beyond default configurations.

---

## 1. Prompt Engineering

**Prompt engineering** is central to shaping agent behavior and optimizing performance with different LLMs. Customizing prompts allows you to:

- **Tailor agent instructions** for specific tasks or domains.
- **Adapt to different LLMs** (e.g., OpenAI, Anthropic, local models) by adjusting prompt style, length, and system messages.
- **Guide tool usage** and multi-step reasoning.

**Best Practices:**
- Use the `systemPrompt` and `userPrompt` options in agent constructors or when invoking the prompt engine.
- Store reusable prompt templates in the `/src/core/prompts/` directory.
- For complex workflows, consider dynamic prompt generation based on context or user input.

**Example:**
```ts
import { Agent } from './src/agent';

const customAgent = new Agent({
  systemPrompt: "You are a legal assistant. Always cite relevant statutes.",
  userPrompt: "Summarize the following case: {caseText}",
  // ...other options
});
```

---

## 2. Agent Behavior Modification

Beyond changing models or tools, you can modify core agent behaviors to suit advanced requirements:

- **Override decision logic:** Subclass `Agent` or `MultiStepAgent` and override methods like `plan()`, `selectTool()`, or `postProcess()`.
- **Inject custom validation:** Add or replace output validation logic to enforce stricter formats or domain-specific constraints.
- **Customize tool selection:** Implement custom tool selection strategies for multi-tool agents.

**Example:**
```ts
import { MultiStepAgent } from './src/multiStepAgent';

class CustomMultiStepAgent extends MultiStepAgent {
  async plan(context) {
    // Custom planning logic
    return super.plan(context);
  }
  // Override other methods as needed
}
```

---

## 3. Extending Core Classes

For highly specialized needs, extend core classes:

- **Agent:** Base class for single-step agents.
- **MultiStepAgent:** For agents that reason over multiple steps or tools.

**Extension Tips:**
- Follow the open/closed principle: extend without modifying core files.
- Place custom agents in a separate directory (e.g., `src/customAgents/`).
- Use TypeScript interfaces to ensure type safety when adding new methods or properties.

**Example:**
```ts
import { Agent } from './src/agent';

class MySpecialAgent extends Agent {
  // Add custom methods or override existing ones
}
```

---

## 4. Integrating External Libraries and Services

`tinyagent-ts` is designed for extensibility:

- **Add new tools:** Implement custom tool classes that wrap external APIs or libraries, then register them with your agent.
- **Async operations:** Tools can perform asynchronous calls (e.g., fetch data from a web API) and return results to the agent.
- **Middleware:** Use or implement middleware patterns to preprocess inputs/outputs or log agent activity.

**Example:**
```ts
// Custom tool integrating an external API
class WeatherTool {
  async run(input) {
    // Call external weather API
    return await fetchWeather(input.location);
  }
}
```

---

## 5. UI and Frontend Integration

To integrate `tinyagent-ts` agents into user interfaces:

- **Expose agent APIs:** Use a backend server (Node.js/Express) to expose agent endpoints for frontend consumption.
- **WebSocket/Streaming:** For real-time updates, implement WebSocket endpoints or use server-sent events.
- **Frontend frameworks:** Connect to the backend using React, Vue, or other frameworks. Display agent responses, tool traces, and intermediate steps for transparency.

**Considerations:**
- Sanitize and format agent outputs before rendering in the UI.
- Provide user controls for agent configuration (e.g., prompt, model, tool selection).
- For advanced UIs, visualize agent reasoning steps or tool usage.

---

## Additional Resources

- [Advanced Usage Guide](advanced-usage.md)
- [API Reference](api-reference.md)
- [Examples Directory](../examples/README.md)

For further customization questions, consult the source code or open an issue on the project repository.