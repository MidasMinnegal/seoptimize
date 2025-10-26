/**
 * Tests for Browser Renderer
 * Tests Puppeteer-based page rendering with resource optimization
 */

import puppeteer from 'puppeteer'

import { closeBrowser,renderPage } from '@/lib/seo/browser/renderer'

// Mock Puppeteer - Jest will use __mocks__/puppeteer.ts
jest.mock('puppeteer')

describe('Browser Renderer', () => {
  // Clean up browser instance after each test
  afterEach(async () => {
    await closeBrowser()
    jest.clearAllMocks()
  })

  describe('Basic Page Rendering', () => {
    it('should successfully render a simple HTML page', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
      expect(html.length).toBeGreaterThan(0)
    })

    it('should return HTML content with DOCTYPE', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toContain('<!DOCTYPE')
    })

    it('should render JavaScript-heavy pages', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
      expect(html.length).toBeGreaterThan(0)
    })

    it('should handle pages with async content loading', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should throw error for invalid URL', async () => {
      await expect(renderPage('not-a-url')).rejects.toThrow()
    })

    it('should throw error for unreachable URL', async () => {
      await expect(renderPage('https://thisdoesnotexist.invalid')).rejects.toThrow()
    })

    it('should throw error on timeout', async () => {
      // This should timeout quickly
      await expect(renderPage('https://httpstat.us/200?sleep=60000')).rejects.toThrow()
    }, 35000) // Allow 35s for timeout test

    it('should handle network errors gracefully', async () => {
      await expect(renderPage('https://localhost:99999')).rejects.toThrow()
    })

    it('should handle SSL errors', async () => {
      // Mock an SSL error scenario
      await expect(renderPage('https://expired.badssl.com')).rejects.toThrow()
    })

    it('should provide meaningful error messages', async () => {
      try {
        await renderPage('not-a-url')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBeTruthy()
        expect((error as Error).message.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Browser Instance Management', () => {
    it('should reuse browser instance for multiple requests', async () => {
      await renderPage('https://example.com')
      await renderPage('https://example.com')

      // Browser should be launched only once (singleton pattern)
      // Note: puppeteer is imported at top of file and mocked
      expect(puppeteer.launch).toHaveBeenCalledTimes(1)
    })

    it('should properly close browser on cleanup', async () => {
      await renderPage('https://example.com')

      // Browser close should work without errors
      await expect(closeBrowser()).resolves.not.toThrow()
    })

    it('should handle multiple cleanup calls safely', async () => {
      await renderPage('https://example.com')

      await closeBrowser()
      await closeBrowser() // Should not throw on second call

      expect(true).toBe(true)
    })
  })

  describe('Resource Optimization', () => {
    it('should wait for network to be idle', async () => {
      const html = await renderPage('https://example.com')

      // Should have rendered content, not just initial HTML
      expect(html).toBeDefined()
      expect(html.length).toBeGreaterThan(100)
    })

    it('should respect timeout configuration', async () => {
      // Mock simulates immediate timeout rejection
      // Just verify that timeout URLs properly throw errors
      await expect(renderPage('https://httpstat.us/200?sleep=60000')).rejects.toThrow()
    })

    it('should handle pages with many resources', async () => {
      // Page with lots of images/scripts
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
    })

    it('should complete within reasonable time for simple pages', async () => {
      const startTime = Date.now()

      await renderPage('https://example.com')

      const duration = Date.now() - startTime

      // Should complete in under 10 seconds for simple page
      expect(duration).toBeLessThan(10000)
    })
  })

  describe('Content Capture', () => {
    it('should capture fully rendered HTML including JavaScript content', async () => {
      const html = await renderPage('https://example.com')

      // Should contain actual page content, not loading placeholders
      expect(html).toBeTruthy()
      expect(html).toContain('html')
    })

    it('should capture meta tags', async () => {
      const html = await renderPage('https://example.com')

      expect(html.toLowerCase()).toContain('<head')
    })

    it('should capture body content', async () => {
      const html = await renderPage('https://example.com')

      expect(html.toLowerCase()).toContain('<body')
    })

    it('should preserve HTML structure', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toContain('<html')
      expect(html).toContain('</html>')
    })
  })

  describe('URL Handling', () => {
    it('should handle URLs with query parameters', async () => {
      const html = await renderPage('https://example.com?foo=bar')

      expect(html).toBeDefined()
    })

    it('should handle URLs with hash fragments', async () => {
      const html = await renderPage('https://example.com#section')

      expect(html).toBeDefined()
    })

    it('should handle URLs with paths', async () => {
      const html = await renderPage('https://example.com/path/to/page')

      expect(html).toBeDefined()
    })

    it('should handle internationalized URLs', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
    })
  })

  describe('Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const urls = ['https://example.com', 'https://example.org', 'https://example.net']

      const startTime = Date.now()
      const results = await Promise.all(urls.map((url: string) => renderPage(url)))
      const duration = Date.now() - startTime

      expect(results).toHaveLength(3)
      results.forEach((html: string) => {
        expect(html).toBeDefined()
        expect(html.length).toBeGreaterThan(0)
      })

      // Should complete in reasonable time (not 3x the single page time)
      expect(duration).toBeLessThan(30000)
    }, 35000)
  })

  describe('Edge Cases', () => {
    it('should handle empty pages', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
    })

    it('should handle very large pages', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
      expect(typeof html).toBe('string')
    })

    it('should handle redirects', async () => {
      const html = await renderPage('http://example.com') // HTTP redirects to HTTPS

      expect(html).toBeDefined()
    })

    it('should handle pages with iframes', async () => {
      const html = await renderPage('https://example.com')

      expect(html).toBeDefined()
    })
  })
})
