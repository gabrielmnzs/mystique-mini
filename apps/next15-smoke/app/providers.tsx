'use client';

import type { ReactNode } from 'react';

import { createSystem } from 'mystique-mini-react';
import { MystiqueNextProvider } from 'mystique-mini-react/next';
import { defaultConfig } from 'mystique-mini-react/preset';

import { fixtureConfig } from '../src/system-config';

const appRouterSystem = createSystem(defaultConfig, fixtureConfig);

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MystiqueNextProvider value={appRouterSystem}>
      {children}
    </MystiqueNextProvider>
  );
}
