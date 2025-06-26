import { search, SafeSearchType } from 'duck-duck-scrape';
import { z } from 'zod';
import { Tool } from '../final-answer.tool';

// Define proper types based on duck-duck-scrape documentation
interface SearchResult {
  title: string;
  url: string;
  description?: string;
}

interface DuckSearchResponse {
  noResults: boolean;
  vqd: string;
  results: SearchResult[];
}

export const DuckSearchSchema = z.object({
  query: z.string(),
  maxResults: z.number().int().positive().max(10).optional().default(3),
  safeSearch: z
    .enum(['strict', 'moderate', 'off'])
    .optional()
    .default('moderate'),
});

export type DuckSearchArgs = z.infer<typeof DuckSearchSchema>;
export type DuckSearchOutput = Array<{ url: string; title?: string }>;

export class DuckDuckGoSearchTool
  implements Tool<DuckSearchArgs, DuckSearchOutput>
{
  readonly name = 'duck_search';
  readonly description =
    'Search the web via DuckDuckGo with safe search options';
  readonly schema = DuckSearchSchema;

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

  async forward(args: DuckSearchArgs): Promise<DuckSearchOutput> {
    const { query, maxResults, safeSearch } = DuckSearchSchema.parse(args);

    const maxAttempts = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const searchOptions = {
          safeSearch: this.getSafeSearchType(safeSearch),
        };

        const response: DuckSearchResponse = await search(query, searchOptions);

        if (
          response.noResults ||
          !response.results ||
          response.results.length === 0
        ) {
          throw new Error(`No search results found for query: "${query}"`);
        }

        const filteredResults = response.results
          .slice(0, maxResults)
          .map((r) => ({
            url: r.url,
            title: r.title,
          }));

        return filteredResults;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxAttempts) {
          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    // If we reach here, all attempts failed
    const errorMessage = `DuckDuckGo search failed after ${maxAttempts} attempts for query "${query}". ${lastError?.message || 'Unknown error'}. Try rephrasing your search or using a different query.`;
    throw new Error(errorMessage);
  }
}
