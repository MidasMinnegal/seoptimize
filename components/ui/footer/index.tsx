import Link from 'next/link'
import React from 'react'

export type FooterProps = {
  copyright?: string
  links?: Array<{
    href: string
    label: string
  }>
  className?: string
}

export function Footer({
  copyright = `© ${new Date().getFullYear()} SEOptimize`,
  links = [],
  className = '',
}: FooterProps) {
  return (
    <footer className={`site-footer ${className}`}>
      <p>{copyright}</p>
      {links.length > 0 && (
        <nav>
          <ul>
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </footer>
  )
}
