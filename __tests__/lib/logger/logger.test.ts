/**
 * Logger Tests
 * Feature: 001-input-field-fetches
 * Task: T011 - Write comprehensive logger tests
 */

import type { LogContext, Logger } from '@/types/logger'

// Mock pino logger instance
const mockPinoInstance = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  child: jest.fn(),
}

// Mock pino module
const mockPino = jest.fn(() => mockPinoInstance)
jest.mock('pino', () => mockPino)

describe('Logger', () => {
  let logger: Logger

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    mockPino.mockClear()

    // Mock child to return a new logger instance with the same methods
    mockPinoInstance.child.mockImplementation((bindings: unknown) => ({
      ...mockPinoInstance,
      bindings,
    }))
  })

  describe('Initialization', () => {
    it('should create logger with default log level (info)', () => {
      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      )
    })

    it('should create logger with custom log level from environment', () => {
      // Set environment variable for this test
      const originalLogLevel = process.env.LOG_LEVEL
      process.env.LOG_LEVEL = 'debug'

      // Reload module with new env
      jest.resetModules()
      const { createLogger: createLoggerWithEnv } = require('@/lib/logger')
      logger = createLoggerWithEnv()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      )

      // Restore
      if (originalLogLevel !== undefined) {
        process.env.LOG_LEVEL = originalLogLevel
      } else {
        delete process.env.LOG_LEVEL
      }
    })

    it('should use JSON format (pino-pretty disabled for Next.js compatibility)', () => {
      // pino-pretty is disabled in all environments due to Next.js API route bundling
      // which breaks the transport resolution
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true,
      })
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      )
      // Should NOT have transport property (using JSON format)
      expect(mockPino).not.toHaveBeenCalledWith(
        expect.objectContaining({
          transport: expect.anything(),
        })
      )
    })

    it('should use JSON format in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
        configurable: true,
      })
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.not.objectContaining({
          transport: expect.anything(),
        })
      )
    })
  })

  describe('Log Level Methods', () => {
    beforeEach(() => {
      const { createLogger } = require('@/lib/logger')
      logger = createLogger()
    })

    it('should log trace messages', () => {
      const context: LogContext = {
        operation: 'test',
        url: 'https://example.com',
      }

      logger.trace('Trace message', context)

      expect(mockPinoInstance.trace).toHaveBeenCalledWith(context, 'Trace message')
    })

    it('should log debug messages', () => {
      const context: LogContext = {
        operation: 'test',
        requestId: 'req-123',
      }

      logger.debug('Debug message', context)

      expect(mockPinoInstance.debug).toHaveBeenCalledWith(context, 'Debug message')
    })

    it('should log info messages', () => {
      const context: LogContext = {
        operation: 'analyze',
        url: 'https://example.com',
        requestId: 'req-456',
      }

      logger.info('Info message', context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(context, 'Info message')
    })

    it('should log warn messages', () => {
      const context: LogContext = {
        operation: 'fetch',
        metadata: { timeout: 5000 },
      }

      logger.warn('Warning message', context)

      expect(mockPinoInstance.warn).toHaveBeenCalledWith(context, 'Warning message')
    })

    it('should log error messages', () => {
      const context: LogContext = {
        operation: 'parse',
        url: 'https://example.com',
        metadata: { errorCode: 'PARSE_ERROR' },
      }

      logger.error('Error message', context)

      expect(mockPinoInstance.error).toHaveBeenCalledWith(context, 'Error message')
    })

    it('should log fatal messages', () => {
      const context: LogContext = {
        operation: 'critical',
        metadata: { severity: 'critical' },
      }

      logger.fatal('Fatal message', context)

      expect(mockPinoInstance.fatal).toHaveBeenCalledWith(context, 'Fatal message')
    })

    it('should log without context', () => {
      logger.info('Simple message')

      expect(mockPinoInstance.info).toHaveBeenCalledWith(undefined, 'Simple message')
    })
  })

  describe('Context Serialization', () => {
    beforeEach(() => {
      const { createLogger } = require('@/lib/logger')
      logger = createLogger()
    })

    it('should serialize context with all fields', () => {
      const context: LogContext = {
        operation: 'analyze',
        url: 'https://example.com',
        requestId: 'req-789',
        metadata: {
          analyzer: 'meta-tags',
          duration: 150,
        },
      }

      logger.info('Test message', context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'analyze',
          url: 'https://example.com',
          requestId: 'req-789',
          metadata: {
            analyzer: 'meta-tags',
            duration: 150,
          },
        }),
        'Test message'
      )
    })

    it('should handle minimal context', () => {
      const context: LogContext = {
        operation: 'minimal',
      }

      logger.info('Minimal context', context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'minimal',
        }),
        'Minimal context'
      )
    })

    it('should handle complex metadata', () => {
      const context: LogContext = {
        operation: 'complex',
        metadata: {
          nested: {
            deep: {
              value: 'test',
            },
          },
          array: [1, 2, 3],
          bool: true,
          null: null,
        },
      }

      logger.info('Complex metadata', context)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'complex',
          metadata: context.metadata,
        }),
        'Complex metadata'
      )
    })
  })

  describe('Child Logger', () => {
    beforeEach(() => {
      const { createLogger } = require('@/lib/logger')
      logger = createLogger()
    })

    it('should create child logger with additional bindings', () => {
      const bindings = {
        requestId: 'req-123',
        userId: 'user-456',
      }

      const childLogger = logger.child(bindings)

      expect(mockPinoInstance.child).toHaveBeenCalledWith(bindings)
      expect(childLogger).toBeDefined()
    })

    it('should create child logger for request scope', () => {
      const requestBindings = {
        requestId: 'req-abc-123',
        operation: 'analyze-seo',
        url: 'https://example.com',
      }

      logger.child(requestBindings)

      expect(mockPinoInstance.child).toHaveBeenCalledWith(requestBindings)
    })

    it('should allow multiple child loggers', () => {
      const child1 = logger.child({ requestId: 'req-1' })
      const child2 = logger.child({ requestId: 'req-2' })

      expect(mockPinoInstance.child).toHaveBeenCalledTimes(2)
      expect(child1).toBeDefined()
      expect(child2).toBeDefined()
    })
  })

  describe('Log Level Filtering', () => {
    it('should respect log level - only info and above', () => {
      process.env.LOG_LEVEL = 'info'
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      )
      delete process.env.LOG_LEVEL
    })

    it('should respect log level - debug and above', () => {
      process.env.LOG_LEVEL = 'debug'
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      )
      delete process.env.LOG_LEVEL
    })

    it('should respect log level - warn and above', () => {
      process.env.LOG_LEVEL = 'warn'
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
        })
      )
      delete process.env.LOG_LEVEL
    })

    it('should respect log level - error and above', () => {
      process.env.LOG_LEVEL = 'error'
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
        })
      )
      delete process.env.LOG_LEVEL
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const { createLogger } = require('@/lib/logger')
      logger = createLogger()
    })

    it('should handle invalid log level gracefully', () => {
      process.env.LOG_LEVEL = 'invalid'
      jest.resetModules()

      const { createLogger } = require('@/lib/logger')
      logger = createLogger()

      // Should fall back to default 'info'
      expect(mockPino).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
        })
      )
      delete process.env.LOG_LEVEL
    })

    it('should handle undefined context', () => {
      logger.info('Message with undefined context', undefined)

      expect(mockPinoInstance.info).toHaveBeenCalledWith(
        undefined,
        'Message with undefined context'
      )
    })
  })

  describe('Default Export', () => {
    it('should export a default logger instance', () => {
      const loggerModule = require('@/lib/logger')

      expect(loggerModule.default).toBeDefined()
      expect(typeof loggerModule.default.info).toBe('function')
      expect(typeof loggerModule.default.error).toBe('function')
      expect(typeof loggerModule.default.child).toBe('function')
    })
  })
})
