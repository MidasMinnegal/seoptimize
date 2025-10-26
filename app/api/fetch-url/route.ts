/**
 * API Route: Fetch URL Content
 * Feature: 003-seo-url-input
 * Endpoint: POST /api/fetch-url
 */

import { NextRequest, NextResponse } from 'next/server'

import { validateURL } from '@/lib/seo/url-validator'
import type { FetchedHTML, FetchError, FetchURLRequest, FetchURLResponse } from '@/types/seo'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const TIMEOUT_MS = 30000 // 30 seconds

function createFetchError(
  type: FetchError['type'],
  message: string,
  statusCode?: number,
  details?: string
): FetchError {
  return { type, message, statusCode, details }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'SEOptimize/1.0 (SEO Analysis Tool)',
      },
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<FetchURLResponse>> {
  try {
    // Parse request body
    const body = (await request.json()) as FetchURLRequest

    // Validate URL
    const validationResult = validateURL(body.url)
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: createFetchError('NETWORK_ERROR', validationResult.error.message),
        },
        { status: 400 }
      )
    }

    // Fetch URL with timeout
    let response: Response
    try {
      response = await fetchWithTimeout(body.url, TIMEOUT_MS)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json({
            success: false,
            error: createFetchError(
              'TIMEOUT',
              'The request took too long. Please try again or enter a different URL.',
              undefined,
              `Timeout after ${TIMEOUT_MS}ms`
            ),
          })
        }

        return NextResponse.json({
          success: false,
          error: createFetchError(
            'NETWORK_ERROR',
            `Unable to reach ${body.url}. Please check the URL and try again.`,
            undefined,
            error.message
          ),
        })
      }

      return NextResponse.json({
        success: false,
        error: createFetchError('UNKNOWN', 'An unexpected error occurred. Please try again.'),
      })
    }

    // Check HTTP status
    if (!response.ok) {
      const statusMessages: Record<number, string> = {
        404: 'The page was not found (404).',
        403: 'Access to this page is forbidden (403).',
        500: 'The server encountered an error (500).',
        502: 'Bad gateway error (502).',
        503: 'The service is temporarily unavailable (503).',
      }

      const statusMessage = statusMessages[response.status] || `HTTP error ${response.status}.`

      return NextResponse.json({
        success: false,
        error: createFetchError(
          'HTTP_ERROR',
          `Failed to fetch ${body.url}. ${statusMessage}`,
          response.status
        ),
      })
    }

    // Check content type
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return NextResponse.json({
        success: false,
        error: createFetchError(
          'INVALID_RESPONSE',
          "The URL didn't return a valid webpage. Please enter a different URL.",
          undefined,
          `Content-Type: ${contentType}`
        ),
      })
    }

    // Check content length
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE_BYTES) {
      return NextResponse.json({
        success: false,
        error: createFetchError(
          'SIZE_EXCEEDED',
          'The webpage is too large to analyze.',
          undefined,
          `Content-Length: ${contentLength} bytes (max: ${MAX_SIZE_BYTES})`
        ),
      })
    }

    // Read response body with size check
    const html = await response.text()
    if (html.length > MAX_SIZE_BYTES) {
      return NextResponse.json({
        success: false,
        error: createFetchError(
          'SIZE_EXCEEDED',
          'The webpage is too large to analyze.',
          undefined,
          `Actual size: ${html.length} bytes (max: ${MAX_SIZE_BYTES})`
        ),
      })
    }

    // Extract headers
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Create successful response
    const fetchedData: FetchedHTML = {
      url: body.url,
      finalUrl: response.url,
      html,
      contentLength: html.length,
      timestamp: new Date().toISOString(),
      headers,
    }

    return NextResponse.json({
      success: true,
      data: fetchedData,
    })
  } catch (error) {
    console.error('Fetch URL error:', error)

    return NextResponse.json({
      success: false,
      error: createFetchError(
        'UNKNOWN',
        'An unexpected error occurred. Please try again.',
        undefined,
        error instanceof Error ? error.message : String(error)
      ),
    })
  }
}
