import { Tool } from './types';
import { FinalAnswerTool } from './final-answer';
import { FileTool } from './file-tool';
import { GrepTool } from './grep-tool';
import { UuidTool } from './uuid-tool';
import { HumanLoopTool } from './human-loop-tool';
import { DuckDuckGoSearchTool } from './duckduckgo-search-tool';

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
} as const;

/**
 * Get all default tools as an array
 */
export function getDefaultTools(): Tool[] {
  return Object.values(defaultTools);
}

/**
 * Get default tools by category
 */
export const defaultToolCategories = {
  filesystem: [defaultTools.file, defaultTools.grep],
  utility: [defaultTools.uuid],
  search: [defaultTools.duckSearch],
  interaction: [defaultTools.humanLoop],
  completion: [defaultTools.finalAnswer],
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