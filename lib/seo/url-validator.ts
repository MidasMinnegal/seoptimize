/**
 * URL Validation Utility
 * Feature: 003-seo-url-input
 */

import type { ValidationError, ValidationErrorCode, ValidationResult } from '@/types/seo'

const isProduction = process.env.NODE_ENV === 'production'

// Validation error messages
export const validationErrorMessages: Record<ValidationErrorCode, string> = {
  EMPTY_VALUE: 'Please enter a URL',
  INVALID_FORMAT: 'Please enter a valid URL (e.g., example.com)',
  MISSING_PROTOCOL: 'URL must include http:// or https://',
  UNSUPPORTED_PROTOCOL: 'Only HTTP and HTTPS protocols are supported',
  LOCALHOST_BLOCKED: 'Localhost URLs are not allowed',
  PRIVATE_IP: 'Private IP addresses are not allowed',
}

function createValidationError(code: ValidationErrorCode): ValidationError {
  return {
    code,
    message: validationErrorMessages[code],
  }
}

function isPrivateIP(hostname: string): boolean {
  // Check for localhost variations
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname.toLowerCase())) {
    return true
  }

  // Check for private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = hostname.match(ipv4Regex)

  if (match) {
    const [, a, b] = match.map(Number)
    if (a === 10) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
  }

  return false
}

/**
 * Normalizes a URL by adding https:// protocol if missing
 * @param url - The URL string to normalize
 * @returns Normalized URL with protocol
 */
export function normalizeURL(url: string): string {
  const trimmedUrl = url.trim()

  // If URL already has a protocol, return as-is
  if (trimmedUrl.match(/^https?:\/\//i)) {
    return trimmedUrl
  }

  // Add https:// prefix by default
  return `https://${trimmedUrl}`
}

/**
 * Validates a URL string for SEO analysis
 * @param url - The URL string to validate
 * @returns ValidationResult indicating success or specific error
 */
export function validateURL(url: string): ValidationResult {
  // Check for empty value
  if (!url || url.trim() === '') {
    return { valid: false, error: createValidationError('EMPTY_VALUE') }
  }

  // Normalize URL (add https:// if missing)
  const normalizedUrl = normalizeURL(url)

  // Parse URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return { valid: false, error: createValidationError('INVALID_FORMAT') }
  }

  // Check protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: createValidationError('UNSUPPORTED_PROTOCOL') }
  }

  // Check for localhost/private IPs in production
  if (isProduction && isPrivateIP(parsedUrl.hostname)) {
    if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
      return { valid: false, error: createValidationError('LOCALHOST_BLOCKED') }
    }
    return { valid: false, error: createValidationError('PRIVATE_IP') }
  }

  return { valid: true, normalizedUrl }
}
