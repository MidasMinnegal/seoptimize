/**
 * Header Analyzer Tests
 * Feature: 001-input-field-fetches
 *
 * Tests for analyzing heading structure in HTML content for SEO purposes.
 * Following TDD approach - these tests should fail initially.
 */

import { analyzeHeaders } from '@/lib/seo/analyzers/header-analyzer'
import type { HeadingInfo } from '@/types/seo'

describe('analyzeHeaders', () => {
  describe('Empty and No Headers', () => {
    it('should handle empty HTML', () => {
      const html = ''
      const result = analyzeHeaders(html)

      expect(result.headings.h1).toEqual([])
      expect(result.headings.h2).toEqual([])
      expect(result.headings.h3).toEqual([])
      expect(result.headings.h4).toEqual([])
      expect(result.headings.h5).toEqual([])
      expect(result.headings.h6).toEqual([])
      expect(result.hasProperH1).toBe(false)
      expect(result.hasProperHierarchy).toBe(true) // No headers = no violations
    })

    it('should handle HTML with no headers', () => {
      const html = '<html><body><p>No headers here</p></body></html>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1).toEqual([])
      expect(result.hasProperH1).toBe(false)
      expect(result.hasProperHierarchy).toBe(true)
    })

    it('should handle whitespace-only HTML', () => {
      const html = '   \n\t  '
      const result = analyzeHeaders(html)

      expect(result.headings.h1).toEqual([])
      expect(result.hasProperH1).toBe(false)
    })
  })

  describe('H1 Tag Detection', () => {
    it('should extract single H1 tag', () => {
      const html = '<html><body><h1>Main Heading</h1></body></html>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(1)
      expect(result.headings.h1[0]).toEqual({
        level: 1,
        text: 'Main Heading',
        position: 0,
      })
      expect(result.hasProperH1).toBe(true)
    })

    it('should detect multiple H1 tags', () => {
      const html = `
        <h1>First Heading</h1>
        <h1>Second Heading</h1>
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(2)
      expect(result.headings.h1[0].text).toBe('First Heading')
      expect(result.headings.h1[1].text).toBe('Second Heading')
      expect(result.hasProperH1).toBe(false) // Multiple H1s = improper
    })

    it('should detect missing H1 tag', () => {
      const html = '<html><body><h2>Subheading</h2><p>Content</p></body></html>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(0)
      expect(result.hasProperH1).toBe(false)
    })

    it('should trim whitespace from H1 text', () => {
      const html = '<h1>  Padded Heading  </h1>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1[0].text).toBe('Padded Heading')
    })

    it('should decode HTML entities in H1', () => {
      const html = '<h1>Test &amp; Heading &quot;Quoted&quot;</h1>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1[0].text).toBe('Test & Heading "Quoted"')
    })

    it('should handle empty H1 tag', () => {
      const html = '<h1></h1>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(1)
      expect(result.headings.h1[0].text).toBe('')
    })
  })

  describe('Multiple Heading Levels', () => {
    it('should extract all heading levels', () => {
      const html = `
        <h1>Level 1</h1>
        <h2>Level 2</h2>
        <h3>Level 3</h3>
        <h4>Level 4</h4>
        <h5>Level 5</h5>
        <h6>Level 6</h6>
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(1)
      expect(result.headings.h2.length).toBe(1)
      expect(result.headings.h3.length).toBe(1)
      expect(result.headings.h4.length).toBe(1)
      expect(result.headings.h5.length).toBe(1)
      expect(result.headings.h6.length).toBe(1)

      expect(result.headings.h1[0].text).toBe('Level 1')
      expect(result.headings.h2[0].text).toBe('Level 2')
      expect(result.headings.h3[0].text).toBe('Level 3')
    })

    it('should track heading positions correctly', () => {
      const html = `
        <h2>First H2</h2>
        <h2>Second H2</h2>
        <h2>Third H2</h2>
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h2[0].position).toBe(0)
      expect(result.headings.h2[1].position).toBe(1)
      expect(result.headings.h2[2].position).toBe(2)
    })

    it('should handle mixed heading order', () => {
      const html = `
        <h3>H3 First</h3>
        <h1>H1 Second</h1>
        <h2>H2 Third</h2>
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h3[0].position).toBe(0)
      expect(result.headings.h1[0].position).toBe(1)
      expect(result.headings.h2[0].position).toBe(2)
    })
  })

  describe('Heading Hierarchy Validation', () => {
    it('should validate proper hierarchy (H1 → H2 → H3)', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(true)
    })

    it('should detect hierarchy skip (H1 → H3)', () => {
      const html = `
        <h1>Main Title</h1>
        <h3>Skipped H2</h3>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(false)
    })

    it('should detect hierarchy skip (H2 → H4)', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Section</h2>
        <h4>Skipped H3</h4>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(false)
    })

    it('should allow multiple headings at same level', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Section 1</h2>
        <h2>Section 2</h2>
        <h3>Subsection 1</h3>
        <h3>Subsection 2</h3>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(true)
    })

    it('should allow going back to higher level', () => {
      const html = `
        <h1>Main Title</h1>
        <h2>Section 1</h2>
        <h3>Subsection</h3>
        <h2>Section 2</h2>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(true)
    })

    it('should detect starting with H2 (missing H1)', () => {
      const html = `
        <h2>Section</h2>
        <h3>Subsection</h3>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(false)
    })

    it('should allow H1 without other headings', () => {
      const html = '<h1>Only Heading</h1>'
      const result = analyzeHeaders(html)

      expect(result.hasProperHierarchy).toBe(true)
    })
  })

  describe('HTML Edge Cases', () => {
    it('should handle headings in comments', () => {
      const html = `
        <h1>Visible Heading</h1>
        <!-- <h1>Commented Heading</h1> -->
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(1)
      expect(result.headings.h1[0].text).toBe('Visible Heading')
    })

    it('should handle mixed case heading tags', () => {
      const html = '<H1>Uppercase Tag</H1><H2>Another Uppercase</H2>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(1)
      expect(result.headings.h2.length).toBe(1)
    })

    it('should handle headings with attributes', () => {
      const html = '<h1 class="title" id="main">Heading with Attributes</h1>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1[0].text).toBe('Heading with Attributes')
    })

    it('should handle headings with nested elements', () => {
      const html = '<h1>Heading with <strong>bold</strong> text</h1>'
      const result = analyzeHeaders(html)

      expect(result.headings.h1[0].text).toBe('Heading with bold text')
    })

    it('should handle self-closing heading tags (invalid but possible)', () => {
      const html = '<h1/><h2>Valid Heading</h2>'
      const result = analyzeHeaders(html)

      // Self-closing heading tags should be ignored
      expect(result.headings.h2.length).toBe(1)
    })

    it('should handle malformed HTML gracefully', () => {
      const html = '<h1>Unclosed heading<h2>Another heading</h2>'
      const result = analyzeHeaders(html)

      // Should still extract what it can
      expect(result.headings.h1.length).toBeGreaterThan(0)
      expect(result.headings.h2.length).toBeGreaterThan(0)
    })
  })

  describe('Real-World Scenarios', () => {
    it('should handle blog post structure', () => {
      const html = `
        <article>
          <h1>Blog Post Title</h1>
          <p>Introduction</p>
          <h2>Section 1</h2>
          <p>Content</p>
          <h3>Subsection 1.1</h3>
          <p>More content</p>
          <h2>Section 2</h2>
          <p>Content</p>
        </article>
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(1)
      expect(result.headings.h2.length).toBe(2)
      expect(result.headings.h3.length).toBe(1)
      expect(result.hasProperH1).toBe(true)
      expect(result.hasProperHierarchy).toBe(true)
    })

    it('should handle documentation page structure', () => {
      const html = `
        <h1>API Documentation</h1>
        <h2>Getting Started</h2>
        <h3>Installation</h3>
        <h3>Configuration</h3>
        <h2>API Reference</h2>
        <h3>Authentication</h3>
        <h4>OAuth</h4>
        <h4>API Keys</h4>
        <h3>Endpoints</h3>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperH1).toBe(true)
      expect(result.hasProperHierarchy).toBe(true)
    })

    it('should handle e-commerce product page (no H1)', () => {
      const html = `
        <div class="product">
          <h2>Product Name</h2>
          <p>Description</p>
          <h3>Specifications</h3>
          <h3>Reviews</h3>
        </div>
      `
      const result = analyzeHeaders(html)

      expect(result.hasProperH1).toBe(false)
      expect(result.hasProperHierarchy).toBe(false) // Missing H1
    })

    it('should handle landing page with multiple H1s (bad SEO)', () => {
      const html = `
        <h1>Welcome to Our Site</h1>
        <section>
          <h1>Feature 1</h1>
          <p>Description</p>
        </section>
        <section>
          <h1>Feature 2</h1>
          <p>Description</p>
        </section>
      `
      const result = analyzeHeaders(html)

      expect(result.headings.h1.length).toBe(3)
      expect(result.hasProperH1).toBe(false)
    })
  })

  describe('Return Type Validation', () => {
    it('should return correct HeaderAnalysisResult structure', () => {
      const html = '<h1>Test</h1><h2>Subheading</h2>'
      const result = analyzeHeaders(html)

      expect(result).toHaveProperty('headings')
      expect(result).toHaveProperty('hasProperH1')
      expect(result).toHaveProperty('hasProperHierarchy')

      expect(result.headings).toHaveProperty('h1')
      expect(result.headings).toHaveProperty('h2')
      expect(result.headings).toHaveProperty('h3')
      expect(result.headings).toHaveProperty('h4')
      expect(result.headings).toHaveProperty('h5')
      expect(result.headings).toHaveProperty('h6')

      expect(typeof result.hasProperH1).toBe('boolean')
      expect(typeof result.hasProperHierarchy).toBe('boolean')
    })

    it('should return HeadingInfo with correct structure', () => {
      const html = '<h1>Test Heading</h1>'
      const result = analyzeHeaders(html)

      const heading: HeadingInfo = result.headings.h1[0]

      expect(heading).toHaveProperty('level')
      expect(heading).toHaveProperty('text')
      expect(heading).toHaveProperty('position')

      expect(typeof heading.level).toBe('number')
      expect(typeof heading.text).toBe('string')
      expect(typeof heading.position).toBe('number')
    })
  })
})
