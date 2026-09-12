import createCache, { type EmotionCache } from '@emotion/cache'

export function createMystiqueCache(): EmotionCache {
  const cache = createCache({ key: 'mystique' })
  cache.compat = true
  return cache
}
