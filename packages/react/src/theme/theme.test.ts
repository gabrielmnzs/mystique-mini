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

  it('supports custom breakpoints and component configs', () => {
    const theme = extendTheme({
      breakpoints: { tablet: '40em' },
      components: { Button: { baseStyle: { color: 'red' }, defaultProps: { size: 'sm' } } },
    })
    expect(theme.breakpoints.tablet).toBe('40em')
    expect(theme.components.Button?.defaultProps?.size).toBe('sm')
  })
})
