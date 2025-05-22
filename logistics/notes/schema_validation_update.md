# Assistant Schema Validation & Retry System (May 2025)

## Summary

We implemented a strict, two-tier schema validation system for all assistant responses in TinyAgent-TS. This ensures that every LLM output is either a valid tool call or a direct answer, with no extra keys or malformed structures, and that tool arguments are validated against their specific schemas. Invalid outputs trigger an automatic retry with a corrective prompt.

---

## Motivation

- Prevent hallucinated or malformed LLM outputs from reaching tool logic.
- Guarantee that only sanctioned reply shapes are processed.
- Catch and correct both top-level and tool-specific schema errors before execution.
- Improve reliability and testability of agent workflows.

---

## Implementation Steps

1. **Schema Design**
   - Created strict Zod schemas in [`src/schemas.ts`](src/schemas.ts):
     - `ToolCallSchema`: `{ tool: string, args: object }`
     - `DirectAnswerSchema`: `{ answer: string }`
     - `AssistantReplySchema`: union of the above, with no extra keys allowed.

2. **Agent Integration**
   - Updated the agent's `run()` method in [`src/agent.ts`](src/agent.ts) to:
     - Parse and validate the entire LLM response against `AssistantReplySchema`.
     - If invalid, use a new `retryWithFixRequest` helper to prompt the LLM to correct its output.
     - Only after passing validation, branch into tool or answer logic.

3. **Tool Argument Validation**
   - On tool calls, validate `args` against the tool's Zod schema.
   - If argument validation fails, trigger a retry for just the tool call payload.
   - If the retry also fails, return an error and halt execution.

4. **Testing**
   - Added unit tests for all schemas in [`test/schemas.test.ts`](test/schemas.test.ts).
   - Added an integration test in [`test/agent.integration.test.ts`](test/agent.integration.test.ts) that simulates invalid LLM output followed by a valid retry, verifying the retry mechanism.

---

## Results

- All assistant responses are now strictly validated before any tool logic is executed.
- The agent automatically retries on both top-level and tool-argument schema errors.
- The system is fully covered by unit and integration tests.
- This approach eliminates runtime surprises from malformed LLM output and improves the reliability of agent workflows.

---

_Last updated: 2025-05-20_