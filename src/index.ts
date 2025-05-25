// New modular architecture exports
export { ModelManager, OpenRouterProvider } from './model';
export { LLMMessage, ModelConfig, ModelResponse, ModelProvider, ModelError } from './model/types';
export { UnifiedAgent } from './agent/unified-agent';
export { AgentConfig, AgentExecutionOptions, AgentResult, AgentMode, AgentGenerationError } from './agent/types';
export { StandardToolRegistry, Tool, BaseTool, FinalAnswerTool } from './tools';
export { ReActEngine, ReActStateManager, parseReActResponse, validateFinalAnswer, FinalAnswerSchema } from './react';
export { ReActConfig, ReActResult, ReActTool, ActionStep, ReActStep } from './react/types';

// Main agent export (unified agent as the primary Agent)
export { UnifiedAgent as Agent } from './agent/unified-agent';

// Tool exports for convenience
export { defaultTools, getDefaultTools } from './tools/default-tools';
export * as DefaultTools from './tools/default-tools';

// Convenience type aliases
export { StandardToolRegistry as ToolRegistry } from './tools';

// Utility exports (keeping existing utilities)
export * from './schemas';
export * from './utils/steps';
export { Scratchpad } from './utils/scratchpad';

// Specialized tools
export { pythonExecTool } from './tools/pythonExec';
