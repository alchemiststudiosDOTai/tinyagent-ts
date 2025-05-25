# Tool Development Guide

## Philosophy & Design Principles

The TinyAgent framework uses a **composition-based tool architecture** that prioritizes modularity, reusability, and type safety. This approach moved away from decorator-based inheritance to enable better framework design.

### Why Composition Over Decorators?

**Before (Decorator-Based)**:
```typescript
@model('gpt-4')
class MathAgent extends Agent {
  @tool('Add numbers', schema)
  add({a, b}) { return a + b; }
}
// Tools tied to specific agent classes
```

**After (Composition-Based)**:
```typescript
const mathTool = {
  name: 'add_numbers',
  description: 'Add two numbers',
  schema: z.object({a: z.number(), b: z.number()}),
  execute: async ({a, b}) => a + b
};
// Tools are reusable across any agent
```

**Benefits of the New Approach**:
- ✅ **Reusability**: Tools work with any agent
- ✅ **Modularity**: Each tool is independently testable
- ✅ **Framework-first**: Better for library integration
- ✅ **Type Safety**: Explicit interfaces with TypeScript
- ✅ **Flexibility**: Mix and match tools easily

## Tool Architecture

### Modern Tool Interface

All tools implement the standard `Tool` interface:

```typescript
interface Tool {
  name: string;                                    // Unique identifier
  description: string;                             // Human-readable purpose
  schema: z.ZodSchema<any>;                       // Input validation
  execute(args: any, abortSignal?: AbortSignal): Promise<any>;  // Implementation
}
```

### BaseTool Class

For consistency and best practices, extend the `BaseTool` class:

```typescript
import { BaseTool } from '../src/tools/types';
import { z } from 'zod';

export class MyTool extends BaseTool {
  name = 'my-tool';
  description = 'Clear description of what this tool does';
  schema = MyToolSchema;

  async execute(args: MyToolArgs, abortSignal?: AbortSignal): Promise<string> {
    // Implementation here
  }
}
```

## Best Practices for Tool Development

### 1. Schema-First Design

Always define your schema first with descriptive field documentation:

```typescript
const WeatherToolSchema = z.object({
  location: z.string().describe('City name or location to get weather for'),
  units: z.enum(['celsius', 'fahrenheit']).default('celsius').describe('Temperature units'),
  includeHourly: z.boolean().default(false).describe('Include hourly forecast')
});

type WeatherToolArgs = z.infer<typeof WeatherToolSchema>;
```

### 2. Robust Error Handling

Handle errors gracefully and provide meaningful messages:

```typescript
async execute(args: WeatherToolArgs, abortSignal?: AbortSignal): Promise<string> {
  // 1. Validate arguments first
  const { location, units, includeHourly } = this.validateArgs(args);
  
  // 2. Check for cancellation
  if (abortSignal?.aborted) {
    throw new Error('Weather request was cancelled');
  }
  
  try {
    // 3. Implementation with periodic abort checks
    const response = await fetch(`https://api.weather.com/${location}`);
    
    if (abortSignal?.aborted) {
      throw new Error('Weather request was cancelled');
    }
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.formatWeatherData(data, units, includeHourly);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Weather request was cancelled');
    }
    throw new Error(`Failed to get weather data: ${error.message}`);
  }
}
```

### 3. Abort Signal Support

Always support cancellation for long-running operations:

```typescript
async execute(args: ToolArgs, abortSignal?: AbortSignal): Promise<string> {
  // Check before starting
  if (abortSignal?.aborted) {
    throw new Error('Operation was cancelled');
  }
  
  // Check during loops
  for (const item of items) {
    if (abortSignal?.aborted) {
      throw new Error('Operation was cancelled');
    }
    await processItem(item);
  }
  
  // Use with fetch/axios
  const response = await fetch(url, { signal: abortSignal });
}
```

### 4. Naming Conventions

Follow consistent naming patterns:

```typescript
// Tool names: kebab-case
name = 'weather-forecast';
name = 'file-manager';
name = 'code-search';

// Schema names: PascalCase + ToolSchema suffix
const WeatherForecastToolSchema = z.object({...});
const FileManagerToolSchema = z.object({...});

// Type names: PascalCase + ToolArgs suffix
type WeatherForecastToolArgs = z.infer<typeof WeatherForecastToolSchema>;
```

## Complete Tool Example

Here's a fully implemented tool following all best practices:

```typescript
import { BaseTool } from '../src/tools/types';
import { z } from 'zod';

// 1. Define schema with descriptions
const CalculatorToolSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('Mathematical operation to perform'),
  a: z.number().describe('First number'),
  b: z.number().describe('Second number'),
  precision: z.number().min(0).max(10).default(2)
    .describe('Number of decimal places in result')
});

type CalculatorToolArgs = z.infer<typeof CalculatorToolSchema>;

// 2. Implement tool class
export class CalculatorTool extends BaseTool {
  name = 'calculator';
  description = 'Perform basic mathematical operations with configurable precision';
  schema = CalculatorToolSchema;

