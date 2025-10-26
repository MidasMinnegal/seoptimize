import './globals.css'

import { Footer } from '@components/ui/footer'
import { Header } from '@components/ui/header'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'SEOptimize',
  description: 'Next.js TypeScript project with minimal code style',
  keywords: ['SEO', 'optimization', 'Next.js', 'TypeScript'],
  authors: [{ name: 'SEOptimize Team' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header
          title="SEOptimize"
          links={[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About' },
          ]}
        />
        <main>{children}</main>
        <Footer
          links={[
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
          ]}
        />
      </body>
    </html>
  )
}
