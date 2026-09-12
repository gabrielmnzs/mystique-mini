import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { AppProviders } from './providers';

export const metadata: Metadata = {
  title: 'Mystique Next 15 smoke',
  description: 'Persistent App Router and Pages Router consumer fixture.',
  other: { 'mystique-smoke': 'next15' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-fixture="next15-smoke">
      <body data-smoke="app-router-shell">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
