# Plan: Refactoring tinyAgent-lite for Scalability and Best Practices

**Objective**: To refactor the existing tinyAgent-lite TypeScript codebase to enhance its structure, maintainability, and scalability by adhering to TypeScript best practices and modern development patterns.

---

### 1. Project Structure Enhancement

The current flat structure in `src/` is suitable for a minimal example but will become unwieldy as the framework grows. We should adopt a more modular structure.

**Current Structure (Conceptual):**

```
src/
├── decorators.ts
├── agent.ts
├── index.ts (CalcAgent demo)
└── multiplierAgent.ts
```

**Proposed New Structure:**

```
src/
├── core/                  # Core agent logic and decorators
│   ├── agent.ts           # Base Agent class, LLM orchestration, tool runtime
│   ├── decorators.ts      # @model and @tool decorators + metadata registry
│   └── errors.ts          # Custom error classes
├── types/                 # Shared TypeScript interfaces and type definitions
│   ├── agent.types.ts     # Types related to Agent, LLM interactions
│   └── tool.types.ts      # Types related to Tools (metadata, parameters)
├── examples/              # Demo agents and usage examples
│   ├── calcAgent.ts       # (Renamed from index.ts for clarity)
│   └── multiplierAgent.ts
├── utils/                 # Utility functions (if any emerge)
│   └── ...
└── index.ts               # Main entry point for exporting framework components
```

**Mermaid Diagram for Proposed Structure:**

```mermaid
graph TD
    A[src] --> B[core];
    A --> C[types];
    A --> D[examples];
    A --> E[utils];
    A --> F[index.ts (main export)];

    B --> B1[agent.ts];
    B --> B2[decorators.ts];
    B --> B3[errors.ts];

    C --> C1[agent.types.ts];
    C --> C2[tool.types.ts];

    D --> D1[calcAgent.ts];
    D --> D2[multiplierAgent.ts];
```

**Rationale:**

- **`core/`**: Centralizes the fundamental building blocks of the agent framework.
- **`types/`**: Promotes type reusability and separation of concerns. Makes it easier to manage complex type definitions.
- **`examples/`**: Clearly separates demonstration code from the core framework.
- **`utils/`**: A place for common helper functions that don't fit neatly into `core`.
- **`src/index.ts`**: Acts as the public API of the framework, exporting necessary components for users.

---

### 2. TypeScript Best Practices Implementation

- **Strict Type Checking**:
  - Ensure `tsconfig.json` has `strict: true` and enable/verify flags like `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`.
  - Address any errors that arise from stricter settings.
- **Explicit Typing**:
  - Add explicit return types to all functions and methods.
  - Use explicit types for variables where type inference might be ambiguous or less clear.
- **Interfaces and Types (in `src/types/`)**:
  - Move `ToolMetadata` to `src/types/tool.types.ts`.
  - Move `ToolHandle` and `OpenRouterResponse` to `src/types/agent.types.ts`.
  - Define clear interfaces for agent inputs/outputs (`I`, `O` in `Agent<I, O>`).
- **Readonly and Immutability**:
  - Use `readonly` for class properties that should not be modified after initialization (e.g., `apiKey` in `Agent`).
- **Error Handling (in `src/core/errors.ts`)**:
  - Create custom error classes extending `Error` (e.g., `AgentInitializationError`, `LLMCommunicationError`, `ToolNotFoundError`, `ToolExecutionError`, `ToolValidationError`, `AgentConfigurationError`).
  - Refactor error handling in `src/core/agent.ts` to use these custom errors.
- **Async/Await Consistency**:
  - Review all `async` functions to ensure `await` is used correctly and promises are handled properly.
- **Modules and Namespaces**:
  - Utilize ES module syntax (`import`/`export`) consistently.
  - Prefer named exports over default exports for better clarity and refactorability, unless a default export is semantically appropriate.
- **Linting and Formatting**:
  - Set up ESLint with recommended TypeScript rules (e.g., `@typescript-eslint/recommended`).
  - Set up Prettier for automatic code formatting.
  - Add `lint` and `format` scripts to `package.json`.

---

### 3. Code Refinements

- **`Agent` Class (now `src/core/agent.ts`)**:
  - **Constructor**: Throw `AgentInitializationError` if `OPENROUTER_API_KEY` is missing.
  - **`getModelName()`**: Throw `AgentConfigurationError` if `@model` decorator is missing.
  - **`makeOpenRouterRequest()`**:
    - Make `HTTP-Referer` and `X-Title` headers configurable or provide sensible defaults.
    - Throw `LLMCommunicationError` for API errors.
  - **`run()` method**:
    - When a tool is not found: `throw new ToolNotFoundError(\`Unknown tool "\${tool}"\`);`.
    - On tool argument validation failure: Catch Zod errors and re-throw as `ToolValidationError`.
    - On tool execution failure: Catch errors from tool methods and re-throw as `ToolExecutionError`.
- **Decorators (now `src/core/decorators.ts`)**:
  - Ensure `ToolMetadata` (moved to types) is imported correctly.
- **Example Agents (now in `src/examples/`)**:
  - Update import paths based on the new structure.
  - Rename `src/index.ts` (current demo) to `src/examples/calcAgent.ts`.
  - Ensure examples correctly demonstrate error handling if applicable.

---

### 4. Configuration Management

- **LLM Provider Configuration**:
  - Abstract the LLM call logic in `makeOpenRouterRequest`.
  - Allow the base URL for the LLM API to be configurable (e.g., via `Agent` constructor options or environment variables).
- **API Keys**: Continue using `process.env` for API keys, but make the specific environment variable name configurable if supporting multiple LLM providers.

---

### 5. Testing Strategy

- **Unit Tests**:
  - Use a testing framework like Jest or Vitest.
  - Write unit tests for:
    - Decorator logic.
    - `Agent` class methods (mocking LLM calls and tool executions).
    - Zod schema validations.
- **Integration Tests**:
  - Test the end-to-end flow of an agent running with mocked LLM responses.
- **Mocking**:
  - Mock `fetch` calls for LLM interactions.
  - Mock tool methods to isolate agent logic.

---

### 6. Documentation

- **TSDoc**:
  - Add TSDoc comments to all exported classes, methods, functions, and type definitions.
- **`README.md`**:
  - Update "Project Structure" section.
  - Update "Quick Start" and code examples.
  - Explain new configuration options.
- **Contribution Guide**: Consider adding `CONTRIBUTING.md`.

---

### 7. Build Process and Dependencies

- **`tsconfig.json`**:
  - Review and optimize settings for `outDir`, `rootDir`, `declaration: true`, `sourceMap: true`.
- **`package.json`**:
  - Add `main`, `module`, and `types` fields.
  - Add scripts for `build`, `lint`, `format`, `test`.
  - Review dependencies.

---

### 8. Phased Implementation (Suggested)

1.  **Setup & Basic TypeScript Enhancements**: ESLint, Prettier, `tsconfig.json` strictness, initial TSDoc.
2.  **Restructure Project**: New directories, move files, update imports, `src/index.ts` exports.
3.  **Refine Core Logic & Types**: Custom errors, `Agent` class error handling, move types.
4.  **Enhance Configuration**: Configurable LLM endpoint.
5.  **Testing**: Setup framework, write unit tests.
6.  **Documentation Update**: `README.md`, etc.
