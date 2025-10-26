/**
 * Mock for isomorphic-dompurify
 * Provides a simplified DOMPurify implementation for testing
 */

interface SanitizerConfig {
  ALLOWED_TAGS?: string[]
  ALLOWED_ATTR?: string[]
  FORBID_ATTR?: string[]
  ALLOW_DATA_ATTR?: boolean
  KEEP_CONTENT?: boolean
  RETURN_DOM?: boolean
  RETURN_DOM_FRAGMENT?: boolean
  RETURN_TRUSTED_TYPE?: boolean
}

/**
 * Mock sanitize function that removes dangerous HTML patterns
 */
function sanitize(html: string, config?: SanitizerConfig): string {
  let result = html

  // Remove script tags and their content
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers
  result = result.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
  result = result.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: URLs
  result = result.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
  result = result.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '')

  // Remove data: URLs (potential XSS vector)
  result = result.replace(/href\s*=\s*["']data:[^"']*["']/gi, '')
  result = result.replace(/src\s*=\s*["']data:[^"']*["']/gi, '')

  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'style', 'base', 'meta']
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi')
    result = result.replace(regex, '')
    // Also remove self-closing versions
    result = result.replace(new RegExp(`<${tag}[^>]*\\/?>`, 'gi'), '')
  })

  // Remove forbidden attributes if specified
  if (config?.FORBID_ATTR) {
    config.FORBID_ATTR.forEach(attr => {
      const regex = new RegExp(`\\s+${attr}\\s*=\\s*["'][^"']*["']`, 'gi')
      result = result.replace(regex, '')
      const regex2 = new RegExp(`\\s+${attr}\\s*=\\s*[^\\s>]*`, 'gi')
      result = result.replace(regex2, '')
    })
  }

  // Remove data- attributes if not allowed
  if (config?.ALLOW_DATA_ATTR === false) {
    result = result.replace(/\s+data-[a-z0-9-]+\s*=\s*["'][^"']*["']/gi, '')
    result = result.replace(/\s+data-[a-z0-9-]+\s*=\s*[^\s>]*/gi, '')
  }

  // Filter allowed tags if specified
  if (config?.ALLOWED_TAGS && config.ALLOWED_TAGS.length > 0) {
    // This is a simplified implementation - doesn't remove disallowed tags
    // but good enough for testing purposes
    // In a real implementation, we would parse and filter tags here
  }

  return result
}

const DOMPurify = {
  sanitize,
}

export default DOMPurify
