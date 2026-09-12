import type { EmotionCache } from '@emotion/cache'
import type { AppProps } from 'next/app'
import { MystiqueProvider, createSystem } from '@gabrielmnzs/mystique-react'
import { defaultConfig } from '@gabrielmnzs/mystique-react/preset'
import { createMystiqueCache } from '../src/emotion-cache'
import { fixtureConfig } from '../src/system-config'

export interface FixtureAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const browserCache = createMystiqueCache()
const pagesRouterSystem = createSystem(defaultConfig, fixtureConfig)

export default function FixtureApp({
  Component,
  emotionCache = browserCache,
  pageProps,
}: FixtureAppProps) {
  return (
    <MystiqueProvider cache={emotionCache} value={pagesRouterSystem}>
      <Component {...pageProps} />
    </MystiqueProvider>
  )
}
