import type { ReactNode } from 'react';

import { MystiqueProvider } from 'mystique-mini-react';

import { docsSystem } from '../system';

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps) {
  return <MystiqueProvider value={docsSystem}>{children}</MystiqueProvider>;
}
