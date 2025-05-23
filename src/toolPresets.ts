import { FileTool } from './default-tools/file.tool';
import { GrepTool } from './default-tools/grep.tool';
import { DuckDuckGoSearchTool } from './default-tools/duckduckgo-search.tool';
import { HumanLoopTool } from './default-tools/human-loop.tool';
import { UuidTool } from './default-tools/uuid.tool';

export const ToolPresets = {
  all: () => [
    new FileTool(),
    new GrepTool(),
    new DuckDuckGoSearchTool(),
    new HumanLoopTool(),
    new UuidTool(),
  ],
  basic: () => [
    new FileTool(),
    new UuidTool(),
  ],
  search: () => [
    new FileTool(),
    new UuidTool(),
    new DuckDuckGoSearchTool(),
  ],
  none: () => [],
};
