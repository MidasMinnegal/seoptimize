# Data Model: SEO Analysis & Results Display

**Feature**: 001-input-field-fetches  
**Date**: 2025-10-26  
**Source**: Derived from spec.md Key Entities section

---

## Overview

This document defines the TypeScript type definitions for all entities involved in the SEO analysis feature. All types follow the constitutional requirement for explicit type annotations and strict TypeScript mode.

---

## Core Entities

### SEOAnalysisResult

Represents the complete analysis of a single URL.

```typescript
type SEOAnalysisResult = {
  /** The URL that was analyzed */
  url: string

  /** ISO 8601 timestamp when analysis was performed */
  analyzedAt: string

  /** Collection of findings organized by category */
  findings: SEOFinding[]

  /** Overall SEO score (0-100), optional for MVP */
  score?: number

  /** Analysis execution time in milliseconds */
  executionTimeMs: number

  /** Sanitized HTML content that was analyzed (for debugging/reference) */
  sanitizedHtml?: string
}
```

**Validation Rules**:

- `url` must be a valid URL (validated by existing `url-validator.ts`)
- `analyzedAt` must be ISO 8601 format
- `findings` array must not be empty (at least one finding per analysis)
- `executionTimeMs` must be > 0 and < 30000 (30s timeout per NFR-001)

---

### SEOFinding

Represents a specific SEO issue or confirmation.

```typescript
type SEOFindingSeverity = 'critical' | 'warning' | 'info' | 'success'

type SEOFindingCategory = 'images' | 'meta-tags' | 'robots' | 'content' | 'duplicate-content'

type SEOFinding = {
  /** Unique identifier for this finding */
  id: string

  /** Category of the finding */
  category: SEOFindingCategory

  /** Severity level */
  severity: SEOFindingSeverity

  /** Short title/summary of the finding */
  title: string

  /** Detailed description explaining what's wrong */
  description: string

  /** Explanation of SEO impact */
  impact: string

  /** Actionable recommendation for fixing the issue */
  recommendation: string

  /** Count or quantity (e.g., number of affected images) */
  count?: number

  /** Specific details or examples */
  details?: SEOFindingDetails
}
```

**Validation Rules**:

- `id` must be unique within an `SEOAnalysisResult`
- `title` must be non-empty string (1-100 chars)
- `description` must be non-empty string (1-500 chars)
- `impact` must be non-empty string (1-300 chars)
- `recommendation` must be non-empty string (1-500 chars)
- `count` must be >= 0 if provided

---

### SEOFindingDetails

Union type for category-specific finding details.

```typescript
type SEOFindingDetails =
  | ImageFindingDetails
  | MetaTagFindingDetails
  | RobotsFindingDetails
  | ContentFindingDetails
  | DuplicateContentFindingDetails
```

---

### ImageAnalysis & ImageFindingDetails

Detailed analysis of page images.

```typescript
type ImageInfo = {
  /** Image source URL */
  src: string

  /** Alt text value (empty string if present but empty) */
  alt: string | null

  /** Image position in document (0-indexed) */
  position: number
}

type ImageFindingDetails = {
  /** Total number of images found on page */
  totalImages: number

  /** Images missing alt attribute */
  missingAlt: ImageInfo[]

  /** Images with empty alt text (alt="") */
  emptyAlt: ImageInfo[]

  /** Images with proper alt text (for success findings) */
  withAlt?: ImageInfo[]
}

type ImageAnalysis = {
  totalImages: number
  imagesWithAlt: number
  imagesMissingAlt: number
  imagesWithEmptyAlt: number
  images: ImageInfo[]
}
```

**Validation Rules**:

- `totalImages` must equal `missingAlt.length + emptyAlt.length + (withAlt?.length ?? 0)`
- `src` must be non-empty string
- `position` must be >= 0
- `alt` is `null` if attribute is missing, empty string if `alt=""`

---

### MetaTagAnalysis & MetaTagFindingDetails

Analysis of page meta information.

```typescript
type MetaTag = {
  /** Meta tag name or property */
  name: string

  /** Meta tag content */
  content: string

  /** Character length of content */
  length: number
}

type TitleTag = {
  /** Title text content */
  content: string

  /** Character length */
  length: number

  /** Whether length is optimal (50-60 chars) */
  isOptimalLength: boolean
}

type MetaTagFindingDetails = {
  /** Title tag information */
  title?: TitleTag

  /** Meta description tag */
  description?: MetaTag

  /** Robots meta tag */
  robots?: MetaTag

  /** Duplicate or conflicting tags */
  duplicates?: string[]

  /** Missing essential tags */
  missing?: string[]
}

type MetaTagAnalysis = {
  /** Title tag (null if missing) */
  title: TitleTag | null

  /** Meta description (null if missing) */
  description: MetaTag | null

  /** Robots meta tag (null if missing) */
  robots: MetaTag | null

  /** Open Graph tags (optional for MVP) */
  openGraph?: MetaTag[]

  /** Twitter Card tags (optional for MVP) */
  twitterCard?: MetaTag[]

  /** List of duplicate tag names */
  duplicateTags: string[]
}
```

