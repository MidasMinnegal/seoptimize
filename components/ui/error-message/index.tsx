/**
 * Error Message Component
 * Feature: 003-seo-url-input
 */

import React from 'react'

export interface ErrorMessageProps {
  message: string
  details?: string
}

export function ErrorMessage({ message, details }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert" aria-live="assertive">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <p className="error-text">{message}</p>
        {details && <p className="error-details">{details}</p>}
      </div>
      <style jsx>{`
        .error-message {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background-color: #fee;
          border: 1px solid #fcc;
          border-radius: 0.5rem;
          color: #c33;
        }

        .error-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .error-content {
          flex: 1;
        }

        .error-text {
          margin: 0;
          font-weight: 500;
        }

        .error-details {
          margin: 0.5rem 0 0;
          font-size: 0.875rem;
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}
