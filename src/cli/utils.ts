import * as fs from 'fs/promises';
import * as path from 'path';
import { ToolPresets } from '../toolPresets';

export async function readPrompt(promptPath: string | undefined): Promise<string | undefined> {
  if (!promptPath) return undefined;
  
  try {
    const fullPath = path.resolve(promptPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return content.trim();
  } catch (error) {
    throw new Error(`Failed to read prompt file "${promptPath}": ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadToolPreset(preset: string): any[] {
  switch (preset.toLowerCase()) {
    case 'all':
      return ToolPresets.all();
    case 'basic':
      return ToolPresets.basic();
    case 'search':
      return ToolPresets.search();
    case 'none':
      return [];
    default:
      throw new Error(`Unknown tool preset: ${preset}. Available: all, basic, search, none`);
  }
}

export async function loadCustomTools(toolsFile: string): Promise<any[]> {
  try {
    const fullPath = path.resolve(toolsFile);
    
    // Check if file exists
    await fs.access(fullPath);
    
    // Dynamically import the module
    const toolsModule = await import(fullPath);
    
    // Support both default export and named exports
    const tools = toolsModule.default || toolsModule.tools || toolsModule;
    
    if (!Array.isArray(tools)) {
      throw new Error('Tools file must export an array of tools or have a "tools" property that is an array');
    }
    
    // Validate tool structure
    for (const tool of tools) {
      if (!tool.name || !tool.description || typeof tool.execute !== 'function') {
        throw new Error(`Invalid tool structure. Each tool must have: name, description, and execute function`);
      }
    }
    
    return tools;
  } catch (error) {
    throw new Error(`Failed to load custom tools from "${toolsFile}": ${error instanceof Error ? error.message : String(error)}`);
  }
} 