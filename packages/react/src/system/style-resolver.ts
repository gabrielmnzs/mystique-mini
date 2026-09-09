import { getToken, type Theme } from '../theme'
import { aliases, isStyleProp, stylePropConfig } from './style-config'
import { pseudoEntries } from './pseudos'
import { resolveResponsive } from './responsive'
import type { CSSValue, MystiqueStyleProps, StyleProps } from './types'

const token = (theme: Theme, scale: string | undefined, value: CSSValue): CSSValue => {
  if (!scale) return value
  const resolved = getToken(theme, scale, value)
  return resolved !== null && typeof resolved === 'object' ? value : resolved as CSSValue
}

const lookupToken = (theme: Theme, scale: string, value: CSSValue): { found: boolean; value: unknown } => {
  const source = theme[scale]
  if (source === undefined || source === null) return { found: false, value }
  let current: unknown = source
  for (const segment of String(value).split('.')) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(Object(current), segment)) return { found: false, value }
    current = (current as Record<string, unknown>)[segment]
  }
  return { found: current !== undefined, value: current }
}

function resolveOne(prop: string, value: CSSValue, theme: Theme): CSSValue {
  const config = stylePropConfig[prop] ?? (aliases[prop] ? { property: aliases[prop][0], scale: 'space' } : undefined)
  if (prop === 'w' || prop === 'h' || prop === 'minW' || prop === 'maxW' || prop === 'minH' || prop === 'maxH' || prop === 'boxSize') {
    const sized = lookupToken(theme, 'sizes', value)
    return (sized.found ? sized.value : getToken(theme, 'space', value)) as CSSValue
  }
  return token(theme, config?.scale, value)
}

export function resolveStyles(props: StyleProps | MystiqueStyleProps, theme: Theme): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [prop, value] of Object.entries(props)) {
    if (!isStyleProp(prop) || value === undefined) continue
    const targets = aliases[prop] ?? (prop === 'boxSize' ? aliases.boxSize : [stylePropConfig[prop].property])
    const resolved = resolveResponsive(value as Parameters<typeof resolveResponsive<CSSValue>>[0], theme, (item) => resolveOne(prop, item, theme))
    for (const target of targets) {
      for (const [key, item] of Object.entries(resolved)) {
        if (key === 'base') result[target] = item
        else result[key] = { ...(result[key] as Record<string, unknown> | undefined), [target]: item }
      }
    }
  }
  Object.assign(result, pseudoEntries(props as MystiqueStyleProps, theme, resolveStyles))
  const mediaKeys = Object.values(theme.breakpoints).map((width) => `@media screen and (min-width: ${width})`)
  const ordered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(result)) if (!mediaKeys.includes(key)) ordered[key] = value
  for (const key of mediaKeys) if (key in result) ordered[key] = result[key]
  return ordered
}