**Validation Rules**:

- `title.length` ideal: 50-60 chars, warning if <30 or >70
- `description.length` ideal: 150-160 chars, warning if <120 or >200
- `isOptimalLength` = true if length in [50, 60]
- `duplicateTags` contains only tag names that appear 2+ times

---

### RobotsAnalysis & RobotsFindingDetails

Analysis of robots crawling directives.

```typescript
type RobotsDirective =
  | 'index'
  | 'noindex'
  | 'follow'
  | 'nofollow'
  | 'none'
  | 'noarchive'
  | 'nosnippet'
  | 'noimageindex'
  | 'nocache'

type RobotsFindingDetails = {
  /** Detected robots directives */
  directives: RobotsDirective[]

  /** Whether crawling is blocked */
  crawlingBlocked: boolean

  /** Whether indexing is blocked */
  indexingBlocked: boolean

  /** Raw robots meta tag content */
  rawContent?: string
}

type RobotsAnalysis = {
  /** Parsed directives from robots meta tag */
  directives: RobotsDirective[]

  /** Whether robots meta tag exists */
  hasRobotsTag: boolean

  /** Whether crawling is allowed */
  crawlingAllowed: boolean

  /** Whether indexing is allowed */
  indexingAllowed: boolean
}
```

**Validation Rules**:

- `crawlingBlocked` = true if `nofollow` or `none` present
- `indexingBlocked` = true if `noindex` or `none` present
- `directives` array must not contain duplicates
- Empty `directives` array = no restrictions (default allow)

---

### ContentAnalysis & ContentFindingDetails

Analysis of page text content.

```typescript
type HeadingInfo = {
  /** Heading level (1-6) */
  level: number

  /** Heading text content */
  text: string

  /** Position in document (0-indexed) */
  position: number
}

type HeadingStructure = {
  /** H1 tags found */
  h1: HeadingInfo[]

  /** H2 tags found */
  h2: HeadingInfo[]

  /** H3 tags found */
  h3: HeadingInfo[]

  /** H4 tags found */
  h4: HeadingInfo[]

  /** H5 tags found */
  h5: HeadingInfo[]

  /** H6 tags found */
  h6: HeadingInfo[]
}

type ContentFindingDetails = {
  /** Total word count */
  wordCount: number

  /** Whether content is sufficient (>= 300 words) */
  hasSufficientContent: boolean

  /** Heading structure summary */
  headings: {
    h1Count: number
    h2Count: number
    h3Count: number
    totalHeadings: number
    hasProperH1: boolean // Exactly one H1
  }

  /** Content-to-HTML ratio (percentage) */
  contentRatio?: number
}

type ContentAnalysis = {
  /** Total word count (excluding scripts, styles, navigation) */
  wordCount: number

  /** Detailed heading structure */
  headings: HeadingStructure

  /** Content-to-HTML ratio (text characters / total HTML characters) */
  contentToHtmlRatio: number

  /** Whether page has sufficient content (>= 300 words) */
  hasSufficientContent: boolean

  /** Whether heading structure is proper (exactly 1 H1) */
  hasProperHeadingStructure: boolean
}
```

**Validation Rules**:

- `wordCount` must be >= 0
- `hasSufficientContent` = true if `wordCount >= 300`
- `hasProperH1` = true if exactly 1 H1 tag exists
- `hasProperHeadingStructure` = `hasProperH1` && (H2s exist if H3s exist)
- `contentToHtmlRatio` must be between 0 and 1 (percentage as decimal)
- `level` must be 1-6

---

### DuplicateContentAnalysis & DuplicateContentFindingDetails

Analysis of duplicate content within the page.

```typescript
type DuplicateBlock = {
  /** The duplicated text content */
  text: string

  /** Word positions where this block appears */
  positions: number[]

  /** Number of times this block appears */
  occurrences: number

  /** Length of the duplicate block in words */
  wordCount: number
}

type DuplicateContentFindingDetails = {
  /** Percentage of content that is duplicated */
  duplicatePercentage: number

  /** Whether page exceeds 50% duplicate threshold */
  exceedsThreshold: boolean

  /** Detailed duplicate blocks found */
  duplicateBlocks: DuplicateBlock[]

  /** Total words analyzed */
  totalWords: number

  /** Total duplicate words */
  duplicateWords: number
}

type DuplicateContentAnalysis = {
  /** Percentage of duplicated content (0-100) */
  duplicatePercentage: number

  /** Whether duplicate content exceeds 50% threshold */
  isDuplicate: boolean

  /** Array of duplicate blocks found */
  duplicateBlocks: DuplicateBlock[]

  /** Total words in analyzed content */
  totalWords: number

  /** Total words that are duplicates */
  totalDuplicateWords: number
}
```

