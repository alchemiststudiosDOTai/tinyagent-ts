// New modular architecture exports
export { ModelManager, OpenRouterProvider } from './model';
export { LLMMessage, ModelConfig, ModelResponse, ModelProvider, ModelError } from './model/types';
export { UnifiedAgent } from './agent/unified-agent';
export { AgentConfig, AgentExecutionOptions, AgentResult, AgentMode } from './agent/types';
export { StandardToolRegistry, Tool, BaseTool, FinalAnswerTool } from './tools';
export { ReActEngine, ReActStateManager, parseReActResponse } from './react';
export { ReActConfig, ReActResult, ReActTool, ActionStep, ReActStep } from './react/types';

// Legacy exports for backward compatibility
export { Agent as LegacyBaseAgent } from './agent';
export { MultiStepAgent } from './multiStepAgent';
export { ConfigurableAgent } from './configurableAgent';
export { TriageAgent } from './triageAgent';

// Main agent export (new unified agent)
export { UnifiedAgent as Agent } from './agent/unified-agent';

// Convenience type aliases
export { StandardToolRegistry as ToolRegistry } from './tools'; 