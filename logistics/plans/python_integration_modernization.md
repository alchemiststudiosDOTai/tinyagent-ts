# Plan: Modernizing Python Integration with New Codebase

## Current State Analysis

**Legacy Python Integration:**
- `src/python_stubs/ta.py` - Auto-generated helper for code-runner mounting
- `src/tools/pythonExec.ts` - Decorator-based tool with Express server integration
- `examples/codeact-python-agent.ts` - CodeAct pattern using legacy Agent architecture
- Uses decorator pattern (`@tool`) which conflicts with new composition-based architecture

**New Architecture Benefits:**
- Clean modular design with unified Agent class
- Composition-based tool system (no decorators)
- Type-safe tool interfaces with Zod schemas
- Better separation of concerns

## Implementation Phases

### Phase 1: Modernize Python Tool Architecture
**Goal:** Update pythonExec to use new composition-based tool system

- **`src/tools/pythonExec.ts`** - Convert from decorator-based to modern Tool interface
  - Remove `@tool` decorator usage
  - Implement standard `Tool` interface with `name`, `description`, `schema`, `execute`
  - Update to use Zod schema validation
  - Maintain Express server functionality for tool bridging
  - Add proper abort signal support

- **`src/python_stubs/ta.py`** - Review and potentially update
  - Verify HTTP communication pattern still works
  - Consider if stub needs updates for new tool interface
  - Ensure tool bridging works with modernized architecture

### Phase 2: Update CodeAct Examples
**Goal:** Migrate Python examples to use new Agent and tool system

- **`examples/codeact-python-agent.ts`** - Full rewrite using new architecture
  - Replace legacy `Agent` class with unified `Agent` from new architecture
  - Remove `@model` decorator usage
  - Use new Agent configuration pattern: `new Agent({ model: {...}, mode: 'react' })`
  - Register pythonExec tool using composition: `agent.registerTool(pythonExecTool)`
  - Update CodeAct pattern to work with new unified agent

- **`examples/python-multistep.ts`** - Update for consistency
  - Similar modernization to align with new architecture
  - Use unified tool registration pattern

### Phase 3: Enhanced Python Integration
**Goal:** Leverage new architecture for better Python integration

- **Create `new-docs/python-integration-example.ts`** - Modern Python usage example
  - Show clean integration of Python execution with default tools
  - Demonstrate CodeAct pattern with new ergonomic API
  - Include best practices for Python tool development

- **Consider Python tool preset** - Add to `src/tools/default-tools.ts`
  - Evaluate if Python execution should be part of default tools
  - Create `getDefaultTools({ includePython: true })` option pattern
  - Align with new `includeFinalAnswer` pattern we just implemented

- **Update tool development guide** - Add Python-specific examples
  - Show how to create tools that bridge to Python
  - Document HTTP server pattern for complex integrations
  - Best practices for code execution tools

## Key Migration Challenges

1. **Decorator to Composition**: Converting `@tool` pattern to object-based tools
2. **Agent Architecture**: Moving from legacy inheritance to unified configuration
3. **Tool Registration**: Updating from automatic decorator registration to explicit composition
4. **Type Safety**: Ensuring Zod schemas work with Python tool interfaces

## Expected Benefits

- **Consistency**: Python tools follow same patterns as other tools
- **Modularity**: Python execution can be mixed with any other tools
- **Type Safety**: Full TypeScript support for Python tool interfaces
- **Maintainability**: Cleaner separation between Python execution and agent logic
- **Flexibility**: Python tools work with both simple and react modes

This modernization will bring the Python integration up to the same high standards as the rest of the new modular architecture.

---
🤖 Generated with Claude Code