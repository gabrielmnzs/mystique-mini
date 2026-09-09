import type { Theme } from '../theme'
import type { CSSValue, ResponsiveValue } from './types'

export function resolveResponsive<T>(value: ResponsiveValue<T>, theme: Theme, resolve: (value: T) => CSSValue): Record<string, CSSValue | Record<string, CSSValue>> {
  if (!Array.isArray(value) && (typeof value !== 'object' || value === null)) return { base: resolve(value as T) }
  const result: Record<string, CSSValue | Record<string, CSSValue>> = {}
  const breakpoints = Object.entries(theme.breakpoints)
  const add = (key: string, item: T | null | undefined) => { if (item !== null && item !== undefined) result[key] = resolve(item) }
  if (Array.isArray(value)) {
    add('base', value[0])
    for (const [index, name] of ['sm', 'md', 'lg', 'xl'].entries()) {
      const width = theme.breakpoints[name]
      if (width !== undefined) add(`@media screen and (min-width: ${width})`, value[index + 1])
    }
  } else {
    const objectValue = value as { base?: T; [key: string]: T | null | undefined }
    add('base', objectValue.base)
    for (const [name, width] of breakpoints) add(`@media screen and (min-width: ${width})`, objectValue[name])
  }
  return result
}
