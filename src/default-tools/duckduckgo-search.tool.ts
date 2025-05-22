import { search } from 'duck-duck-scrape';
import { z } from 'zod';
import { Tool } from '../final-answer.tool';

export const DuckSearchSchema = z.object({
  query: z.string(),
  maxResults: z.number().int().positive().max(10).optional().default(3),
});
export type DuckSearchArgs = z.infer<typeof DuckSearchSchema>;
export type DuckSearchOutput = Array<{ url: string }>;

export class DuckDuckGoSearchTool
  implements Tool<DuckSearchArgs, DuckSearchOutput>
{
  readonly name = 'duck_search';
  readonly description = 'Search the web via DuckDuckGo';
  readonly schema = DuckSearchSchema;

  async forward(args: DuckSearchArgs): Promise<DuckSearchOutput> {
    const { query, maxResults } = DuckSearchSchema.parse(args);
    const { results } = await search(query);
    return results.slice(0, maxResults).map((r) => ({ url: r.url }));
  }
}
