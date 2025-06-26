import { Tool } from './types';
import { FinalAnswerTool } from './final-answer';
import { FileTool } from './file-tool';
import { GrepTool } from './grep-tool';
import { UuidTool } from './uuid-tool';
import { HumanLoopTool } from './human-loop-tool';
import { DuckDuckGoSearchTool } from './duckduckgo-search-tool';
import { pythonExecTool } from './pythonExec';
import { getBrowserTools } from './browser-tools';

/**
 * Default tool instances
 */
export const defaultTools = {
  finalAnswer: new FinalAnswerTool(),
  file: new FileTool(),
  grep: new GrepTool(),
  uuid: new UuidTool(),
  humanLoop: new HumanLoopTool(),
  duckSearch: new DuckDuckGoSearchTool(),
  python: pythonExecTool,
  ...Object.fromEntries(getBrowserTools().map(tool => [tool.name.replace(/_/g, ''), tool])),
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
  search: [defaultTools.duckSearch, defaultTools.websearch],
  interaction: [defaultTools.humanLoop],
  completion: [defaultTools.finalAnswer],
  execution: [defaultTools.python],
  browser: [
    defaultTools.visitpage,
    defaultTools.pagedown,
    defaultTools.pageup,
    defaultTools.findonpagectrlf,
    defaultTools.findnext
  ],
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