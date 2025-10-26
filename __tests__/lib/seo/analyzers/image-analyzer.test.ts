/**
 * Image Analyzer Tests
 * Feature: 001-input-field-fetches
 *
 * Tests for analyzing images in HTML content for SEO purposes.
 * Following TDD approach - these tests should fail initially.
 */

import { analyzeImages } from '@/lib/seo/analyzers/image-analyzer'
import type { ImageInfo } from '@/types/seo'

describe('analyzeImages', () => {
  describe('Empty and No Images', () => {
    it('should handle empty HTML', () => {
      const html = ''
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(0)
      expect(result.imagesWithAlt).toBe(0)
      expect(result.imagesMissingAlt).toBe(0)
      expect(result.imagesWithEmptyAlt).toBe(0)
      expect(result.images).toEqual([])
    })

    it('should handle HTML with no images', () => {
      const html = '<html><body><p>No images here</p></body></html>'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(0)
      expect(result.imagesWithAlt).toBe(0)
      expect(result.imagesMissingAlt).toBe(0)
      expect(result.imagesWithEmptyAlt).toBe(0)
      expect(result.images).toEqual([])
    })

    it('should handle whitespace-only HTML', () => {
      const html = '   \n\t  '
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(0)
      expect(result.images).toEqual([])
    })
  })

  describe('Single Image Scenarios', () => {
    it('should extract image with proper alt text', () => {
      const html = '<img src="logo.png" alt="Company Logo" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.imagesWithAlt).toBe(1)
      expect(result.imagesMissingAlt).toBe(0)
      expect(result.imagesWithEmptyAlt).toBe(0)
      expect(result.images).toHaveLength(1)
      expect(result.images[0]).toEqual({
        src: 'logo.png',
        alt: 'Company Logo',
        position: 0,
      })
    })

    it('should detect image with missing alt attribute', () => {
      const html = '<img src="photo.jpg" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.imagesWithAlt).toBe(0)
      expect(result.imagesMissingAlt).toBe(1)
      expect(result.imagesWithEmptyAlt).toBe(0)
      expect(result.images).toHaveLength(1)
      expect(result.images[0]).toEqual({
        src: 'photo.jpg',
        alt: null,
        position: 0,
      })
    })

    it('should detect image with empty alt text (alt="")', () => {
      const html = '<img src="decorative.png" alt="" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.imagesWithAlt).toBe(0)
      expect(result.imagesMissingAlt).toBe(0)
      expect(result.imagesWithEmptyAlt).toBe(1)
      expect(result.images).toHaveLength(1)
      expect(result.images[0]).toEqual({
        src: 'decorative.png',
        alt: '',
        position: 0,
      })
    })

    it('should handle image with whitespace-only alt text', () => {
      const html = '<img src="image.jpg" alt="   " />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.imagesWithAlt).toBe(1)
      expect(result.imagesMissingAlt).toBe(0)
      expect(result.imagesWithEmptyAlt).toBe(0)
      expect(result.images[0].alt).toBe('   ')
    })
  })

  describe('Multiple Images', () => {
    it('should extract multiple images with correct positions', () => {
      const html = `
        <div>
          <img src="first.png" alt="First Image" />
          <p>Some text</p>
          <img src="second.jpg" alt="Second Image" />
          <img src="third.gif" alt="Third Image" />
        </div>
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(3)
      expect(result.imagesWithAlt).toBe(3)
      expect(result.imagesMissingAlt).toBe(0)
      expect(result.imagesWithEmptyAlt).toBe(0)
      expect(result.images).toHaveLength(3)
      expect(result.images[0]).toEqual({ src: 'first.png', alt: 'First Image', position: 0 })
      expect(result.images[1]).toEqual({ src: 'second.jpg', alt: 'Second Image', position: 1 })
      expect(result.images[2]).toEqual({ src: 'third.gif', alt: 'Third Image', position: 2 })
    })

    it('should handle mixed alt text scenarios', () => {
      const html = `
        <img src="with-alt.png" alt="Has Alt" />
        <img src="no-alt.jpg" />
        <img src="empty-alt.gif" alt="" />
        <img src="another-alt.webp" alt="Another Alt" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(4)
      expect(result.imagesWithAlt).toBe(2)
      expect(result.imagesMissingAlt).toBe(1)
      expect(result.imagesWithEmptyAlt).toBe(1)
      expect(result.images).toHaveLength(4)

      expect(result.images[0]).toEqual({ src: 'with-alt.png', alt: 'Has Alt', position: 0 })
      expect(result.images[1]).toEqual({ src: 'no-alt.jpg', alt: null, position: 1 })
      expect(result.images[2]).toEqual({ src: 'empty-alt.gif', alt: '', position: 2 })
      expect(result.images[3]).toEqual({ src: 'another-alt.webp', alt: 'Another Alt', position: 3 })
    })

    it('should count categories correctly', () => {
      const html = `
        <img src="1.png" alt="Good" />
        <img src="2.png" alt="Also Good" />
        <img src="3.png" />
        <img src="4.png" />
        <img src="5.png" alt="" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(5)
      expect(result.imagesWithAlt).toBe(2) // 2 with actual alt text
      expect(result.imagesMissingAlt).toBe(2) // 2 without alt attribute
      expect(result.imagesWithEmptyAlt).toBe(1) // 1 with empty alt
    })
  })

  describe('Different Image Formats and Paths', () => {
    it('should handle absolute URLs', () => {
      const html = '<img src="https://example.com/image.png" alt="Remote Image" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0].src).toBe('https://example.com/image.png')
    })

    it('should handle relative paths', () => {
      const html = `
        <img src="/images/logo.png" alt="Absolute path" />
        <img src="../assets/photo.jpg" alt="Relative path" />
        <img src="./icon.svg" alt="Current dir" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(3)
      expect(result.images[0].src).toBe('/images/logo.png')
      expect(result.images[1].src).toBe('../assets/photo.jpg')
      expect(result.images[2].src).toBe('./icon.svg')
    })

    it('should handle data URIs', () => {
      const html = '<img src="data:image/png;base64,iVBORw0KGg..." alt="Inline Image" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0].src).toBe('data:image/png;base64,iVBORw0KGg...')
    })

    it('should handle various image file extensions', () => {
      const html = `
        <img src="photo.jpg" alt="JPEG" />
        <img src="graphic.png" alt="PNG" />
        <img src="animation.gif" alt="GIF" />
        <img src="modern.webp" alt="WebP" />
        <img src="vector.svg" alt="SVG" />
        <img src="icon.ico" alt="ICO" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(6)
      expect(result.images.map((img: ImageInfo) => img.src)).toEqual([
        'photo.jpg',
        'graphic.png',
        'animation.gif',
        'modern.webp',
        'vector.svg',
        'icon.ico',
      ])
    })
  })

  describe('HTML Variations and Edge Cases', () => {
    it('should handle self-closing img tags', () => {
      const html = '<img src="self-close.png" alt="Self Closing" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
    })

    it('should handle non-self-closing img tags', () => {
      const html = '<img src="no-close.png" alt="No Self Close">'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
    })

    it('should handle images with additional attributes', () => {
      const html = `
        <img 
          src="complex.png" 
          alt="Complex Image"
          width="800"
          height="600"
          loading="lazy"
          class="responsive"
          id="hero-image"
          data-test="image"
        />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0]).toEqual({
        src: 'complex.png',
        alt: 'Complex Image',
        position: 0,
      })
    })

    it('should ignore images in comments', () => {
      const html = `
        <img src="visible.png" alt="Visible" />
        <!-- <img src="commented.png" alt="Commented Out" /> -->
        <img src="also-visible.jpg" alt="Also Visible" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(2)
      expect(result.images.map((img: ImageInfo) => img.src)).toEqual([
        'visible.png',
        'also-visible.jpg',
      ])
    })

    it('should handle malformed HTML gracefully', () => {
      const html = '<img src="test.png" alt="Test" <img src="broken.jpg">'
      const result = analyzeImages(html)

      // Should still extract what it can
      expect(result.totalImages).toBeGreaterThanOrEqual(1)
    })

    it('should handle images in nested structures', () => {
      const html = `
        <div class="gallery">
          <div class="row">
            <div class="col">
              <figure>
                <img src="nested1.jpg" alt="Nested 1" />
              </figure>
            </div>
            <div class="col">
              <picture>
                <source srcset="modern.webp" type="image/webp">
                <img src="nested2.jpg" alt="Nested 2" />
              </picture>
            </div>
          </div>
        </div>
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(2)
      expect(result.images.map((img: ImageInfo) => img.src)).toEqual(['nested1.jpg', 'nested2.jpg'])
    })
  })

  describe('Special Alt Text Cases', () => {
    it('should preserve special characters in alt text', () => {
      const html = `
        <img src="special.png" alt="Image with &quot;quotes&quot; & ampersands" />
      `
      const result = analyzeImages(html)

      expect(result.images[0].alt).toBe('Image with "quotes" & ampersands')
    })

    it('should decode numeric HTML entities in alt text', () => {
      const html = '<img src="numeric.png" alt="Test &#65;&#66;&#67; entities" />'
      const result = analyzeImages(html)

      expect(result.images[0].alt).toBe('Test ABC entities')
    })

    it('should decode hex HTML entities in alt text', () => {
      const html = '<img src="hex.png" alt="Hex &#x41;&#x42;&#x43; test" />'
      const result = analyzeImages(html)

      expect(result.images[0].alt).toBe('Hex ABC test')
    })

    it('should handle unicode characters in alt text', () => {
      const html = '<img src="emoji.png" alt="Smile 😊 and hearts ❤️" />'
      const result = analyzeImages(html)

      expect(result.images[0].alt).toBe('Smile 😊 and hearts ❤️')
    })

    it('should handle long alt text', () => {
      const longAlt = 'A'.repeat(500)
      const html = `<img src="long-alt.png" alt="${longAlt}" />`
      const result = analyzeImages(html)

      expect(result.images[0].alt).toBe(longAlt)
      expect(result.images[0].alt?.length).toBe(500)
    })

    it('should handle multi-line alt text (whitespace collapsed)', () => {
      const html = `
        <img src="multiline.png" alt="This is
        a multi-line
        alt text" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      // HTML parsers typically collapse whitespace
      expect(result.images[0].alt).toContain('This is')
      expect(result.images[0].alt).toContain('multi-line')
    })
  })

  describe('srcset and Responsive Images', () => {
    it('should use src attribute for images with srcset', () => {
      const html = `
        <img 
          src="default.jpg" 
          srcset="small.jpg 300w, medium.jpg 600w, large.jpg 1200w"
          alt="Responsive Image"
        />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0].src).toBe('default.jpg')
    })

    it('should handle picture element with multiple sources', () => {
      const html = `
        <picture>
          <source media="(min-width: 800px)" srcset="large.jpg">
          <source media="(min-width: 400px)" srcset="medium.jpg">
          <img src="small.jpg" alt="Picture Element">
        </picture>
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0].src).toBe('small.jpg')
      expect(result.images[0].alt).toBe('Picture Element')
    })
  })

  describe('Images with Missing or Invalid src', () => {
    it('should handle image with empty src', () => {
      const html = '<img src="" alt="Empty Source" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0].src).toBe('')
    })

    it('should handle image with no src attribute', () => {
      const html = '<img alt="No Source" />'
      const result = analyzeImages(html)

      // Depending on implementation, might skip or include with empty src
      // We'll expect it to be included with empty/undefined src
      if (result.totalImages > 0) {
        expect(result.images[0].src).toBeDefined()
      }
    })

    it('should handle image with only whitespace src', () => {
      const html = '<img src="   " alt="Whitespace Source" />'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(1)
      expect(result.images[0].src).toBe('   ')
    })
  })

  describe('Return Type Validation', () => {
    it('should return correct ImageAnalysisResult structure', () => {
      const html = `
        <img src="1.png" alt="One" />
        <img src="2.png" />
      `
      const result = analyzeImages(html)

      // Verify all required fields exist
      expect(result).toHaveProperty('totalImages')
      expect(result).toHaveProperty('imagesWithAlt')
      expect(result).toHaveProperty('imagesMissingAlt')
      expect(result).toHaveProperty('imagesWithEmptyAlt')
      expect(result).toHaveProperty('images')

      // Verify types
      expect(typeof result.totalImages).toBe('number')
      expect(typeof result.imagesWithAlt).toBe('number')
      expect(typeof result.imagesMissingAlt).toBe('number')
      expect(typeof result.imagesWithEmptyAlt).toBe('number')
      expect(Array.isArray(result.images)).toBe(true)
    })

    it('should return ImageInfo objects with correct structure', () => {
      const html = '<img src="test.png" alt="Test" />'
      const result = analyzeImages(html)

      const imageInfo = result.images[0]
      expect(imageInfo).toHaveProperty('src')
      expect(imageInfo).toHaveProperty('alt')
      expect(imageInfo).toHaveProperty('position')

      expect(typeof imageInfo.src).toBe('string')
      expect(typeof imageInfo.position).toBe('number')
      // alt can be string or null
      expect(imageInfo.alt === null || typeof imageInfo.alt === 'string').toBe(true)
    })
  })

  describe('Mathematical Consistency', () => {
    it('should maintain count consistency: total = withAlt + missingAlt + emptyAlt', () => {
      const html = `
        <img src="1.png" alt="One" />
        <img src="2.png" alt="Two" />
        <img src="3.png" />
        <img src="4.png" alt="" />
        <img src="5.png" alt="Five" />
        <img src="6.png" />
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(
        result.imagesWithAlt + result.imagesMissingAlt + result.imagesWithEmptyAlt
      )
      expect(result.totalImages).toBe(result.images.length)
    })

    it('should maintain consistency even with zero images', () => {
      const html = '<p>No images</p>'
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(0)
      expect(result.imagesWithAlt + result.imagesMissingAlt + result.imagesWithEmptyAlt).toBe(0)
      expect(result.images.length).toBe(0)
    })
  })

  describe('Real-World HTML Scenarios', () => {
    it('should handle typical blog post with hero image and inline images', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head><title>Blog Post</title></head>
          <body>
            <header>
              <img src="/logo.png" alt="Site Logo" />
            </header>
            <main>
              <article>
                <img src="/hero.jpg" alt="Article Hero Image" class="hero" />
                <p>Some content with <img src="inline-icon.svg" alt=""> inline decorative icon.</p>
                <img src="diagram.png" alt="Technical Diagram" />
                <img src="screenshot.png" />
              </article>
            </main>
            <footer>
              <img src="badge.png" alt="Certification Badge" />
            </footer>
          </body>
        </html>
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(6)
      expect(result.imagesWithAlt).toBe(4)
      expect(result.imagesMissingAlt).toBe(1)
      expect(result.imagesWithEmptyAlt).toBe(1)
    })

    it('should handle e-commerce product page', () => {
      const html = `
        <div class="product">
          <img src="product-main.jpg" alt="Blue Running Shoes - Front View" />
          <div class="thumbnails">
            <img src="thumb-1.jpg" alt="Blue Running Shoes - Side View" />
            <img src="thumb-2.jpg" alt="Blue Running Shoes - Top View" />
            <img src="thumb-3.jpg" alt="Blue Running Shoes - Sole View" />
          </div>
          <img src="badge-free-shipping.png" alt="" />
          <img src="brand-logo.png" alt="Nike" />
        </div>
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(6)
      expect(result.imagesWithAlt).toBe(5)
      expect(result.imagesWithEmptyAlt).toBe(1)
    })

    it('should handle image gallery with missing alt tags (SEO issue)', () => {
      const html = `
        <div class="gallery">
          <img src="gallery-1.jpg" />
          <img src="gallery-2.jpg" />
          <img src="gallery-3.jpg" />
          <img src="gallery-4.jpg" />
          <img src="gallery-5.jpg" />
        </div>
      `
      const result = analyzeImages(html)

      expect(result.totalImages).toBe(5)
      expect(result.imagesMissingAlt).toBe(5)
      expect(result.imagesWithAlt).toBe(0)

      // All should have position set correctly
      result.images.forEach((img: ImageInfo, index: number) => {
        expect(img.position).toBe(index)
        expect(img.alt).toBeNull()
      })
    })
  })
})
