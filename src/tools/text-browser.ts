import { URL } from 'node:url'; // Use node: prefix to avoid punycode deprecation
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

/**
 * History entry for browser navigation
 */
interface HistoryEntry {
  url: string;
  timestamp: number;
}

/**
 * Viewport bounds for pagination
 */
interface ViewportBounds {
  start: number;
  end: number;
}

/**
 * Search result interface
 */
export interface SearchResult {
  title: string;
  url: string;
  description?: string;
  datePublished?: string;
  source?: string;
}

/**
 * Browser response interface
 */
export interface BrowserResponse {
  success: boolean;
  content: string;
  title?: string;
  url: string;
  viewport: string;
  metadata?: {
    currentPage: number;
    totalPages: number;
    visitedBefore?: boolean;
    secondsAgo?: number;
  };
}

/**
 * Simple text-based browser for web content consumption
 * Converts HTML to readable text with viewport pagination
 */
export class SimpleTextBrowser {
  private history: HistoryEntry[] = [];
  private pageContent: string = '';
  private pageTitle?: string;
  private viewportSize: number;
  private viewportPages: ViewportBounds[] = [];
  private viewportCurrentPage: number = 0;
  private findQuery?: string;
  private findLastResult?: number;
  private requestTimeout: number;

  constructor(
    options: {
      viewportSize?: number;
      requestTimeout?: number;
      startPage?: string;
    } = {}
  ) {
    this.viewportSize = options.viewportSize || 8192; // 8KB default viewport
    this.requestTimeout = options.requestTimeout || 30000; // 30s timeout

    if (options.startPage) {
      this.setAddress(options.startPage);
    } else {
      this.setAddress('about:blank');
    }
  }

  /**
   * Get current page address
   */
  get address(): string {
    return this.history.length > 0
      ? this.history[this.history.length - 1].url
      : 'about:blank';
  }

  /**
   * Get current viewport content
   */
  get viewport(): string {
    if (this.viewportPages.length === 0) return '';
    const bounds = this.viewportPages[this.viewportCurrentPage];
    return this.pageContent.slice(bounds.start, bounds.end);
  }

  /**
   * Get full page content
   */
  get content(): string {
    return this.pageContent;
  }

  /**
   * Navigate to a URL or relative path
   */
  async setAddress(urlOrPath: string): Promise<void> {
    // Add to history
    this.history.push({
      url: urlOrPath,
      timestamp: Date.now(),
    });

    // Handle special URIs
    if (urlOrPath === 'about:blank') {
      this.setPageContent('');
      this.pageTitle = 'Blank Page';
      return;
    }

    // Handle relative URLs
    let targetUrl = urlOrPath;
    if (
      !urlOrPath.startsWith('http://') &&
      !urlOrPath.startsWith('https://') &&
      !urlOrPath.startsWith('file://')
    ) {
      if (this.history.length > 1) {
        const currentUrl = this.history[this.history.length - 2].url;
        try {
          const baseUrl = new URL(currentUrl);
          targetUrl = new URL(urlOrPath, baseUrl.origin).toString();
          // Update history with resolved URL
          this.history[this.history.length - 1].url = targetUrl;
        } catch (error) {
          throw new Error(`Invalid URL: ${urlOrPath}`);
        }
      }
    }

    // Fetch the page
    await this.fetchPage(targetUrl);
    this.resetViewport();
  }

  /**
   * Visit a page and return browser response
   */
  async visitPage(urlOrPath: string): Promise<BrowserResponse> {
    await this.setAddress(urlOrPath);
    return this.getState();
  }

  /**
   * Navigate to next page in viewport
   */
  pageDown(): BrowserResponse {
    this.viewportCurrentPage = Math.min(
      this.viewportCurrentPage + 1,
      this.viewportPages.length - 1
    );
    return this.getState();
  }

  /**
   * Navigate to previous page in viewport
   */
  pageUp(): BrowserResponse {
    this.viewportCurrentPage = Math.max(this.viewportCurrentPage - 1, 0);
    return this.getState();
  }

