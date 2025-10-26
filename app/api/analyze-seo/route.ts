/**
 * API Route: SEO Analysis
 * Feature: 001-input-field-fetches
 * Endpoint: POST /api/analyze-seo
 *
 * Performs comprehensive SEO analysis on a given URL.
 */

import { NextRequest, NextResponse } from 'next/server'

import { createLogger } from '@/lib/logger'
import { analyzeHeaders } from '@/lib/seo/analyzers/header-analyzer'
import { analyzeImages } from '@/lib/seo/analyzers/image-analyzer'
import { analyzeLinks } from '@/lib/seo/analyzers/link-analyzer'
import { analyzeMetaTags } from '@/lib/seo/analyzers/meta-tag-analyzer'
import { renderPage } from '@/lib/seo/browser/renderer'
import { sanitizeHTML } from '@/lib/seo/sanitizer'
import { validateURL } from '@/lib/seo/url-validator'
import type {
  AnalyzeSEORequest,
  AnalyzeSEOResponse,
  HeaderFindingDetails,
  ImageFindingDetails,
  LinkFindingDetails,
  MetaTagFindingDetails,
  SEOAnalysisResult,
  SEOFinding,
} from '@/types/seo'

// Route configuration for Next.js App Router
export const maxDuration = 30 // 30 seconds max execution time
export const dynamic = 'force-dynamic' // Don't cache

const logger = createLogger().child({ operation: 'analyze-seo' })

/**
 * Convert image analysis results to SEO findings
 */
function createImageFindings(analysis: ReturnType<typeof analyzeImages>): SEOFinding[] {
  const findings: SEOFinding[] = []

  // Finding: Images missing alt text
  if (analysis.imagesMissingAlt > 0) {
    const missingAlt = analysis.images.filter(img => img.alt === null)

    findings.push({
      id: `img-missing-alt-${Date.now()}`,
      category: 'images',
      severity: 'warning',
      title: 'Missing Alt Text on Images',
      description: `${analysis.imagesMissingAlt} image${analysis.imagesMissingAlt === 1 ? ' is' : 's are'} missing alt text attributes, which hurts accessibility and SEO.`,
      impact:
        'Search engines cannot understand image content, and screen readers cannot describe images to visually impaired users.',
      recommendation:
        'Add descriptive alt text to all images. Alt text should describe the image content and context.',
      count: analysis.imagesMissingAlt,
      details: {
        totalImages: analysis.totalImages,
        missingAlt,
        emptyAlt: [],
      } as ImageFindingDetails,
    })
  }

  // Finding: Images with empty alt text
  if (analysis.imagesWithEmptyAlt > 0) {
    const emptyAlt = analysis.images.filter(img => img.alt === '')

    findings.push({
      id: `img-empty-alt-${Date.now()}`,
      category: 'images',
      severity: 'info',
      title: 'Images with Empty Alt Text',
      description: `${analysis.imagesWithEmptyAlt} image${analysis.imagesWithEmptyAlt === 1 ? ' has' : 's have'} empty alt text (alt="").`,
      impact:
        'Empty alt text is valid for decorative images but should be used intentionally. Screen readers will skip these images.',
      recommendation:
        'Verify that images with empty alt text are truly decorative. Add descriptive alt text for meaningful images.',
      count: analysis.imagesWithEmptyAlt,
      details: {
        totalImages: analysis.totalImages,
        missingAlt: [],
        emptyAlt,
      } as ImageFindingDetails,
    })
  }

  // Finding: Success - All images have alt text
  if (
    analysis.totalImages > 0 &&
    analysis.imagesMissingAlt === 0 &&
    analysis.imagesWithEmptyAlt === 0
  ) {
    findings.push({
      id: `img-success-${Date.now()}`,
      category: 'images',
      severity: 'success',
      title: 'All Images Have Alt Text',
      description: `All ${analysis.totalImages} image${analysis.totalImages === 1 ? '' : 's'} on the page have descriptive alt text.`,
      impact: 'Images are accessible and can be properly indexed by search engines.',
      recommendation: 'Continue ensuring all new images include descriptive alt text.',
      count: analysis.totalImages,
      details: {
        totalImages: analysis.totalImages,
        missingAlt: [],
        emptyAlt: [],
        withAlt: analysis.images.filter(img => img.alt && img.alt.length > 0),
      } as ImageFindingDetails,
    })
  }

  return findings
}

