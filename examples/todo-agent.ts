import * as dotenv from 'dotenv';
dotenv.config();

import { model, tool } from '../src/decorators';
import { MultiStepAgent } from '../src/multiStepAgent';
import { z } from 'zod';

/**
 * Simple todo list agent illustrating tool-based state management.
 */
@model('openai/gpt-4.1-mini')
class TodoAgent extends MultiStepAgent<string> {
  private todos: string[] = [];

  @tool('Add a todo item', z.object({ item: z.string() }))
  add({ item }: { item: string }): string {
    this.todos.push(item);
    return `Added: ${item}`;
  }

  @tool('Remove a todo item by index', z.object({ index: z.number() }))
  remove({ index }: { index: number }): string {
    if (index < 0 || index >= this.todos.length) {
      return 'Invalid index';
    }
    const [removed] = this.todos.splice(index, 1);
    return `Removed: ${removed}`;
  }

  @tool('List all todo items', z.object({}))
  list(): string {
    return this.todos.join('\n');
  }
}

async function runDemo() {
  const agent = new TodoAgent();
  const task = 'Add buy milk and walk the dog. Then list items.';
  console.log(`❓ ${task}`);
  const result = await agent.run(task, { trace: true });
  console.log('✅ Final Answer:', result);
}

if (require.main === module) {
  runDemo();
}
