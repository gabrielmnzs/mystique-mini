import { toKebabCase } from './utils'

export interface Layers {
  readonly names: readonly string[]
  readonly atRule: string
  wrap(name: string, css: string): string
  wrapObject(
    name: string,
    styles: Record<string, unknown>,
  ): Record<string, unknown>
}

export function createLayers(
  names: readonly string[] = ['reset', 'base', 'tokens', 'recipes'],
): Layers {
  const unique = Object.freeze([...new Set(names)])
  return Object.freeze({
    names: unique,
    atRule: unique.length > 0 ? `@layer ${unique.join(', ')};` : '',
    wrap(name: string, css: string) {
      return css && unique.includes(name) ? `@layer ${name}{${css}}` : css
    },
    wrapObject(name: string, styles: Record<string, unknown>) {
      if (Object.keys(styles).length === 0 || !unique.includes(name)) return styles
      return { [`@layer ${name}`]: styles }
    },
  })
}

const unitless = new Set([
  'animation-iteration-count',
  'aspect-ratio',
  'border-image-outset',
  'border-image-slice',
  'border-image-width',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'columns',
  'flex',
  'flex-grow',
  'flex-positive',
  'flex-shrink',
  'flex-negative',
  'flex-order',
  'grid-area',
  'grid-column',
  'grid-column-end',
  'grid-column-span',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-span',
  'grid-row-start',
  'font-weight',
  'line-clamp',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
])

function declaration(property: string, value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  const name = toKebabCase(property)
  const resolved = typeof value === 'number' &&
    value !== 0 &&
    !name.startsWith('--') &&
    !unitless.has(name)
    ? `${value}px`
    : String(value)
  return `${name}:${resolved};`
}

/** Serializes a resolved Emotion-style object into deterministic stylesheet text. */
export function serializeCssRule(
  selector: string,
  style: Record<string, unknown>,
): string {
  let declarations = ''
  let nested = ''
  for (const [property, value] of Object.entries(style)) {
    if (value === null || value === undefined || value === false) continue
    if (typeof value === 'string' || typeof value === 'number') {
      declarations += declaration(property, value)
      continue
    }
    if (typeof value !== 'object' || Array.isArray(value)) continue
    const child = value as Record<string, unknown>
    if (property.startsWith('@')) {
      nested += `${property}{${serializeCssRule(selector, child)}}`
      continue
    }
    const childSelector = property.includes('&')
      ? property.replaceAll('&', selector)
      : `${selector} ${property}`
    nested += serializeCssRule(childSelector, child)
  }
  return `${declarations ? `${selector}{${declarations}}` : ''}${nested}`
}

export function serializeGlobalCss(
  styles: Record<string, Record<string, unknown>>,
): string {
  const serializeAtRuleBody = (style: Record<string, unknown>): string => {
    let declarations = ''
    let nested = ''
    for (const [name, value] of Object.entries(style)) {
      if (value === null || value === undefined || value === false) continue
      if (typeof value === 'string' || typeof value === 'number') {
        declarations += declaration(name, value)
        continue
      }
      if (typeof value !== 'object' || Array.isArray(value)) continue
      const child = value as Record<string, unknown>
      nested += name.startsWith('@')
        ? `${name}{${serializeAtRuleBody(child)}}`
        : serializeCssRule(name, child)
    }
    return declarations + nested
  }

  let output = ''
  for (const [selector, style] of Object.entries(styles)) {
    if (selector.startsWith('@')) {
      output += `${selector}{${serializeAtRuleBody(style)}}`
    } else {
      output += serializeCssRule(selector, style)
    }
  }
  return output
}
