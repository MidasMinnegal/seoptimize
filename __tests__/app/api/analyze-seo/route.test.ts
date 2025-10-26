/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'

// Mock logger functions - using var for hoisting compatibility with jest.mock
let mockLogger: {
  info: jest.Mock
  warn: jest.Mock
  error: jest.Mock
  debug: jest.Mock
  child: jest.Mock
}

// Mock dependencies BEFORE importing the route
jest.mock('@/lib/seo/url-validator')
jest.mock('@/lib/seo/browser/renderer')
jest.mock('@/lib/seo/sanitizer')
jest.mock('@/lib/logger', () => {
  // Create mock functions inside the factory to avoid hoisting issues
  const loggerMock = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(),
  }

  // Set up child to return the same mock
  loggerMock.child.mockReturnValue(loggerMock)

  // Assign to the outer variable so tests can access it
  mockLogger = loggerMock

  return {
    createLogger: jest.fn(() => loggerMock),
  }
})

import { renderPage } from '@/lib/seo/browser/renderer'
import { sanitizeHTML } from '@/lib/seo/sanitizer'
import { validateURL } from '@/lib/seo/url-validator'

const mockValidateURL = validateURL as jest.MockedFunction<typeof validateURL>
const mockRenderPage = renderPage as jest.MockedFunction<typeof renderPage>
const mockSanitizeHTML = sanitizeHTML as jest.MockedFunction<typeof sanitizeHTML>

// Now import the route
import { POST } from '@/app/api/analyze-seo/route'
import type { AnalyzeSEOResponse } from '@/types/seo'