  async execute(args: CalculatorToolArgs, abortSignal?: AbortSignal): Promise<string> {
    // 3. Validate and extract arguments
    const { operation, a, b, precision } = this.validateArgs(args);
    
    // 4. Check for cancellation
    if (abortSignal?.aborted) {
      throw new Error('Calculation was cancelled');
    }
    
    // 5. Implement business logic with error handling
    let result: number;
    
    try {
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          if (b === 0) {
            throw new Error('Division by zero is not allowed');
          }
          result = a / b;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      // 6. Format result
      const formatted = result.toFixed(precision);
      return `${a} ${this.getOperatorSymbol(operation)} ${b} = ${formatted}`;
      
    } catch (error) {
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }
  
  // 7. Helper methods for clean code
  private getOperatorSymbol(operation: string): string {
    const symbols = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
    return symbols[operation as keyof typeof symbols] || operation;
  }
}
```

## Tool Registration and Usage

### Basic Registration

```typescript
import { Agent, getDefaultTools } from 'tinyagent-ts';
import { CalculatorTool } from './tools/calculator-tool';

const agent = new Agent({
  model: { name: 'your-model' },
  mode: 'react'
});

// Register default tools (excluding final_answer which auto-registers)
const defaultTools = getDefaultTools().filter(tool => tool.name !== 'final_answer');
defaultTools.forEach(tool => agent.registerTool(tool));

// Register custom tool
agent.registerTool(new CalculatorTool());

// Use the agent
const result = await agent.execute('Calculate 15.5 × 23.7 with 3 decimal places');
```

### Advanced Registration with Metadata

```typescript
import { StandardToolRegistry } from 'tinyagent-ts';

const registry = new StandardToolRegistry();

// Register with metadata for better organization
registry.registerWithMetadata(new CalculatorTool(), {
  category: 'mathematics',
  tags: ['arithmetic', 'calculator', 'numbers'],
  version: '1.0.0'
});

// Query tools by category
const mathTools = registry.getByCategory('mathematics');
console.log('Math tools:', mathTools.map(t => t.name));
```

## Testing Tools

Create comprehensive tests for your tools:

```typescript
import { CalculatorTool } from './calculator-tool';

describe('CalculatorTool', () => {
  let tool: CalculatorTool;
  
  beforeEach(() => {
    tool = new CalculatorTool();
  });
  
  it('should add numbers correctly', async () => {
    const result = await tool.execute({ operation: 'add', a: 5, b: 3 });
    expect(result).toBe('5 + 3 = 8.00');
  });
  
  it('should handle division by zero', async () => {
    await expect(tool.execute({ operation: 'divide', a: 10, b: 0 }))
      .rejects.toThrow('Division by zero is not allowed');
  });
  
  it('should respect precision setting', async () => {
    const result = await tool.execute({ 
      operation: 'divide', a: 1, b: 3, precision: 4 
    });
    expect(result).toBe('1 ÷ 3 = 0.3333');
  });
  
  it('should handle abort signals', async () => {
    const controller = new AbortController();
    controller.abort();
    
    await expect(tool.execute({ operation: 'add', a: 1, b: 2 }, controller.signal))
      .rejects.toThrow('Calculation was cancelled');
  });
});
```

## Common Patterns

### File System Tools
```typescript
// Handle paths safely
const safePath = path.resolve(args.path);
if (!safePath.startsWith(process.cwd())) {
  throw new Error('Path must be within current directory');
}
```

### Network Tools
```typescript
// Always use timeouts and abort signals
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(url, { 
    signal: AbortSignal.any([abortSignal, controller.signal])
  });
} finally {
  clearTimeout(timeoutId);
}
```

### Data Processing Tools
```typescript
// Stream large data sets
async processLargeDataset(items: any[], abortSignal?: AbortSignal) {
  const results = [];
  
  for (let i = 0; i < items.length; i++) {
    if (i % 100 === 0 && abortSignal?.aborted) {
      throw new Error('Processing was cancelled');
    }
    
    results.push(await processItem(items[i]));
  }
  
  return results;
}
```

## Migration from Legacy Tools

If you have existing decorator-based tools, here's how to migrate:

### Before (Legacy)
```typescript
@model('gpt-4')
class MathAgent extends Agent {
  @tool('Add numbers', z.object({ a: z.number(), b: z.number() }))
  add({ a, b }: { a: number; b: number }) {
    return `${a} + ${b} = ${a + b}`;
  }
}
```

### After (Modern)
```typescript
const addTool = {
  name: 'add_numbers',
  description: 'Add two numbers together',
  schema: z.object({
    a: z.number().describe('First number'),
    b: z.number().describe('Second number')
  }),
  execute: async ({ a, b }: { a: number; b: number }) => {
    return `${a} + ${b} = ${a + b}`;
  }
};

const agent = new Agent({ model: { name: 'gpt-4' }, mode: 'react' });
agent.registerTool(addTool);
```

## Summary

The new tool architecture prioritizes:

1. **Modularity**: Tools are independent, reusable components
2. **Type Safety**: Full TypeScript support with Zod validation
3. **Error Handling**: Robust error patterns and abort signal support  
4. **Developer Experience**: Clear interfaces and helpful base classes
5. **Framework Design**: Built as a pure TypeScript library for seamless integration

This approach enables building powerful, maintainable agent frameworks that can scale from simple scripts to complex applications.