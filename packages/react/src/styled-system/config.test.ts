import { describe, expect, it } from 'vitest'
import { defineConfig, defineGlobalStyles } from './config'

defineGlobalStyles({
  body: {
    color: 'black',
    // @ts-expect-error global selector declarations reject misspelled properties
    colro: 'red',
  },
})

defineGlobalStyles({
  body: {
    '& a': {
      // @ts-expect-error nested selectors use the same strict property validation
      colro: 'red',
    },
  },
})

describe('defineConfig', () => {
  it('returns the exact configuration object unchanged', () => {
    const config = {
      cssVarsPrefix: 'mystique',
      theme: { tokens: { colors: { accent: { value: '#b44' } } } },
    } as const

    const result = defineConfig(config)

    expect(result).toBe(config)
    expect(result.cssVarsPrefix).toBe('mystique')
  })

  it('keeps global selectors and supported at-rules unchanged', () => {
    const styles = {
      body: {
        color: 'black',
        '& a': { color: 'blue', _hover: { color: 'red' } },
        '@media (min-width: 48rem)': { display: 'grid' },
      },
      '@font-face': {
        fontDisplay: 'swap',
        fontFamily: 'Mystique Fixture',
        src: 'url(/fixture.woff2) format("woff2")',
      },
      '@keyframes mystique-fade': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      '@media (prefers-contrast: more)': {
        body: { color: 'black', '& strong': { fontWeight: 700 } },
      },
    } as const

    expect(defineGlobalStyles(styles)).toBe(styles)
  })
})
