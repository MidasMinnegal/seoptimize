'use client'

import { useRouter } from 'next/navigation'
import React from 'react'

import { URLInputForm } from '@/components/seo/url-input-form'
import type { FetchedHTML, FetchError } from '@/types/seo'

export default function HomePage() {
  const router = useRouter()

  const handleFetchComplete = (data: FetchedHTML) => {
    // Redirect to results page with the URL as a query parameter
    const encodedUrl = encodeURIComponent(data.finalUrl)
    router.push(`/results?url=${encodedUrl}`)
  }

  const handleFetchError = (error: FetchError) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch URL:', error.message)
    }
    // Error is already shown in the URLInputForm component
  }

  return (
    <div className="home-page">
      <section className="hero">
        <h1 className="hero-title">Analyze Your Website for SEO</h1>
        <p className="hero-description">
          Enter your website URL below to fetch and analyze its content for SEO optimization
          opportunities.
        </p>
      </section>

      <section className="url-input-section">
        <URLInputForm onFetchComplete={handleFetchComplete} onFetchError={handleFetchError} />
      </section>

      <style jsx>{`
        .home-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111;
          margin: 0 0 1rem;
        }

        .hero-description {
          font-size: 1.125rem;
          color: #666;
          margin: 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .url-input-section {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  )
}
