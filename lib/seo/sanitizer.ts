/**
 * HTML Sanitizer Module
 *
 * Provides HTML sanitization functionality to remove potentially dangerous
 * content while preserving safe, semantic HTML structure.
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Configuration for DOMPurify
 * Defines which tags and attributes are allowed in sanitized HTML
 */
const SANITIZER_CONFIG = {
  ALLOWED_TAGS: [
    // Document structure
    'html',
    'head',
    'body',
    'meta',
    'title',
    'link',
    // Content tags
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'img',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'br',
    'span',
    'div',
    'blockquote',
    'code',
    'pre',
  ],
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'target',
    'rel',
    'width',
    'height',
    'title',
    'name',
    'content',
    'property',
    'charset',
    'lang',
  ],
  // Remove style, id, class, and data- attributes
  FORBID_ATTR: [
    'style',
    'id',
    'class',
    'onerror',
    'onclick',
    'onload',
    'onmouseover',
    'onfocus',
    'onblur',
  ],
  // Additional security options
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true, // Preserve text content when removing tags
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  WHOLE_DOCUMENT: true, // Preserve <html>, <head>, <body> structure for SEO analysis
}

/**
 * Sanitizes HTML content by removing potentially dangerous elements and attributes
 * while preserving safe, semantic HTML structure and SEO-relevant tags.
 *
 * Allowed tags: html, head, body, meta, title, link, p, h1-h6, a, img, ul, ol, li, strong, em, br, span, div, blockquote, code, pre
 * Allowed attributes: href, src, alt, target, rel, width, height, title, name, content, property, charset, lang
 * Removed attributes: style, id, class, data-*, on* event handlers
 *
 * @param html - The HTML string to sanitize
 * @returns The sanitized HTML string
 * @throws TypeError if input is not a string or is null/undefined
 */
export function sanitizeHTML(html: string): string {
  // Handle null, undefined, and non-string inputs
  if (html === null || html === undefined) {
    return ''
  }

  if (typeof html !== 'string') {
    return ''
  }

  // Handle empty string
  if (html === '') {
    return ''
  }

  // Handle whitespace-only strings
  if (html.trim() === '') {
    return html
  }

  try {
    // Sanitize the HTML using DOMPurify
    const sanitized = DOMPurify.sanitize(html, SANITIZER_CONFIG)
    return sanitized
  } catch (error) {
    // Handle malformed HTML or other errors
    // DOMPurify is generally resilient, but catch any unexpected errors
    throw new Error(
      `Failed to sanitize HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
