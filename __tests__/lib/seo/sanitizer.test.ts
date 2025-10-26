/**
 * HTML Sanitizer Tests
 * Feature: 001-input-field-fetches
 * Tasks: T016, T019, T020 - Comprehensive sanitization tests with XSS protection
 */

import { sanitizeHTML } from '@/lib/seo/sanitizer'

describe('HTML Sanitizer', () => {
  describe('Basic Sanitization', () => {
    it('should return clean HTML unchanged', () => {
      const cleanHTML = '<p>This is a clean paragraph.</p>'
      const result = sanitizeHTML(cleanHTML)

      expect(result).toBe(cleanHTML)
    })

    it('should preserve allowed tags', () => {
      const html = `
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
        <p>Paragraph</p>
        <a href="https://example.com">Link</a>
        <img src="image.jpg" alt="Image">
        <ul><li>Item 1</li><li>Item 2</li></ul>
        <ol><li>Item 1</li><li>Item 2</li></ol>
      `
      const result = sanitizeHTML(html)

      expect(result).toContain('<h1>Heading 1</h1>')
      expect(result).toContain('<h2>Heading 2</h2>')
      expect(result).toContain('<h3>Heading 3</h3>')
      expect(result).toContain('<h4>Heading 4</h4>')
      expect(result).toContain('<h5>Heading 5</h5>')
      expect(result).toContain('<h6>Heading 6</h6>')
      expect(result).toContain('<p>Paragraph</p>')
      expect(result).toContain('<a href="https://example.com">Link</a>')
      expect(result).toContain('<img src="image.jpg" alt="Image">')
      expect(result).toContain('<ul>')
      expect(result).toContain('<ol>')
      expect(result).toContain('<li>')
    })

    it('should preserve safe attributes', () => {
      const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
      const result = sanitizeHTML(html)

      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener"')
    })

    it('should preserve image attributes', () => {
      const html = '<img src="image.jpg" alt="Description" width="100" height="100">'
      const result = sanitizeHTML(html)

      expect(result).toContain('src="image.jpg"')
      expect(result).toContain('alt="Description"')
      expect(result).toContain('width="100"')
      expect(result).toContain('height="100"')
    })
  })

  describe('XSS Protection - Script Tags', () => {
    it('should remove script tags', () => {
      const maliciousHTML = '<p>Hello</p><script>alert("XSS")</script><p>World</p>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<script>')
      expect(result).not.toContain('</script>')
      expect(result).not.toContain('alert("XSS")')
      expect(result).toContain('<p>Hello</p>')
      expect(result).toContain('<p>World</p>')
    })

    it('should remove script tags with attributes', () => {
      const maliciousHTML = '<script type="text/javascript" src="evil.js"></script>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<script')
      expect(result).not.toContain('evil.js')
    })

    it('should remove inline script tags', () => {
      const maliciousHTML = '<p>Text<script>alert(1)</script>More text</p>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert(1)')
      expect(result).toContain('Text')
      expect(result).toContain('More text')
    })

    it('should remove multiple script tags', () => {
      const maliciousHTML = `
        <script>alert(1)</script>
        <p>Content</p>
        <script>alert(2)</script>
        <script>console.log("malicious")</script>
      `
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).not.toContain('console.log')
      expect(result).toContain('<p>Content</p>')
    })
  })

  describe('XSS Protection - Event Handlers', () => {
    it('should remove onclick event handlers', () => {
      const maliciousHTML = '<a href="#" onclick="alert(\'XSS\')">Click me</a>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
      expect(result).toContain('Click me')
    })

    it('should remove onerror event handlers', () => {
      const maliciousHTML = '<img src="x" onerror="alert(\'XSS\')">'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('onerror')
      expect(result).not.toContain('alert')
    })

    it('should remove onload event handlers', () => {
      const maliciousHTML = '<body onload="alert(\'XSS\')">Content</body>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('onload')
      expect(result).not.toContain('alert')
    })

    it('should remove all on* event handlers', () => {
      const events = [
        'onclick',
        'onmouseover',
        'onmouseout',
        'onfocus',
        'onblur',
        'onchange',
        'onsubmit',
        'onkeyup',
        'onkeydown',
      ]

      events.forEach(event => {
        const maliciousHTML = `<div ${event}="maliciousCode()">Content</div>`
        const result = sanitizeHTML(maliciousHTML)

        expect(result).not.toContain(event)
        expect(result).not.toContain('maliciousCode')
      })
    })
  })

  describe('XSS Protection - JavaScript URLs', () => {
    it('should remove javascript: URLs in href', () => {
      const maliciousHTML = '<a href="javascript:alert(\'XSS\')">Click</a>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('alert')
    })

    it('should remove javascript: URLs in src', () => {
      const maliciousHTML = '<img src="javascript:alert(\'XSS\')">'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('alert')
    })

    it('should remove data: URLs with script content', () => {
      const maliciousHTML = '<a href="data:text/html,<script>alert(\'XSS\')</script>">Click</a>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('data:text/html')
      expect(result).not.toContain('<script>')
    })

    it('should allow safe http/https URLs', () => {
      const html = `
        <a href="https://example.com">HTTPS Link</a>
        <a href="http://example.com">HTTP Link</a>
      `
      const result = sanitizeHTML(html)

      expect(result).toContain('https://example.com')
      expect(result).toContain('http://example.com')
    })
  })

  describe('XSS Protection - Advanced Vectors', () => {
    it('should remove iframe tags', () => {
      const maliciousHTML = '<iframe src="https://evil.com"></iframe>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<iframe')
      expect(result).not.toContain('evil.com')
    })

    it('should remove object tags', () => {
      const maliciousHTML = '<object data="evil.swf"></object>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<object')
      expect(result).not.toContain('evil.swf')
    })

    it('should remove embed tags', () => {
      const maliciousHTML = '<embed src="evil.swf">'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<embed')
    })

    it('should remove style tags with expressions', () => {
      const maliciousHTML = '<style>body { background: url("javascript:alert(\'XSS\')"); }</style>'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<style')
      expect(result).not.toContain('javascript:')
    })

    it('should remove base tags', () => {
      const maliciousHTML = '<base href="https://evil.com">'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<base')
    })

    it('should remove meta refresh redirects', () => {
      const maliciousHTML = '<meta http-equiv="refresh" content="0;url=https://evil.com">'
      const result = sanitizeHTML(maliciousHTML)

      expect(result).not.toContain('<meta')
      expect(result).not.toContain('refresh')
    })
  })

  describe('Attribute Stripping', () => {
    it('should remove style attributes', () => {
      const html = '<p style="color: red; display: none;">Text</p>'
      const result = sanitizeHTML(html)

      expect(result).not.toContain('style=')
      expect(result).toContain('Text')
    })

    it('should remove id attributes', () => {
      const html = '<div id="my-id">Content</div>'
      const result = sanitizeHTML(html)

      expect(result).not.toContain('id=')
      expect(result).toContain('Content')
    })

    it('should remove class attributes', () => {
      const html = '<div class="my-class">Content</div>'
      const result = sanitizeHTML(html)

      expect(result).not.toContain('class=')
      expect(result).toContain('Content')
    })

    it('should remove data- attributes', () => {
      const html = '<div data-value="123">Content</div>'
      const result = sanitizeHTML(html)

      expect(result).not.toContain('data-')
      expect(result).toContain('Content')
    })
  })

  describe('Error Handling', () => {
    it('should handle null input', () => {
      const result = sanitizeHTML(null as unknown as string)

      expect(result).toBe('')
    })

    it('should handle undefined input', () => {
      const result = sanitizeHTML(undefined as unknown as string)

      expect(result).toBe('')
    })

    it('should handle empty string', () => {
      const result = sanitizeHTML('')

      expect(result).toBe('')
    })

    it('should handle malformed HTML', () => {
      const malformedHTML = '<p>Unclosed paragraph<div>Nested wrong</p></div>'
      const result = sanitizeHTML(malformedHTML)

      // DOMPurify should clean this up
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should handle HTML with only whitespace', () => {
      const result = sanitizeHTML('   \n\t   ')

      expect(result.trim()).toBe('')
    })

    it('should handle very long HTML strings', () => {
      const longHTML = `<p>${  'A'.repeat(100000)  }</p>`
      const result = sanitizeHTML(longHTML)

      expect(result).toContain('<p>')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle HTML with special characters', () => {
      const html = '<p>&lt;script&gt;alert("XSS")&lt;/script&gt;</p>'
      const result = sanitizeHTML(html)

      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
      expect(result).not.toContain('<script>')
    })
  })

  describe('Text Content Preservation', () => {
    it('should preserve text content when removing tags', () => {
      const html = '<script>alert(1)</script>Important text<script>alert(2)</script>'
      const result = sanitizeHTML(html)

      expect(result).toContain('Important text')
      expect(result).not.toContain('<script>')
    })

    it('should preserve nested text content', () => {
      const html = '<div onclick="bad()"><p>Keep this <span>and this</span></p></div>'
      const result = sanitizeHTML(html)

      expect(result).toContain('Keep this')
      expect(result).toContain('and this')
      expect(result).not.toContain('onclick')
    })

    it('should preserve whitespace in text', () => {
      const html = '<p>Text   with    multiple   spaces</p>'
      const result = sanitizeHTML(html)

      expect(result).toContain('Text   with    multiple   spaces')
    })
  })

  describe('Complex HTML Structures', () => {
    it('should sanitize nested structures', () => {
      const html = `
        <div>
          <h1>Title</h1>
          <p>Description with <a href="https://example.com">link</a></p>
          <ul>
            <li>Item 1</li>
            <li>Item 2 with <strong>emphasis</strong></li>
          </ul>
        </div>
      `
      const result = sanitizeHTML(html)

      expect(result).toContain('<h1>Title</h1>')
      expect(result).toContain('<p>Description')
      expect(result).toContain('<a href="https://example.com">link</a>')
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>')
    })

    it('should sanitize mixed safe and malicious content', () => {
      const html = `
        <h1>Safe Title</h1>
        <script>alert("XSS")</script>
        <p>Safe paragraph</p>
        <img src="x" onerror="alert('XSS')">
        <a href="https://safe.com">Safe link</a>
        <a href="javascript:alert('XSS')">Malicious link</a>
      `
      const result = sanitizeHTML(html)

      expect(result).toContain('<h1>Safe Title</h1>')
      expect(result).toContain('<p>Safe paragraph</p>')
      expect(result).toContain('<a href="https://safe.com">Safe link</a>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('onerror')
      expect(result).not.toContain('javascript:')
    })
  })
})
