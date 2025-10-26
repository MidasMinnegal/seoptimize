/**
 * URL Input Form Component
 * Feature: 003-seo-url-input
 * Main component for entering and fetching URLs for SEO analysis
 */

'use client'

import { Button } from '@components/ui/button'
import { ErrorMessage } from '@components/ui/error-message'
import { LoadingSpinner } from '@components/ui/loading-spinner'
import React, { FormEvent, useEffect, useRef, useState } from 'react'

import { validateURL } from '@/lib/seo/url-validator'
import type {
  FetchedHTML,
  FetchError,
  FetchStatus,
  FetchURLRequest,
  FetchURLResponse,
} from '@/types/seo'

export interface URLInputFormProps {
  onFetchComplete?: (data: FetchedHTML) => void
  onFetchError?: (error: FetchError) => void
}

const errorMessages: Record<FetchError['type'], (url: string) => string> = {
  NETWORK_ERROR: url =>
    `Unable to reach ${url}. Please check your internet connection and try again.`,
  TIMEOUT: () => 'The request took too long. Please try again or enter a different URL.',
  HTTP_ERROR: () => 'Failed to fetch the webpage. The server returned an error.',
  CORS_ERROR: url => `Unable to access ${url}. The website may block analysis tools.`,
  INVALID_RESPONSE: () => "The URL didn't return a valid webpage. Please enter a different URL.",
  SIZE_EXCEEDED: () => 'The webpage is too large to analyze.',
  UNKNOWN: () => 'An unexpected error occurred. Please try again.',
}

function getFriendlyErrorMessage(error: FetchError, url: string): string {
  const messageGenerator = errorMessages[error.type]
  const baseMessage = messageGenerator ? messageGenerator(url) : error.message

  if (error.statusCode) {
    return `${baseMessage} (Status: ${error.statusCode})`
  }

  return baseMessage
}

export function URLInputForm({ onFetchComplete, onFetchError }: URLInputFormProps) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [error, setError] = useState<FetchError | null>(null)
  const [fetchedData, setFetchedData] = useState<FetchedHTML | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    // Clear validation errors when user types
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Client-side validation
    const validationResult = validateURL(url)
    if (!validationResult.valid) {
      setError({
        type: 'NETWORK_ERROR',
        message: validationResult.error.message,
      })
      return
    }

    // Start loading
    setStatus('loading')
    setError(null)

    try {
      // Use the normalized URL (with protocol added if missing)
      const requestBody: FetchURLRequest = { url: validationResult.normalizedUrl }
      const response = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = (await response.json()) as FetchURLResponse

      if (data.success) {
        setStatus('success')
        setFetchedData(data.data)
        onFetchComplete?.(data.data)
      } else {
        setStatus('error')
        setError(data.error)
        onFetchError?.(data.error)
      }
    } catch (err) {
      const fetchError: FetchError = {
        type: 'NETWORK_ERROR',
        message: 'Failed to connect to the server. Please try again.',
        details: err instanceof Error ? err.message : String(err),
      }
      setStatus('error')
      setError(fetchError)
      onFetchError?.(fetchError)
    }
  }

  const handleReset = () => {
    setUrl('')
    setStatus('idle')
    setError(null)
    setFetchedData(null)
    inputRef.current?.focus()
  }

  const isLoading = status === 'loading'
  const isSuccess = status === 'success'
  const isError = status === 'error'

  return (
    <div className="url-input-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url-input" className="form-label">
            Website URL
          </label>
          <input
            ref={inputRef}
            id="url-input"
            type="text"
            className="url-input"
            placeholder="example.com"
            value={url}
            onChange={handleInputChange}
            disabled={isLoading || isSuccess}
            aria-label="Website URL"
            aria-required="true"
            aria-invalid={isError}
            aria-describedby={isError ? 'error-message' : undefined}
          />
        </div>

        {!isSuccess && (
          <Button type="submit" variant="primary" size="large" disabled={isLoading || !url.trim()}>
            {isLoading ? 'Analyzing...' : 'Analyze URL'}
          </Button>
        )}
      </form>

      {isLoading && (
        <div className="status-container" aria-live="polite">
          <LoadingSpinner label="Fetching website content..." />
          <p className="status-text">Fetching website content...</p>
        </div>
      )}

      {isError && error && (
        <div id="error-message" className="status-container">
          <ErrorMessage message={getFriendlyErrorMessage(error, url)} details={error.details} />
        </div>
      )}

      {isSuccess && fetchedData && (
        <div className="status-container success-state" aria-live="polite">
          <div className="success-icon">✓</div>
          <div className="success-content">
            <h3 className="success-title">Successfully Fetched!</h3>
            <p className="success-url">{fetchedData.finalUrl}</p>
            <p className="success-details">
              Content size: {(fetchedData.contentLength / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button variant="secondary" size="medium" onClick={handleReset}>
            Analyze Another URL
          </Button>
        </div>
      )}

      <style jsx>{`
        .url-input-form {
          max-width: 600px;
          margin: 0 auto;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 600;
          font-size: 1.125rem;
          color: #333;
        }

        .url-input {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 2px solid #ddd;
          border-radius: 0.5rem;
          transition: border-color 0.2s;
        }

        .url-input:focus {
          outline: none;
          border-color: #0070f3;
        }

        .url-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .url-input[aria-invalid='true'] {
          border-color: #c33;
        }

        .status-container {
          margin-top: 2rem;
          padding: 1.5rem;
          border-radius: 0.5rem;
        }

        .status-text {
          text-align: center;
          margin-top: 1rem;
          color: #666;
        }

        .success-state {
          background-color: #f0fdf4;
          border: 1px solid #86efac;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background-color: #22c55e;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }

        .success-content {
          text-align: center;
        }

        .success-title {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          color: #166534;
        }

        .success-url {
          margin: 0 0 0.25rem;
          color: #15803d;
          font-weight: 500;
          word-break: break-all;
        }

        .success-details {
          margin: 0;
          color: #16a34a;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
