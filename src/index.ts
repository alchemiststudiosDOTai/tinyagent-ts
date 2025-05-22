// Core exports for building agents
export { Agent } from './agent';
export type { LLMMessage } from './agent';
export { model, tool } from './decorators';
export type { ToolMetadata } from './decorators';
export {
  FinalAnswerTool,
  FinalAnswerArgs,
  FinalAnswerOutput,
} from './final-answer.tool';

// Export all tools individually in addition to the namespace
export * as DefaultTools from './default-tools';
export { 
  DuckDuckGoSearchTool,
  FileTool,
  GrepTool,
  HumanLoopTool,
  UuidTool
} from './default-tools';

// ReAct pattern implementation
export { MultiStepAgent } from './multiStepAgent';
export { runMultiStep } from './runMultiStep';
export { Scratchpad } from './utils/scratchpad';

// Specialized tools
export { PythonExec } from './tools/pythonExec';

// Utility exports
export * from './schemas';
export * from './utils/steps';
