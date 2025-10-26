/**
 * Image Analyzer
 * Feature: 001-input-field-fetches
 *
 * Analyzes images in HTML content for SEO purposes.
 * Extracts image information including src, alt text, and position.
 */

import type { ImageAnalysisResult, ImageInfo } from '@/types/seo'

/**
 * Analyzes images in HTML content
 *
 * @param html - Sanitized HTML content to analyze
 * @returns ImageAnalysisResult containing image metrics and details
 */
export function analyzeImages(html: string): ImageAnalysisResult {
  const images: ImageInfo[] = []

  // Return early for empty HTML
  if (!html || html.trim().length === 0) {
    return {
      totalImages: 0,
      imagesWithAlt: 0,
      imagesMissingAlt: 0,
      imagesWithEmptyAlt: 0,
      images: [],
    }
  }

  // Remove HTML comments to avoid extracting images from commented-out code
  const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '')

  // Use DOM parser to extract images
  // Note: Using regex as a fallback since we're in Node.js environment
  // In a browser environment, we could use DOMParser
  const imgTagRegex = /<img[^>]*>/gi
  const imgTags = htmlWithoutComments.match(imgTagRegex) || []

  imgTags.forEach((imgTag, position) => {
    // Extract src attribute
    const srcMatch = imgTag.match(/\ssrc=["']([^"']*)["']/i) || imgTag.match(/\ssrc=([^\s>]*)/i)
    const src = srcMatch ? srcMatch[1] : ''

    // Extract alt attribute
    let alt: string | null = null

    // Check if alt attribute exists
    const altMatch = imgTag.match(/\salt=["']([^"']*)["']/i) || imgTag.match(/\salt=([^\s>]*)/i)

    if (altMatch) {
      // Alt attribute exists - decode HTML entities and use the value
      alt = decodeHTMLEntities(altMatch[1])
    }
    // If no alt match, alt remains null (missing alt attribute)

    images.push({
      src,
      alt,
      position,
    })
  })

  // Calculate metrics
  const imagesWithAlt = images.filter(img => img.alt !== null && img.alt !== '').length
  const imagesMissingAlt = images.filter(img => img.alt === null).length
  const imagesWithEmptyAlt = images.filter(img => img.alt === '').length

  return {
    totalImages: images.length,
    imagesWithAlt,
    imagesMissingAlt,
    imagesWithEmptyAlt,
    images,
  }
}

/**
 * Decodes common HTML entities in text
 *
 * @param text - Text containing HTML entities
 * @returns Decoded text
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&quot;': '"',
    '&#34;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&nbsp;': ' ',
    '&#160;': ' ',
  }

  let decoded = text

  // Replace named and numeric entities
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  })

  // Handle numeric character references (e.g., &#123;)
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))

  // Handle hex character references (e.g., &#x7B;)
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))

  return decoded
}
