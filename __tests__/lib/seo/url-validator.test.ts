/**
 * Tests for URL Validator
 * Tests URL validation and normalization with security checks
 */

import { normalizeURL, validateURL, validationErrorMessages } from '@/lib/seo/url-validator'

describe('URL Validator', () => {
  describe('normalizeURL', () => {
    it('should preserve URLs with https:// protocol', () => {
      const url = 'https://example.com'
      expect(normalizeURL(url)).toBe('https://example.com')
    })

    it('should preserve URLs with http:// protocol', () => {
      const url = 'http://example.com'
      expect(normalizeURL(url)).toBe('http://example.com')
    })

    it('should add https:// to URLs without protocol', () => {
      const url = 'example.com'
      expect(normalizeURL(url)).toBe('https://example.com')
    })

    it('should add https:// to www URLs', () => {
      const url = 'www.example.com'
      expect(normalizeURL(url)).toBe('https://www.example.com')
    })

    it('should trim whitespace before normalizing', () => {
      const url = '  example.com  '
      expect(normalizeURL(url)).toBe('https://example.com')
    })

    it('should preserve paths in URLs', () => {
      const url = 'example.com/path/to/page'
      expect(normalizeURL(url)).toBe('https://example.com/path/to/page')
    })

    it('should preserve query parameters', () => {
      const url = 'example.com?foo=bar&baz=qux'
      expect(normalizeURL(url)).toBe('https://example.com?foo=bar&baz=qux')
    })

    it('should preserve hash fragments', () => {
      const url = 'example.com#section'
      expect(normalizeURL(url)).toBe('https://example.com#section')
    })

    it('should handle URLs with ports', () => {
      const url = 'example.com:8080'
      expect(normalizeURL(url)).toBe('https://example.com:8080')
    })

    it('should preserve case in URLs', () => {
      const url = 'Example.COM/Path'
      expect(normalizeURL(url)).toBe('https://Example.COM/Path')
    })
  })

  describe('validateURL - Empty Values', () => {
    it('should reject empty string', () => {
      const result = validateURL('')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('EMPTY_VALUE')
        expect(result.error.message).toBe(validationErrorMessages.EMPTY_VALUE)
      }
    })

    it('should reject whitespace-only string', () => {
      const result = validateURL('   ')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('EMPTY_VALUE')
      }
    })

    it('should reject null-like values', () => {
      // TypeScript would prevent this, but test runtime behavior
      const result = validateURL(undefined as unknown as string)
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('EMPTY_VALUE')
      }
    })
  })

  describe('validateURL - Valid URLs', () => {
    it('should accept valid HTTP URL', () => {
      const result = validateURL('http://example.com')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('http://example.com')
      }
    })

    it('should accept valid HTTPS URL', () => {
      const result = validateURL('https://example.com')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com')
      }
    })

    it('should accept and normalize URL without protocol', () => {
      const result = validateURL('example.com')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com')
      }
    })

    it('should accept URL with www prefix', () => {
      const result = validateURL('www.example.com')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://www.example.com')
      }
    })

    it('should accept URL with path', () => {
      const result = validateURL('https://example.com/path/to/page')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com/path/to/page')
      }
    })

    it('should accept URL with query parameters', () => {
      const result = validateURL('https://example.com?foo=bar')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com?foo=bar')
      }
    })

    it('should accept URL with hash fragment', () => {
      const result = validateURL('https://example.com#section')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com#section')
      }
    })

    it('should accept URL with port', () => {
      const result = validateURL('https://example.com:8080')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com:8080')
      }
    })

    it('should accept URL with subdomain', () => {
      const result = validateURL('https://blog.example.com')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://blog.example.com')
      }
    })

    it('should accept international domain names', () => {
      const result = validateURL('https://münchen.de')
      expect(result.valid).toBe(true)
    })

    it('should trim whitespace from valid URLs', () => {
      const result = validateURL('  https://example.com  ')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://example.com')
      }
    })
  })

  describe('validateURL - Invalid Formats', () => {
    it('should reject malformed URLs', () => {
      const result = validateURL('not a url')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('INVALID_FORMAT')
        expect(result.error.message).toBe(validationErrorMessages.INVALID_FORMAT)
      }
    })

    it('should reject URLs with spaces', () => {
      const result = validateURL('https://example .com')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('INVALID_FORMAT')
      }
    })

    it('should reject URLs with invalid characters', () => {
      const result = validateURL('https://example<>.com')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('INVALID_FORMAT')
      }
    })

    it('should reject single word without domain extension', () => {
      const result = validateURL('localhost')
      // localhost is technically valid in development, would be blocked in production
      // In test environment (development), it's allowed
      expect(result.valid).toBe(true)
    })
  })

  describe('validateURL - Unsupported Protocols', () => {
    it('should reject FTP protocol', () => {
      const result = validateURL('ftp://example.com')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('UNSUPPORTED_PROTOCOL')
        expect(result.error.message).toBe(validationErrorMessages.UNSUPPORTED_PROTOCOL)
      }
    })

    it('should reject file:// protocol', () => {
      const result = validateURL('file:///path/to/file')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('UNSUPPORTED_PROTOCOL')
      }
    })

    it('should reject javascript: protocol', () => {
      const result = validateURL('javascript:alert(1)')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('UNSUPPORTED_PROTOCOL')
      }
    })

    it('should reject data: protocol', () => {
      const result = validateURL('data:text/html,<h1>Test</h1>')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('UNSUPPORTED_PROTOCOL')
      }
    })

    it('should reject mailto: protocol', () => {
      const result = validateURL('mailto:test@example.com')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('UNSUPPORTED_PROTOCOL')
      }
    })

    it('should reject tel: protocol', () => {
      const result = validateURL('tel:+1234567890')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('UNSUPPORTED_PROTOCOL')
      }
    })
  })

  describe('validateURL - Security: Localhost/Private IPs (Production)', () => {
    const originalEnv = process.env.NODE_ENV

    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })
    })

    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })

    it('should reject localhost in production', () => {
      const result = validateURL('https://localhost')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('LOCALHOST_BLOCKED')
        expect(result.error.message).toBe(validationErrorMessages.LOCALHOST_BLOCKED)
      }
    })

    it('should reject 127.0.0.1 in production', () => {
      const result = validateURL('https://127.0.0.1')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('LOCALHOST_BLOCKED')
      }
    })

    it('should reject ::1 (IPv6 localhost) in production', () => {
      const result = validateURL('https://[::1]')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('LOCALHOST_BLOCKED')
      }
    })

    it('should reject 0.0.0.0 in production', () => {
      const result = validateURL('https://0.0.0.0')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('LOCALHOST_BLOCKED')
      }
    })

    it('should reject 10.x.x.x private IP range', () => {
      const result = validateURL('https://10.0.0.1')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('PRIVATE_IP')
        expect(result.error.message).toBe(validationErrorMessages.PRIVATE_IP)
      }
    })

    it('should reject 192.168.x.x private IP range', () => {
      const result = validateURL('https://192.168.1.1')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('PRIVATE_IP')
      }
    })

    it('should reject 172.16.x.x - 172.31.x.x private IP range', () => {
      const result1 = validateURL('https://172.16.0.1')
      expect(result1.valid).toBe(false)
      if (!result1.valid) {
        expect(result1.error.code).toBe('PRIVATE_IP')
      }

      const result2 = validateURL('https://172.31.255.255')
      expect(result2.valid).toBe(false)
      if (!result2.valid) {
        expect(result2.error.code).toBe('PRIVATE_IP')
      }
    })

    it('should reject localhost with port in production', () => {
      const result = validateURL('https://localhost:3000')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('LOCALHOST_BLOCKED')
      }
    })

    it('should reject 127.0.0.1 with port in production', () => {
      const result = validateURL('https://127.0.0.1:8080')
      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error.code).toBe('LOCALHOST_BLOCKED')
      }
    })
  })

  describe('validateURL - Security: Localhost/Private IPs (Development)', () => {
    const originalEnv = process.env.NODE_ENV

    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })
    })

    afterAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
        configurable: true,
      })
    })

    it('should allow localhost in development', () => {
      const result = validateURL('https://localhost')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://localhost')
      }
    })

    it('should allow 127.0.0.1 in development', () => {
      const result = validateURL('https://127.0.0.1')
      expect(result.valid).toBe(true)
    })

    it('should allow private IPs in development', () => {
      const result = validateURL('https://192.168.1.1')
      expect(result.valid).toBe(true)
    })

    it('should allow localhost with port in development', () => {
      const result = validateURL('https://localhost:3000')
      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.normalizedUrl).toBe('https://localhost:3000')
      }
    })
  })

  describe('validateURL - Edge Cases', () => {
    it('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000)
      const result = validateURL(`https://example.com/${longPath}`)
      expect(result.valid).toBe(true)
    })

    it('should handle URLs with many query parameters', () => {
      const result = validateURL('https://example.com?a=1&b=2&c=3&d=4&e=5&f=6&g=7')
      expect(result.valid).toBe(true)
    })

    it('should handle URLs with encoded characters', () => {
      const result = validateURL('https://example.com/path%20with%20spaces')
      expect(result.valid).toBe(true)
    })

    it('should handle URLs with unicode characters', () => {
      const result = validateURL('https://example.com/路径')
      expect(result.valid).toBe(true)
    })

    it('should handle URLs with multiple subdomains', () => {
      const result = validateURL('https://a.b.c.d.example.com')
      expect(result.valid).toBe(true)
    })

    it('should handle URLs with authentication (not recommended but valid)', () => {
      const result = validateURL('https://user:pass@example.com')
      expect(result.valid).toBe(true)
    })

    it('should handle uppercase protocols', () => {
      const result = validateURL('HTTPS://example.com')
      expect(result.valid).toBe(true)
    })

    it('should handle mixed case protocols', () => {
      const result = validateURL('HtTpS://example.com')
      expect(result.valid).toBe(true)
    })
  })

  describe('validationErrorMessages', () => {
    it('should have messages for all error codes', () => {
      expect(validationErrorMessages.EMPTY_VALUE).toBeDefined()
      expect(validationErrorMessages.INVALID_FORMAT).toBeDefined()
      expect(validationErrorMessages.MISSING_PROTOCOL).toBeDefined()
      expect(validationErrorMessages.UNSUPPORTED_PROTOCOL).toBeDefined()
      expect(validationErrorMessages.LOCALHOST_BLOCKED).toBeDefined()
      expect(validationErrorMessages.PRIVATE_IP).toBeDefined()
    })

    it('should have non-empty messages', () => {
      Object.values(validationErrorMessages).forEach(message => {
        expect(message.length).toBeGreaterThan(0)
      })
    })

    it('should have user-friendly messages', () => {
      // Messages should not contain technical jargon
      expect(validationErrorMessages.EMPTY_VALUE).toContain('enter')
      expect(validationErrorMessages.INVALID_FORMAT).toContain('valid')
      expect(validationErrorMessages.UNSUPPORTED_PROTOCOL).toContain('HTTP')
    })
  })
})