**Validation Rules**:

- `duplicatePercentage` must be 0-100
- `exceedsThreshold` = true if `duplicatePercentage > 50` (per clarification)
- `isDuplicate` = `exceedsThreshold`
- `positions` array length must equal `occurrences`
- `occurrences` must be >= 2 (otherwise not a duplicate)
- `wordCount` must be >= 50 (minimum block size per research)
- `totalDuplicateWords` = sum of all `duplicateBlock.wordCount * (duplicateBlock.occurrences - 1)`

---

## API Request/Response Types

### Analyze SEO Endpoint

```typescript
// POST /api/analyze-seo
type AnalyzeSEORequest = {
  /** URL to analyze */
  url: string
}

type AnalyzeSEOResponse = AnalyzeSEOSuccessResponse | AnalyzeSEOErrorResponse

type AnalyzeSEOSuccessResponse = {
  success: true
  data: SEOAnalysisResult
}

type AnalyzeSEOErrorResponse = {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: string
  }
}

type ErrorCode =
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'TIMEOUT'
  | 'RENDER_FAILED'
  | 'SANITIZATION_FAILED'
  | 'ANALYSIS_FAILED'
  | 'UNKNOWN_ERROR'
```

**Validation Rules**:

- `url` must pass existing URL validator
- `error.message` must be user-friendly (non-technical language per NFR-003)
- `error.details` contains technical details for debugging (logged, not shown to user)

---

## Analyzer Module Types

### Image Analyzer

```typescript
type ImageAnalyzerInput = {
  /** Sanitized HTML content */
  html: string
}

type ImageAnalyzerOutput = ImageAnalysis
```

### Meta Tag Analyzer

```typescript
type MetaTagAnalyzerInput = {
  /** Sanitized HTML content */
  html: string
}

type MetaTagAnalyzerOutput = MetaTagAnalysis
```

### Robots Analyzer

```typescript
type RobotsAnalyzerInput = {
  /** Sanitized HTML content */
  html: string
}

type RobotsAnalyzerOutput = RobotsAnalysis
```

### Content Analyzer

```typescript
type ContentAnalyzerInput = {
  /** Sanitized HTML content */
  html: string
}

type ContentAnalyzerOutput = ContentAnalysis
```

### Duplicate Content Analyzer

```typescript
type DuplicateContentAnalyzerInput = {
  /** Sanitized HTML content */
  html: string
}

type DuplicateContentAnalyzerOutput = DuplicateContentAnalysis
```

---

## Logging Types

```typescript
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

type LogContext = {
  /** Operation being performed */
  operation: string

  /** URL being analyzed (if applicable) */
  url?: string

  /** Request ID for correlation */
  requestId?: string

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

type AnalysisLogEntry = {
  level: LogLevel
  timestamp: string
  message: string
  context: LogContext
  duration?: number // milliseconds
  error?: Error
}
```

---

## State Transitions

### SEOAnalysisResult Lifecycle

```
[URL Submitted]
    → [Fetching HTML]
    → [Rendering JavaScript]
    → [Sanitizing HTML]
    → [Running Analyzers]
        → Image Analysis
        → Meta Tag Analysis
        → Robots Analysis
        → Content Analysis
        → Duplicate Content Analysis
    → [Aggregating Findings]
    → [Analysis Complete]
```

### Finding Severity Mapping

| Severity   | Color  | Icon | Use Case                                 |
| ---------- | ------ | ---- | ---------------------------------------- |
| `critical` | Red    | ❌   | Missing title, noindex when unintended   |
| `warning`  | Yellow | ⚠️   | Suboptimal meta length, missing alt text |
| `info`     | Blue   | ℹ️   | Recommendations, best practices          |
| `success`  | Green  | ✅   | Proper implementation, passed checks     |

---

## Type Organization

All types should be organized in the following files:

- `types/seo/index.ts` - Core SEO analysis types (SEOAnalysisResult, SEOFinding, etc.)
- `types/seo/analyzers.ts` - Analyzer-specific types (ImageAnalysis, MetaTagAnalysis, etc.)
- `types/seo/api.ts` - API request/response types
- `types/logger/index.ts` - Logging types

---

## Next Steps

These types will be:

1. Implemented in the `types/` directory
2. Used by analyzer modules in `lib/seo/analyzers/`
3. Validated in API routes in `app/api/analyze-seo/`
4. Consumed by React components in `components/seo/`
