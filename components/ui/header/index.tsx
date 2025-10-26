import Link from 'next/link'
import React from 'react'

export type HeaderProps = {
  title: string
  links?: Array<{
    href: string
    label: string
  }>
  className?: string
}

export function Header({ title, links = [], className = '' }: HeaderProps) {
  return (
    <header className={`site-header ${className}`}>
      <h1>{title}</h1>
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
    </header>
  )
}
