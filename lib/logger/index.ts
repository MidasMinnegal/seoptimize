/**
 * Logger Module
 * Feature: 001-input-field-fetches
 * Tasks: T012-T014 - Pino-based structured logging with environment-based configuration
 */

import pino from 'pino'

import type { LogContext, Logger as LoggerInterface, LogLevel } from '@/types/logger'

/**
 * Get log level from environment or default to 'info'
 */
function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase()
  const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal']

  if (level && validLevels.includes(level as LogLevel)) {
    return level as LogLevel
  }

  return 'info'
}

/**
 * Determine if we should use pretty printing (development) or JSON (production)
 * Note: pino-pretty is not compatible with edge runtime or bundled environments
 * It also doesn't work in Next.js API routes due to webpack bundling
 */
function shouldUsePrettyPrint(): boolean {
  // Disable pretty printing in edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    return false
  }
  // Disable if we can't determine environment (safer default)
  if (!process.env.NODE_ENV) {
    return false
  }
  // Disable in production
  if (process.env.NODE_ENV !== 'development') {
    return false
  }
  // Disable pino-pretty entirely - it doesn't work reliably in Next.js
  // API routes are bundled by webpack which breaks pino-pretty transport resolution
  // Use JSON logging for all environments to avoid runtime errors
  return false
}

/**
 * Create a configured Pino logger instance
 */
export function createLogger(): LoggerInterface {
  const level = getLogLevel()
  const usePretty = shouldUsePrettyPrint()

  const pinoOptions: pino.LoggerOptions = {
    level,
    ...(usePretty && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    }),
  }

  const pinoLogger = pino(pinoOptions)

  // Wrap Pino logger to match our Logger interface
  return {
    trace(message: string, context?: LogContext): void {
      pinoLogger.trace(context, message)
    },
    debug(message: string, context?: LogContext): void {
      pinoLogger.debug(context, message)
    },
    info(message: string, context?: LogContext): void {
      pinoLogger.info(context, message)
    },
    warn(message: string, context?: LogContext): void {
      pinoLogger.warn(context, message)
    },
    error(message: string, context?: LogContext): void {
      pinoLogger.error(context, message)
    },
    fatal(message: string, context?: LogContext): void {
      pinoLogger.fatal(context, message)
    },
    child(bindings: Record<string, unknown>): LoggerInterface {
      const childPinoLogger = pinoLogger.child(bindings)
      return {
        trace(message: string, context?: LogContext): void {
          childPinoLogger.trace(context, message)
        },
        debug(message: string, context?: LogContext): void {
          childPinoLogger.debug(context, message)
        },
        info(message: string, context?: LogContext): void {
          childPinoLogger.info(context, message)
        },
        warn(message: string, context?: LogContext): void {
          childPinoLogger.warn(context, message)
        },
        error(message: string, context?: LogContext): void {
          childPinoLogger.error(context, message)
        },
        fatal(message: string, context?: LogContext): void {
          childPinoLogger.fatal(context, message)
        },
        child(childBindings: Record<string, unknown>): LoggerInterface {
          return createLoggerFromPino(childPinoLogger.child(childBindings))
        },
      }
    },
  }
}

/**
 * Helper to create logger interface from Pino logger instance
 * (to avoid code duplication in child logger creation)
 */
function createLoggerFromPino(pinoLogger: pino.Logger): LoggerInterface {
  return {
    trace(message: string, context?: LogContext): void {
      pinoLogger.trace(context, message)
    },
    debug(message: string, context?: LogContext): void {
      pinoLogger.debug(context, message)
    },
    info(message: string, context?: LogContext): void {
      pinoLogger.info(context, message)
    },
    warn(message: string, context?: LogContext): void {
      pinoLogger.warn(context, message)
    },
    error(message: string, context?: LogContext): void {
      pinoLogger.error(context, message)
    },
    fatal(message: string, context?: LogContext): void {
      pinoLogger.fatal(context, message)
    },
    child(bindings: Record<string, unknown>): LoggerInterface {
      return createLoggerFromPino(pinoLogger.child(bindings))
    },
  }
}

/**
 * Default logger instance
 * Use this for general application logging
 */
export default createLogger()
