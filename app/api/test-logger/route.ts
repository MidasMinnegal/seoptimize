/**
 * Test Logger API Route
 * Feature: 001-input-field-fetches
 * Task: T015 - Verify logger works in Next.js API route
 */

import { NextRequest, NextResponse } from 'next/server'

import logger from '@/lib/logger'

export async function GET(request: NextRequest) {
  // Create a request-scoped child logger
  const requestId = crypto.randomUUID()
  const requestLogger = logger.child({
    requestId,
    path: request.nextUrl.pathname,
  })

  requestLogger.info('Test logger endpoint called')

  // Test all log levels
  requestLogger.trace('Trace level message', {
    operation: 'test',
    metadata: { level: 'trace' },
  })

  requestLogger.debug('Debug level message', {
    operation: 'test',
    metadata: { level: 'debug' },
  })

  requestLogger.info('Info level message', {
    operation: 'test',
    url: 'https://example.com',
  })

  requestLogger.warn('Warning level message', {
    operation: 'test',
    metadata: { warning: 'This is a test warning' },
  })

  requestLogger.error('Error level message', {
    operation: 'test',
    metadata: { error: 'This is a test error' },
  })

  requestLogger.info('Logger test complete')

  return NextResponse.json({
    success: true,
    message: 'Logger test complete',
    requestId,
    logLevels: ['trace', 'debug', 'info', 'warn', 'error'],
    note: 'Check server console for log output',
  })
}
