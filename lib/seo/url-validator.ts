/**
 * URL Validation Utility
 * Feature: 003-seo-url-input
 */

import type { ValidationError, ValidationErrorCode, ValidationResult } from '@/types/seo'

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
  const lowerHostname = hostname.toLowerCase()

  // Check for localhost variations (including IPv6 with brackets removed)
  const cleanHostname = lowerHostname.replace(/^\[|\]$/g, '') // Remove brackets from IPv6
  if (
    ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(cleanHostname) ||
    cleanHostname === 'localhost'
  ) {
    return true
  }

  // Check for private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = cleanHostname.match(ipv4Regex)

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
  if (trimmedUrl.match(/^[a-z][a-z0-9+.-]*:\/\//i)) {
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

  const trimmedUrl = url.trim()

  // Check for unsupported protocols before normalization
  // Handle protocols without // (javascript:, data:, mailto:, tel:, etc.)
  const protocolMatch = trimmedUrl.match(/^([a-z][a-z0-9+.-]*):/)
  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase()
    if (!['http', 'https'].includes(protocol)) {
      return { valid: false, error: createValidationError('UNSUPPORTED_PROTOCOL') }
    }
  }

  // Normalize URL (add https:// if missing)
  const normalizedUrl = normalizeURL(trimmedUrl)

  // Parse URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return { valid: false, error: createValidationError('INVALID_FORMAT') }
  }

  // Double-check protocol (redundant but safe)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: createValidationError('UNSUPPORTED_PROTOCOL') }
  }

  // Check for localhost/private IPs in production
  const isProduction = process.env.NODE_ENV === 'production'
  if (isProduction && isPrivateIP(parsedUrl.hostname)) {
    const hostname = parsedUrl.hostname.toLowerCase()
    const cleanHostname = hostname.replace(/^\[|\]$/g, '') // Remove IPv6 brackets
    if (
      cleanHostname === 'localhost' ||
      cleanHostname === '127.0.0.1' ||
      cleanHostname === '::1' ||
      cleanHostname === '0.0.0.0'
    ) {
      return { valid: false, error: createValidationError('LOCALHOST_BLOCKED') }
    }
    return { valid: false, error: createValidationError('PRIVATE_IP') }
  }

  return { valid: true, normalizedUrl }
}
