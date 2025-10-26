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

// ============================================================================
// SEO Analysis Types (Feature: 001-input-field-fetches)
// ============================================================================

/**
 * SEO Finding Severity Levels
 */
export type SEOFindingSeverity = 'critical' | 'warning' | 'info' | 'success'

/**
 * SEO Finding Categories
 */
export type SEOFindingCategory =
  | 'images'
  | 'meta-tags'
  | 'robots'
  | 'content'
  | 'duplicate-content'
  | 'headers'
  | 'links'

/**
 * Core SEO Finding structure
 */
export interface SEOFinding {
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

/**
 * Complete SEO Analysis Result
 */
export interface SEOAnalysisResult {
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

/**
 * Union type for category-specific finding details
 */
export type SEOFindingDetails =
  | ImageFindingDetails
  | MetaTagFindingDetails
  | RobotsFindingDetails
  | ContentFindingDetails
  | DuplicateContentFindingDetails
  | HeaderFindingDetails
  | LinkFindingDetails

// ============================================================================
// Image Analysis Types
// ============================================================================

export interface ImageInfo {
  /** Image source URL */
  src: string

  /** Alt text value (empty string if present but empty, null if missing) */
  alt: string | null

  /** Image position in document (0-indexed) */
  position: number
}

export interface ImageFindingDetails {
  /** Total number of images found on page */
  totalImages: number

  /** Images missing alt attribute */
  missingAlt: ImageInfo[]

  /** Images with empty alt text (alt="") */
  emptyAlt: ImageInfo[]

  /** Images with proper alt text (for success findings) */
  withAlt?: ImageInfo[]
}

export interface ImageAnalysisResult {
  totalImages: number
  imagesWithAlt: number
  imagesMissingAlt: number
  imagesWithEmptyAlt: number
  images: ImageInfo[]
}

// ============================================================================
// Meta Tag Analysis Types
// ============================================================================

export interface MetaTag {
  /** Meta tag name or property */
  name: string

  /** Meta tag content */
  content: string

  /** Character length of content */
  length: number
}

export interface TitleTag {
  /** Title text content */
  content: string

  /** Character length */
  length: number

  /** Whether length is optimal (50-60 chars) */
  isOptimalLength: boolean
}

export interface MetaTagFindingDetails {
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

export interface MetaTagAnalysisResult {
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

// ============================================================================
// Robots Analysis Types
// ============================================================================

export type RobotsDirective =
  | 'index'
  | 'noindex'
  | 'follow'
  | 'nofollow'
  | 'none'
  | 'noarchive'
  | 'nosnippet'
  | 'noimageindex'
  | 'nocache'

export interface RobotsFindingDetails {
  /** Detected robots directives */
  directives: RobotsDirective[]

  /** Whether crawling is blocked */
  crawlingBlocked: boolean

  /** Whether indexing is blocked */
  indexingBlocked: boolean

  /** Raw robots meta tag content */
  rawContent?: string
}

export interface RobotsAnalysisResult {
  /** Parsed directives from robots meta tag */
  directives: RobotsDirective[]

  /** Whether robots meta tag exists */
  hasRobotsTag: boolean

  /** Whether crawling is allowed */
  crawlingAllowed: boolean

  /** Whether indexing is allowed */
  indexingAllowed: boolean
}

// ============================================================================
// Header Analysis Types (for H1, H2, etc.)
// ============================================================================

export interface HeadingInfo {
  /** Heading level (1-6) */
  level: number

  /** Heading text content */
  text: string

  /** Position in document (0-indexed) */
  position: number
}

export interface HeadingStructure {
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

export interface HeaderFindingDetails {
  /** Heading structure summary */
  headings: {
    h1Count: number
    h2Count: number
    h3Count: number
    totalHeadings: number
    hasProperH1: boolean // Exactly one H1
  }
}

export interface HeaderAnalysisResult {
  /** Detailed heading structure */
  headings: HeadingStructure

  /** Whether page has exactly one H1 */
  hasProperH1: boolean

  /** Whether heading hierarchy is proper */
  hasProperHierarchy: boolean
}

// ============================================================================
// Link Analysis Types
// ============================================================================

export interface LinkInfo {
  /** Link href */
  href: string

  /** Link text content */
  text: string

  /** Whether link has rel="nofollow" */
  isNofollow: boolean

  /** Whether link is internal (same domain) */
  isInternal: boolean

  /** Position in document (0-indexed) */
  position: number
}

export interface LinkFindingDetails {
  /** Total links found */
  totalLinks: number

  /** Internal links */
  internalLinks: number

  /** External links */
  externalLinks: number

  /** Nofollow links */
  nofollowLinks: number
}

export interface LinkAnalysisResult {
  /** Total links found */
  totalLinks: number

  /** Internal links */
  internalLinks: number

  /** External links */
  externalLinks: number

  /** Nofollow links */
  nofollowLinks: number

  /** Detailed link information */
  links: LinkInfo[]
}

// ============================================================================
// Content Analysis Types
// ============================================================================

export interface ContentFindingDetails {
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
    hasProperH1: boolean
  }

  /** Content-to-HTML ratio (percentage) */
  contentRatio?: number
}

export interface ContentAnalysisResult {
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

// ============================================================================
// Duplicate Content Analysis Types
// ============================================================================

export interface DuplicateBlock {
  /** The duplicated text content */
  text: string

  /** Word positions where this block appears */
  positions: number[]

  /** Number of times this block appears */
  occurrences: number

  /** Length of the duplicate block in words */
  wordCount: number
}

export interface DuplicateContentFindingDetails {
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

export interface DuplicateContentAnalysisResult {
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

// ============================================================================
// API Types for SEO Analysis
// ============================================================================

export interface AnalyzeSEORequest {
  /** URL to analyze */
  url: string
}

export type ErrorCode =
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'TIMEOUT'
  | 'RENDER_FAILED'
  | 'SANITIZATION_FAILED'
  | 'ANALYSIS_FAILED'
  | 'UNKNOWN_ERROR'

export interface AnalyzeSEOErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: string
  }
}

export interface AnalyzeSEOSuccessResponse {
  success: true
  data: SEOAnalysisResult
}

export type AnalyzeSEOResponse = AnalyzeSEOSuccessResponse | AnalyzeSEOErrorResponse