  /**
   * Search for text on current page
   */
  findOnPage(query: string): BrowserResponse | null {
    // If same query and same viewport, move to next result
    if (
      query === this.findQuery &&
      this.viewportCurrentPage === this.findLastResult
    ) {
      return this.findNext();
    }

    // New search from current viewport
    this.findQuery = query;
    const viewportMatch = this.findNextViewport(
      query,
      this.viewportCurrentPage
    );

    if (viewportMatch === null) {
      this.findLastResult = undefined;
      return null;
    }

    this.viewportCurrentPage = viewportMatch;
    this.findLastResult = viewportMatch;
    return this.getState();
  }

  /**
   * Find next occurrence of search query
   */
  findNext(): BrowserResponse | null {
    if (!this.findQuery) return null;

    const startingViewport =
      this.findLastResult !== undefined ? this.findLastResult + 1 : 0;
    const wrappedStart =
      startingViewport >= this.viewportPages.length ? 0 : startingViewport;

    const viewportMatch = this.findNextViewport(this.findQuery, wrappedStart);

    if (viewportMatch === null) {
      this.findLastResult = undefined;
      return null;
    }

    this.viewportCurrentPage = viewportMatch;
    this.findLastResult = viewportMatch;
    return this.getState();
  }

  /**
   * Get current browser state
   */
  private getState(): BrowserResponse {
    const visitInfo = this.getVisitInfo();

    return {
      success: true,
      content: this.pageContent,
      title: this.pageTitle,
      url: this.address,
      viewport: this.viewport,
      metadata: {
        currentPage: this.viewportCurrentPage + 1,
        totalPages: this.viewportPages.length,
        visitedBefore: visitInfo.visited,
        secondsAgo: visitInfo.secondsAgo,
      },
    };
  }

  /**
   * Get information about previous visits to current URL
   */
  private getVisitInfo(): { visited: boolean; secondsAgo?: number } {
    const currentUrl = this.address;
    const now = Date.now();

    // Look for previous visits (excluding current one)
    for (let i = this.history.length - 2; i >= 0; i--) {
      if (this.history[i].url === currentUrl) {
        return {
          visited: true,
          secondsAgo: Math.round((now - this.history[i].timestamp) / 1000),
        };
      }
    }

    return { visited: false };
  }

  /**
   * Set page content and split into viewport pages
   */
  private setPageContent(content: string): void {
    this.pageContent = content;
    this.splitPages();

    // Reset viewport if current page is out of bounds
    if (this.viewportCurrentPage >= this.viewportPages.length) {
      this.viewportCurrentPage = Math.max(0, this.viewportPages.length - 1);
    }
  }

  /**
   * Split content into viewport-sized pages
   */
  private splitPages(): void {
    this.viewportPages = [];

    if (this.pageContent.length === 0) {
      this.viewportPages.push({ start: 0, end: 0 });
      return;
    }

    let startIdx = 0;
    while (startIdx < this.pageContent.length) {
      let endIdx = Math.min(
        startIdx + this.viewportSize,
        this.pageContent.length
      );

      // Adjust to end on word boundary
      while (
        endIdx < this.pageContent.length &&
        !/[\s\t\r\n]/.test(this.pageContent[endIdx - 1])
      ) {
        endIdx++;
      }

      this.viewportPages.push({ start: startIdx, end: endIdx });
      startIdx = endIdx;
    }
  }

  /**
   * Reset viewport to first page and clear search
   */
  private resetViewport(): void {
    this.viewportCurrentPage = 0;
    this.findQuery = undefined;
    this.findLastResult = undefined;
  }

