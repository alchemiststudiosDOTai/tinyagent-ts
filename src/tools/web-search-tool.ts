import { BaseTool } from './types';
import { z } from 'zod';

// ---------- schema ----------
const WebSearchSchema = z.object({
  query: z.string()
          .min(2, 'Query must be at least 2 characters')
          .describe('The search term'),
  count: z.number()
          .int()
          .min(1)
          .max(20)
          .default(10)
          .describe('How many results to return (1-20)')
});

type WebSearchArgs = z.infer<typeof WebSearchSchema>;

// ---------- tool ----------
export class WebSearchTool extends BaseTool {
  name = 'web-search';
  description = 'Search the web and return a markdown list of results (title, URL, snippet).';
  schema = WebSearchSchema;

  private endpoint = 'https://api.search.brave.com/res/v1/web/search';
  private apiKey = process.env.BRAVE_API_KEY ?? '';

  async execute(
    args: WebSearchArgs,
    abortSignal?: AbortSignal
  ): Promise<string> {
    // 1. validate + early cancel
    const { query, count } = this.validateArgs(args);
    if (abortSignal?.aborted) throw new Error('Search was cancelled');

    // 2. fetch results
    const url = new URL(this.endpoint);
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(count));

    const res = await fetch(url.toString(), {
      headers: { 'X-Subscription-Token': this.apiKey },
      signal: abortSignal
    });
    
    if (!res.ok) {
      throw new Error(`Brave API error ${res.status}`);
    }
    
    const data: any = await res.json();

    // 3. extract
    const list: { title: string; url: string; desc?: string }[] =
      (data.web?.results as any[])?.map((r: any) => ({
        title: r.title,
        url: r.url,
        desc: r.description ?? ''
      })) ?? [];

    // 4. format
    if (!list.length) return 'No results found.';
    
    return (
      '## Search Results\n\n' +
      list
        .slice(0, count)
        .map(
          (r, i) =>
            `${i + 1}. [${r.title}](${r.url})\n${r.desc?.trim() ?? ''}`
        )
        .join('\n\n')
    );
  }
}