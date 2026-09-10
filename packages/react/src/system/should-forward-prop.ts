import isPropValid from '@emotion/is-prop-valid'
import { isStyleProp } from './style-config'
import { isPseudoName } from './pseudos'

const controls = new Set(['as', 'theme', 'variant', 'recipeSize', 'htmlSize'])
export const isPseudoProp = isPseudoName
export function shouldForwardProp(name: string, target: unknown): boolean {
  if (controls.has(name) || isStyleProp(name) || isPseudoProp(name)) return false
  const intrinsic = typeof target === 'string' || target === true
  return intrinsic ? isPropValid(name) : true
}

export function filterProps<T extends Record<string, unknown>>(props: T, target: unknown): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([name]) => shouldForwardProp(name, target))) as Partial<T>
}