/**
 * Convert meta tag analysis results to SEO findings
 */
function createMetaTagFindings(analysis: ReturnType<typeof analyzeMetaTags>): SEOFinding[] {
  const findings: SEOFinding[] = []

  // Finding: Missing title tag
  if (!analysis.title) {
    findings.push({
      id: `meta-missing-title-${Date.now()}`,
      category: 'meta-tags',
      severity: 'critical',
      title: 'Missing Title Tag',
      description: 'The page is missing a title tag.',
      impact:
        'Title tags are crucial for SEO and appear as the clickable headline in search results. Missing titles severely hurt rankings.',
      recommendation:
        'Add a descriptive title tag between 50-60 characters that accurately describes the page content.',
      details: {
        missing: ['title'],
      } as MetaTagFindingDetails,
    })
  } else if (analysis.title.length < 30 || analysis.title.length > 60) {
    // Finding: Suboptimal title length
    findings.push({
      id: `meta-title-length-${Date.now()}`,
      category: 'meta-tags',
      severity: 'warning',
      title: 'Title Tag Length Not Optimal',
      description: `Title tag is ${analysis.title.length} characters. Optimal length is 50-60 characters.`,
      impact:
        analysis.title.length < 30
          ? 'Short titles may not effectively convey page content and can hurt click-through rates.'
          : 'Long titles may be truncated in search results, reducing their effectiveness.',
      recommendation:
        analysis.title.length < 30
          ? 'Expand the title to better describe the page content while staying under 60 characters.'
          : 'Shorten the title to 50-60 characters to avoid truncation in search results.',
      details: {
        title: analysis.title,
      } as MetaTagFindingDetails,
    })
  } else {
    // Finding: Success - Good title
    findings.push({
      id: `meta-title-success-${Date.now()}`,
      category: 'meta-tags',
      severity: 'success',
      title: 'Title Tag Is Optimal',
      description: `Title tag is ${analysis.title.length} characters, within the optimal range.`,
      impact: 'The title will display well in search results and effectively convey page content.',
      recommendation: 'Continue using descriptive, optimally-sized title tags.',
      details: {
        title: analysis.title,
      } as MetaTagFindingDetails,
    })
  }

  // Finding: Missing meta description
  if (!analysis.description) {
    findings.push({
      id: `meta-missing-description-${Date.now()}`,
      category: 'meta-tags',
      severity: 'critical',
      title: 'Missing Meta Description',
      description: 'The page is missing a meta description tag.',
      impact:
        'Search engines may display auto-generated, less relevant snippets in search results, reducing click-through rates.',
      recommendation:
        'Add a compelling meta description between 150-160 characters that accurately summarizes the page content.',
      details: {
        missing: ['description'],
      } as MetaTagFindingDetails,
    })
  } else if (analysis.description.length < 120 || analysis.description.length > 160) {
    // Finding: Suboptimal description length
    findings.push({
      id: `meta-description-length-${Date.now()}`,
      category: 'meta-tags',
      severity: 'warning',
      title: 'Meta Description Length Not Optimal',
      description: `Meta description is ${analysis.description.length} characters. Optimal length is 150-160 characters.`,
      impact:
        analysis.description.length < 120
          ? 'Short descriptions may not effectively describe page content.'
          : 'Long descriptions may be truncated in search results.',
      recommendation:
        analysis.description.length < 120
          ? 'Expand the description to better summarize the page content.'
          : 'Shorten the description to 150-160 characters to avoid truncation.',
      details: {
        description: analysis.description,
      } as MetaTagFindingDetails,
    })
  } else {
    // Finding: Success - Good description
    findings.push({
      id: `meta-description-success-${Date.now()}`,
      category: 'meta-tags',
      severity: 'success',
      title: 'Meta Description Is Optimal',
      description: `Meta description is ${analysis.description.length} characters, within the optimal range.`,
      impact:
        'The description will display well in search results and improve click-through rates.',
      recommendation: 'Continue using compelling, optimally-sized meta descriptions.',
      details: {
        description: analysis.description,
      } as MetaTagFindingDetails,
    })
  }

  // Finding: Duplicate meta tags
  if (analysis.duplicateTags.length > 0) {
    findings.push({
      id: `meta-duplicates-${Date.now()}`,
      category: 'meta-tags',
      severity: 'warning',
      title: 'Duplicate Meta Tags Detected',
      description: `Found duplicate meta tags: ${analysis.duplicateTags.join(', ')}`,
      impact:
        'Duplicate meta tags can confuse search engines and may cause unpredictable behavior.',
      recommendation: 'Remove duplicate meta tags, keeping only one instance of each.',
      count: analysis.duplicateTags.length,
      details: {
        duplicates: analysis.duplicateTags,
      } as MetaTagFindingDetails,
    })
  }

  // Finding: Open Graph tags (optional but recommended for social sharing)
  const hasOpenGraph = analysis.openGraph && analysis.openGraph.length > 0
  const hasOgTitle =
    hasOpenGraph && analysis.openGraph?.some(tag => tag.name.toLowerCase() === 'og:title')
  const hasOgDescription =
    hasOpenGraph && analysis.openGraph?.some(tag => tag.name.toLowerCase() === 'og:description')
  const hasOgImage =
    hasOpenGraph && analysis.openGraph?.some(tag => tag.name.toLowerCase() === 'og:image')

  if (!hasOpenGraph) {
    findings.push({
      id: `meta-no-opengraph-${Date.now()}`,
      category: 'meta-tags',
      severity: 'info',
      title: 'No Open Graph Tags Found',
      description: 'The page does not have Open Graph meta tags for social media sharing.',
      impact:
        'Without Open Graph tags, social media platforms may not display optimal previews when your page is shared.',
      recommendation:
        'Add Open Graph tags (og:title, og:description, og:image) to improve social media appearance.',
      details: {
        missing: ['og:title', 'og:description', 'og:image'],
      } as MetaTagFindingDetails,
    })
  } else {
    // Check for missing essential OG tags
    const missingOgTags: string[] = []
    if (!hasOgTitle) missingOgTags.push('og:title')
    if (!hasOgDescription) missingOgTags.push('og:description')
    if (!hasOgImage) missingOgTags.push('og:image')

    if (missingOgTags.length > 0) {
      findings.push({
        id: `meta-incomplete-opengraph-${Date.now()}`,
        category: 'meta-tags',
        severity: 'info',
        title: 'Incomplete Open Graph Tags',
        description: `Found Open Graph tags, but missing: ${missingOgTags.join(', ')}`,
        impact: 'Incomplete Open Graph tags may result in suboptimal social media previews.',
        recommendation: `Add the missing Open Graph tags: ${missingOgTags.join(', ')}`,
        count: missingOgTags.length,
        details: {
          missing: missingOgTags,
          openGraph: analysis.openGraph,
        } as MetaTagFindingDetails,
      })
    } else {
      findings.push({
        id: `meta-opengraph-success-${Date.now()}`,
        category: 'meta-tags',
        severity: 'success',
        title: 'Complete Open Graph Tags',
        description: 'The page has all essential Open Graph tags for social media sharing.',
        impact:
          'Social media platforms will display rich, engaging previews when your page is shared.',
        recommendation: 'Continue maintaining Open Graph tags for all important pages.',
        count: analysis.openGraph?.length ?? 0,
        details: {
          openGraph: analysis.openGraph,
        } as MetaTagFindingDetails,
      })
    }
  }

  // Finding: Twitter Card tags (optional but recommended for Twitter)
  const hasTwitterCard = analysis.twitterCard && analysis.twitterCard.length > 0
  const hasTwitterCardType =
    hasTwitterCard && analysis.twitterCard?.some(tag => tag.name.toLowerCase() === 'twitter:card')

  if (!hasTwitterCard) {
    findings.push({
      id: `meta-no-twitter-${Date.now()}`,
      category: 'meta-tags',
      severity: 'info',
      title: 'No Twitter Card Tags Found',
      description: 'The page does not have Twitter Card meta tags for enhanced Twitter sharing.',
      impact:
        'Twitter will fall back to Open Graph tags or generic previews, which may not be optimal.',
      recommendation:
        'Add Twitter Card tags (twitter:card, twitter:title, twitter:image) for better Twitter appearance.',
      details: {
        missing: ['twitter:card', 'twitter:title', 'twitter:image'],
      } as MetaTagFindingDetails,
    })
  } else if (!hasTwitterCardType) {
    findings.push({
      id: `meta-missing-twitter-card-type-${Date.now()}`,
      category: 'meta-tags',
      severity: 'info',
      title: 'Missing Twitter Card Type',
      description: 'Found Twitter Card tags but missing the required twitter:card type.',
      impact: 'Twitter may not recognize the card type and fall back to default rendering.',
      recommendation: 'Add twitter:card meta tag with value "summary" or "summary_large_image".',
      details: {
        missing: ['twitter:card'],
        twitterCard: analysis.twitterCard,
      } as MetaTagFindingDetails,
    })
  } else {
    findings.push({
      id: `meta-twitter-success-${Date.now()}`,
      category: 'meta-tags',
      severity: 'success',
      title: 'Twitter Card Tags Present',
      description: 'The page has Twitter Card tags configured.',
      impact: 'Twitter will display enhanced previews when your page is shared.',
      recommendation: 'Continue maintaining Twitter Card tags for consistent Twitter appearance.',
      count: analysis.twitterCard?.length ?? 0,
      details: {
        twitterCard: analysis.twitterCard,
      } as MetaTagFindingDetails,
    })
  }

  return findings
}

