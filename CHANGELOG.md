# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-05-25

### Changed
- **BREAKING**: Complete architectural overhaul to modular design
- Replaced decorator-based patterns with composition-based architecture
- Introduced unified `Agent` class as the primary interface
- Removed CLI functionality - now a pure TypeScript framework
- Modernized tool system with standardized `Tool` interface
- Python integration now uses composition pattern instead of decorators

### Added
- Clean modular structure with separate layers (model/, agent/, tools/, react/)
- Tool registry system for dynamic tool discovery
- Default tools collection with `getDefaultTools()` function
- Comprehensive TypeScript types throughout
- Tool categories for better organization
- Abort signal support across all tools

### Removed
- Legacy agent classes (Agent, MultiStepAgent, ConfigurableAgent, TriageAgent)
- Decorator-based `@model` and `@tool` patterns
- CLI application and related infrastructure
- Legacy prompt engine (replaced by model layer)

### Improved
- Simplified API with minimal boilerplate
- Better error handling and type safety
- Cleaner separation of concerns
- More maintainable and extensible codebase

## [0.1.8] - 2024-12-20

- Initial release of tinyagent-ts
- Core agent framework functionality
- Tool execution system
- Memory management
- Built-in tools for web search, math operations, and more
- Example implementations including ReAct pattern, Todo list management, and Wiki summary
- Pure TypeScript framework for building AI agents
- Business Source License 1.1 with free usage for individuals and businesses under $1M annual revenue

