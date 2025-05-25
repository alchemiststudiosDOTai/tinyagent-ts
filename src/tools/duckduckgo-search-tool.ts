import { search, SafeSearchType } from 'duck-duck-scrape';
import { z } from 'zod';
import { BaseTool } from './types';

/**
 * Search result interface
 */
interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

/**
 * DuckDuckGo search response interface
 */
interface DuckSearchResponse {
  noResults: boolean;
  vqd: string;
  results: SearchResult[];
}

/**
 * Schema for DuckDuckGo search operations
 */
export const DuckDuckGoSearchToolSchema = z.object({
  query: z.string().describe('The search query'),
  maxResults: z.number().int().positive().max(10).default(3).describe('Maximum number of results to return'),
  safeSearch: z.enum(['strict', 'moderate', 'off']).default('moderate').describe('Safe search level'),
});

export type DuckDuckGoSearchToolArgs = z.infer<typeof DuckDuckGoSearchToolSchema>;

/**
 * Result interface for search results
 */
export interface DuckDuckGoSearchResult {
  url: string;
  title: string;
  description?: string;
}

/**
 * DuckDuckGo web search tool
 */
export class DuckDuckGoSearchTool extends BaseTool {
  name = 'duck_search';
  description = 'Search the web via DuckDuckGo with safe search options';
  schema = DuckDuckGoSearchToolSchema;

  private getSafeSearchType(level: string): SafeSearchType {
    switch (level) {
      case 'strict':
        return SafeSearchType.STRICT;
      case 'off':
        return SafeSearchType.OFF;
      case 'moderate':
      default:
        return SafeSearchType.MODERATE;
    }
  }

  async execute(args: DuckDuckGoSearchToolArgs, abortSignal?: AbortSignal): Promise<DuckDuckGoSearchResult[]> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { query, maxResults, safeSearch } = this.validateArgs(args);
    
    const maxAttempts = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (abortSignal?.aborted) {
        throw new Error('Operation was aborted');
      }

      try {
        const searchOptions = {
          safeSearch: this.getSafeSearchType(safeSearch),
        };
        
        const response: DuckSearchResponse = await search(query, searchOptions);
        
        if (abortSignal?.aborted) {
          throw new Error('Operation was aborted');
        }
        
        if (response.noResults || !response.results || response.results.length === 0) {
          throw new Error(`No search results found for query: "${query}"`);
        }
        
        const filteredResults: DuckDuckGoSearchResult[] = response.results
          .slice(0, maxResults)
          .map((r) => ({ 
            url: r.url,
            title: r.title,
            description: r.description 
          }));
        
        return filteredResults;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (abortSignal?.aborted) {
          throw new Error('Operation was aborted');
        }
        
        if (attempt < maxAttempts) {
          // Wait a bit before retrying
          await new Promise(resolve => {
            const timeout = setTimeout(resolve, 1000);
            if (abortSignal) {
              abortSignal.addEventListener('abort', () => {
                clearTimeout(timeout);
                resolve(undefined);
              });
            }
          });
          continue;
        }
      }
    }
    
    // If we reach here, all attempts failed
    const errorMessage = `DuckDuckGo search failed after ${maxAttempts} attempts for query "${query}". ${lastError?.message || 'Unknown error'}. Try rephrasing your search or using a different query.`;
    throw new Error(errorMessage);
  }
} 