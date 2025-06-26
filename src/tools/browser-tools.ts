import { z } from 'zod';
import { BaseTool } from './types';
import { SimpleTextBrowser, BrowserResponse } from './text-browser';

/**
 * Shared browser instance for all browser tools
 */
let sharedBrowser: SimpleTextBrowser | null = null;

/**
 * Get or create shared browser instance
 */
function getBrowser(): SimpleTextBrowser {
  if (!sharedBrowser) {
    sharedBrowser = new SimpleTextBrowser({
      viewportSize: 8192,
      requestTimeout: 30000,
    });
  }
  return sharedBrowser;
}

/**
 * Format browser response for tool output
 */
function formatBrowserResponse(response: BrowserResponse): string {
  let header = `Address: ${response.url}\n`;

  if (response.title) {
    header += `Title: ${response.title}\n`;
  }

  if (response.metadata?.visitedBefore && response.metadata.secondsAgo) {
    header += `You previously visited this page ${response.metadata.secondsAgo} seconds ago.\n`;
  }

  header += `Viewport position: Showing page ${response.metadata?.currentPage || 1} of ${response.metadata?.totalPages || 1}.\n`;

  return header.trim() + '\n=======================\n' + response.viewport;
}

/**
 * Visit a webpage tool
 */
export class VisitPageTool extends BaseTool {
  name = 'visit_page';
  description =
    'Visit a webpage at a given URL and return its text content. Works with regular web pages and converts HTML to readable text.';
  schema = z.object({
    url: z
      .string()
      .describe('The URL of the webpage to visit (absolute or relative)'),
  });

  async execute(
    args: { url: string },
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { url } = this.validateArgs(args);

    try {
      const browser = getBrowser();
      const response = await browser.visitPage(url);

      if (abortSignal?.aborted) {
        throw new Error('Operation was aborted');
      }

      return formatBrowserResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to visit page: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Page navigation - scroll down tool
 */
export class PageDownTool extends BaseTool {
  name = 'page_down';
  description =
    'Scroll the viewport DOWN one page-length in the current webpage and return the new viewport content.';
  schema = z.object({});

  async execute(args: {}, abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    try {
      const browser = getBrowser();
      const response = browser.pageDown();
      return formatBrowserResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to scroll down: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Page navigation - scroll up tool
 */
export class PageUpTool extends BaseTool {
  name = 'page_up';
  description =
    'Scroll the viewport UP one page-length in the current webpage and return the new viewport content.';
  schema = z.object({});

  async execute(args: {}, abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    try {
      const browser = getBrowser();
      const response = browser.pageUp();
      return formatBrowserResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to scroll up: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Find text on page tool (Ctrl+F equivalent)
 */
export class FindOnPageTool extends BaseTool {
  name = 'find_on_page_ctrl_f';
  description =
    'Search for text on the current page and scroll to the first occurrence. Equivalent to Ctrl+F. Supports wildcards with *.';
  schema = z.object({
    search_string: z
      .string()
      .describe(
        'The text to search for on the page. Supports wildcards like * for pattern matching.'
      ),
  });

  async execute(
    args: { search_string: string },
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { search_string } = this.validateArgs(args);

    try {
      const browser = getBrowser();
      const response = browser.findOnPage(search_string);

      if (abortSignal?.aborted) {
        throw new Error('Operation was aborted');
      }

      if (!response) {
        const currentState = browser.visitPage(browser.address);
        const header = `Address: ${browser.address}\n`;
        return (
          header +
          `=======================\nThe search string '${search_string}' was not found on this page.`
        );
      }

      return formatBrowserResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to search on page: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Find next occurrence tool
 */
export class FindNextTool extends BaseTool {
  name = 'find_next';
  description =
    'Scroll to the next occurrence of the previous search string. Equivalent to finding the next match in a Ctrl+F search.';
  schema = z.object({});

  async execute(args: {}, abortSignal?: AbortSignal): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    try {
      const browser = getBrowser();
      const response = browser.findNext();

      if (abortSignal?.aborted) {
        throw new Error('Operation was aborted');
      }

      if (!response) {
        const header = `Address: ${browser.address}\n`;
        return (
          header +
          '=======================\nNo more matches found or no previous search was performed.'
        );
      }

      return formatBrowserResponse(response);
    } catch (error) {
      throw new Error(
        `Failed to find next: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Web search tool (simplified version - would need search API integration)
 */
export class WebSearchTool extends BaseTool {
  name = 'web_search';
  description =
    'Perform a web search and return search results. Note: This is a simplified implementation that would need proper search API integration.';
  schema = z.object({
    query: z.string().describe('The search query to perform'),
    max_results: z
      .number()
      .int()
      .positive()
      .max(10)
      .default(3)
      .describe('Maximum number of results to return'),
  });

  async execute(
    args: { query: string; max_results?: number },
    abortSignal?: AbortSignal
  ): Promise<string> {
    if (abortSignal?.aborted) {
      throw new Error('Operation was aborted');
    }

    const { query, max_results = 3 } = this.validateArgs(args);

    // Note: This is a placeholder implementation
    // In a real implementation, you would integrate with:
    // - Google Search API
    // - DuckDuckGo API
    // - SerpAPI
    // - Or other search services

    const mockResults = [
      {
        title: `Search results for: ${query}`,
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        description:
          'This is a placeholder implementation. To enable real web search, integrate with a search API like Google Search API, SerpAPI, or DuckDuckGo API.',
      },
    ];

    let content = `A web search for '${query}' found ${mockResults.length} results:\n\n## Web Results\n`;

    mockResults.slice(0, max_results).forEach((result, index) => {
      content += `${index + 1}. [${result.title}](${result.url})\n`;
      if (result.description) {
        content += `${result.description}\n\n`;
      }
    });

    return content.trim();
  }
}

/**
 * Export all browser tools
 */
export const browserTools = [
  new VisitPageTool(),
  new PageDownTool(),
  new PageUpTool(),
  new FindOnPageTool(),
  new FindNextTool(),
  new WebSearchTool(),
];

/**
 * Get default browser tools
 */
export function getBrowserTools(): BaseTool[] {
  return browserTools;
}
