/**
 * Link Analyzer
 * Extracts and analyzes links from HTML content for SEO evaluation
 *
 * Feature: 001-input-field-fetches
 */

import type { LinkAnalysisResult, LinkInfo } from '@/types/seo'

/**
 * Analyzes links in HTML content
 *
 * @param html - HTML content to analyze
 * @param baseUrl - Base URL of the page (for determining internal vs external)
 * @returns LinkAnalysisResult with link metrics and details
 */
export function analyzeLinks(html: string, baseUrl: string): LinkAnalysisResult {
  // Remove HTML comments before processing
  const cleanedHtml = removeHTMLComments(html)

  // Extract all links
  const links = extractLinks(cleanedHtml, baseUrl)

  // Count different link types
  const internalCount = links.filter(link => link.isInternal).length
  const externalCount = links.filter(link => !link.isInternal).length
  const nofollowCount = links.filter(link => link.isNofollow).length

  return {
    totalLinks: links.length,
    internalLinks: internalCount,
    externalLinks: externalCount,
    nofollowLinks: nofollowCount,
    links,
  }
}

/**
 * Removes HTML comments from content
 *
 * @param html - HTML content
 * @returns HTML without comments
 */
function removeHTMLComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '')
}

/**
 * Extracts all links from HTML
 *
 * @param html - HTML content (without comments)
 * @param baseUrl - Base URL for determining internal vs external links
 * @returns Array of LinkInfo objects
 */
function extractLinks(html: string, baseUrl: string): LinkInfo[] {
  const links: LinkInfo[] = []

  // Regex to match anchor tags with href attribute
  // Matches: <a href="..." [other attributes]>content</a>
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi
  const matches = html.matchAll(linkRegex)

  let position = 0

  for (const match of matches) {
    const href = match[1]?.trim()
    const content = match[2] || ''

    // Skip links without href or with empty href
    if (!href) {
      continue
    }

    // Extract other attributes from the full tag
    const fullTag = match[0]
    const isNofollow = checkNofollow(fullTag)

    // Remove nested HTML tags from link text
    const textWithoutTags = content.replace(/<[^>]*>/g, '')

    // Decode HTML entities and trim
    const text = decodeHTMLEntities(textWithoutTags.trim())

    // Determine if link is internal or external
    const isInternal = isInternalLink(href, baseUrl)

    links.push({
      href,
      text,
      isInternal,
      isNofollow,
      position: position++,
    })
  }

  return links
}

/**
 * Checks if a link has rel="nofollow"
 *
 * @param linkTag - Full anchor tag HTML
 * @returns true if link has nofollow
 */
function checkNofollow(linkTag: string): boolean {
  // Match rel attribute value
  const relMatch = linkTag.match(/\s+rel\s*=\s*["']([^"']*)["']/i)

  if (!relMatch) {
    return false
  }

  const relValue = relMatch[1].toLowerCase()

  // Check if 'nofollow' is in the rel value (could be space-separated)
  return relValue.split(/\s+/).includes('nofollow')
}

/**
 * Determines if a link is internal (same domain) or external
 *
 * @param href - Link href value
 * @param baseUrl - Base URL of the page
 * @returns true if link is internal
 */
function isInternalLink(href: string, baseUrl: string): boolean {
  // Special protocols (mailto, tel, javascript, etc.) are considered external
  // Check these FIRST before any other logic
  if (
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:') ||
    href.startsWith('ftp:') ||
    href.startsWith('file:')
  ) {
    return false
  }

  // Relative URLs are internal
  if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
    return true
  }

  // Hash-only URLs are internal
  if (href.startsWith('#')) {
    return true
  }

  // Pure relative paths (no protocol, no slash) are internal
  if (!href.includes('://') && !href.startsWith('//')) {
    return true
  }

  try {
    // Parse both URLs
    const baseParsed = new URL(baseUrl)
    const hrefParsed = new URL(href, baseUrl)

    // Normalize domains: remove 'www.' for comparison
    const baseDomain = normalizeDomain(baseParsed.hostname)
    const hrefDomain = normalizeDomain(hrefParsed.hostname)

    // Check if href domain is a subdomain of base domain or vice versa
    return (
      hrefDomain === baseDomain ||
      hrefDomain.endsWith(`.${baseDomain}`) ||
      baseDomain.endsWith(`.${hrefDomain}`)
    )
  } catch {
    // If URL parsing fails, assume external for safety
    return false
  }
}

/**
 * Normalizes a domain by removing 'www.' prefix
 *
 * @param domain - Domain name
 * @returns Normalized domain
 */
function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./i, '')
}

/**
 * Decodes common HTML entities
 *
 * @param text - Text with HTML entities
 * @returns Decoded text
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
  }

  let decoded = text
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char)
  }

  return decoded
}