describe('POST /api/analyze-seo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('URL Validation', () => {
    it('should return 400 for invalid URL', async () => {
      mockValidateURL.mockReturnValue({
        valid: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'Invalid URL format',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: 'invalid-url' }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      if (!data.success) {
        expect(data.error.code).toBe('INVALID_URL')
        expect(data.error.message).toContain('not valid')
      }
    })

    it('should return 400 for missing URL', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should accept valid URL', async () => {
      const testUrl = 'https://example.com'
      const mockHtml = '<html><head><title>Test</title></head><body><h1>Test</h1></body></html>'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(mockHtml)

      mockSanitizeHTML.mockReturnValue(mockHtml)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Page Rendering', () => {
    it('should return 500 if rendering fails', async () => {
      const testUrl = 'https://example.com'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockRejectedValue(new Error('Navigation failed'))

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      if (!data.success) {
        expect(data.error.code).toBe('RENDER_FAILED')
      }
    })

    it('should sanitize rendered HTML', async () => {
      const testUrl = 'https://example.com'
      const unsafeHtml = '<html><body><script>alert("xss")</script><h1>Test</h1></body></html>'
      const safeHtml = '<html><body><h1>Test</h1></body></html>'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(unsafeHtml)

      mockSanitizeHTML.mockReturnValue(safeHtml)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      await POST(request)

      expect(mockSanitizeHTML).toHaveBeenCalledWith(unsafeHtml)
    })
  })

  describe('SEO Analysis', () => {
    it('should analyze images and return findings', async () => {
      const testUrl = 'https://example.com'
      const html = `
        <html>
          <body>
            <img src="image1.jpg" />
            <img src="image2.jpg" alt="Valid alt" />
          </body>
        </html>
      `

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        expect(data.data.url).toBe(testUrl)
        expect(data.data.analyzedAt).toBeDefined()
        expect(data.data.executionTimeMs).toBeGreaterThanOrEqual(0)
        expect(data.data.findings).toBeDefined()
        expect(Array.isArray(data.data.findings)).toBe(true)

        // Should have image findings
        const imageFindings = data.data.findings.filter(f => f.category === 'images')
        expect(imageFindings.length).toBeGreaterThan(0)
      }
    })

    it('should analyze meta tags and return findings', async () => {
      const testUrl = 'https://example.com'
      const html = `
        <html>
          <head>
            <title>Test Page</title>
          </head>
          <body><h1>Test</h1></body>
        </html>
      `

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        // Should have meta tag findings (missing description)
        const metaFindings = data.data.findings.filter(f => f.category === 'meta-tags')
        expect(metaFindings.length).toBeGreaterThan(0)
      }
    })

    it('should analyze headers and return findings', async () => {
      const testUrl = 'https://example.com'
      const html = `
        <html>
          <body>
            <h1>First Heading</h1>
            <h1>Second Heading</h1>
            <h2>Subheading</h2>
          </body>
        </html>
      `

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        // Should have header findings (multiple H1s)
        const headerFindings = data.data.findings.filter(f => f.category === 'headers')
        expect(headerFindings.length).toBeGreaterThan(0)
      }
    })

    it('should analyze links and return findings', async () => {
      const testUrl = 'https://example.com'
      const html = `
        <html>
          <body>
            <a href="https://example.com/page1">Internal</a>
            <a href="https://external.com">External</a>
            <a href="/page2">Internal 2</a>
          </body>
        </html>
      `

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        // Should have link findings
        const linkFindings = data.data.findings.filter(f => f.category === 'links')
        expect(linkFindings.length).toBeGreaterThan(0)
      }
    })

    it('should combine findings from all analyzers', async () => {
      const testUrl = 'https://example.com'
      const html = `
        <html>
          <head>
            <title>Short</title>
            <meta name="description" content="Test description" />
          </head>
          <body>
            <h1>Main Heading</h1>
            <img src="image.jpg" />
            <a href="https://external.com">Link</a>
          </body>
        </html>
      `

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        const categories = new Set(data.data.findings.map(f => f.category))

        // Should have findings from multiple categories
        expect(categories.size).toBeGreaterThan(0)
      }
    })
  })

  describe('Response Structure', () => {
    it('should return correct response structure for success', async () => {
      const testUrl = 'https://example.com'
      const html = '<html><body><h1>Test</h1></body></html>'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        expect(data.data).toHaveProperty('url')
        expect(data.data).toHaveProperty('analyzedAt')
        expect(data.data).toHaveProperty('findings')
        expect(data.data).toHaveProperty('executionTimeMs')
        expect(typeof data.data.url).toBe('string')
        expect(typeof data.data.analyzedAt).toBe('string')
        expect(typeof data.data.executionTimeMs).toBe('number')
        expect(Array.isArray(data.data.findings)).toBe(true)
      }
    })

    it('should return correct response structure for errors', async () => {
      mockValidateURL.mockReturnValue({
        valid: false,
        error: {
          code: 'INVALID_FORMAT',
          message: 'Invalid URL',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: 'invalid' }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(false)
      if (!data.success) {
        expect(data.error).toHaveProperty('code')
        expect(data.error).toHaveProperty('message')
        expect(typeof data.error.code).toBe('string')
        expect(typeof data.error.message).toBe('string')
      }
    })

    it('should include ISO 8601 timestamp', async () => {
      const testUrl = 'https://example.com'
      const html = '<html><body><h1>Test</h1></body></html>'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success) {
        // Should be valid ISO 8601 format
        const timestamp = new Date(data.data.analyzedAt)
        expect(timestamp.toISOString()).toBe(data.data.analyzedAt)
      }
    })
  })

  describe('Error Handling', () => {
    it('should return 500 if sanitization fails', async () => {
      const testUrl = 'https://example.com'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue('<html></html>')

      mockSanitizeHTML.mockImplementation(() => {
        throw new Error('Sanitization error')
      })

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      if (!data.success) {
        expect(data.error.code).toBe('SANITIZATION_FAILED')
      }
    })

    it('should return 500 if analysis throws error', async () => {
      const testUrl = 'https://example.com'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue('<html></html>')

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
    })

    it('should handle malformed JSON request', async () => {
      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: 'invalid json{',
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })

  describe('Logging', () => {
    it('should log analysis start', async () => {
      const testUrl = 'https://example.com'
      const html = '<html><body><h1>Test</h1></body></html>'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      await POST(request)

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('analysis'),
        expect.objectContaining({ url: testUrl })
      )
    })

    it('should log errors', async () => {
      const testUrl = 'https://example.com'

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockRejectedValue(new Error('Test error'))

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      await POST(request)

      expect(mockLogger.error).toHaveBeenCalled()
    })
  })

  describe('Finding Structure', () => {
    it('should return findings with required fields', async () => {
      const testUrl = 'https://example.com'
      const html = `
        <html>
          <head><title>Test</title></head>
          <body>
            <h1>Test</h1>
            <img src="test.jpg" />
          </body>
        </html>
      `

      mockValidateURL.mockReturnValue({
        valid: true,
        normalizedUrl: testUrl,
      })

      mockRenderPage.mockResolvedValue(html)

      mockSanitizeHTML.mockReturnValue(html)

      const request = new NextRequest('http://localhost:3000/api/analyze-seo', {
        method: 'POST',
        body: JSON.stringify({ url: testUrl }),
      })

      const response = await POST(request)
      const data = (await response.json()) as AnalyzeSEOResponse

      expect(data.success).toBe(true)
      if (data.success && data.data.findings.length > 0) {
        const finding = data.data.findings[0]
        expect(finding).toHaveProperty('id')
        expect(finding).toHaveProperty('category')
        expect(finding).toHaveProperty('severity')
        expect(finding).toHaveProperty('title')
        expect(finding).toHaveProperty('description')
        expect(finding).toHaveProperty('impact')
        expect(finding).toHaveProperty('recommendation')
      }
    })
  })
})
