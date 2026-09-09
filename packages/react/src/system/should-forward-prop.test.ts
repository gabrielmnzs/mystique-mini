import { describe, expect, it } from 'vitest'
import { shouldForwardProp } from './should-forward-prop'

describe('prop filtering', () => {
  it('filters mystique and control props for intrinsic elements', () => {
    for (const prop of ['m', 'color', '_hover', 'theme', 'as', 'variant', 'recipeSize', 'htmlSize']) expect(shouldForwardProp(prop, true)).toBe(false)
    expect(shouldForwardProp('id', true)).toBe(true)
    expect(shouldForwardProp('not-a-dom-prop', true)).toBe(false)
  })
  it('retains arbitrary custom component props but removes system props', () => {
    expect(shouldForwardProp('customThing', false)).toBe(true)
    expect(shouldForwardProp('p', false)).toBe(false)
  })
})
