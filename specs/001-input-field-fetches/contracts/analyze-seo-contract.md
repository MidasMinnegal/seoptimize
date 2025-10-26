# Contract: SEO Analysis API

**Endpoint**: `POST /api/analyze-seo`  
**Feature**: 001-input-field-fetches  
**Version**: 1.0.0

---

## Description

Performs comprehensive SEO analysis on a given URL. The endpoint fetches the page, renders JavaScript using a headless browser (Puppeteer), sanitizes the HTML, and runs multiple analyzers to detect SEO issues.

## Authentication

None required for MVP.

---

## Request

### HTTP Method

```
POST /api/analyze-seo
```

### Headers

```
Content-Type: application/json
```

### Request Body Schema

```typescript
{
  "url": string  // Required: URL to analyze
}
```

### Validation Rules

| Field | Type   | Required | Validation                                                  |
| ----- | ------ | -------- | ----------------------------------------------------------- |
| `url` | string | Yes      | Must be valid URL (validated by `lib/seo/url-validator.ts`) |
| `url` | string | Yes      | Must use http:// or https:// protocol                       |
| `url` | string | Yes      | Maximum length: 2048 characters                             |

### Request Example

```json
{
  "url": "https://example.com"
}
```

---

## Response

### Success Response (200 OK)

```typescript
{
  "success": true,
  "data": {
    "url": string,
    "analyzedAt": string,  // ISO 8601 timestamp
    "executionTimeMs": number,
    "findings": [
      {
        "id": string,
        "category": "images" | "meta-tags" | "robots" | "content" | "duplicate-content",
        "severity": "critical" | "warning" | "info" | "success",
        "title": string,
        "description": string,
        "impact": string,
        "recommendation": string,
        "count": number | undefined,
        "details": object | undefined
      }
    ],
    "score": number | undefined  // 0-100, optional for MVP
  }
}
```

