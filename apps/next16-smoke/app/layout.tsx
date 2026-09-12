import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppProviders } from './providers'

export const metadata: Metadata = {
  title: 'Mystique Next 16 smoke',
  description: 'Persistent App Router and Pages Router consumer fixture.',
  other: { 'mystique-smoke': 'next16' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-fixture="next16-smoke">
      <body data-smoke="app-router-shell">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
