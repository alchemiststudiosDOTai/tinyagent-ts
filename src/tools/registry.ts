import { Tool, ToolRegistry, ToolMetadata } from './types';
import { formatZodSchemaForPrompt, extractZodSchemaExamples } from '../utils/schema-formatter';

/**
 * Standard implementation of the tool registry
 */
export class StandardToolRegistry implements ToolRegistry {
  private tools = new Map<string, Tool>();
  private metadata = new Map<string, ToolMetadata>();

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool with name '${tool.name}' is already registered`);
    }
    
    this.tools.set(tool.name, tool);
    this.metadata.set(tool.name, {
      name: tool.name,
      description: tool.description,
      schema: tool.schema,
    });
  }

  unregister(name: string): void {
    this.tools.delete(name);
    this.metadata.delete(name);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): Tool[] {
    const result: Tool[] = [];
    for (const [name, meta] of this.metadata.entries()) {
      if (meta.category === category) {
        const tool = this.tools.get(name);
        if (tool) {
          result.push(tool);
        }
      }
    }
    return result;
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get metadata for a tool
   */
  getMetadata(name: string): ToolMetadata | undefined {
    return this.metadata.get(name);
  }

  /**
   * Get all tool metadata
   */
  getAllMetadata(): ToolMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Register a tool with additional metadata
   */
  registerWithMetadata(tool: Tool, metadata: Partial<ToolMetadata>): void {
    this.register(tool);
    
    const fullMetadata: ToolMetadata = {
      name: tool.name,
      description: tool.description,
      schema: tool.schema,
      ...metadata,
    };
    
    this.metadata.set(tool.name, fullMetadata);
  }

  /**
   * Create a StandardToolRegistry from an object of tools
   */
  static fromTools(toolsObj: Record<string, Tool>): StandardToolRegistry {
    const registry = new StandardToolRegistry();
    for (const key in toolsObj) {
      if (Object.prototype.hasOwnProperty.call(toolsObj, key)) {
        registry.register(toolsObj[key]);
      }
    }
    return registry;
  }

  /**
   * Get tools catalog as string for LLM prompts
   */
  getCatalog(): string {
    return this.getAll()
      .map(tool => {
        const schemaStr = formatZodSchemaForPrompt(tool.schema);
        const examples = extractZodSchemaExamples(tool.schema);
        const exampleStr = Object.keys(examples).length > 0 
          ? ` Example: ${JSON.stringify(examples)}`
          : '';
        
        return `- ${tool.name}(${schemaStr}): ${tool.description}${exampleStr}`;
      })
      .join('\n');
  }

  /**
   * Get detailed tools catalog with full schema information
   */
  getDetailedCatalog(): string {
    return this.getAll()
      .map(tool => {
        const schemaStr = formatZodSchemaForPrompt(tool.schema);
        const examples = extractZodSchemaExamples(tool.schema);
        
        let result = `## ${tool.name}\n`;
        result += `**Description:** ${tool.description}\n`;
        result += `**Parameters:** ${schemaStr}\n`;
        
        if (Object.keys(examples).length > 0) {
          result += `**Example Usage:** \`${tool.name}(${JSON.stringify(examples)})\`\n`;
        }
        
        return result;
      })
      .join('\n\n');
  }

  /**
   * Get legacy catalog format (name + description only)
   */
  getLegacyCatalog(): string {
    return this.getAll()
      .map(tool => `- ${tool.name}: ${tool.description}`)
      .join('\n');
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.tools.clear();
    this.metadata.clear();
  }

  /**
   * Get tool count
   */
  size(): number {
    return this.tools.size;
  }
} 