### Success Response Example

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "analyzedAt": "2025-10-26T10:30:45.123Z",
    "executionTimeMs": 5234,
    "findings": [
      {
        "id": "img-001",
        "category": "images",
        "severity": "warning",
        "title": "Missing Alt Text on Images",
        "description": "5 images are missing alt text attributes, which hurts accessibility and SEO.",
        "impact": "Search engines cannot understand image content, and screen readers cannot describe images to visually impaired users.",
        "recommendation": "Add descriptive alt text to all images. Alt text should describe the image content and context.",
        "count": 5,
        "details": {
          "totalImages": 12,
          "missingAlt": [
            {
              "src": "https://example.com/image1.jpg",
              "alt": null,
              "position": 0
            },
            {
              "src": "https://example.com/image2.png",
              "alt": null,
              "position": 3
            }
          ],
          "emptyAlt": []
        }
      },
      {
        "id": "meta-001",
        "category": "meta-tags",
        "severity": "critical",
        "title": "Missing Meta Description",
        "description": "The page is missing a meta description tag.",
        "impact": "Search engines may display auto-generated, less relevant snippets in search results, reducing click-through rates.",
        "recommendation": "Add a compelling meta description between 150-160 characters that accurately summarizes the page content.",
        "details": {
          "title": {
            "content": "Example Domain",
            "length": 14,
            "isOptimalLength": false
          },
          "missing": ["description"]
        }
      },
      {
        "id": "robots-001",
        "category": "robots",
        "severity": "success",
        "title": "Crawling Allowed",
        "description": "Search engines are allowed to crawl and index this page.",
        "impact": "This page can appear in search engine results.",
        "recommendation": "No action needed. Crawling permissions are properly configured.",
        "details": {
          "directives": [],
          "crawlingBlocked": false,
          "indexingBlocked": false
        }
      },
      {
        "id": "content-001",
        "category": "content",
        "severity": "warning",
        "title": "Insufficient Content",
        "description": "The page has only 127 words of content. Pages with thin content may rank poorly.",
        "impact": "Search engines prefer pages with substantial, valuable content. Thin content may be flagged as low-quality.",
        "recommendation": "Expand content to at least 300 words with valuable, unique information that addresses user intent.",
        "details": {
          "wordCount": 127,
          "hasSufficientContent": false,
          "headings": {
            "h1Count": 1,
            "h2Count": 0,
            "h3Count": 0,
            "totalHeadings": 1,
            "hasProperH1": true
          }
        }
      },
      {
        "id": "dup-001",
        "category": "duplicate-content",
        "severity": "success",
        "title": "No Duplicate Content Detected",
        "description": "The page content is unique with only 12% duplication.",
        "impact": "Unique content is valued by search engines and provides better user experience.",
        "recommendation": "Continue creating original, unique content.",
        "details": {
          "duplicatePercentage": 12.3,
          "exceedsThreshold": false,
          "duplicateBlocks": [],
          "totalWords": 127,
          "duplicateWords": 15
        }
      }
    ]
  }
}
```

---

## Error Response

### Error Response Schema

```typescript
{
  "success": false,
  "error": {
    "code": "INVALID_URL" | "FETCH_FAILED" | "TIMEOUT" | "RENDER_FAILED" | "SANITIZATION_FAILED" | "ANALYSIS_FAILED" | "UNKNOWN_ERROR",
    "message": string,  // User-friendly error message
    "details": string | undefined  // Technical details (for logging)
  }
}
```

### Error Response Examples

#### Invalid URL (400 Bad Request)

```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The URL you provided is not valid. Please check the URL and try again.",
    "details": "URL validation failed: Invalid protocol"
  }
}
```

#### Fetch Failed (502 Bad Gateway)

```json
{
  "success": false,
  "error": {
    "code": "FETCH_FAILED",
    "message": "We couldn't access the website. The site may be down or blocking our requests.",
    "details": "fetch failed: ECONNREFUSED"
  }
}
```

#### Timeout (504 Gateway Timeout)

```json
{
  "success": false,
  "error": {
    "code": "TIMEOUT",
    "message": "The analysis took too long and was cancelled. The website may be very slow or unresponsive.",
    "details": "Analysis timeout after 30000ms"
  }
}
```

#### Render Failed (500 Internal Server Error)

```json
{
  "success": false,
  "error": {
    "code": "RENDER_FAILED",
    "message": "We encountered an error while rendering the page. Please try again.",
    "details": "Puppeteer navigation failed: net::ERR_NAME_NOT_RESOLVED"
  }
}
```

#### Analysis Failed (500 Internal Server Error)

```json
{
  "success": false,
  "error": {
    "code": "ANALYSIS_FAILED",
    "message": "An error occurred while analyzing the page. Please try again.",
    "details": "Image analyzer threw exception: Cannot read property 'src' of null"
  }
}
```

---

## Status Codes

| Code | Meaning               | When Used                                           |
| ---- | --------------------- | --------------------------------------------------- |
| 200  | OK                    | Analysis completed successfully                     |
| 400  | Bad Request           | Invalid URL or malformed request                    |
| 500  | Internal Server Error | Sanitization failed, analysis failed, unknown error |
| 502  | Bad Gateway           | Failed to fetch the target URL                      |
| 504  | Gateway Timeout       | Analysis exceeded 30-second timeout                 |

---

## Performance

### Expected Response Time

- **Typical**: 10-20 seconds (including JavaScript rendering)
- **Maximum**: 30 seconds (enforced timeout per NFR-001)

### Timeout Configuration

```typescript
// In route.ts
export const maxDuration = 30 // seconds
export const dynamic = 'force-dynamic' // Don't cache
```

### Performance Characteristics

- JavaScript rendering: 5-15 seconds (Puppeteer)
- HTML sanitization: < 100ms
- Analysis (all analyzers): < 1 second
- Network fetch: 1-5 seconds (varies by target site)

---

## Dependencies

### External Services

- Target website (user-provided URL)

### Internal Modules

- `lib/seo/browser/renderer.ts` - Headless browser rendering (Puppeteer)
- `lib/seo/sanitizer.ts` - HTML sanitization (isomorphic-dompurify)
- `lib/seo/analyzers/image-analyzer.ts` - Image analysis
- `lib/seo/analyzers/meta-analyzer.ts` - Meta tag analysis
- `lib/seo/analyzers/robots-analyzer.ts` - Robots directive analysis
- `lib/seo/analyzers/content-analyzer.ts` - Content quality analysis
- `lib/seo/analyzers/duplicate-analyzer.ts` - Duplicate content detection
- `lib/logger/index.ts` - Structured logging
- `lib/seo/url-validator.ts` - URL validation (existing)

---

## Logging Events

The endpoint logs the following events:

| Event             | Level | When                                |
| ----------------- | ----- | ----------------------------------- |
| Analysis started  | info  | Request received with valid URL     |
| Fetching URL      | info  | Starting to fetch target URL        |
| Rendering page    | info  | Starting Puppeteer rendering        |
| Sanitizing HTML   | info  | Starting HTML sanitization          |
| Running analyzers | info  | Starting analysis phase             |
| Analysis complete | info  | All analyzers finished successfully |
| Analysis failed   | error | Any step failed                     |
| Timeout           | warn  | Analysis exceeded timeout           |

### Log Example

```json
{
  "level": "info",
  "timestamp": "2025-10-26T10:30:45.123Z",
  "message": "SEO analysis started",
  "context": {
    "operation": "analyze-seo",
    "url": "https://example.com",
    "requestId": "req-abc123"
  }
}
```

---

## Error Handling

### Error Scenarios

#### 1. Invalid URL

- **Trigger**: URL fails validation
- **Response**: 400 Bad Request with `INVALID_URL` code
- **Logged**: warn level
- **User Message**: "The URL you provided is not valid. Please check the URL and try again."

#### 2. Network Failure

- **Trigger**: Cannot connect to target URL (DNS failure, connection refused, SSL error)
- **Response**: 502 Bad Gateway with `FETCH_FAILED` code
- **Logged**: error level
- **User Message**: "We couldn't access the website. The site may be down or blocking our requests."

#### 3. Timeout

- **Trigger**: Analysis exceeds 30 seconds
- **Response**: 504 Gateway Timeout with `TIMEOUT` code
- **Logged**: warn level
- **User Message**: "The analysis took too long and was cancelled. The website may be very slow or unresponsive."

#### 4. Rendering Failure

- **Trigger**: Puppeteer fails to render page (JavaScript errors, resource loading failure)
- **Response**: 500 Internal Server Error with `RENDER_FAILED` code
- **Logged**: error level with stack trace
- **User Message**: "We encountered an error while rendering the page. Please try again."

#### 5. Sanitization Failure

- **Trigger**: DOMPurify or jsdom throws exception
- **Response**: 500 Internal Server Error with `SANITIZATION_FAILED` code
- **Logged**: error level with stack trace
- **User Message**: "An error occurred while processing the page content. Please try again."

#### 6. Analysis Failure

- **Trigger**: Any analyzer throws uncaught exception
- **Response**: 500 Internal Server Error with `ANALYSIS_FAILED` code
- **Logged**: error level with stack trace
- **User Message**: "An error occurred while analyzing the page. Please try again."

### Error Recovery

- Browser instance is restarted if Puppeteer crashes
- Partial results are NOT returned (all-or-nothing approach for MVP)
- Errors are logged with full context for debugging

---

## Rate Limiting

**MVP**: No rate limiting implemented.

**Future consideration**:

- Limit to 10 requests per IP per minute
- Implement queue system for concurrent requests
- Add authentication with higher limits for registered users

---

## Caching

**MVP**: No caching (re-analyze on every request per clarification).

**Future consideration**:

- Cache results for 1 hour per URL
- Add `force-refresh` parameter to bypass cache
- Implement cache invalidation strategy

---

## Security

### Input Validation

- URL must be validated before fetching (prevent SSRF attacks)
- Maximum URL length enforced (2048 chars)
- Protocol whitelist: only http:// and https://

### HTML Sanitization

- All fetched HTML is sanitized server-side using isomorphic-dompurify
- Scripts, event handlers, and dangerous attributes removed
- Sanitized HTML is never rendered directly in browser

### Browser Security

- Puppeteer runs with `--no-sandbox` and `--disable-setuid-sandbox` flags
- Browser instances are isolated per request (future: connection pooling)
- Timeout enforced to prevent resource exhaustion

---

## Testing

### Unit Tests

- Request validation
- Error code mapping
- Response formatting

### Integration Tests

- Full analysis flow with mock HTML
- Error handling for each error scenario
- Timeout behavior

### E2E Tests

- Analysis of real websites
- Performance under load
- Browser crash recovery

---

## Versioning

**Current Version**: 1.0.0

### Future Changes

- v1.1.0: Add caching
- v1.2.0: Add rate limiting
- v2.0.0: Add authentication and historical tracking

---

## Notes

- Analysis is **synchronous** - client waits for full completion
- No partial results or streaming (MVP simplification)
- Results are deterministic (same URL analyzed twice yields same findings per NFR-005)
- Execution time includes all steps: fetch, render, sanitize, analyze