/**
 * Convert header analysis results to SEO findings
 */
function createHeaderFindings(analysis: ReturnType<typeof analyzeHeaders>): SEOFinding[] {
  const findings: SEOFinding[] = []

  const h1Count = analysis.headings.h1.length
  const h2Count = analysis.headings.h2.length
  const h3Count = analysis.headings.h3.length
  const totalHeadings =
    h1Count +
    h2Count +
    h3Count +
    analysis.headings.h4.length +
    analysis.headings.h5.length +
    analysis.headings.h6.length

  // Finding: Missing H1 or multiple H1s
  if (h1Count === 0) {
    findings.push({
      id: `header-missing-h1-${Date.now()}`,
      category: 'headers',
      severity: 'critical',
      title: 'Missing H1 Tag',
      description: 'The page is missing an H1 tag.',
      impact:
        'H1 tags are crucial for SEO and accessibility. They tell search engines and users what the page is about.',
      recommendation: 'Add exactly one H1 tag that describes the main topic of the page.',
      details: {
        headings: {
          h1Count,
          h2Count,
          h3Count,
          totalHeadings,
          hasProperH1: false,
        },
      } as HeaderFindingDetails,
    })
  } else if (h1Count > 1) {
    findings.push({
      id: `header-multiple-h1-${Date.now()}`,
      category: 'headers',
      severity: 'warning',
      title: 'Multiple H1 Tags',
      description: `Found ${h1Count} H1 tags on the page. Best practice is to use exactly one H1.`,
      impact:
        'Multiple H1 tags can dilute the page focus and confuse search engines about the main topic.',
      recommendation:
        'Use only one H1 tag for the main page heading, and use H2-H6 for subheadings.',
      count: h1Count,
      details: {
        headings: {
          h1Count,
          h2Count,
          h3Count,
          totalHeadings,
          hasProperH1: false,
        },
      } as HeaderFindingDetails,
    })
  } else {
    // Finding: Success - Proper H1
    findings.push({
      id: `header-h1-success-${Date.now()}`,
      category: 'headers',
      severity: 'success',
      title: 'Proper H1 Structure',
      description: 'The page has exactly one H1 tag, following best practices.',
      impact: 'Clear heading hierarchy helps search engines and users understand page structure.',
      recommendation:
        'Continue using a single H1 tag and maintain proper heading hierarchy (H1 > H2 > H3).',
      details: {
        headings: {
          h1Count,
          h2Count,
          h3Count,
          totalHeadings,
          hasProperH1: true,
        },
      } as HeaderFindingDetails,
    })
  }

  // Finding: No subheadings
  if (h1Count === 1 && h2Count === 0 && totalHeadings === 1) {
    findings.push({
      id: `header-no-subheadings-${Date.now()}`,
      category: 'headers',
      severity: 'info',
      title: 'No Subheadings Detected',
      description: 'The page has only an H1 tag with no subheadings (H2, H3, etc.).',
      impact:
        'Subheadings improve content structure and readability, helping both users and search engines.',
      recommendation:
        'Consider adding H2 and H3 tags to break up content and improve document structure.',
      details: {
        headings: {
          h1Count,
          h2Count,
          h3Count,
          totalHeadings,
          hasProperH1: true,
        },
      } as HeaderFindingDetails,
    })
  }

  return findings
}

