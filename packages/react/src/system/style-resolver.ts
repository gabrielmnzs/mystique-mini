import { getToken, type ComponentThemeConfig, type RecipeStyleObject, type Theme } from '../theme'
import { lookupToken as lookupTokenValue } from '../theme/token-lookup'
import { getStylePropDefinition, isStyleProp } from './style-config'
import { isPseudoName, pseudoEntries } from './pseudos'
import { resolveResponsive } from './responsive'
import type { CSSValue, MystiqueStyleProps, StyleProps } from './types'

export interface ComponentStyleResolutionOptions {
  theme: Theme
  component: ComponentThemeConfig
  factoryBaseStyle?: RecipeStyleObject
  props?: MystiqueStyleProps & Record<string, unknown>
}

export interface ComponentStyleResolution {
  props: MystiqueStyleProps & Record<string, unknown>
  styles: Record<string, unknown>
}

const isScalar = (value: unknown): value is CSSValue => typeof value === 'string' || typeof value === 'number'
const RESERVED_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

const token = (theme: Theme, scale: string | undefined, value: CSSValue): CSSValue => {
  if (!scale) return value
  const resolved = getToken(theme, scale, value)
  return isScalar(resolved) ? resolved : value
}

const lookupToken = (theme: Theme, scale: string, value: CSSValue): { found: boolean; value: unknown } => {
  return lookupTokenValue(theme[scale], value)
}

function resolveOne(prop: string, value: CSSValue, theme: Theme): CSSValue {
  const config = getStylePropDefinition(prop as keyof StyleProps)
  if (prop === 'w' || prop === 'h' || prop === 'minW' || prop === 'maxW' || prop === 'minH' || prop === 'maxH' || prop === 'boxSize') {
    const sized = lookupToken(theme, 'sizes', value)
    return sized.found && isScalar(sized.value) ? sized.value : token(theme, 'space', value)
  }
  return token(theme, config?.scale, value)
}

export function resolveStyles(props: StyleProps | MystiqueStyleProps, theme: Theme): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [prop, value] of Object.entries(props)) {
    if (!isStyleProp(prop) || value === undefined || value === null || typeof value === 'boolean') continue
    const targets = getStylePropDefinition(prop as keyof StyleProps).targets
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

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function mergeResolved(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    if (isPlainObject(target[key]) && isPlainObject(value)) mergeResolved(target[key] as Record<string, unknown>, value)
    else {
      delete target[key]
      Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true })
    }
  }
}

/** Resolves layers independently so aliases and responsive rules cannot leak across layers. */
export function resolveStyleLayers(theme: Theme, ...layers: Array<StyleProps | MystiqueStyleProps | undefined>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const layer of layers) if (layer) mergeResolved(result, resolveStyles(layer, theme))
  return result
}

/** Resolves a component recipe without depending on React or a styling runtime. */
export function resolveComponentStyles(options: ComponentStyleResolutionOptions): ComponentStyleResolution {
  const { theme, component, factoryBaseStyle, props = {} } = options
  const filledProps: Record<string, unknown> = { ...props }
  for (const [name, value] of Object.entries(component.defaultProps ?? {})) {
    if (RESERVED_KEYS.has(name)) continue
    if (filledProps[name] === undefined) filledProps[name] = value
  }

  const recipeSize = typeof filledProps.recipeSize === 'string' ? filledProps.recipeSize : undefined
  const variant = typeof filledProps.variant === 'string' ? filledProps.variant : undefined
  const defaultStyleProps: StyleProps & MystiqueStyleProps = {}
  for (const [name, value] of Object.entries(component.defaultProps ?? {})) {
    if (props[name] === undefined && !RESERVED_KEYS.has(name) && (isStyleProp(name) || isPseudoName(name))) {
      defaultStyleProps[name as keyof MystiqueStyleProps] = value as never
    }
  }
  const layers: Array<StyleProps | MystiqueStyleProps | undefined> = [
    factoryBaseStyle,
    component.baseStyle,
    recipeSize ? component.sizes?.[recipeSize] : undefined,
    variant ? component.variants?.[variant] : undefined,
    defaultStyleProps,
    props as MystiqueStyleProps,
  ]
  return {
    props: filledProps as MystiqueStyleProps & Record<string, unknown>,
    styles: resolveStyleLayers(theme, ...layers),
  }
}
