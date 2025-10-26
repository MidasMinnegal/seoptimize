'use client'

import { Button } from '@components/ui/button'
import React from 'react'

export default function HomePage() {
  const handleClick = () => {
    // Demo button handler - in production, this would perform an action
  }

  return (
    <div className="home-page">
      <section className="hero">
        <h2>Welcome to SEOptimize</h2>
        <p>
          A Next.js application built with TypeScript, demonstrating minimal code style and best
          practices.
        </p>
      </section>

      <section className="features">
        <h3>Features</h3>
        <ul>
          <li>TypeScript strict mode for maximum type safety</li>
          <li>Minimal code style with ESLint and Prettier</li>
          <li>Automated pre-commit hooks for code quality</li>
          <li>Path aliases for clean imports</li>
        </ul>
      </section>

      <section className="demo">
        <h3>Component Demo</h3>
        <div className="button-group">
          <Button variant="primary" size="large" onClick={handleClick}>
            Primary Button
          </Button>
          <Button variant="secondary" size="medium" onClick={handleClick}>
            Secondary Button
          </Button>
          <Button variant="outline" size="small" onClick={handleClick}>
            Outline Button
          </Button>
          <Button variant="primary" disabled>
            Disabled Button
          </Button>
        </div>
      </section>
    </div>
  )
}
