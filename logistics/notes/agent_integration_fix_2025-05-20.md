# Agent Integration Test Fix – Output Schema Consistency (2025-05-20)

## Summary

Resolved a failure in the integration test `Agent Integration - Retry Logic › retries on invalid output and succeeds on valid output` in `test/agent.integration.test.ts`. The agent was returning a stringified JSON instead of a JavaScript object, causing a schema mismatch and test failure.

## Problem

- The test expected an object: `{ type: "final_answer", content: "42" }`.
- The agent returned a string: `"{\"type\":\"final_answer\",\"content\":\"42\"}"`.
- This mismatch was detected after recent schema validation updates (see [`schema_validation_update.md`](schema_validation_update.md)).

## Root Cause

- The agent's `run` method returned a stringified object or just a string value, rather than the full object required by the schema and test.
- The schema validation system and tests both expect the agent to return a parsed object, not a string.

## Solution

- Updated the agent's `run` method in [`src/agent.ts`](../../src/agent.ts) to return the full object when the reply matches the schema.
- Ensured the output contract is consistent: all agent responses are now objects validated by the schema, not stringified JSON.

## Result

- The integration test now passes.
- The agent's output is fully consistent with the schema validation approach.
- This change improves reliability and prevents similar mismatches in future development.

---

_Last updated: 2025-05-20_