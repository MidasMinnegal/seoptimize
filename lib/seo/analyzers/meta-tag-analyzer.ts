/**
 * Meta Tag Analyzer
 * Feature: 001-input-field-fetches
 *
 * Analyzes meta tags in HTML content for SEO purposes.
 * Extracts title, description, robots, and social media tags.
 */

import type { MetaTag, MetaTagAnalysisResult, TitleTag } from '@/types/seo'

/**
 * Analyzes meta tags in HTML content
 *
 * @param html - Sanitized HTML content to analyze
 * @returns MetaTagAnalysisResult containing meta tag information
 */
export function analyzeMetaTags(html: string): MetaTagAnalysisResult {
  // Return early for empty HTML
  if (!html || html.trim().length === 0) {
    return {
      title: null,
      description: null,
      robots: null,
      duplicateTags: [],
    }
  }

  // Remove HTML comments to avoid extracting tags from commented-out code
  const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '')

  // Extract title tag
  const title = extractTitle(htmlWithoutComments)

  // Extract meta tags
  const metaTags = extractMetaTags(htmlWithoutComments)

  // Find specific meta tags
  const description = findMetaTag(metaTags, 'description')
  const robots = findMetaTag(metaTags, 'robots')

  // Extract Open Graph tags (optional)
  const openGraph = extractOpenGraphTags(metaTags)

  // Extract Twitter Card tags (optional)
  const twitterCard = extractTwitterCardTags(metaTags)

  // Detect duplicate tags
  const duplicateTags = detectDuplicates(metaTags)

  const result: MetaTagAnalysisResult = {
    title,
    description,
    robots,
    duplicateTags,
  }

  // Add optional fields only if they have values
  if (openGraph.length > 0) {
    result.openGraph = openGraph
  }

  if (twitterCard.length > 0) {
    result.twitterCard = twitterCard
  }

  return result
}

/**
 * Extracts title tag from HTML
 *
 * @param html - HTML content (without comments)
 * @returns TitleTag or null if not found
 */
function extractTitle(html: string): TitleTag | null {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)

  if (!titleMatch) {
    return null
  }

  const rawContent = titleMatch[1]
  const content = decodeHTMLEntities(rawContent.trim())
  const { length } = content

  // Optimal length is 50-60 characters (inclusive)
  const isOptimalLength = length >= 50 && length <= 60

  return {
    content,
    length,
    isOptimalLength,
  }
}

/**
 * Extracts all meta tags from HTML
 *
 * @param html - HTML content (without comments)
 * @returns Array of meta tags with name/property and content
 */
function extractMetaTags(html: string): Array<{ name: string; content: string }> {
  const metaTags: Array<{ name: string; content: string }> = []
  const metaTagRegex = /<meta[^>]*>/gi
  const matches = html.match(metaTagRegex) || []

  matches.forEach(metaTag => {
    // Extract name or property attribute (case-insensitive)
    const nameMatch =
      metaTag.match(/\sname=["']([^"']*)["']/i) || metaTag.match(/\sname=([^\s>]*)/i)
    const propertyMatch =
      metaTag.match(/\sproperty=["']([^"']*)["']/i) || metaTag.match(/\sproperty=([^\s>]*)/i)

    const name = nameMatch ? nameMatch[1] : propertyMatch ? propertyMatch[1] : ''

    // Extract content attribute
    // Use lazy matching (.*?) to get everything between quotes, regardless of content
    const contentMatch =
      metaTag.match(/\scontent=(["'])(.*?)\1/i) || metaTag.match(/\scontent=([^\s>]*)/i)
    const content = contentMatch
      ? contentMatch[2] !== undefined
        ? contentMatch[2]
        : contentMatch[1]
      : ''

    if (name) {
      metaTags.push({ name, content })
    }
  })

  return metaTags
}

/**
 * Finds a specific meta tag by name (case-insensitive)
 * Returns the first occurrence
 *
 * @param metaTags - Array of extracted meta tags
 * @param tagName - Name of the tag to find
 * @returns MetaTag or null if not found
 */
function findMetaTag(
  metaTags: Array<{ name: string; content: string }>,
  tagName: string
): MetaTag | null {
  const tag = metaTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase())

  if (!tag) {
    return null
  }

  const content = decodeHTMLEntities(tag.content.trim())

  return {
    name: tagName,
    content,
    length: content.length,
  }
}

/**
 * Extracts Open Graph tags (tags starting with 'og:')
 *
 * @param metaTags - Array of extracted meta tags
 * @returns Array of Open Graph MetaTags
 */
function extractOpenGraphTags(metaTags: Array<{ name: string; content: string }>): MetaTag[] {
  return metaTags
    .filter(tag => tag.name.toLowerCase().startsWith('og:'))
    .map(tag => {
      const content = decodeHTMLEntities(tag.content.trim())
      return {
        name: tag.name,
        content,
        length: content.length,
      }
    })
}

/**
 * Extracts Twitter Card tags (tags starting with 'twitter:')
 *
 * @param metaTags - Array of extracted meta tags
 * @returns Array of Twitter Card MetaTags
 */
function extractTwitterCardTags(metaTags: Array<{ name: string; content: string }>): MetaTag[] {
  return metaTags
    .filter(tag => tag.name.toLowerCase().startsWith('twitter:'))
    .map(tag => {
      const content = decodeHTMLEntities(tag.content.trim())
      return {
        name: tag.name,
        content,
        length: content.length,
      }
    })
}

/**
 * Detects duplicate meta tags (case-insensitive)
 *
 * @param metaTags - Array of extracted meta tags
 * @returns Array of tag names that appear more than once
 */
function detectDuplicates(metaTags: Array<{ name: string; content: string }>): string[] {
  const tagCounts = new Map<string, number>()

  // Count occurrences (case-insensitive)
  metaTags.forEach(tag => {
    const lowerName = tag.name.toLowerCase()
    tagCounts.set(lowerName, (tagCounts.get(lowerName) || 0) + 1)
  })

  // Find duplicates
  const duplicates: string[] = []
  tagCounts.forEach((count, name) => {
    if (count > 1) {
      duplicates.push(name)
    }
  })

  return duplicates
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