  /**
   * Find next viewport containing search query
   */
  private findNextViewport(
    query: string,
    startingViewport: number
  ): number | null {
    if (!query.trim()) return null;

    // Normalize query for searching
    const normalizedQuery = query.toLowerCase().replace(/\*/g, '.*').trim();

    if (!normalizedQuery) return null;

    // Create search indices (current to end, then start to current)
    const indices = [
      ...Array.from(
        { length: this.viewportPages.length - startingViewport },
        (_, i) => startingViewport + i
      ),
      ...Array.from({ length: startingViewport }, (_, i) => i),
    ];

    // Search through viewports
    for (const i of indices) {
      const bounds = this.viewportPages[i];
      const content = this.pageContent
        .slice(bounds.start, bounds.end)
        .toLowerCase();

      if (normalizedQuery.includes('.*')) {
        // Regex search
        try {
          const regex = new RegExp(normalizedQuery);
          if (regex.test(content)) return i;
        } catch {
          // Fallback to simple search if regex fails
          if (content.includes(normalizedQuery.replace(/\.\*/g, ''))) return i;
        }
      } else {
        // Simple text search
        if (content.includes(normalizedQuery)) return i;
      }
    }

    return null;
  }

  /**
   * Fetch and process web page content
   */
  private async fetchPage(url: string): Promise<void> {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.requestTimeout
      );

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SimpleTextBrowser/1.0',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('text/html')) {
          const html = await response.text();
          const { title, textContent } = this.convertHtmlToText(html);
          this.pageTitle = title;
          this.setPageContent(textContent);
        } else if (contentType.includes('text/')) {
          const text = await response.text();
          this.pageTitle = this.extractTitleFromUrl(url);
          this.setPageContent(text);
        } else {
          throw new Error(`Unsupported content type: ${contentType}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout: ${url}`);
        }
        this.pageTitle = 'Error';
        this.setPageContent(
          `# Error Loading Page\n\nFailed to load ${url}\n\nError: ${error.message}`
        );
      } else {
        throw new Error(`Unknown error loading ${url}: ${String(error)}`);
      }
    }
  }

  /**
   * Convert HTML to readable text content
   */
  private convertHtmlToText(html: string): {
    title: string;
    textContent: string;
  } {
    try {
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Remove script and style elements
      const scriptsAndStyles = document.querySelectorAll(
        'script, style, noscript'
      );
      scriptsAndStyles.forEach((element) => element.remove());

      // Extract title
      const titleElement = document.querySelector('title');
      const title = titleElement
        ? titleElement.textContent?.trim() || 'Untitled'
        : 'Untitled';

      // Convert to text while preserving some structure
      const body = document.body || document.documentElement;
      const textContent = this.extractTextWithStructure(body);

      return {
        title,
        textContent: this.cleanupText(textContent),
      };
    } catch (error) {
      throw new Error(
        `Failed to parse HTML: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Extract text content while preserving basic structure
   */
  private extractTextWithStructure(element: Element): string {
    let text = '';

    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === 3) {
        // Text node
        const textContent = node.textContent?.trim();
        if (textContent) {
          text += textContent + ' ';
        }
      } else if (node.nodeType === 1) {
        // Element node
        const tagName = (node as Element).tagName.toLowerCase();

        // Add structure for headers and paragraphs
        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
          text += '\n\n# ';
        } else if (['p', 'div', 'br'].includes(tagName)) {
          text += '\n';
        } else if (tagName === 'a') {
          const href = (node as Element).getAttribute('href');
          const linkText = (node as Element).textContent?.trim();
          if (linkText && href) {
            text += `[${linkText}](${href}) `;
            continue; // Skip recursive call for links
          }
        }

        // Recursively process child elements
        text += this.extractTextWithStructure(node as Element);

        // Add line breaks after block elements
        if (
          ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
            tagName
          )
        ) {
          text += '\n';
        }
      }
    }

    return text;
  }

  /**
   * Clean up extracted text
   */
  private cleanupText(text: string): string {
    return (
      text
        // Normalize whitespace
        .replace(/[ \t]+/g, ' ')
        // Remove excessive line breaks
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Clean up edges
        .trim()
    );
  }

  /**
   * Extract title from URL when not available
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname;
    } catch {
      return url;
    }
  }
}
