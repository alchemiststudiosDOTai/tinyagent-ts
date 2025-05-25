# Plan: Ergonomic Handling of `final_answer` in getDefaultTools

## Summary
This document outlines the plan to make the inclusion of the `final_answer` tool in `getDefaultTools` more ergonomic for developers by eliminating manual filtering.

## Current State Analysis
- `getDefaultTools()` in `src/tools/default-tools.ts:24-26` includes `final_answer` by default
- All examples manually filter it out: `.filter(tool => tool.name !== 'final_answer')`
- Creates unnecessary boilerplate and potential for errors

## Implementation Phases

### Phase 1: Core API Update
**Goal:** Update the core `getDefaultTools()` function with new signature
- Added optional `{ includeFinalAnswer?: boolean }` parameter to `getDefaultTools` in `src/tools/default-tools.ts`
- Introduced TypeScript `GetDefaultToolsOptions` interface
- Default behavior is now to exclude `final_answer` from returned tools array (breaking change)
- Advanced: `getDefaultTools({ includeFinalAnswer: true })` to include it
- Updated implementation for ergonomic, explicit opt-in

### Phase 2: Documentation Examples Cleanup
**Goal:** Remove manual filtering from all new documentation examples
- **`new-docs/simple-agent.ts:13`** - Remove `.filter(tool => tool.name !== 'final_answer')`
- **`new-docs/modes-example.ts:36`** - Remove `.filter(tool => tool.name !== 'final_answer')`  
- **`new-docs/custom-tools-example.ts:33`** - Remove `.filter(tool => tool.name !== 'final_answer')`
- Update any comments referencing manual filtering
- Verify examples still work correctly

### Phase 3: Codebase-wide Cleanup
**Goal:** Find and update any other usages throughout the codebase
- **`src/agent/unified-agent.ts`** - Verify how it handles default tools
- **`src/index.ts`** - Update exports if needed
- **`examples/*.ts`** - Check for similar filtering patterns and update
- Search for any other `getDefaultTools()` usages with manual filtering
- Update any internal tooling that depends on the old behavior

## Files Affected
- `src/tools/default-tools.ts` (core implementation)
- `new-docs/simple-agent.ts` (remove filtering)
- `new-docs/modes-example.ts` (remove filtering)
- `new-docs/custom-tools-example.ts` (remove filtering)
- Any other files using getDefaultTools with manual filtering

## Expected Benefits
- Eliminate boilerplate filtering code
- Prevent accidental duplication of final_answer tool
- Cleaner, more intuitive API
- Consistent behavior across examples

---
🤖 Generated with Claude Code
