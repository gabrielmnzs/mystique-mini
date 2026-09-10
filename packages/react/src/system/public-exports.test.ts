import { describe, expect, it } from 'vitest'
import * as publicApi from '../index'
import { getStylePropDefinition } from './style-config'

describe('system public API', () => {
  it('does not expose style configuration internals from the package root', () => {
    expect(publicApi).not.toHaveProperty('stylePropConfig')
    expect(publicApi).not.toHaveProperty('aliases')
  })

  it('keeps the private style definitions immutable at runtime', () => {
    const definition = getStylePropDefinition('mx')
    expect(Object.isFrozen(definition)).toBe(true)
    expect(Object.isFrozen(definition.targets)).toBe(true)
    expect(definition.targets).toEqual(['marginLeft', 'marginRight'])
  })
})
