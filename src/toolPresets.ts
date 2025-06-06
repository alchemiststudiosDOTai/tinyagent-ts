import { FileTool } from './default-tools/file.tool';
import { GrepTool } from './default-tools/grep.tool';
import { WebSearchTool } from './default-tools/web-search.tool';
import { UuidTool } from './default-tools/uuid.tool';

export const ToolPresets = {
  all: () => [
    new FileTool(),
    new GrepTool(),
    new WebSearchTool(),
    new UuidTool(),
  ],
  basic: () => [
    new FileTool(),
    new UuidTool(),
  ],
  search: () => [
    new FileTool(),
    new UuidTool(),
    new WebSearchTool(),
  ],
  none: () => [],
};
