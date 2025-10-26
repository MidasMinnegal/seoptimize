/**
 * Logger Type Definitions
 * Feature: 001-input-field-fetches
 * Structured logging with Pino
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogContext {
  /** Operation being performed */
  operation: string

  /** URL being analyzed (if applicable) */
  url?: string

  /** Request ID for correlation */
  requestId?: string

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

export interface AnalysisLogEntry {
  level: LogLevel
  timestamp: string
  message: string
  context: LogContext
  duration?: number // milliseconds
  error?: Error
}

/**
 * Logger interface matching Pino's API
 */
export interface Logger {
  trace(message: string, context?: LogContext): void
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  fatal(message: string, context?: LogContext): void

  /** Create a child logger with additional context */
  child(bindings: Record<string, unknown>): Logger
}
