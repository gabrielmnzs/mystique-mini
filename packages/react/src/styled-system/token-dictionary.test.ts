import { describe, expect, it } from 'vitest'
import { createTokenDictionary, flattenTokens } from './token-dictionary'

describe('token dictionary', () => {
  const options = {
    prefix: 'mystique',
    tokens: {
      spacing: { 2: { value: '0.5rem' }, 1: { value: '0.25rem' } },
      colors: {
        paper: { value: '#fff' },
        ink: { value: '#111' },
        border: { value: 'color-mix(in srgb, {colors.ink} 20%, transparent)' },
      },
    },
    semanticTokens: {
      colors: {
        fg: { value: { base: '{colors.ink}', _dark: '{colors.paper}' } },
        focus: { value: '{colors.border}' },
      },
    },
  } as const

  it('flattens names and conditions deterministically', () => {
    const flattened = flattenTokens(options)

    expect(flattened.map((token) => `${token.name}:${token.condition ?? 'token'}`)).toEqual([
      'colors.border:token',
      'colors.fg:base',
      'colors.fg:_dark',
      'colors.focus:base',
      'colors.ink:token',
      'colors.paper:token',
      'spacing.1:token',
      'spacing.2:token',
    ])
    expect(flattened.find((token) => token.name === 'spacing.2')?.value).toBe('0.5rem')
  })

  it('rejects token leaves that omit the required value wrapper', () => {
    expect(() => flattenTokens({
      tokens: { colors: { invalid: '#fff' } } as unknown as NonNullable<Parameters<typeof flattenTokens>[0]['tokens']>,
    })).toThrow(/token leaves must use \{ value \}/)
    expect(() => flattenTokens({
      semanticTokens: { colors: { invalid: '#fff' } } as unknown as NonNullable<Parameters<typeof flattenTokens>[0]['semanticTokens']>,
    })).toThrow(/token leaves must use \{ value \}/)
  })

  it('resolves token references to prefixed CSS variable references', () => {
    const dictionary = createTokenDictionary(options)

    expect(dictionary.prefix).toBe('mystique')
    expect(dictionary.formatTokenName(['colors', 'ink'])).toBe('colors.ink')
    expect(dictionary.formatCssVar('colors.ink')).toEqual({
      var: '--mystique-colors-ink',
      ref: 'var(--mystique-colors-ink)',
    })
    expect(dictionary.getVar('colors.ink')).toBe('var(--mystique-colors-ink)')
    expect(dictionary.getVar('colors.missing', 'black')).toBe('black')
    expect(dictionary.expandReferenceInValue('1px solid {colors.fg}')).toBe('1px solid var(--mystique-colors-fg)')
    expect(dictionary.expandReferenceInValue('{colors.missing}')).toBe('{colors.missing}')
    expect(dictionary.getByName('colors.border')?.value).toBe(
      'color-mix(in srgb, var(--mystique-colors-ink) 20%, transparent)',
    )
  })

  it('exposes base and conditional semantic CSS variables', () => {
    const dictionary = createTokenDictionary(options)

    expect(dictionary.all).toBe(dictionary.allTokens)
    expect(dictionary.cssVars).toBe(dictionary.cssVarMap)
    expect(dictionary.cssVars.get('base')?.get('--mystique-colors-fg')).toBe('var(--mystique-colors-ink)')
    expect(dictionary.cssVars.get('base')?.get('--mystique-colors-focus')).toBe('var(--mystique-colors-border)')
    expect(dictionary.cssVars.get('base')?.get('--mystique-spacing-2')).toBe('0.5rem')
    expect(dictionary.cssVars.get('_dark')).toEqual(new Map([
      ['--mystique-colors-fg', 'var(--mystique-colors-paper)'],
    ]))
    expect(dictionary.getByName('colors.fg')?.extensions.condition).toBe('base')
    expect(dictionary.getCategoryValues('colors')).toMatchObject({
      border: 'var(--mystique-colors-border)',
      fg: 'var(--mystique-colors-fg)',
      ink: 'var(--mystique-colors-ink)',
    })
  })

  it('registers breakpoints in both canonical token categories', () => {
    const dictionary = createTokenDictionary({
      cssVarsPrefix: 'custom',
      breakpoints: { md: '48rem', sm: '30rem' },
    })

    expect(dictionary.getByName('breakpoints.sm')?.value).toBe('30rem')
    expect(dictionary.getByName('sizes.breakpoint-md')?.extensions.cssVar.ref).toBe(
      'var(--custom-sizes-breakpoint-md)',
    )
  })
})
