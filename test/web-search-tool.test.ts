import { WebSearchTool } from '../src/tools/web-search-tool';

// Mock global fetch
global.fetch = jest.fn();

describe('WebSearchTool', () => {
  let tool: WebSearchTool;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    // Set mock API key
    process.env.BRAVE_API_KEY = 'test-api-key';
    tool = new WebSearchTool();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.BRAVE_API_KEY;
  });

  it('should have correct metadata', () => {
    expect(tool.name).toBe('web-search');
    expect(tool.description).toBe('Search the web and return a markdown list of results (title, URL, snippet).');
  });

  it('should return formatted search results', async () => {
    const mockResponse = {
      web: {
        results: [
          {
            title: 'TypeScript Documentation',
            url: 'https://www.typescriptlang.org/',
            description: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.'
          },
          {
            title: 'Getting Started with TypeScript',
            url: 'https://www.typescriptlang.org/docs/',
            description: 'Learn TypeScript step by step with our comprehensive guide.'
          }
        ]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await tool.execute({ query: 'TypeScript', count: 2 });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.search.brave.com/res/v1/web/search?q=TypeScript&count=2',
      {
        headers: { 'X-Subscription-Token': 'test-api-key' },
        signal: undefined
      }
    );

    expect(result).toBe(
      '## Search Results\n\n' +
      '1. [TypeScript Documentation](https://www.typescriptlang.org/)\n' +
      'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.\n\n' +
      '2. [Getting Started with TypeScript](https://www.typescriptlang.org/docs/)\n' +
      'Learn TypeScript step by step with our comprehensive guide.'
    );
  });

  it('should handle empty results', async () => {
    const mockResponse = {
      web: {
        results: []
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await tool.execute({ query: 'nonexistent query', count: 10 });
    expect(result).toBe('No results found.');
  });

  it('should handle missing web results', async () => {
    const mockResponse = {};

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await tool.execute({ query: 'test query', count: 10 });
    expect(result).toBe('No results found.');
  });

  it('should throw error on API failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    } as Response);

    await expect(tool.execute({ query: 'test query', count: 10 }))
      .rejects.toThrow('Brave API error 401');
  });

  it('should respect abort signal', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(tool.execute({ query: 'test query', count: 10 }, controller.signal))
      .rejects.toThrow('Search was cancelled');
  });

  it('should use default count when not specified via schema', async () => {
    const mockResponse = {
      web: {
        results: Array(15).fill(null).map((_, i) => ({
          title: `Result ${i + 1}`,
          url: `https://example.com/${i + 1}`,
          description: `Description ${i + 1}`
        }))
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    // Test that the schema applies the default value
    const args = tool.schema.parse({ query: 'test' });
    expect(args.count).toBe(10);

    const result = await tool.execute(args);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.search.brave.com/res/v1/web/search?q=test&count=10',
      expect.any(Object)
    );

    // Should only return 10 results (default count)
    const resultCount = (result.match(/^\d+\./gm) || []).length;
    expect(resultCount).toBe(10);
  });

  it('should handle results without descriptions', async () => {
    const mockResponse = {
      web: {
        results: [
          {
            title: 'No Description Result',
            url: 'https://example.com',
            // description field missing
          }
        ]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await tool.execute({ query: 'test', count: 1 });

    expect(result).toBe(
      '## Search Results\n\n' +
      '1. [No Description Result](https://example.com)\n'
    );
  });

  it('should validate query minimum length', async () => {
    await expect(tool.execute({ query: 'a', count: 10 }))
      .rejects.toThrow();
  });

  it('should enforce maximum count limit', async () => {
    const mockResponse = {
      web: {
        results: Array(25).fill(null).map((_, i) => ({
          title: `Result ${i + 1}`,
          url: `https://example.com/${i + 1}`,
          description: `Description ${i + 1}`
        }))
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response);

    const result = await tool.execute({ query: 'test', count: 20 });

    // Should only return 20 results (max count)
    const resultCount = (result.match(/^\d+\./gm) || []).length;
    expect(resultCount).toBe(20);
  });
});