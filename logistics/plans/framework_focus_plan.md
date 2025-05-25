# Framework Focus Plan - Remove CLI Logic

## Current Problem
The codebase has mixed concerns:
- **Framework code** (agent, tools, model) ✅ Clean and modular
- **CLI application code** ❌ Adds complexity and maintenance burden
- **Legacy files** ❌ Still present causing build issues

## Vision: Pure Framework
Transform tinyAgent-TS into a **clean, focused TypeScript framework** for building AI agents.

---

## Phase 1: CLI Separation Assessment 

### 1.1 Identify CLI-Specific Code
**Files to Remove:**
```
src/cli/                     # Entire CLI directory
├── cli-controller.ts        # CLI orchestration
├── agent-interaction.ts     # CLI-agent bridge
├── io-manager.ts           # Terminal I/O
├── state-manager.ts        # CLI state
├── signal-handler.ts       # Keyboard signals
├── formatter.ts            # CLI output formatting
├── utils.ts                # CLI utilities
└── index.ts                # CLI exports

src/cli-refactored.ts        # Legacy CLI file
```

**CLI-Related Legacy Files:**
```
src/promptEngine.ts          # Used by CLI prompts
src/runMultiStep.ts         # CLI runner (legacy)
src/core/prompts/           # CLI-specific prompts
├── system/cli.md
├── system/cli-react.md
└── final_answer_flow.md
```

### 1.2 Keep Framework Essentials
**Core Framework (Keep):**
```
src/
├── model/                  # ✅ LLM communication
├── agent/                  # ✅ Agent orchestration  
├── tools/                  # ✅ Tool system
├── react/                  # ✅ ReAct engine
├── utils/                  # ✅ Framework utilities
├── schemas.ts              # ✅ Validation
└── index.ts               # ✅ Framework exports
```

---

## Phase 2: Clean Framework Structure

### 2.1 New Directory Structure
```
tinyagent-ts/
├── src/
│   ├── agent/              # Agent orchestration
│   ├── model/              # LLM providers
│   ├── tools/              # Tool system
│   ├── react/              # ReAct reasoning
│   ├── utils/              # Framework utilities
│   ├── schemas.ts          # Validation schemas
│   └── index.ts            # Main exports
├── examples/               # Usage examples
├── docs/                   # Documentation
├── test/                   # Framework tests
└── package.json           # Framework package
```

### 2.2 Clean Package Exports
**New `src/index.ts`:**
```typescript
// Core Agent Framework
export { Agent } from './agent/unified-agent';
export { AgentConfig, AgentMode, AgentResult } from './agent/types';

// Model Layer
export { ModelManager, OpenRouterProvider } from './model';
export { ModelConfig, ModelProvider } from './model/types';

// Tool System
export { ToolRegistry } from './tools/registry';
export { Tool, ToolMetadata } from './tools/types';
export { getDefaultTools, defaultTools } from './tools/default-tools';

// ReAct Engine
export { ReActEngine } from './react/engine';
export { ReActConfig, ReActResult } from './react/types';

// Utilities
export { Scratchpad } from './utils/scratchpad';
export * from './schemas';
```

---

## Phase 3: Framework-First Examples

### 3.1 Replace CLI Examples with Library Examples
**Instead of CLI usage, show:**
- **Web app integration** (Express.js)
- **React component** usage
- **Node.js scripts**
- **Serverless functions**
- **Bot frameworks** (Discord, Slack)

### 3.2 New Example Structure
```
examples/
├── basic-usage.ts          # Simple agent creation
├── custom-tools.ts         # Custom tool development
├── web-integration/        # Express.js integration
├── react-component/        # React UI component
├── discord-bot/           # Discord bot example
└── serverless/            # AWS Lambda example
```

---

## Phase 4: Package Positioning

### 4.1 New Package Description
**From:** "CLI agent with ReAct pattern"
**To:** "Minimal TypeScript framework for building AI agents"

### 4.2 README Focus
- **Getting Started**: Library installation
- **Core Concepts**: Agent, Tools, Models
- **Examples**: Integration patterns
- **API Reference**: Framework API
- **Remove**: CLI usage, CLI installation

### 4.3 Package.json Updates
```json
{
  "name": "tinyagent-ts",
  "description": "Minimal TypeScript framework for building AI agents",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["ai", "agent", "framework", "llm", "typescript", "react-pattern"],
  "bin": {},  // Remove CLI binaries
  "scripts": {
    "build": "rollup -c && tsc -p tsconfig.build.json --emitDeclarationOnly",
    "test": "jest",
    "dev": "tsx examples/basic-usage.ts"  // Example instead of CLI
  }
}
```

---

## Phase 5: Testing Strategy

### 5.1 Framework Tests
Focus on testing the **library API**, not CLI interactions:
- Agent creation and configuration
- Tool registration and execution  
- Model provider integration
- ReAct engine functionality
- Error handling and validation

### 5.2 Integration Tests
- Example applications work correctly
- Package exports are complete
- TypeScript types are accurate
- Documentation examples are valid

---

## Benefits of CLI Removal

### ✅ **Focused Scope**
- Single responsibility: AI agent framework
- Easier to maintain and evolve
- Clear value proposition

### ✅ **Better Developer Experience**  
- Integrate into existing applications
- No CLI dependencies or setup
- Pure library usage patterns

### ✅ **Wider Adoption**
- Works in any Node.js environment
- Web apps, serverless, bots, APIs
- Not limited to command-line usage

### ✅ **Simpler Architecture**
- Remove CLI complexity
- Focus on core framework features
- Cleaner codebase and documentation

---

## Migration Path

### For Existing CLI Users:
1. **Wrapper Script**: Create simple wrapper using the framework
2. **Migration Guide**: Show how to convert CLI usage to library usage
3. **Deprecation Notice**: CLI functionality moved to separate package

### Example Wrapper:
```typescript
// cli-wrapper.ts (separate package)
import { Agent, getDefaultTools } from 'tinyagent-ts';
import readline from 'readline';

const agent = new Agent({ mode: 'react' });
getDefaultTools().forEach(tool => agent.registerTool(tool));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('> ', async (input) => {
  const result = await agent.execute(input);
  console.log(result.data);
  rl.close();
});
```

---

## Implementation Steps

1. **Remove CLI directories and files**
2. **Clean up package.json and build scripts**  
3. **Update examples to show library usage**
4. **Rewrite README with framework focus**
5. **Update tests to focus on framework API**
6. **Create migration guide for CLI users**
7. **Publish as framework-focused package**

**Result**: Clean, focused AI agent framework perfect for integration into any TypeScript/Node.js application! 🚀