/**
 * @jest-environment node
 */

import { analyzeLinks } from '@/lib/seo/analyzers/link-analyzer'

describe('analyzeLinks', () => {
  describe('Empty and No Links', () => {
    it('should handle empty HTML', () => {
      const result = analyzeLinks('', 'https://example.com')

      expect(result.totalLinks).toBe(0)
      expect(result.internalLinks).toBe(0)
      expect(result.externalLinks).toBe(0)
      expect(result.nofollowLinks).toBe(0)
      expect(result.links).toEqual([])
    })

    it('should handle HTML with no links', () => {
      const html = '<div><p>Some text without links</p></div>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(0)
      expect(result.internalLinks).toBe(0)
      expect(result.externalLinks).toBe(0)
      expect(result.nofollowLinks).toBe(0)
      expect(result.links).toEqual([])
    })

    it('should handle whitespace-only HTML', () => {
      const html = '   \n\t  '
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(0)
    })
  })

  describe('Link Extraction', () => {
    it('should extract single link', () => {
      const html = '<a href="https://example.com/page">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.links.length).toBe(1)
      expect(result.links[0].href).toBe('https://example.com/page')
      expect(result.links[0].text).toBe('Link')
      expect(result.links[0].isInternal).toBe(true)
      expect(result.links[0].isNofollow).toBe(false)
    })

    it('should extract multiple links', () => {
      const html = `
        <a href="https://example.com/page1">Link 1</a>
        <a href="https://example.com/page2">Link 2</a>
        <a href="https://external.com">External</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(3)
      expect(result.links.length).toBe(3)
    })

    it('should handle links without href', () => {
      const html = '<a>No href</a><a href="">Empty href</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(0)
      expect(result.links).toEqual([])
    })

    it('should trim whitespace from href and text', () => {
      const html = '<a href="  https://example.com/page  ">  Link Text  </a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.links[0].href).toBe('https://example.com/page')
      expect(result.links[0].text).toBe('Link Text')
    })

    it('should handle links with nested HTML', () => {
      const html = '<a href="https://example.com"><strong>Bold</strong> Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.links[0].text).toBe('Bold Link')
    })
  })

  describe('Internal vs External Links', () => {
    it('should detect internal link (same domain)', () => {
      const html = '<a href="https://example.com/page">Internal</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(1)
      expect(result.externalLinks).toBe(0)
      expect(result.links[0].isInternal).toBe(true)
    })

    it('should detect external link (different domain)', () => {
      const html = '<a href="https://external.com">External</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(0)
      expect(result.externalLinks).toBe(1)
      expect(result.links[0].isInternal).toBe(false)
    })

    it('should handle subdomain as internal', () => {
      const html = '<a href="https://blog.example.com">Blog</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(1)
      expect(result.links[0].isInternal).toBe(true)
    })

    it('should handle www subdomain correctly', () => {
      const html = `
        <a href="https://www.example.com/page">WWW Link</a>
        <a href="https://example.com/page">No WWW Link</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(2)
      expect(result.links[0].isInternal).toBe(true)
      expect(result.links[1].isInternal).toBe(true)
    })

    it('should handle relative URLs as internal', () => {
      const html = `
        <a href="/page">Absolute path</a>
        <a href="page">Relative path</a>
        <a href="../page">Parent path</a>
        <a href="./page">Current path</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(4)
      expect(result.internalLinks).toBe(4)
      expect(result.externalLinks).toBe(0)
      expect(result.links.every((link: { isInternal: boolean }) => link.isInternal)).toBe(true)
    })

    it('should handle protocol-relative URLs', () => {
      const html = '<a href="//example.com/page">Protocol relative</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(1)
      expect(result.links[0].isInternal).toBe(true)
    })

    it('should handle hash-only URLs as internal', () => {
      const html = '<a href="#section">Hash link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(1)
      expect(result.links[0].isInternal).toBe(true)
    })

    it('should handle mixed internal and external links', () => {
      const html = `
        <a href="https://example.com/page1">Internal 1</a>
        <a href="https://external.com">External 1</a>
        <a href="/page2">Internal 2</a>
        <a href="https://another.com">External 2</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(4)
      expect(result.internalLinks).toBe(2)
      expect(result.externalLinks).toBe(2)
    })
  })

  describe('Nofollow Detection', () => {
    it('should detect nofollow link', () => {
      const html = '<a href="https://example.com" rel="nofollow">Nofollow</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.nofollowLinks).toBe(1)
      expect(result.links[0].isNofollow).toBe(true)
    })

    it('should detect nofollow in mixed rel attributes', () => {
      const html = '<a href="https://example.com" rel="noopener nofollow">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.nofollowLinks).toBe(1)
      expect(result.links[0].isNofollow).toBe(true)
    })

    it('should handle case-insensitive nofollow', () => {
      const html = '<a href="https://example.com" rel="NoFollow">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.nofollowLinks).toBe(1)
      expect(result.links[0].isNofollow).toBe(true)
    })

    it('should handle links without rel attribute', () => {
      const html = '<a href="https://example.com">Normal link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.nofollowLinks).toBe(0)
      expect(result.links[0].isNofollow).toBe(false)
    })

    it('should count multiple nofollow links', () => {
      const html = `
        <a href="https://example.com" rel="nofollow">Link 1</a>
        <a href="https://example.com">Link 2</a>
        <a href="https://example.com" rel="nofollow">Link 3</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.nofollowLinks).toBe(2)
    })
  })

  describe('HTML Edge Cases', () => {
    it('should handle links in comments', () => {
      const html = `
        <!-- <a href="https://example.com">Commented link</a> -->
        <a href="https://example.com">Real link</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.links[0].text).toBe('Real link')
    })

    it('should handle mixed case anchor tags', () => {
      const html = '<A HREF="https://example.com">Mixed Case</A>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.links[0].href).toBe('https://example.com')
    })

    it('should handle links with other attributes', () => {
      const html = '<a href="https://example.com" class="link" id="mylink" target="_blank">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.links[0].href).toBe('https://example.com')
    })

    it('should handle empty link text', () => {
      const html = '<a href="https://example.com"></a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.links[0].text).toBe('')
    })

    it('should handle special characters in URLs', () => {
      const html = '<a href="https://example.com/page?query=value&foo=bar#section">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.links[0].href).toBe('https://example.com/page?query=value&foo=bar#section')
    })

    it('should decode HTML entities in link text', () => {
      const html = '<a href="https://example.com">Link &amp; Text &lt;tag&gt;</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.links[0].text).toBe('Link & Text <tag>')
    })
  })

  describe('Special URL Protocols', () => {
    it('should handle mailto links as external', () => {
      const html = '<a href="mailto:test@example.com">Email</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.externalLinks).toBe(1)
      expect(result.links[0].isInternal).toBe(false)
    })

    it('should handle tel links as external', () => {
      const html = '<a href="tel:+1234567890">Phone</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.externalLinks).toBe(1)
    })

    it('should handle javascript links', () => {
      const html = '<a href="javascript:void(0)">JS Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(1)
      expect(result.externalLinks).toBe(1)
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle navigation menu', () => {
      const html = `
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/products">Products</a>
          <a href="/contact">Contact</a>
        </nav>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(4)
      expect(result.internalLinks).toBe(4)
      expect(result.externalLinks).toBe(0)
    })

    it('should handle blog post with external references', () => {
      const html = `
        <article>
          <p>Read more on <a href="/blog/related">our blog</a></p>
          <p>Source: <a href="https://external.com" rel="nofollow">External Article</a></p>
          <p>Contact us at <a href="mailto:info@example.com">info@example.com</a></p>
        </article>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(3)
      expect(result.internalLinks).toBe(1)
      expect(result.externalLinks).toBe(2)
      expect(result.nofollowLinks).toBe(1)
    })

    it('should handle footer with social links', () => {
      const html = `
        <footer>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="https://twitter.com/example" rel="noopener">Twitter</a>
          <a href="https://facebook.com/example" rel="noopener">Facebook</a>
        </footer>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.totalLinks).toBe(4)
      expect(result.internalLinks).toBe(2)
      expect(result.externalLinks).toBe(2)
    })
  })

  describe('Return Type Validation', () => {
    it('should return correct LinkAnalysisResult structure', () => {
      const html = `
        <a href="https://example.com/page">Internal</a>
        <a href="https://external.com" rel="nofollow">External</a>
      `
      const result = analyzeLinks(html, 'https://example.com')

      expect(result).toHaveProperty('totalLinks')
      expect(result).toHaveProperty('internalLinks')
      expect(result).toHaveProperty('externalLinks')
      expect(result).toHaveProperty('nofollowLinks')
      expect(result).toHaveProperty('links')
      expect(Array.isArray(result.links)).toBe(true)
    })

    it('should return LinkInfo with correct structure', () => {
      const html = '<a href="https://example.com">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      const link = result.links[0]
      expect(link).toHaveProperty('href')
      expect(link).toHaveProperty('text')
      expect(link).toHaveProperty('isInternal')
      expect(link).toHaveProperty('isNofollow')
      expect(typeof link.href).toBe('string')
      expect(typeof link.text).toBe('string')
      expect(typeof link.isInternal).toBe('boolean')
      expect(typeof link.isNofollow).toBe('boolean')
    })
  })

  describe('Base URL Handling', () => {
    it('should handle base URL without trailing slash', () => {
      const html = '<a href="/page">Link</a>'
      const result = analyzeLinks(html, 'https://example.com')

      expect(result.internalLinks).toBe(1)
    })

    it('should handle base URL with trailing slash', () => {
      const html = '<a href="/page">Link</a>'
      const result = analyzeLinks(html, 'https://example.com/')

      expect(result.internalLinks).toBe(1)
    })

    it('should handle base URL with path', () => {
      const html = '<a href="/page">Link</a>'
      const result = analyzeLinks(html, 'https://example.com/blog/post')

      expect(result.internalLinks).toBe(1)
    })

    it('should handle base URL with port', () => {
      const html = '<a href="https://example.com:8080/page">Link</a>'
      const result = analyzeLinks(html, 'https://example.com:8080')

      expect(result.internalLinks).toBe(1)
    })
  })
})
