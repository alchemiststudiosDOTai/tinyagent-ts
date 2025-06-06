import { Tool } from './types';
import { FinalAnswerTool } from './final-answer';
import { FileTool } from './file-tool';
import { GrepTool } from './grep-tool';
import { UuidTool } from './uuid-tool';
import { HumanLoopTool } from './human-loop-tool';
import { WebSearchTool } from './web-search-tool';
import { pythonExecTool } from './pythonExec';

/**
 * Default tool instances
 */
export const defaultTools = {
  finalAnswer: new FinalAnswerTool(),
  file: new FileTool(),
  grep: new GrepTool(),
  uuid: new UuidTool(),
  humanLoop: new HumanLoopTool(),
  webSearch: new WebSearchTool(),
  python: pythonExecTool,
} as const;

/**
 * Get all default tools as an array
 */
export interface GetDefaultToolsOptions {
  includeFinalAnswer?: boolean;
}

export function getDefaultTools(options?: GetDefaultToolsOptions): Tool[] {
  const opts = options ?? {};
  const tools = Object.values(defaultTools);
  if (opts.includeFinalAnswer) return tools;
  return tools.filter(t => t.name !== 'final_answer');
}

/**
 * Get default tools by category
 */
export const defaultToolCategories = {
  filesystem: [defaultTools.file, defaultTools.grep],
  utility: [defaultTools.uuid],
  search: [defaultTools.webSearch],
  interaction: [defaultTools.humanLoop],
  completion: [defaultTools.finalAnswer],
  execution: [defaultTools.python],
} as const;

/**
 * Get tools by category
 */
export function getToolsByCategory(category: keyof typeof defaultToolCategories): Tool[] {
  return [...defaultToolCategories[category]];
}

/**
 * Get all categories
 */
export function getToolCategories(): (keyof typeof defaultToolCategories)[] {
  return Object.keys(defaultToolCategories) as (keyof typeof defaultToolCategories)[];
} 