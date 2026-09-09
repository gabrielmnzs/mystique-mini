export type Primitive = string | number | boolean | null

export type TokenScale = Record<string | number, unknown> | unknown[]
export type ColorPalette = Record<string, string>
export type SystemStyleObject = {
  [property: string]: Primitive | SystemStyleObject | Array<Primitive | SystemStyleObject> | undefined
}

export interface Colors {
  transparent: string
  current: string
  black: string
  white: string
  gray: ColorPalette
  red: ColorPalette
  blue: ColorPalette
  green: ColorPalette
  purple: ColorPalette
  yellow: ColorPalette
  [key: string]: unknown
}

export interface ComponentThemeConfig {
  baseStyle?: SystemStyleObject
  sizes?: Record<string, SystemStyleObject>
  variants?: Record<string, SystemStyleObject>
  defaultProps?: Record<string, unknown>
}

export interface Theme {
  breakpoints: Record<string, string>
  colors: Colors
  space: TokenScale
  sizes: TokenScale
  fontSizes: TokenScale
  fontWeights: TokenScale
  lineHeights: TokenScale
  letterSpacings: TokenScale
  fonts: TokenScale
  radii: TokenScale
  borders: TokenScale
  shadows: TokenScale
  zIndices: TokenScale
  components: Record<string, ComponentThemeConfig>
  [key: string]: unknown
}

const colors = {
  transparent: 'transparent',
  current: 'currentColor',
  black: '#000000',
  white: '#ffffff',
  gray: { 50: '#f7fafc', 100: '#edf2f7', 200: '#e2e8f0', 300: '#cbd5e0', 400: '#a0aec0', 500: '#718096', 600: '#4a5568', 700: '#2d3748', 800: '#1a202c', 900: '#171923' },
  red: { 50: '#fff5f5', 100: '#fed7d7', 200: '#feb2b2', 300: '#fc8181', 400: '#f56565', 500: '#e53e3e', 600: '#c53030', 700: '#9b2c2c', 800: '#822727', 900: '#63171b' },
  blue: { 50: '#ebf8ff', 100: '#bee3f8', 200: '#90cdf4', 300: '#63b3ed', 400: '#4299e1', 500: '#3182ce', 600: '#2b6cb0', 700: '#2c5282', 800: '#2a4365', 900: '#1a365d' },
  green: { 50: '#f0fff4', 100: '#c6f6d5', 200: '#9ae6b4', 300: '#68d391', 400: '#48bb78', 500: '#38a169', 600: '#2f855a', 700: '#276749', 800: '#22543d', 900: '#1c4532' },
  purple: { 50: '#faf5ff', 100: '#e9d8fd', 200: '#d6bcfa', 300: '#b794f4', 400: '#9f7aea', 500: '#805ad5', 600: '#6b46c1', 700: '#553c9a', 800: '#44337a', 900: '#322659' },
  yellow: { 50: '#fffff0', 100: '#fefcbf', 200: '#faf089', 300: '#f6e05e', 400: '#ecc94b', 500: '#d69e2e', 600: '#b7791f', 700: '#975a16', 800: '#744210', 900: '#5f370e' },
}

export const defaultTheme: Theme = {
  breakpoints: { sm: '30em', md: '48em', lg: '62em', xl: '80em' },
  colors,
  space: { 0: '0rem', 1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem', 5: '1.25rem', 6: '1.5rem', 8: '2rem', 10: '2.5rem', 12: '3rem', 16: '4rem', 20: '5rem', 24: '6rem' },
  sizes: { xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', full: '100%', screen: '100vw' },
  fontSizes: { xs: '0.75rem', sm: '0.875rem', md: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
  fontWeights: { 0: 400, normal: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { normal: 'normal', none: 1, tight: 1.25, snug: 1.375, base: 1.5, relaxed: 1.625, loose: 2 },
  letterSpacings: { tighter: '-0.05em', tight: '-0.025em', normal: '0', wide: '0.025em', wider: '0.05em' },
  fonts: { body: 'system-ui, sans-serif', heading: 'system-ui, sans-serif', mono: 'monospace' },
  radii: { none: '0', sm: '0.125rem', md: '0.25rem', lg: '0.5rem', full: '9999px' },
  borders: { none: '0', '1px': '1px solid' },
  shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  zIndices: { hide: -1, base: 0, dropdown: 1000, modal: 1400, tooltip: 1800 },
  components: {},
}

const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function clone<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => clone(item)) as T
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) {
      if (!RESERVED_KEYS.has(key)) result[key] = clone(item)
    }
    return result as T
  }
  return value
}

function merge<T>(base: T, override: unknown): T {
  if (override === undefined) return clone(base)
  if (!isPlainObject(override)) return clone(override) as T
  const result: Record<string, unknown> = isPlainObject(base) ? clone(base) : {}
  for (const [key, value] of Object.entries(override)) {
    if (RESERVED_KEYS.has(key)) continue
    result[key] = merge(result[key], value)
  }
  return result as T
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

export function extendTheme(override: DeepPartial<Theme> = {}): Theme {
  return merge(defaultTheme, override)
}

export function getToken(theme: Theme, scale: string, value: string | number): unknown {
  const source = theme[scale]
  if (source === undefined || source === null) return value
  const path = String(value).split('.')
  let current: unknown = source
  for (const segment of path) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(Object(current), segment)) return value
    current = (current as Record<string, unknown>)[segment]
  }
  return current === undefined ? value : current
}