/**
 * Convert link analysis results to SEO findings
 */
function createLinkFindings(analysis: ReturnType<typeof analyzeLinks>): SEOFinding[] {
  const findings: SEOFinding[] = []

  // Finding: No links
  if (analysis.totalLinks === 0) {
    findings.push({
      id: `link-no-links-${Date.now()}`,
      category: 'links',
      severity: 'warning',
      title: 'No Links Detected',
      description: 'The page has no links.',
      impact:
        'Links help search engines discover and understand site structure. Pages with no links may appear isolated.',
      recommendation: 'Add relevant internal and external links to improve navigation and SEO.',
      details: {
        totalLinks: 0,
        internalLinks: 0,
        externalLinks: 0,
        nofollowLinks: 0,
      } as LinkFindingDetails,
    })
  } else {
    // Finding: Link summary (always show if there are links)
    findings.push({
      id: `link-summary-${Date.now()}`,
      category: 'links',
      severity: 'info',
      title: 'Link Structure',
      description: `Found ${analysis.totalLinks} link${analysis.totalLinks === 1 ? '' : 's'}: ${analysis.internalLinks} internal, ${analysis.externalLinks} external.`,
      impact:
        'Proper link structure helps search engines crawl your site and understand content relationships.',
      recommendation:
        'Maintain a healthy balance of internal and external links. Use descriptive anchor text.',
      count: analysis.totalLinks,
      details: {
        totalLinks: analysis.totalLinks,
        internalLinks: analysis.internalLinks,
        externalLinks: analysis.externalLinks,
        nofollowLinks: analysis.nofollowLinks,
      } as LinkFindingDetails,
    })

    // Finding: No internal links
    if (analysis.internalLinks === 0 && analysis.totalLinks > 0) {
      findings.push({
        id: `link-no-internal-${Date.now()}`,
        category: 'links',
        severity: 'warning',
        title: 'No Internal Links',
        description: 'The page has no internal links.',
        impact:
          'Internal links help search engines discover other pages on your site and distribute page authority.',
        recommendation: 'Add relevant internal links to other pages on your website.',
        details: {
          totalLinks: analysis.totalLinks,
          internalLinks: 0,
          externalLinks: analysis.externalLinks,
          nofollowLinks: analysis.nofollowLinks,
        } as LinkFindingDetails,
      })
    }

    // Finding: High percentage of nofollow links
    if (analysis.nofollowLinks > 0) {
      const nofollowPercentage = (analysis.nofollowLinks / analysis.totalLinks) * 100

      if (nofollowPercentage > 50) {
        findings.push({
          id: `link-high-nofollow-${Date.now()}`,
          category: 'links',
          severity: 'info',
          title: 'High Percentage of Nofollow Links',
          description: `${analysis.nofollowLinks} out of ${analysis.totalLinks} links (${nofollowPercentage.toFixed(1)}%) have rel="nofollow".`,
          impact:
            'Nofollow links tell search engines not to pass authority. Excessive use may limit SEO benefits.',
          recommendation:
            'Review nofollow links and ensure they are intentional (e.g., for user-generated content or paid links).',
          count: analysis.nofollowLinks,
          details: {
            totalLinks: analysis.totalLinks,
            internalLinks: analysis.internalLinks,
            externalLinks: analysis.externalLinks,
            nofollowLinks: analysis.nofollowLinks,
          } as LinkFindingDetails,
        })
      }
    }
  }

  return findings
}

