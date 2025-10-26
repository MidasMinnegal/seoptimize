/**
 * Header Analyzer
 * Feature: 001-input-field-fetches
 *
 * Analyzes heading structure in HTML content for SEO purposes.
 * Detects H1 issues, hierarchy problems, and extracts all heading levels.
 */

import type { HeaderAnalysisResult, HeadingInfo, HeadingStructure } from '@/types/seo'

/**
 * Analyzes heading structure in HTML content
 *
 * @param html - Sanitized HTML content to analyze
 * @returns HeaderAnalysisResult containing heading structure and validation
 */
export function analyzeHeaders(html: string): HeaderAnalysisResult {
  // Return early for empty HTML
  if (!html || html.trim().length === 0) {
    return {
      headings: createEmptyHeadingStructure(),
      hasProperH1: false,
      hasProperHierarchy: true, // No headings = no violations
    }
  }

  // Remove HTML comments to avoid extracting headings from commented-out code
  const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '')

  // Extract all headings
  const headings = extractHeadings(htmlWithoutComments)

  // Validate H1 (should have exactly one)
  const hasProperH1 = headings.h1.length === 1

  // Validate hierarchy
  const hasProperHierarchy = validateHierarchy(headings)

  return {
    headings,
    hasProperH1,
    hasProperHierarchy,
  }
}

/**
 * Creates an empty heading structure
 *
 * @returns Empty HeadingStructure with all arrays initialized
 */
function createEmptyHeadingStructure(): HeadingStructure {
  return {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
  }
}

/**
 * Extracts all heading tags from HTML
 *
 * @param html - HTML content (without comments)
 * @returns HeadingStructure with all extracted headings
 */
function extractHeadings(html: string): HeadingStructure {
  const structure = createEmptyHeadingStructure()

  // Track global position counter for all headings
  let globalPosition = 0

  // Extract each heading level
  for (let level = 1; level <= 6; level++) {
    const headings = extractHeadingLevel(html, level, globalPosition)

    // Update global position counter
    globalPosition += headings.length

    // Store in appropriate array
    const key = `h${level}` as keyof HeadingStructure
    structure[key] = headings
  }

  // Re-sort all headings by their actual document order
  const allHeadings = [
    ...structure.h1,
    ...structure.h2,
    ...structure.h3,
    ...structure.h4,
    ...structure.h5,
    ...structure.h6,
  ]

  // Sort by document order (based on the original match index in HTML)
  allHeadings.sort((a, b) => {
    const aIndex = getHeadingIndexInHTML(html, a)
    const bIndex = getHeadingIndexInHTML(html, b)
    return aIndex - bIndex
  })

  // Reassign positions based on sorted order
  allHeadings.forEach((heading, index) => {
    heading.position = index
  })

  return structure
}

/**
 * Extracts headings of a specific level from HTML
 *
 * @param html - HTML content
 * @param level - Heading level (1-6)
 * @param startPosition - Starting position counter
 * @returns Array of HeadingInfo for this level
 */
function extractHeadingLevel(html: string, level: number, startPosition: number): HeadingInfo[] {
  const headings: HeadingInfo[] = []

  // First try to match properly closed tags
  const closedTagRegex = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi')
  const closedMatches = [...html.matchAll(closedTagRegex)]

  // If we found properly closed tags, use those
  if (closedMatches.length > 0) {
    let position = startPosition
    for (const match of closedMatches) {
      const rawText = match[1]

      // Remove nested HTML tags (e.g., <strong>, <em>)
      const textWithoutTags = rawText.replace(/<[^>]*>/g, '')

      // Decode HTML entities and trim
      const text = decodeHTMLEntities(textWithoutTags.trim())

      headings.push({
        level,
        text,
        position: position++,
      })
    }
  } else {
    // Fall back to matching unclosed tags (malformed HTML)
    // Stop at next heading tag of same or higher level, or end of string
    const unclosedTagRegex = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)(?=<h[1-${level}]|$)`, 'gi')
    const unclosedMatches = html.matchAll(unclosedTagRegex)

    let position = startPosition
    for (const match of unclosedMatches) {
      const rawText = match[1]

      // Remove nested HTML tags
      const textWithoutTags = rawText.replace(/<[^>]*>/g, '')

      // Decode HTML entities and trim
      const text = decodeHTMLEntities(textWithoutTags.trim())

      if (text) {
        headings.push({
          level,
          text,
          position: position++,
        })
      }
    }
  }

  return headings
}

/**
 * Gets the index of a heading in the HTML string
 * Used for determining document order
 *
 * @param html - HTML content
 * @param heading - Heading to find
 * @returns Index in HTML string
 */
function getHeadingIndexInHTML(html: string, heading: HeadingInfo): number {
  const escapedText = heading.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `<h${heading.level}[^>]*>[\\s\\S]*?${escapedText}[\\s\\S]*?<\\/h${heading.level}>`,
    'i'
  )
  const match = html.match(regex)
  return match ? html.indexOf(match[0]) : -1
}

/**
 * Validates heading hierarchy
 * Rules:
 * - Must start with H1 if there are any headings
 * - Cannot skip levels (e.g., H1 → H3 without H2)
 * - Can go back to higher levels (e.g., H3 → H2 is OK)
 *
 * @param structure - Heading structure to validate
 * @returns True if hierarchy is valid
 */
function validateHierarchy(structure: HeadingStructure): boolean {
  // Get all headings in document order
  const allHeadings = [
    ...structure.h1,
    ...structure.h2,
    ...structure.h3,
    ...structure.h4,
    ...structure.h5,
    ...structure.h6,
  ].sort((a, b) => a.position - b.position)

  // No headings = valid (no violations)
  if (allHeadings.length === 0) {
    return true
  }

  // First heading must be H1
  if (allHeadings[0].level !== 1) {
    return false
  }

  // Check for level skips
  let maxLevelSeen = 0

  for (const heading of allHeadings) {
    const currentLevel = heading.level

    // If this is the first heading or we're going back to a higher level, it's OK
    if (currentLevel <= maxLevelSeen + 1) {
      maxLevelSeen = Math.max(maxLevelSeen, currentLevel)
    } else {
      // Skipped a level (e.g., went from H1 to H3)
      return false
    }
  }

  return true
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
