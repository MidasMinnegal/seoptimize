# SEO URL Input - Data Model

## Overview

This document defines the data structures used in the URL input and HTML fetching feature. These are designed to be extensible for future SEO analysis capabilities.

## Core Data Structures

### URLInputState

Represents the complete state of the URL input form and fetch operation.

```typescript
type URLInputState = {
  url: string // Current value in the input field
  status: FetchStatus // Current status of the fetch operation
  error: string | null // Error message if status is 'error'
  fetchedData: FetchedHTML | null // Result of successful fetch
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'
```

**Properties:**

- `url`: The raw URL string entered by the user
- `status`: Tracks the lifecycle of the fetch operation
- `error`: Human-readable error message shown to user
- `fetchedData`: The fetched HTML and metadata

**State Transitions:**

- `idle` → `loading`: When user submits the form
- `loading` → `success`: When fetch completes successfully
- `loading` → `error`: When fetch fails (network, timeout, validation)
- `success` → `idle`: When user clears/resets the form
- `error` → `idle`: When user clears/resets the form

---

### FetchedHTML

Represents the HTML content and metadata retrieved from a URL.

```typescript
type FetchedHTML = {
  html: string // Raw HTML content as string
  url: string // Final URL (after following redirects)
  originalUrl: string // Original URL that was submitted
  contentLength: number // Size of HTML in bytes
  contentType: string // MIME type from response headers
  statusCode: number // HTTP status code (200, etc.)
  fetchedAt: Date // Timestamp when fetch completed
  headers: Record<string, string> // Relevant HTTP headers
}
```

**Properties:**

- `html`: The raw HTML source code - this will be analyzed for SEO in future features
- `url`: The final URL after redirects (may differ from originalUrl)
- `originalUrl`: The URL the user originally submitted
- `contentLength`: Size in bytes - useful for performance monitoring
- `contentType`: Should typically be "text/html" but useful for validation
- `statusCode`: HTTP status - useful for identifying issues
- `fetchedAt`: Timestamp for cache invalidation and history tracking in future
- `headers`: Selected headers that may be useful for SEO analysis (e.g., caching headers, server info)

**Future Extensions:**
This structure is designed to easily add:

- `analysisResults: SEOAnalysisResult` - Future field for SEO findings
- `screenshots: Screenshot[]` - Future field for visual captures
- `performanceMetrics: PerformanceData` - Future field for load time metrics

---

### ValidationError

Represents validation errors for URL input.

```typescript
type ValidationError = {
  field: 'url'
  message: string
  code: ValidationErrorCode
}

type ValidationErrorCode =
  | 'INVALID_FORMAT' // URL doesn't match URL pattern
  | 'MISSING_PROTOCOL' // No http:// or https://
  | 'UNSUPPORTED_PROTOCOL' // Protocol other than http/https
  | 'LOCALHOST_BLOCKED' // Attempt to analyze localhost
  | 'PRIVATE_IP' // Attempt to analyze private network
  | 'EMPTY_VALUE' // Empty string submitted
```

**Usage:**
Allows programmatic error handling and internationalization in future.

---

### FetchError

Represents errors that occur during the fetch operation.

```typescript
type FetchError = {
  type: FetchErrorType
  message: string // User-friendly error message
  statusCode?: number // HTTP status if applicable
  details?: string // Technical details for debugging
}

type FetchErrorType =
  | 'NETWORK_ERROR' // No internet or DNS failure
  | 'TIMEOUT' // Request exceeded timeout
  | 'HTTP_ERROR' // 4xx or 5xx status code
  | 'CORS_ERROR' // CORS policy blocked request
  | 'INVALID_RESPONSE' // Response wasn't HTML
  | 'SIZE_EXCEEDED' // Response too large
  | 'UNKNOWN' // Unexpected error
```

**Usage:**
Provides structured error handling for different failure scenarios.

---

## API Data Structures

### FetchURLRequest

Request payload for the URL fetching API endpoint.

```typescript
type FetchURLRequest = {
  url: string // URL to fetch
  followRedirects?: boolean // Whether to follow redirects (default: true)
  timeout?: number // Timeout in milliseconds (default: 30000)
  maxSize?: number // Max response size in bytes (default: 10MB)
}
```

### FetchURLResponse

Response from the URL fetching API endpoint.

```typescript
type FetchURLResponse = {
  success: boolean
  data?: FetchedHTML // Present when success is true
  error?: FetchError // Present when success is false
}
```

---

## Example State Flow

### Successful Fetch

1. **Initial State:**

```typescript
{
  url: '',
  status: 'idle',
  error: null,
  fetchedData: null
}
```

2. **User types URL:**

```typescript
{
  url: 'https://example.com',
  status: 'idle',
  error: null,
  fetchedData: null
}
```

3. **User submits:**

```typescript
{
  url: 'https://example.com',
  status: 'loading',
  error: null,
  fetchedData: null
}
```

4. **Fetch completes:**

```typescript
{
  url: 'https://example.com',
  status: 'success',
  error: null,
  fetchedData: {
    html: '<!DOCTYPE html>...',
    url: 'https://example.com',
    originalUrl: 'https://example.com',
    contentLength: 15234,
    contentType: 'text/html',
    statusCode: 200,
    fetchedAt: new Date('2025-10-26T12:00:00Z'),
    headers: { ... }
  }
}
```

### Failed Fetch

```typescript
{
  url: 'https://nonexistent-domain-12345.com',
  status: 'error',
  error: 'Unable to reach the website. Please check the URL and try again.',
  fetchedData: null
}
```

---

## Design Principles

1. **Immutability**: State updates should create new objects, not mutate existing ones
2. **Type Safety**: All structures have explicit TypeScript types
3. **Extensibility**: Designed to easily add SEO analysis results without breaking changes
4. **Separation**: Input state separate from fetched data for clarity
5. **User-Friendly Errors**: Error messages designed for end users, not developers
6. **Future-Proof**: Structure anticipates needs of SEO analysis feature

---

## Storage Considerations

### Current Implementation

- All state stored in React component state (useState)
- Data lost on page refresh
- Suitable for MVP

### Future Considerations

- Add localStorage persistence for analysis history
- Add database storage for user accounts
- Add caching layer for frequently analyzed URLs
- Consider Redux/Zustand for complex state management
