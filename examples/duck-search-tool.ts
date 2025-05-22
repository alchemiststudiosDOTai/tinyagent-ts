import * as dotenv from 'dotenv';
dotenv.config();

import { z } from 'zod';
import { model, tool } from '../src/decorators';
import { Agent } from '../src/agent';
import { DuckDuckGoSearchTool } from '../src/default-tools';

/**
 * DuckSearchAgent demonstrates how to use the DuckDuckGoSearchTool to search the web.
 */
@model('openai/gpt-4.1-nano')
export class DuckSearchAgent extends Agent<string> {
  private duckSearchTool = new DuckDuckGoSearchTool();

  @tool('Search the web via DuckDuckGo', z.object({
    query: z.string(),
    maxResults: z.number().int().positive().max(10).optional().default(3)
  }))
  async search(args: { query: string, maxResults?: number }) {
    const results = await this.duckSearchTool.forward({
      query: args.query,
      maxResults: args.maxResults ?? 3
    });
    if (results.length === 0) {
      return 'No results found';
    }
    
    return `Found ${results.length} results:\n${results.map((r, i) => `${i + 1}. ${r.url}`).join('\n')}`;
  }
}

async function runDuckSearchAgentDemo() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('\ud83d\uded1 Error: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  console.log('\ud83d\udd0e Running Simplified DuckSearchAgent Demo...');
  console.log('This example shows a direct call to the search method with maxResults = 2\n');

  // Simplified example - direct call to search method
  try {
    const agent = new DuckSearchAgent();
    const result = await agent.search({ 
      query: "tinyagnent.xyz", 
      maxResults: 2 
    });
    console.log(`\u2705 Search Results:\n${result}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\u274c Error: ${message}\n`);
  }
}

if (require.main === module) {
  runDuckSearchAgentDemo();
}
