# ReAct Update Summary (May 2025)

This note summarizes the key additions that implement a stricter ReAct loop in **TinyAgent‑TS**.

## Key Features

- **Prompt Template** – New `react` system prompt guides the model to output `Thought`, `Action`, and `Observation` fields.
- **Typed Steps** – Added `ThoughtStep`, `ActionStep`, and `ObservationStep` interfaces to represent scratchpad entries.
- **Scratchpad Utility** – The `Scratchpad` class stores steps and converts them back into `LLMMessage` objects for the next cycle.
- **MultiStepAgent** – A reusable agent that repeatedly processes the scratchpad until the `final_answer` tool is called. Tracing can be enabled with `--trace` or `{ trace: true }`.
- **Example** – `src/examples/react.ts` shows a minimal JSON‑tool loop with tracing enabled.

## Usage

Run the example after setting `OPENROUTER_API_KEY`:

```bash
npx ts-node src/examples/react.ts
```

The agent will print each `Thought`, `Action`, and `Observation` when tracing is enabled.