/**
 * POST handler for SEO analysis
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeSEOResponse>> {
  const startTime = Date.now()

  try {
    // Parse request body
    let body: AnalyzeSEORequest
    try {
      body = (await request.json()) as AnalyzeSEORequest
    } catch (error) {
      logger.warn('Invalid JSON in request body', {
        operation: 'parse-request',
        metadata: { error },
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Invalid request format. Please provide a valid JSON body with a URL.',
            details: 'JSON parsing failed',
          },
        },
        { status: 400 }
      )
    }

    // Validate URL is provided
    if (!body.url || typeof body.url !== 'string') {
      logger.warn('Missing URL in request', {
        operation: 'validate-input',
        metadata: { body },
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'URL is required. Please provide a valid URL to analyze.',
            details: 'URL field missing or invalid',
          },
        },
        { status: 400 }
      )
    }

    const { url } = body

    logger.info('SEO analysis started', {
      operation: 'analyze-seo-start',
      url,
    })

    // Validate URL
    const validationResult = validateURL(url)
    if (!validationResult.valid) {
      logger.warn('URL validation failed', {
        operation: 'validate-url',
        url,
        metadata: { error: validationResult.error },
      })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'The URL you provided is not valid. Please check the URL and try again.',
            details: `URL validation failed: ${validationResult.error.message}`,
          },
        },
        { status: 400 }
      )
    }

    const { normalizedUrl } = validationResult

    // Render page using headless browser
    let html: string
    try {
      logger.info('Rendering page', {
        operation: 'render-page',
        url: normalizedUrl,
      })
      html = await renderPage(normalizedUrl)
      logger.info('Page rendered successfully', {
        operation: 'render-page',
        url: normalizedUrl,
        metadata: { htmlLength: html.length },
      })
    } catch (error) {
      logger.error('Page rendering failed', {
        operation: 'render-page',
        url: normalizedUrl,
        metadata: { error },
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RENDER_FAILED',
            message: 'We encountered an error while rendering the page. Please try again.',
            details: error instanceof Error ? error.message : 'Unknown rendering error',
          },
        },
        { status: 500 }
      )
    }

    // Sanitize HTML
    let sanitizedHtml: string
    try {
      logger.info('Sanitizing HTML', {
        operation: 'sanitize-html',
        url: normalizedUrl,
      })
      sanitizedHtml = sanitizeHTML(html)
      logger.info('HTML sanitized successfully', {
        operation: 'sanitize-html',
        url: normalizedUrl,
        metadata: { sanitizedLength: sanitizedHtml.length },
      })
    } catch (error) {
      logger.error('HTML sanitization failed', {
        operation: 'sanitize-html',
        url: normalizedUrl,
        metadata: { error },
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SANITIZATION_FAILED',
            message: 'An error occurred while processing the page content. Please try again.',
            details: error instanceof Error ? error.message : 'Unknown sanitization error',
          },
        },
        { status: 500 }
      )
    }

    // Run all analyzers
    let findings: SEOFinding[] = []
    try {
      logger.info('Running SEO analyzers', {
        operation: 'run-analyzers',
        url: normalizedUrl,
      })

      // Run all analyzers
      const imageAnalysis = analyzeImages(sanitizedHtml)
      const metaTagAnalysis = analyzeMetaTags(sanitizedHtml)
      const headerAnalysis = analyzeHeaders(sanitizedHtml)
      const linkAnalysis = analyzeLinks(sanitizedHtml, normalizedUrl)

      // Convert analysis results to findings
      const imageFindings = createImageFindings(imageAnalysis)
      const metaTagFindings = createMetaTagFindings(metaTagAnalysis)
      const headerFindings = createHeaderFindings(headerAnalysis)
      const linkFindings = createLinkFindings(linkAnalysis)

      // Combine all findings
      findings = [...imageFindings, ...metaTagFindings, ...headerFindings, ...linkFindings]

      logger.info('SEO analysis completed', {
        operation: 'run-analyzers',
        url: normalizedUrl,
        metadata: { findingsCount: findings.length },
      })
    } catch (error) {
      logger.error('SEO analysis failed', {
        operation: 'run-analyzers',
        url: normalizedUrl,
        metadata: { error },
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ANALYSIS_FAILED',
            message: 'An error occurred while analyzing the page. Please try again.',
            details: error instanceof Error ? error.message : 'Unknown analysis error',
          },
        },
        { status: 500 }
      )
    }

    // Calculate execution time
    const executionTimeMs = Date.now() - startTime

    // Create successful response
    const result: SEOAnalysisResult = {
      url: normalizedUrl,
      analyzedAt: new Date().toISOString(),
      executionTimeMs,
      findings,
    }

    logger.info('SEO analysis request completed', {
      operation: 'analyze-seo-complete',
      url: normalizedUrl,
      metadata: {
        executionTimeMs,
        findingsCount: findings.length,
      },
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    const executionTimeMs = Date.now() - startTime

    logger.error('Unexpected error in SEO analysis', {
      operation: 'analyze-seo-error',
      metadata: {
        error,
        executionTimeMs,
      },
    })

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred. Please try again.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
