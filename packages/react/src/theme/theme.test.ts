import { describe, expect, it } from 'vitest'
import { defaultTheme, extendTheme, getToken, mergeTheme, type DeepPartial, type Theme } from './index'

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
    ;((theme.space as Array<unknown>)[1] as { nested: boolean }).nested = false
    ;(theme.space as unknown[]).push('new')
    theme.components.Button = { baseStyle: { color: 'red' } }

    expect(defaultTheme.colors.gray[500]).toBe('#718096')
    expect(defaultTheme.colors.purple[500]).toBe('#805ad5')
    expect(defaultTheme.space).toEqual({ 0: '0rem', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem' })
    expect(override).toEqual({ colors: { purple: { 500: 'custom' } }, space: ['zero', { nested: true }] })
  })

  it('isolates nested objects inside replacement arrays from caller input', () => {
    const override = { space: [{ nested: { value: true } }] }
    const theme = extendTheme(override)

    ;((theme.space as Array<{ nested: { value: boolean } }>)[0].nested.value) = false

    expect(override.space[0].nested.value).toBe(true)
  })

  it('ignores reserved keys in JSON-derived root and nested overrides', () => {
    const override = JSON.parse(
      '{"__proto__":{"polluted":"root"},"constructor":{"polluted":"root"},"prototype":{"polluted":"root"},"colors":{"__proto__":{"polluted":"nested"},"constructor":{"polluted":"nested"},"prototype":{"polluted":"nested"},"blue":{"500":"custom"}}}',
    ) as DeepPartial<Theme>
    const theme = extendTheme(override)

    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(theme, '__proto__')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(theme.colors, 'constructor')).toBe(false)
    expect(Object.prototype.hasOwnProperty.call(theme.colors, 'prototype')).toBe(false)
    expect(theme.colors.blue[500]).toBe('custom')
  })

  it('ignores reserved keys in component defaultProps without changing prototypes', () => {
    const override = JSON.parse(
      '{"__proto__":{"polluted":"root"},"components":{"Button":{"defaultProps":{"__proto__":{"polluted":"component"},"prototype":"bad","constructor":{"polluted":"bad"},"mx":4}}}}',
    ) as DeepPartial<Theme>
    const theme = extendTheme(override)
    const defaults = theme.components.Button.defaultProps as Record<string, unknown>

    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.getPrototypeOf(theme)).toBe(Object.prototype)
    expect(Object.getPrototypeOf(defaults)).toBe(Object.prototype)
    expect(Object.keys(defaults)).toEqual(['mx'])
    expect(defaults.mx).toBe(4)
  })

  it('preserves custom values as atomic references', () => {
    class CustomValue {
      value = 'custom'
    }
    const date = new Date('2026-01-01T00:00:00.000Z')
    const map = new Map([['key', 'value']])
    const instance = new CustomValue()
    const theme = extendTheme({ custom: { date, map, instance } } as DeepPartial<Theme>)

    expect((theme.custom as Record<string, unknown>).date).toBe(date)
    expect((theme.custom as Record<string, unknown>).map).toBe(map)
    expect((theme.custom as Record<string, unknown>).instance).toBe(instance)
  })

  it('does not resolve inherited object properties as tokens', () => {
    expect(getToken(defaultTheme, 'colors', 'toString')).toBe('toString')
    expect(getToken(defaultTheme, 'colors', 'constructor')).toBe('constructor')
    expect(getToken(defaultTheme, 'colors', 'white.0')).toBe('white.0')
  })

  it('supports custom breakpoints and component configs', () => {
    const theme = extendTheme({
      breakpoints: { tablet: '40em' },
      components: { Button: { baseStyle: { color: 'red' }, defaultProps: { recipeSize: 'sm' } } },
    })
    expect(theme.breakpoints.tablet).toBe('40em')
    expect(theme.components.Button?.defaultProps?.recipeSize).toBe('sm')
  })

  it('merges a nested theme over its parent without dropping outer branches', () => {
    const parent = extendTheme({ colors: { brand: { 500: '#abc' } }, components: { Card: { variants: { soft: { color: 'red' } } } } })
    const child = mergeTheme(parent, { colors: { brand: { 600: '#def' } }, components: { Card: { baseStyle: { p: 2 } } } })
    expect(child.colors.brand).toEqual({ 500: '#abc', 600: '#def' })
    expect(child.components.Card).toEqual({ baseStyle: { p: 2 }, variants: { soft: { color: 'red' } } })
    expect(parent.components.Card).toEqual({ variants: { soft: { color: 'red' } } })
  })
})
