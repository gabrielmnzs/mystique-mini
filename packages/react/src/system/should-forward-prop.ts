import isPropValid from '@emotion/is-prop-valid'
import { isStyleProp } from './style-config'
import { pseudoSelectors } from './pseudos'

const controls = new Set(['variant', 'recipeSize', 'htmlSize', 'theme', 'as'])
export const isPseudoProp = (name: string): boolean => Object.prototype.hasOwnProperty.call(pseudoSelectors, name)
export function shouldForwardProp(name: string, intrinsic: boolean): boolean {
  if (controls.has(name) || isStyleProp(name) || isPseudoProp(name)) return false
  return intrinsic ? isPropValid(name) : true
}

export function filterProps<T extends Record<string, unknown>>(props: T, intrinsic: boolean): Partial<T> {
  return Object.fromEntries(Object.entries(props).filter(([name]) => shouldForwardProp(name, intrinsic))) as Partial<T>
}
