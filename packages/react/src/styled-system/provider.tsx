'use client'

import createCache, { type EmotionCache } from '@emotion/cache'
import { CacheProvider, Global } from '@emotion/react'
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { isSystemContext, type SystemContext } from './system'
import { interopDefault } from './interop-default'

export const MYSTIQUE_CACHE_KEY = 'mystique'
const createEmotionCache = interopDefault(createCache)

const MystiqueContext = createContext<SystemContext | undefined>(undefined)
MystiqueContext.displayName = 'MystiqueContext'

export interface MystiqueProviderProps {
  children: ReactNode
  /** Optional so framework registries can provide their capture-enabled cache. */
  cache?: EmotionCache
  value: SystemContext
}

export function MystiqueProvider(props: MystiqueProviderProps) {
  const { cache, children, value } = props
  const [localCache] = useState(() => createEmotionCache({ key: MYSTIQUE_CACHE_KEY }))
  const activeCache = cache ?? localCache

  if (!isSystemContext(value)) {
    throw new Error(
      '[mystique > provider] <MystiqueProvider> requires a Mystique SystemContext in its `value` prop.',
    )
  }
  if (activeCache.key !== MYSTIQUE_CACHE_KEY) {
    throw new Error(
      `[mystique > provider] Emotion cache key must be "${MYSTIQUE_CACHE_KEY}"; received "${activeCache.key}".`,
    )
  }

  return (
    <CacheProvider value={activeCache}>
      <MystiqueContext.Provider value={value}>
        {value._globalCss ? <Global styles={value._globalCss} /> : null}
        {children}
      </MystiqueContext.Provider>
    </CacheProvider>
  )
}

export function useMystiqueContext(): SystemContext {
  const value = useContext(MystiqueContext)
  if (value === undefined) {
    throw new Error(
      '[mystique > context] useMystiqueContext must be used within <MystiqueProvider value={system}>.',
    )
  }
  return value
}
