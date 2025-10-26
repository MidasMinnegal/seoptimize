/**
 * SEO Analysis Results Page
 * Feature: 001-input-field-fetches
 *
 * Displays SEO analysis results from /api/analyze-seo
 */

'use client'

import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { AnalyzeSEOResponse, SEOAnalysisResult, SEOFinding } from '@/types/seo'

type AnalysisState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: SEOAnalysisResult }
  | { status: 'error'; error: string }

function ResultsContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
  })

  useEffect(() => {
    if (!url) {
      setAnalysisState({
        status: 'error',
        error: 'No URL provided. Please go back and enter a URL to analyze.',
      })
      return
    }

    // Fetch analysis results
    const fetchAnalysis = async () => {
      setAnalysisState({ status: 'loading' })

      try {
        const response = await fetch('/api/analyze-seo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          const text = await response.text()
          throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`)
        }

        const result: AnalyzeSEOResponse = await response.json()

        if (result.success) {
          setAnalysisState({ status: 'success', data: result.data })
        } else {
          setAnalysisState({
            status: 'error',
            error: result.error.message,
          })
        }
      } catch (err) {
        setAnalysisState({
          status: 'error',
          error:
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred while analyzing the URL.',
        })
      }
    }

    fetchAnalysis()
  }, [url])

  // Loading state
  if (analysisState.status === 'loading') {
    return (
      <div className="container">
        <LoadingSpinner label="Analyzing URL..." />
        <style jsx>{`
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 2rem;
          }
        `}</style>
      </div>
    )
  }

  // Error state
  if (analysisState.status === 'error') {
    return (
      <div className="container">
        <div className="error-card">
          <h1 className="error-title">Analysis Failed</h1>
          <p className="error-message">{analysisState.error}</p>
          <a href="/" className="back-link">
            Try Another URL
          </a>
        </div>
        <style jsx>{`
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            padding: 2rem;
          }

          .error-card {
            max-width: 600px;
            padding: 2rem;
            background: #fff;
            border: 2px solid #ef4444;
            border-radius: 8px;
            text-align: center;
          }

          .error-title {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
            font-weight: 700;
            color: #ef4444;
          }

          .error-message {
            margin: 0 0 1.5rem 0;
            font-size: 1rem;
            color: #374151;
            line-height: 1.6;
          }

          .back-link {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #0070f3;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.2s;
          }

          .back-link:hover {
            background: #0051cc;
          }
        `}</style>
      </div>
    )
  }

  // Success state
  if (analysisState.status === 'success') {
    const { data } = analysisState

    // Group findings by category
    const findingsByCategory: Record<string, SEOFinding[]> = {}
    data.findings.forEach(finding => {
      if (!findingsByCategory[finding.category]) {
        findingsByCategory[finding.category] = []
      }
      findingsByCategory[finding.category].push(finding)
    })

    // Category display names
    const categoryNames: Record<string, string> = {
      images: 'Images',
      'meta-tags': 'Meta Tags',
      headers: 'Headers',
      links: 'Links',
      robots: 'Robots',
      content: 'Content',
      'duplicate-content': 'Duplicate Content',
    }

    return (
      <div className="container">
        <div className="results-header">
          <h1 className="page-title">SEO Analysis Results</h1>
          <div className="metadata">
            <div className="metadata-item">
              <span className="label">URL:</span>
              <span className="value">{data.url}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Analyzed:</span>
              <span className="value">{new Date(data.analyzedAt).toLocaleString()}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Total Findings:</span>
              <span className="value">{data.findings.length}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Execution Time:</span>
              <span className="value">{data.executionTimeMs}ms</span>
            </div>
          </div>
        </div>

        <div className="findings-container">
          {Object.keys(findingsByCategory).length === 0 && (
            <div className="no-findings">
              <p>No findings detected. Your page looks good!</p>
            </div>
          )}

          {Object.entries(findingsByCategory).map(([category, findings]) => (
            <CategorySection
              key={category}
              categoryName={categoryNames[category] || category}
              findings={findings}
            />
          ))}
        </div>

        <div className="actions">
          <a href="/" className="back-link">
            Analyze Another URL
          </a>
        </div>

        <style jsx>{`
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .results-header {
            margin-bottom: 2rem;
          }

          .page-title {
            margin: 0 0 1.5rem 0;
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
          }

          .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            padding: 1.5rem;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }

          .metadata-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          }

          .value {
            font-size: 1rem;
            color: #111827;
            word-break: break-all;
          }

          .findings-container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .no-findings {
            padding: 3rem;
            text-align: center;
            background: #f0fdf4;
            border: 2px solid #86efac;
            border-radius: 8px;
            font-size: 1.125rem;
            color: #166534;
          }

          .no-findings p {
            margin: 0;
          }

          .actions {
            display: flex;
            justify-content: center;
            padding: 2rem 0;
            border-top: 1px solid #e5e7eb;
          }

          .back-link {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #0070f3;
            color: #fff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background 0.2s;
          }

          .back-link:hover {
            background: #0051cc;
          }
        `}</style>
      </div>
    )
  }

  // Idle state (should not be reached in normal flow)
  return null
}

// Helper component to render a collapsible category section
function CategorySection({
  categoryName,
  findings,
}: {
  categoryName: string
  findings: SEOFinding[]
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Get severity counts for the badge
  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const warningCount = findings.filter(f => f.severity === 'warning').length
  const infoCount = findings.filter(f => f.severity === 'info').length
  const successCount = findings.filter(f => f.severity === 'success').length

  return (
    <section className="category-section">
      <button
        className="category-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h2 className="category-title">
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          {categoryName}
          <span className="findings-badge">{findings.length}</span>
        </h2>
        <div className="severity-counts">
          {criticalCount > 0 && <span className="count critical">{criticalCount} Critical</span>}
          {warningCount > 0 && <span className="count warning">{warningCount} Warning</span>}
          {infoCount > 0 && <span className="count info">{infoCount} Info</span>}
          {successCount > 0 && <span className="count success">{successCount} Success</span>}
        </div>
      </button>

      {isExpanded && (
        <div className="findings-list">
          {findings.map(finding => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}

      <style jsx>{`
        .category-section {
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-header {
          width: 100%;
          padding: 1.5rem;
          background: #f9fafb;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }

        .category-header:hover {
          background: #f3f4f6;
        }

        .category-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .expand-icon {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .findings-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.5rem;
          height: 1.5rem;
          padding: 0 0.5rem;
          background: #3b82f6;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 9999px;
        }

        .severity-counts {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .count {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .count.critical {
          background: #fef2f2;
          color: #991b1b;
        }

        .count.warning {
          background: #fefce8;
          color: #854d0e;
        }

        .count.info {
          background: #eff6ff;
          color: #1e40af;
        }

        .count.success {
          background: #f0fdf4;
          color: #166534;
        }

        .findings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          background: #fff;
        }
      `}</style>
    </section>
  )
}

// Helper component to render individual finding cards
function FindingCard({ finding }: { finding: SEOFinding }) {
  const severityColors = {
    critical: {
      bg: '#fef2f2',
      border: '#ef4444',
      text: '#991b1b',
    },
    warning: {
      bg: '#fefce8',
      border: '#eab308',
      text: '#854d0e',
    },
    info: {
      bg: '#eff6ff',
      border: '#3b82f6',
      text: '#1e40af',
    },
    success: {
      bg: '#f0fdf4',
      border: '#22c55e',
      text: '#166534',
    },
  }

  const colors = severityColors[finding.severity]

  return (
    <div className="finding-card">
      <div className="finding-header">
        <h3 className="finding-title">{finding.title}</h3>
        <span className="severity-badge">{finding.severity.toUpperCase()}</span>
      </div>
      {finding.count !== undefined && <p className="finding-count">Count: {finding.count}</p>}
      <p className="finding-description">{finding.description}</p>
      <div className="finding-impact">
        <strong>Impact:</strong> {finding.impact}
      </div>
      <div className="finding-recommendation">
        <strong>Recommendation:</strong> {finding.recommendation}
      </div>

      <style jsx>{`
        .finding-card {
          padding: 1.5rem;
          background: ${colors.bg};
          border: 2px solid ${colors.border};
          border-radius: 8px;
        }

        .finding-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .finding-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: ${colors.text};
          flex: 1;
        }

        .severity-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          background: ${colors.border};
          color: #fff;
          border-radius: 4px;
          white-space: nowrap;
        }

        .finding-count {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          font-weight: 600;
          color: ${colors.text};
          opacity: 0.8;
        }

        .finding-description {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          line-height: 1.6;
          color: #374151;
        }

        .finding-impact,
        .finding-recommendation {
          margin: 0.5rem 0;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #4b5563;
        }

        .finding-impact strong,
        .finding-recommendation strong {
          color: ${colors.text};
        }
      `}</style>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading..." />}>
      <ResultsContent />
    </Suspense>
  )
}
