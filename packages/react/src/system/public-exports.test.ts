import { describe, expect, it } from 'vitest'
import * as publicApi from '../index'
import { getStylePropDefinition } from './style-config'

describe('system public API', () => {
  it('exposes only the v1 runtime API from the package root', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'Box', 'Center', 'Circle', 'Flex', 'MystiqueProvider', 'Span', 'Square', 'Text',
      'defaultTheme', 'extendTheme', 'mystique', 'useMystiqueTheme',
    ].sort())
  })

  it('does not expose private runtime helpers from the package root', () => {
    for (const name of ['mystiqueVersion', 'getToken', 'isCSSValue', 'isStyleProp', 'isPseudoProp', 'shouldForwardProp', 'filterProps']) {
      expect(publicApi).not.toHaveProperty(name)
    }
  })

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

  it('exports every base component from the package source entrypoint', () => {
    for (const name of ['Box', 'Flex', 'Center', 'Square', 'Circle', 'Span', 'Text']) {
      expect(publicApi[name as keyof typeof publicApi]).toBeDefined()
    }
  })
})
