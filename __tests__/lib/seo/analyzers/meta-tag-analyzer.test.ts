/**
 * Meta Tag Analyzer Tests
 * Feature: 001-input-field-fetches
 *
 * Tests for analyzing meta tags in HTML content for SEO purposes.
 * Following TDD approach - these tests should fail initially.
 */

import { analyzeMetaTags } from '@/lib/seo/analyzers/meta-tag-analyzer'
import type { MetaTag } from '@/types/seo'

describe('analyzeMetaTags', () => {
  describe('Empty and No Meta Tags', () => {
    it('should handle empty HTML', () => {
      const html = ''
      const result = analyzeMetaTags(html)

      expect(result.title).toBeNull()
      expect(result.description).toBeNull()
      expect(result.robots).toBeNull()
      expect(result.duplicateTags).toEqual([])
    })

    it('should handle HTML with no meta tags or title', () => {
      const html = '<html><body><p>No meta tags here</p></body></html>'
      const result = analyzeMetaTags(html)

      expect(result.title).toBeNull()
      expect(result.description).toBeNull()
      expect(result.robots).toBeNull()
      expect(result.duplicateTags).toEqual([])
    })

    it('should handle whitespace-only HTML', () => {
      const html = '   \n\t  '
      const result = analyzeMetaTags(html)

      expect(result.title).toBeNull()
      expect(result.description).toBeNull()
      expect(result.robots).toBeNull()
    })
  })

  describe('Title Tag Analysis', () => {
    it('should extract basic title tag', () => {
      const html = '<html><head><title>Test Page Title</title></head></html>'
      const result = analyzeMetaTags(html)

      expect(result.title).not.toBeNull()
      if (result.title) {
        expect(result.title.content).toBe('Test Page Title')
        expect(result.title.length).toBe(15)
        expect(result.title.isOptimalLength).toBe(false)
      }
    })

    it('should detect optimal title length (50-60 chars)', () => {
      const html = '<title>This is an optimal title length for SEO purposes</title>'
      const result = analyzeMetaTags(html)

      expect(result.title).not.toBeNull()
      if (result.title) {
        expect(result.title.content).toBe('This is an optimal title length for SEO purposes')
        expect(result.title.length).toBe(48)
        expect(result.title.isOptimalLength).toBe(false) // Just below 50
      }
    })

    it('should mark 50 char title as optimal', () => {
      const title = 'A'.repeat(50)
      const html = `<title>${title}</title>`
      const result = analyzeMetaTags(html)

      expect(result.title?.length).toBe(50)
      expect(result.title?.isOptimalLength).toBe(true)
    })

    it('should mark 60 char title as optimal', () => {
      const title = 'A'.repeat(60)
      const html = `<title>${title}</title>`
      const result = analyzeMetaTags(html)

      expect(result.title?.length).toBe(60)
      expect(result.title?.isOptimalLength).toBe(true)
    })

    it('should mark 55 char title as optimal', () => {
      const title = 'A'.repeat(55)
      const html = `<title>${title}</title>`
      const result = analyzeMetaTags(html)

      expect(result.title?.length).toBe(55)
      expect(result.title?.isOptimalLength).toBe(true)
    })

    it('should detect title too short', () => {
      const html = '<title>Short</title>'
      const result = analyzeMetaTags(html)

      expect(result.title?.length).toBe(5)
      expect(result.title?.isOptimalLength).toBe(false)
    })

    it('should detect title too long', () => {
      const title = 'A'.repeat(100)
      const html = `<title>${title}</title>`
      const result = analyzeMetaTags(html)

      expect(result.title?.length).toBe(100)
      expect(result.title?.isOptimalLength).toBe(false)
    })

    it('should handle empty title tag', () => {
      const html = '<title></title>'
      const result = analyzeMetaTags(html)

      expect(result.title).not.toBeNull()
      if (result.title) {
        expect(result.title.content).toBe('')
        expect(result.title.length).toBe(0)
        expect(result.title.isOptimalLength).toBe(false)
      }
    })

    it('should trim whitespace from title', () => {
      const html = '<title>  Padded Title  </title>'
      const result = analyzeMetaTags(html)

      expect(result.title?.content).toBe('Padded Title')
      expect(result.title?.length).toBe(12)
    })

    it('should decode HTML entities in title', () => {
      const html = '<title>Test &amp; Title &quot;Quoted&quot;</title>'
      const result = analyzeMetaTags(html)

      expect(result.title?.content).toBe('Test & Title "Quoted"')
    })

    it('should handle multiple title tags (use first)', () => {
      const html = `
        <title>First Title</title>
        <title>Second Title</title>
      `
      const result = analyzeMetaTags(html)

      expect(result.title?.content).toBe('First Title')
    })
  })

  describe('Meta Description Analysis', () => {
    it('should extract meta description with name attribute', () => {
      const html = '<meta name="description" content="This is a test description" />'
      const result = analyzeMetaTags(html)

      expect(result.description).not.toBeNull()
      if (result.description) {
        expect(result.description.name).toBe('description')
        expect(result.description.content).toBe('This is a test description')
        expect(result.description.length).toBe(26)
      }
    })

    it('should extract meta description with property attribute', () => {
      const html = '<meta property="description" content="Description via property" />'
      const result = analyzeMetaTags(html)

      expect(result.description).not.toBeNull()
      if (result.description) {
        expect(result.description.content).toBe('Description via property')
      }
    })

    it('should handle empty meta description', () => {
      const html = '<meta name="description" content="" />'
      const result = analyzeMetaTags(html)

      expect(result.description).not.toBeNull()
      if (result.description) {
        expect(result.description.content).toBe('')
        expect(result.description.length).toBe(0)
      }
    })

    it('should trim whitespace from description', () => {
      const html = '<meta name="description" content="  Padded description  " />'
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('Padded description')
      expect(result.description?.length).toBe(18)
    })

    it('should decode HTML entities in description', () => {
      const html = '<meta name="description" content="Test &amp; Description &lt;tag&gt;" />'
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('Test & Description <tag>')
    })

    it('should handle long description', () => {
      const longDesc = 'A'.repeat(200)
      const html = `<meta name="description" content="${longDesc}" />`
      const result = analyzeMetaTags(html)

      expect(result.description?.length).toBe(200)
      expect(result.description?.content).toBe(longDesc)
    })

    it('should return null when no description tag exists', () => {
      const html = '<html><head><title>No Description</title></head></html>'
      const result = analyzeMetaTags(html)

      expect(result.description).toBeNull()
    })
  })

  describe('Robots Meta Tag Analysis', () => {
    it('should extract robots meta tag', () => {
      const html = '<meta name="robots" content="index, follow" />'
      const result = analyzeMetaTags(html)

      expect(result.robots).not.toBeNull()
      if (result.robots) {
        expect(result.robots.name).toBe('robots')
        expect(result.robots.content).toBe('index, follow')
        expect(result.robots.length).toBe(13)
      }
    })

    it('should handle noindex, nofollow', () => {
      const html = '<meta name="robots" content="noindex, nofollow" />'
      const result = analyzeMetaTags(html)

      expect(result.robots?.content).toBe('noindex, nofollow')
    })

    it('should handle none directive', () => {
      const html = '<meta name="robots" content="none" />'
      const result = analyzeMetaTags(html)

      expect(result.robots?.content).toBe('none')
    })

    it('should handle multiple directives', () => {
      const html = '<meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />'
      const result = analyzeMetaTags(html)

      expect(result.robots?.content).toBe('noindex, nofollow, noarchive, nosnippet')
    })

    it('should return null when no robots tag exists', () => {
      const html = '<html><head><title>No Robots</title></head></html>'
      const result = analyzeMetaTags(html)

      expect(result.robots).toBeNull()
    })

    it('should trim whitespace from robots content', () => {
      const html = '<meta name="robots" content="  index, follow  " />'
      const result = analyzeMetaTags(html)

      expect(result.robots?.content).toBe('index, follow')
    })
  })

  describe('Duplicate Meta Tags Detection', () => {
    it('should detect duplicate description tags', () => {
      const html = `
        <meta name="description" content="First description" />
        <meta name="description" content="Second description" />
      `
      const result = analyzeMetaTags(html)

      expect(result.duplicateTags).toContain('description')
      expect(result.duplicateTags.length).toBeGreaterThan(0)
    })

    it('should detect duplicate robots tags', () => {
      const html = `
        <meta name="robots" content="index, follow" />
        <meta name="robots" content="noindex" />
      `
      const result = analyzeMetaTags(html)

      expect(result.duplicateTags).toContain('robots')
    })

    it('should detect multiple duplicate tags', () => {
      const html = `
        <meta name="description" content="First" />
        <meta name="description" content="Second" />
        <meta name="robots" content="index" />
        <meta name="robots" content="noindex" />
        <meta name="keywords" content="key1" />
        <meta name="keywords" content="key2" />
      `
      const result = analyzeMetaTags(html)

      expect(result.duplicateTags).toContain('description')
      expect(result.duplicateTags).toContain('robots')
      expect(result.duplicateTags).toContain('keywords')
      expect(result.duplicateTags.length).toBe(3)
    })

    it('should not flag single tags as duplicates', () => {
      const html = `
        <meta name="description" content="Only one" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="unique" />
      `
      const result = analyzeMetaTags(html)

      expect(result.duplicateTags).toEqual([])
    })

    it('should handle case-insensitive duplicate detection', () => {
      const html = `
        <meta name="description" content="First" />
        <meta name="Description" content="Second" />
      `
      const result = analyzeMetaTags(html)

      expect(result.duplicateTags).toContain('description')
    })
  })

  describe('Open Graph Tags (Optional)', () => {
    it('should extract og:title', () => {
      const html = '<meta property="og:title" content="Open Graph Title" />'
      const result = analyzeMetaTags(html)

      expect(result.openGraph).toBeDefined()
      if (result.openGraph) {
        const ogTitle = result.openGraph.find((tag: MetaTag) => tag.name === 'og:title')
        expect(ogTitle).toBeDefined()
        if (ogTitle) {
          expect(ogTitle.content).toBe('Open Graph Title')
        }
      }
    })

    it('should extract multiple Open Graph tags', () => {
      const html = `
        <meta property="og:title" content="OG Title" />
        <meta property="og:description" content="OG Description" />
        <meta property="og:image" content="https://example.com/image.jpg" />
        <meta property="og:url" content="https://example.com" />
      `
      const result = analyzeMetaTags(html)

      expect(result.openGraph).toBeDefined()
      if (result.openGraph) {
        expect(result.openGraph.length).toBe(4)
        expect(result.openGraph.map((tag: MetaTag) => tag.name)).toContain('og:title')
        expect(result.openGraph.map((tag: MetaTag) => tag.name)).toContain('og:description')
        expect(result.openGraph.map((tag: MetaTag) => tag.name)).toContain('og:image')
        expect(result.openGraph.map((tag: MetaTag) => tag.name)).toContain('og:url')
      }
    })

    it('should return empty array when no OG tags exist', () => {
      const html = '<html><head><title>No OG Tags</title></head></html>'
      const result = analyzeMetaTags(html)

      if (result.openGraph !== undefined) {
        expect(result.openGraph).toEqual([])
      }
    })
  })

  describe('Twitter Card Tags (Optional)', () => {
    it('should extract twitter:card', () => {
      const html = '<meta name="twitter:card" content="summary_large_image" />'
      const result = analyzeMetaTags(html)

      expect(result.twitterCard).toBeDefined()
      if (result.twitterCard) {
        const twitterCard = result.twitterCard.find((tag: MetaTag) => tag.name === 'twitter:card')
        expect(twitterCard).toBeDefined()
        if (twitterCard) {
          expect(twitterCard.content).toBe('summary_large_image')
        }
      }
    })

    it('should extract multiple Twitter Card tags', () => {
      const html = `
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Twitter Title" />
        <meta name="twitter:description" content="Twitter Description" />
        <meta name="twitter:image" content="https://example.com/twitter.jpg" />
      `
      const result = analyzeMetaTags(html)

      expect(result.twitterCard).toBeDefined()
      if (result.twitterCard) {
        expect(result.twitterCard.length).toBe(4)
        expect(result.twitterCard.map((tag: MetaTag) => tag.name)).toContain('twitter:card')
        expect(result.twitterCard.map((tag: MetaTag) => tag.name)).toContain('twitter:title')
        expect(result.twitterCard.map((tag: MetaTag) => tag.name)).toContain('twitter:description')
        expect(result.twitterCard.map((tag: MetaTag) => tag.name)).toContain('twitter:image')
      }
    })

    it('should return empty array when no Twitter tags exist', () => {
      const html = '<html><head><title>No Twitter Tags</title></head></html>'
      const result = analyzeMetaTags(html)

      if (result.twitterCard !== undefined) {
        expect(result.twitterCard).toEqual([])
      }
    })
  })

  describe('HTML Variations and Edge Cases', () => {
    it('should handle self-closing meta tags', () => {
      const html = '<meta name="description" content="Self closing" />'
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('Self closing')
    })

    it('should handle non-self-closing meta tags', () => {
      const html = '<meta name="description" content="No self close">'
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('No self close')
    })

    it('should handle meta tags in comments', () => {
      const html = `
        <meta name="description" content="Visible" />
        <!-- <meta name="robots" content="Commented out" /> -->
      `
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('Visible')
      expect(result.robots).toBeNull()
    })

    it('should handle mixed case attribute names', () => {
      const html = '<META NAME="description" CONTENT="Mixed Case" />'
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('Mixed Case')
    })

    it('should handle single quotes in attributes', () => {
      const html = "<meta name='description' content='Single quotes' />"
      const result = analyzeMetaTags(html)

      expect(result.description?.content).toBe('Single quotes')
    })

    it('should handle no quotes in attributes (if valid HTML)', () => {
      const html = '<meta name=description content=NoQuotes />'
      const result = analyzeMetaTags(html)

      // Depending on parser, this might work or not
      // The test should be lenient
      if (result.description) {
        expect(result.description.content).toBeDefined()
      }
    })

    it('should handle malformed HTML gracefully', () => {
      const html = '<meta name="description" content="Valid"<meta name="broken">'
      const result = analyzeMetaTags(html)

      // Should still extract what it can
      expect(result.description?.content).toBe('Valid')
    })
  })

  describe('Real-World HTML Scenarios', () => {
    it('should handle complete HTML document with all meta tags', () => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Complete SEO Example - Best Practices for Modern Web</title>
            <meta name="description" content="Learn the best SEO practices for modern web development with comprehensive examples and detailed explanations." />
            <meta name="robots" content="index, follow" />
            <meta property="og:title" content="Complete SEO Example" />
            <meta property="og:description" content="SEO best practices guide" />
            <meta property="og:image" content="https://example.com/og-image.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="SEO Guide" />
          </head>
          <body>
            <h1>Content</h1>
          </body>
        </html>
      `
      const result = analyzeMetaTags(html)

      expect(result.title?.content).toBe('Complete SEO Example - Best Practices for Modern Web')
      expect(result.title?.length).toBe(52)
      expect(result.title?.isOptimalLength).toBe(true)
      expect(result.description?.content).toBe(
        'Learn the best SEO practices for modern web development with comprehensive examples and detailed explanations.'
      )
      expect(result.robots?.content).toBe('index, follow')
      expect(result.duplicateTags).toEqual([])

      if (result.openGraph) {
        expect(result.openGraph.length).toBe(3)
      }

      if (result.twitterCard) {
        expect(result.twitterCard.length).toBe(2)
      }
    })

    it('should handle blog post with minimal meta tags', () => {
      const html = `
        <html>
          <head>
            <title>My Blog Post</title>
            <meta name="description" content="A simple blog post about web development." />
          </head>
          <body>
            <article>Content here</article>
          </body>
        </html>
      `
      const result = analyzeMetaTags(html)

      expect(result.title?.content).toBe('My Blog Post')
      expect(result.description?.content).toBe('A simple blog post about web development.')
      expect(result.robots).toBeNull()
      expect(result.duplicateTags).toEqual([])
    })

    it('should handle e-commerce page with extensive meta tags', () => {
      const html = `
        <head>
          <title>Premium Blue Running Shoes - Free Shipping Available</title>
          <meta name="description" content="Shop our premium blue running shoes with free shipping. Best prices, 30-day returns, and expert customer support." />
          <meta name="robots" content="index, follow, max-image-preview:large" />
          <meta property="og:type" content="product" />
          <meta property="og:title" content="Premium Blue Running Shoes" />
          <meta property="og:description" content="Premium running shoes with free shipping" />
          <meta property="og:image" content="https://shop.example.com/product-image.jpg" />
          <meta property="og:price:amount" content="79.99" />
          <meta property="og:price:currency" content="USD" />
          <meta name="twitter:card" content="product" />
          <meta name="twitter:title" content="Premium Blue Running Shoes" />
          <meta name="twitter:image" content="https://shop.example.com/twitter-image.jpg" />
        </head>
      `
      const result = analyzeMetaTags(html)

      expect(result.title?.content).toBe('Premium Blue Running Shoes - Free Shipping Available')
      expect(result.description).not.toBeNull()
      expect(result.robots).not.toBeNull()

      if (result.openGraph) {
        expect(result.openGraph.length).toBeGreaterThan(4)
      }

      if (result.twitterCard) {
        expect(result.twitterCard.length).toBeGreaterThan(0)
      }
    })

    it('should handle page with SEO issues (missing tags)', () => {
      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <h1>Page with no SEO meta tags</h1>
          </body>
        </html>
      `
      const result = analyzeMetaTags(html)

      expect(result.title).toBeNull()
      expect(result.description).toBeNull()
      expect(result.robots).toBeNull()
    })
  })

  describe('Return Type Validation', () => {
    it('should return correct MetaTagAnalysisResult structure', () => {
      const html = `
        <title>Test</title>
        <meta name="description" content="Test description" />
      `
      const result = analyzeMetaTags(html)

      // Verify all required fields exist
      expect(result).toHaveProperty('title')
      expect(result).toHaveProperty('description')
      expect(result).toHaveProperty('robots')
      expect(result).toHaveProperty('duplicateTags')

      // Verify types
      expect(Array.isArray(result.duplicateTags)).toBe(true)
    })

    it('should return TitleTag with correct structure', () => {
      const html = '<title>Test Title</title>'
      const result = analyzeMetaTags(html)

      if (result.title) {
        expect(result.title).toHaveProperty('content')
        expect(result.title).toHaveProperty('length')
        expect(result.title).toHaveProperty('isOptimalLength')

        expect(typeof result.title.content).toBe('string')
        expect(typeof result.title.length).toBe('number')
        expect(typeof result.title.isOptimalLength).toBe('boolean')
      }
    })

    it('should return MetaTag with correct structure', () => {
      const html = '<meta name="description" content="Test" />'
      const result = analyzeMetaTags(html)

      if (result.description) {
        expect(result.description).toHaveProperty('name')
        expect(result.description).toHaveProperty('content')
        expect(result.description).toHaveProperty('length')

        expect(typeof result.description.name).toBe('string')
        expect(typeof result.description.content).toBe('string')
        expect(typeof result.description.length).toBe('number')
      }
    })
  })
})
