// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

console.log('🔑 Environment loaded, API Key available:', !!process.env.OPENROUTER_API_KEY);

import { Agent } from "../agent";
import { tool, model } from "../decorators";
import { z } from "zod";
import yahooFinance from "yahoo-finance2";          // npm i yahoo-finance2
import { search } from "duck-duck-scrape";          // npm i duck-duck-scrape
import fetch from "node-fetch";                     // npm i node-fetch@^2
import { JSDOM } from "jsdom";                      // npm i jsdom

// Duck-duck-scrape doesn't export its types, so we'll declare what we need
declare module 'duck-duck-scrape' {
  export function search(query: string, options?: { maxResults?: number; safeSearch?: boolean }): Promise<{ results: Array<{ url: string }> }>;
}

/* ─────────────────────────  TOOL DEFINITIONS  ───────────────────────── */

export class StockResearchTools {
  /* 1. Get latest quote ------------------------------------------------ */
  @tool(
    "Get the latest stock quote (price, change %, market cap)",
    z.object({ symbol: z.string() })
  )
  async stockQuote({ symbol }: { symbol: string }) {
    console.log('📈 Getting stock quote for:', symbol);
    const q = await yahooFinance.quote(symbol);
    console.log('📈 Stock data received:', { 
      symbol: q.symbol,
      price: q.regularMarketPrice,
      changePercent: q.regularMarketChangePercent,
      marketCap: q.marketCap
    });
    return {
      symbol: q.symbol,
      price: q.regularMarketPrice,
      changePercent: q.regularMarketChangePercent,
      marketCap: q.marketCap,
    };
  }

  /* 2. DuckDuckGo news search ------------------------------------------ */
  @tool(
    "DuckDuckGo search and return the URL of the top news result",
    z.object({
      query: z.string(),
    })
  )
  async topNewsUrl({ query }: { query: string }): Promise<string> {
    console.log('🔍 Searching for news about:', query);
    const { results } = await search(query, { maxResults: 5 });
    console.log('🔍 Search results received:', results.length, 'results');
    // pick first non-ad / non-Wikipedia
    const r = results.find((r) => !r.url.includes("wikipedia"));
    console.log('🔍 Selected news URL:', r?.url);
    return r?.url ?? "";
  }

  /* 3. Fetch raw page text --------------------------------------------- */
  @tool(
    "Download HTML and return plain text content",
    z.object({
      url: z.string().url(),
      maxLength: z.number().int().max(4_000).optional().default(2_500),
    })
  )
  async fetchPage({
    url,
    maxLength,
  }: {
    url: string;
    maxLength: number;
  }): Promise<string> {
    console.log('🌐 Fetching page content from:', url);
    console.log('🌐 Max content length:', maxLength);
    const res = await fetch(url);
    const html = await res.text();
    // very lightweight text extraction
    const dom = new JSDOM(html);
    const text = dom.window.document.body.textContent ?? "";
    const trimmedText = text.trim().slice(0, maxLength);
    console.log('🌐 Extracted text length:', trimmedText.length);
    return trimmedText;
  }
}

/* ────────────────────────  AGENT WIRING  ────────────────────────────── */

@model("mistralai/mistral-small-3.1-24b-instruct:free")
export class StockResearchAgent extends Agent {
  private tools: StockResearchTools;
  
  constructor() {
    console.log('🤖 Initializing StockResearchAgent');
    super();
    this.tools = new StockResearchTools();
    console.log('🤖 StockResearchAgent initialized with model:', this.getModelName());
  }
  
  @tool(
    "Get the latest stock quote (price, change %, market cap)",
    z.object({ symbol: z.string() })
  )
  async stockQuote(args: { symbol: string }) {
    console.log('💼 Agent.stockQuote called with args:', args);
    const result = await this.tools.stockQuote(args);
    console.log('💼 Agent.stockQuote result:', result);
    return result;
  }
  
  @tool(
    "DuckDuckGo search and return the URL of the top news result",
    z.object({ query: z.string() })
  )
  async topNewsUrl(args: { query: string }) {
    console.log('📰 Agent.topNewsUrl called with args:', args);
    const result = await this.tools.topNewsUrl(args);
    console.log('📰 Agent.topNewsUrl result:', result);
    return result;
  }
  
  @tool(
    "Download HTML and return plain text content",
    z.object({
      url: z.string().url(),
      maxLength: z.number().int().max(4_000).optional().default(2_500),
    })
  )
  async fetchPage(args: { url: string; maxLength: number }) {
    console.log('📚 Agent.fetchPage called with args:', args);
    const result = await this.tools.fetchPage(args);
    console.log('📚 Agent.fetchPage result length:', result.length);
    console.log('📚 Agent.fetchPage result preview:', result.substring(0, 100) + '...');
    return result;
  }
}

/* ─────────────────────────  QUICK DEMO  ─────────────────────────────── */

if (require.main === module) {
  (async () => {
    console.log('🔥 Starting StockResearch demo');
    const agent = new StockResearchAgent();
    try {
      const query = "Create a concise research note on AMC Entertainment (ticker AMC): " +
        "include current price info, percent change, market cap, and a one-paragraph " +
        "summary of the latest news article you find. Format your response as a JSON object with " +
        "'stockInformation' and 'latestNewsSummary' fields.";
      
      console.log('💬 Query to agent:', query);
      console.log('🕐 Starting agent.run() at', new Date().toLocaleTimeString());
      
      const answer = await agent.run(query);
      
      console.log('🕐 Finished agent.run() at', new Date().toLocaleTimeString());
      console.log('💾 Response type:', typeof answer);
      
      // Try to parse the response as JSON if it's a string
      let formattedAnswer = answer;
      if (typeof answer === 'string') {
        try {
          // Check if the answer contains a JSON code block
          const jsonMatch = answer.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            formattedAnswer = JSON.parse(jsonMatch[1]);
            console.log('💾 Extracted JSON from code block');
          } else if (answer.trim().startsWith('{') && answer.trim().endsWith('}')) {
            // Try to parse the entire string as JSON
            formattedAnswer = JSON.parse(answer);
            console.log('💾 Parsed entire response as JSON');
          }
        } catch (e) {
          console.log('💾 Could not parse as JSON, using raw string');
        }
      }
      
      console.log("\n=== GENERATED REPORT ===\n" + JSON.stringify(formattedAnswer, null, 2));
    } catch (error) {
      console.error("\n💥 Error running agent:\n", error);
    }
  })();
}
