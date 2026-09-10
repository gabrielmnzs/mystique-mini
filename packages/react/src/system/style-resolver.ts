import { getToken, type Theme } from '../theme'
import { lookupToken as lookupTokenValue } from '../theme/token-lookup'
import { aliases, isStyleProp, stylePropConfig } from './style-config'
import { pseudoEntries } from './pseudos'
import { resolveResponsive } from './responsive'
import type { CSSValue, MystiqueStyleProps, StyleProps } from './types'

const isScalar = (value: unknown): value is CSSValue => typeof value === 'string' || typeof value === 'number'

const token = (theme: Theme, scale: string | undefined, value: CSSValue): CSSValue => {
  if (!scale) return value
  const resolved = getToken(theme, scale, value)
  return isScalar(resolved) ? resolved : value
}

const lookupToken = (theme: Theme, scale: string, value: CSSValue): { found: boolean; value: unknown } => {
  return lookupTokenValue(theme[scale], value)
}

function resolveOne(prop: string, value: CSSValue, theme: Theme): CSSValue {
  const config = stylePropConfig[prop as keyof typeof stylePropConfig] ?? (aliases[prop as keyof typeof aliases] ? { property: aliases[prop as keyof typeof aliases][0], scale: 'space' } : undefined)
  if (prop === 'w' || prop === 'h' || prop === 'minW' || prop === 'maxW' || prop === 'minH' || prop === 'maxH' || prop === 'boxSize') {
    const sized = lookupToken(theme, 'sizes', value)
    return sized.found && isScalar(sized.value) ? sized.value : token(theme, 'space', value)
  }
  return token(theme, config?.scale, value)
}

export function resolveStyles(props: StyleProps | MystiqueStyleProps, theme: Theme): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [prop, value] of Object.entries(props)) {
    if (!isStyleProp(prop) || value === undefined) continue
    const targets = aliases[prop as keyof typeof aliases] ?? (prop === 'boxSize' ? aliases.boxSize : [stylePropConfig[prop as keyof typeof stylePropConfig].property])
    const resolved = resolveResponsive(value as Parameters<typeof resolveResponsive<CSSValue>>[0], theme, (item) => resolveOne(prop, item, theme))
    for (const target of targets) {
      for (const [key, item] of Object.entries(resolved)) {
        if (key === 'base') result[target] = item
        else result[key] = { ...(result[key] as Record<string, unknown> | undefined), [target]: item }
      }
    }
  }
  Object.assign(result, pseudoEntries(props as MystiqueStyleProps, theme, resolveStyles))
  const mediaKeys = new Set(Object.values(theme.breakpoints).map((width) => `@media screen and (min-width: ${width})`))
  const ordered: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(result)) if (!mediaKeys.has(key)) ordered[key] = value
  for (const key of mediaKeys) if (key in result) ordered[key] = result[key]
  return ordered
}
