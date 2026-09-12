import { describe, expect, it } from 'vitest'
import { defineConfig } from './config'
import { defaultBaseConfig } from './preset-base'
import { defaultSystem } from './preset'
import { createSystem } from './system'

describe('createSystem', () => {
  it('composes tokens, responsive conditions, utilities, selectors, and important values', () => {
    expect(defaultSystem.css({
      mt: { base: '40px', md: '20px' },
      padding: ['10px', '20px'],
      _hover: { color: 'red.500!' },
      '& h1': { py: [3, 4] },
    })).toEqual({
      marginTop: '40px',
      padding: '10px',
      '&:is(:hover, [data-hover]):not(:disabled, [data-disabled])': {
        color: 'var(--mystique-colors-red-500) !important',
      },
      '& h1': {
        paddingTop: 'var(--mystique-spacing-3)',
        paddingBottom: 'var(--mystique-spacing-3)',
        '@media screen and (min-width: 30rem)': {
          paddingTop: 'var(--mystique-spacing-4)',
          paddingBottom: 'var(--mystique-spacing-4)',
        },
      },
      '@media screen and (min-width: 30rem)': { padding: '20px' },
      '@media screen and (min-width: 48rem)': { marginTop: '20px' },
    })
  })

  it('emits stable prefixed variables, semantic conditions, layers, and preflight', () => {
    const output = defaultSystem.getGlobalCss()

    expect(output).toContain('@layer reset, base, tokens, recipes;')
    expect(output).toContain('--mystique-colors-red-500:#ef4444;')
    expect(output).toContain('--mystique-colors-fg:var(--mystique-colors-gray-900);')
    expect(output).toContain('[data-theme=dark]')
    expect(output).toContain('--mystique-colors-fg:var(--mystique-colors-gray-50);')
    expect(output).toContain('box-sizing:border-box;')
    expect(defaultSystem.token('colors.red.500')).toBe('var(--mystique-colors-red-500)')
  })

  it('supports injected config and custom CSS variable prefix/root', () => {
    const system = createSystem(defaultBaseConfig, defineConfig({
      cssVarsPrefix: 'acme',
      cssVarsRoot: ':where(.acme-theme)',
      preflight: false,
      theme: {
        breakpoints: { md: '48rem' },
        tokens: { colors: { brand: { value: '#123456' } } },
        semanticTokens: {
          colors: { action: { value: { base: '{colors.brand}', md: '#654321' } } },
        },
      },
    }))

    expect(system.css({ color: 'action', '--surface': 'colors.brand' })).toEqual({
      color: 'var(--acme-colors-action)',
      '--surface': 'var(--acme-colors-brand)',
    })
    expect(system.getGlobalCss()).toContain(':where(.acme-theme)')
    expect(system.getGlobalCss()).toContain('@media screen and (min-width: 48rem)')
    expect(system.getGlobalCss()).not.toContain('box-sizing:border-box')
  })

  it('emits responsive semantic variables in canonical breakpoint order', () => {
    const system = createSystem(defaultBaseConfig, defineConfig({
      conditions: { md: '&[data-colliding-custom-condition]' },
      theme: {
        breakpoints: { lg: '64rem', sm: '30rem', md: '48rem' },
        semanticTokens: {
          colors: {
            surface: {
              value: {
                lg: '#444444',
                sm: '#222222',
                base: '#111111',
                md: '#333333',
              },
            },
          },
        },
      },
    }))

    const output = system.getTokenCss()
    const baseIndex = output.indexOf('--mystique-colors-surface:#111111;')
    const smIndex = output.indexOf('@media screen and (min-width: 30rem)')
    const mdIndex = output.indexOf('@media screen and (min-width: 48rem)')
    const lgIndex = output.indexOf('@media screen and (min-width: 64rem)')

    expect(baseIndex).toBeGreaterThan(-1)
    expect(smIndex).toBeGreaterThan(baseIndex)
    expect(mdIndex).toBeGreaterThan(smIndex)
    expect(lgIndex).toBeGreaterThan(mdIndex)
  })

  it('resolves cva and sva recipes with defaults, compounds, and slots', () => {
    const recipe = defaultSystem.cva({
      base: { display: 'flex' },
      variants: {
        tone: { quiet: { color: 'muted' }, loud: { color: 'accent' } },
        raised: { true: { shadow: 'sm' }, false: { shadow: 'none' } },
      },
      defaultVariants: { tone: 'quiet', raised: false },
      compoundVariants: [{ tone: 'loud', raised: true, css: { fontWeight: 'bold' } }],
    })
    const slots = defaultSystem.sva({
      slots: ['root', 'label'],
      base: { root: { display: 'flex' }, label: { color: 'fg' } },
      variants: { tone: { loud: { label: { color: 'accent' } } } },
      defaultVariants: { tone: 'loud' },
    })

    expect(recipe()).toMatchObject({
      '@layer recipes': {
        display: 'flex',
        color: 'var(--mystique-colors-muted)',
        boxShadow: 'none',
      },
    })
    expect(recipe({ tone: 'loud', raised: true })).toMatchObject({
      '@layer recipes': {
        color: 'var(--mystique-colors-accent)',
        boxShadow: 'var(--mystique-shadows-sm)',
        fontWeight: 'var(--mystique-font-weights-bold)',
      },
    })
    expect(slots()).toEqual({
      root: { '@layer recipes': { display: 'flex' } },
      label: {
        '@layer recipes': { color: 'var(--mystique-colors-accent)' },
      },
    })
  })

  it('splits only known style props and exposes recipe queries', () => {
    const [style, element] = defaultSystem.splitCssProps({
      color: 'fg',
      _hover: { color: 'accent' },
      id: 'content',
      onClick: () => undefined,
    })

    expect(style).toEqual({ color: 'fg', _hover: { color: 'accent' } })
    expect(element).toMatchObject({ id: 'content' })
    expect(defaultSystem.isRecipe('text')).toBe(true)
    expect(defaultSystem.getRecipeFn('text')?.className).toBe('mystique-text')
    expect(defaultSystem.hasRecipe('text')).toBe(true)

    const withSlot = createSystem(defaultBaseConfig, defineConfig({
      theme: {
        slotRecipes: {
          field: { slots: ['root'], base: { root: { display: 'flex' } } },
        },
      },
    }))
    expect(withSlot.isRecipe('field')).toBe(false)
    expect(withSlot.isSlotRecipe('field')).toBe(true)
    expect(withSlot.hasRecipe('field')).toBe(true)
  })
})
