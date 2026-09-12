'use client'

import type { ReactNode } from 'react'
import { createSystem } from '@gabrielmnzs/mystique-react'
import { MystiqueNextProvider } from '@gabrielmnzs/mystique-react/next'
import { defaultConfig } from '@gabrielmnzs/mystique-react/preset'
import { fixtureConfig } from '../src/system-config'

const appRouterSystem = createSystem(defaultConfig, fixtureConfig)

export function AppProviders({ children }: { children: ReactNode }) {
  return <MystiqueNextProvider value={appRouterSystem}>{children}</MystiqueNextProvider>
}
