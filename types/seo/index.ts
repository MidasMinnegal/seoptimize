/**
 * SEO Analysis Type Definitions
 * Feature: 003-seo-url-input
 */

// Fetch status states
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

// Validation error codes
export type ValidationErrorCode =
  | 'EMPTY_VALUE'
  | 'INVALID_FORMAT'
  | 'MISSING_PROTOCOL'
  | 'UNSUPPORTED_PROTOCOL'
  | 'LOCALHOST_BLOCKED'
  | 'PRIVATE_IP'

// Validation error structure
export interface ValidationError {
  code: ValidationErrorCode
  message: string
}

// Validation result (success or error)
export type ValidationResult =
  | { valid: true; normalizedUrl: string }
  | { valid: false; error: ValidationError }

// Fetch error types
export type FetchErrorType =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'CORS_ERROR'
  | 'INVALID_RESPONSE'
  | 'SIZE_EXCEEDED'
  | 'UNKNOWN'

// Fetch error structure
export interface FetchError {
  type: FetchErrorType
  message: string
  statusCode?: number
  details?: string
}

// Successfully fetched HTML data
export interface FetchedHTML {
  url: string
  finalUrl: string
  html: string
  contentLength: number
  timestamp: string
  headers: Record<string, string>
}

// URL input component state
export interface URLInputState {
  url: string
  status: FetchStatus
  error: FetchError | null
  fetchedData: FetchedHTML | null
}

// API Request/Response types
export interface FetchURLRequest {
  url: string
}

export type FetchURLResponse =
  | { success: true; data: FetchedHTML }
  | { success: false; error: FetchError }
