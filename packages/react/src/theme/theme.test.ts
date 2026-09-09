import { describe, expect, it } from 'vitest'
import { defaultTheme, extendTheme, getToken } from './index'

describe('theme foundation', () => {
  it('resolves tokens, dot paths, raw values, and zero', () => {
    expect(getToken(defaultTheme, 'colors', 'blue.500')).toBe('#3182ce')
    expect(getToken(defaultTheme, 'space', 4)).toBe('1rem')
    expect(getToken(defaultTheme, 'space', 0)).toBe('0rem')
    expect(getToken(defaultTheme, 'colors', 'not-found')).toBe('not-found')
    expect(getToken(defaultTheme, 'fontWeights', 0)).toBe(400)
  })

  it('deep merges objects and replaces arrays', () => {
    const theme = extendTheme({
      colors: { blue: { 500: 'custom', 950: 'new' } },
      space: ['zero', 'one'],
    })
    expect(theme.colors.blue[500]).toBe('custom')
    expect(theme.colors.blue[950]).toBe('new')
    expect(theme.colors.gray[500]).toBeDefined()
    expect(theme.space).toEqual(['zero', 'one'])
  })

  it('does not mutate the default theme or override', () => {
    const override = { colors: { blue: { 500: 'custom' } } }
    const theme = extendTheme(override)
    expect(theme).not.toBe(defaultTheme)
    expect(theme.colors).not.toBe(defaultTheme.colors)
    expect(override.colors.blue[500]).toBe('custom')
    expect(defaultTheme.colors.blue[500]).toBe('#3182ce')
  })

  it('includes purple and yellow color palettes', () => {
    expect(defaultTheme.colors.purple[500]).toBe('#805ad5')
    expect(defaultTheme.colors.yellow[500]).toBe('#d69e2e')
  })

  it('deeply isolates every theme branch from inputs', () => {
    const override = { colors: { purple: { 500: 'custom' } }, space: ['zero', { nested: true }] }
    const theme = extendTheme(override)

    theme.colors.gray[500] = 'changed'
    theme.colors.purple[500] = 'changed'
    ;(theme.space as unknown[])[1] = { nested: false }
    ;(theme.space as unknown[]).push('new')
    theme.components.Button = { baseStyle: { color: 'red' } }

    expect(defaultTheme.colors.gray[500]).toBe('#718096')
    expect(defaultTheme.colors.purple[500]).toBe('#805ad5')
    expect(defaultTheme.space).toEqual({ 0: '0rem', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem' })
    expect(override).toEqual({ colors: { purple: { 500: 'custom' } }, space: ['zero', { nested: true }] })
  })

  it('does not resolve inherited object properties as tokens', () => {
    expect(getToken(defaultTheme, 'colors', 'toString')).toBe('toString')
    expect(getToken(defaultTheme, 'colors', 'constructor')).toBe('constructor')
  })

  it('supports custom breakpoints and component configs', () => {
    const theme = extendTheme({
      breakpoints: { tablet: '40em' },
      components: { Button: { baseStyle: { color: 'red' }, defaultProps: { size: 'sm' } } },
    })
    expect(theme.breakpoints.tablet).toBe('40em')
    expect(theme.components.Button?.defaultProps?.size).toBe('sm')
  })
})
