# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-01-06

### Changed
- **BREAKING**: Replaced DuckDuckGo search with Brave Search API for web search tool
  - The `web-search` tool now uses Brave Search API instead of DuckDuckGo scraping
  - Requires `BRAVE_API_KEY` environment variable to be set
  - Improved reliability and performance with official API support
  - Better structured results with consistent formatting

### Added
- Comprehensive test suite for WebSearchTool with mocked API responses
- Support for customizable result count (1-20 results)
- Proper error handling for API failures and network issues

### Removed
- Removed `duck-duck-scrape` dependency
- Removed DuckDuckGoSearchTool implementation

## [0.2.0] - 2024-05-25

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

