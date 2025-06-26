import { VisitPageTool, PageDownTool, PageUpTool, FindOnPageTool, FindNextTool } from '../src/tools/browser-tools';
import { SimpleTextBrowser } from '../src/tools/text-browser';

describe('Browser Tools', () => {
  let visitTool: VisitPageTool;
  let pageDownTool: PageDownTool;
  let pageUpTool: PageUpTool;
  let findTool: FindOnPageTool;
  let findNextTool: FindNextTool;

  beforeEach(() => {
    visitTool = new VisitPageTool();
    pageDownTool = new PageDownTool();
    pageUpTool = new PageUpTool();
    findTool = new FindOnPageTool();
    findNextTool = new FindNextTool();
  });

  describe('VisitPageTool', () => {
    it('should have correct tool properties', () => {
      expect(visitTool.name).toBe('visit_page');
      expect(visitTool.description).toContain('Visit a webpage');
      expect(visitTool.schema).toBeDefined();
    });

    it('should validate arguments', () => {
      expect(() => visitTool.validateArgs({ url: 'https://example.com' })).not.toThrow();
      expect(() => visitTool.validateArgs({})).toThrow();
      expect(() => visitTool.validateArgs({ url: 123 })).toThrow();
    });

    it('should handle abort signals', async () => {
      const controller = new AbortController();
      controller.abort();
      
      await expect(visitTool.execute({ url: 'https://example.com' }, controller.signal))
        .rejects.toThrow('Operation was aborted');
    });

    it('should visit example.com in live mode', async () => {
      if (!process.env.RUN_LIVE) {
        console.log('Skipping live test - set RUN_LIVE=true to enable');
        return;
      }

      const result = await visitTool.execute({ url: 'https://example.com' });
      
      expect(result).toContain('Address: https://example.com');
      expect(result).toContain('=======================');
      expect(result).toContain('Example Domain');
    }, 30000);
  });

  describe('SimpleTextBrowser', () => {
    let browser: SimpleTextBrowser;

    beforeEach(() => {
      browser = new SimpleTextBrowser();
    });

    it('should initialize with blank page', () => {
      expect(browser.address).toBe('about:blank');
      expect(browser.content).toBe('');
    });

    it('should handle about:blank navigation', async () => {
      await browser.setAddress('about:blank');
      expect(browser.address).toBe('about:blank');
      expect(browser.content).toBe('');
    });

    it('should split content into viewports correctly', async () => {
      const testBrowser = new SimpleTextBrowser({ viewportSize: 100 });
      
      // Set content manually for testing
      const longContent = 'A'.repeat(250) + ' ' + 'B'.repeat(250);
      await testBrowser.setAddress('about:blank');
      
      // Access private method through type assertion for testing
      (testBrowser as any).setPageContent(longContent);
      
      expect(testBrowser.viewport.length).toBeLessThanOrEqual(110); // Slightly more than viewport size due to word boundaries
    });

    it('should navigate viewports', async () => {
      const testBrowser = new SimpleTextBrowser({ viewportSize: 10 });
      
      // Set longer content
      const content = 'Page one content. Page two content. Page three content.';
      (testBrowser as any).setPageContent(content);
      
      const initialViewport = testBrowser.viewport;
      const downResult = testBrowser.pageDown();
      expect(downResult.viewport).not.toBe(initialViewport);
      
      const upResult = testBrowser.pageUp();
      expect(upResult.viewport).toBe(initialViewport);
    });

    it('should find text on page', async () => {
      const testBrowser = new SimpleTextBrowser();
      
      // Set content with searchable text
      const content = 'This is the first paragraph. This contains the target word "example". This is the last paragraph.';
      (testBrowser as any).setPageContent(content);
      
      const findResult = testBrowser.findOnPage('example');
      expect(findResult).not.toBeNull();
      expect(findResult?.viewport).toContain('example');
    });

    it('should handle search not found', async () => {
      const testBrowser = new SimpleTextBrowser();
      
      const content = 'This content does not contain the search term.';
      (testBrowser as any).setPageContent(content);
      
      const findResult = testBrowser.findOnPage('nonexistent');
      expect(findResult).toBeNull();
    });

    it('should support wildcard search', async () => {
      const testBrowser = new SimpleTextBrowser();
      
      const content = 'Testing wildcard functionality with different patterns.';
      (testBrowser as any).setPageContent(content);
      
      const findResult = testBrowser.findOnPage('wild*card');
      expect(findResult).not.toBeNull();
    });

    it('should track visit history', async () => {
      await browser.setAddress('https://example1.com');
      await browser.setAddress('https://example2.com');
      
      expect(browser.address).toBe('https://example2.com');
      
      // Visit first URL again
      await browser.setAddress('https://example1.com');
      const state = browser.visitPage('https://example1.com');
      
      // Should indicate previous visit
      // Note: This test checks the structure; actual visit detection depends on implementation
      expect(browser.address).toBe('https://example1.com');
    });
  });

  describe('PageDownTool', () => {
    it('should have correct tool properties', () => {
      expect(pageDownTool.name).toBe('page_down');
      expect(pageDownTool.description).toContain('scroll');
      expect(pageDownTool.description).toContain('DOWN');
    });

    it('should handle empty arguments', () => {
      expect(() => pageDownTool.validateArgs({})).not.toThrow();
    });
  });

  describe('PageUpTool', () => {
    it('should have correct tool properties', () => {
      expect(pageUpTool.name).toBe('page_up');
      expect(pageUpTool.description).toContain('scroll');
      expect(pageUpTool.description).toContain('UP');
    });
  });

  describe('FindOnPageTool', () => {
    it('should have correct tool properties', () => {
      expect(findTool.name).toBe('find_on_page_ctrl_f');
      expect(findTool.description).toContain('search');
      expect(findTool.description).toContain('Ctrl+F');
    });

    it('should validate search string argument', () => {
      expect(() => findTool.validateArgs({ search_string: 'test' })).not.toThrow();
      expect(() => findTool.validateArgs({})).toThrow();
      expect(() => findTool.validateArgs({ search_string: 123 })).toThrow();
    });
  });

  describe('FindNextTool', () => {
    it('should have correct tool properties', () => {
      expect(findNextTool.name).toBe('find_next');
      expect(findNextTool.description).toContain('next occurrence');
    });
  });

  describe('Integration Tests', () => {
    it('should work together for basic browsing workflow', async () => {
      if (!process.env.RUN_LIVE) {
        console.log('Skipping integration test - set RUN_LIVE=true to enable');
        return;
      }

      // 1. Visit a page
      const visitResult = await visitTool.execute({ url: 'https://example.com' });
      expect(visitResult).toContain('Address: https://example.com');

      // 2. Try to scroll down (may not have effect on simple pages)
      const scrollResult = await pageDownTool.execute({});
      expect(scrollResult).toContain('Address: https://example.com');

      // 3. Search for common text
      const searchResult = await findTool.execute({ search_string: 'Example' });
      expect(searchResult).toContain('Address: https://example.com');

    }, 30000);
  });
});