// @vitest-environment node

import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { mystique } from './factory'
import { MystiqueProvider } from './provider'
import { createSystem } from './system'

describe('mystique factory SSR', () => {
  it('imports and renders without browser globals and emits Mystique styles', () => {
    const system = createSystem({
      globalCss: { body: { color: 'black' } },
      preflight: false,
      utilities: { color: { property: 'color' } },
    })
    const Div = mystique.div

    const html = renderToString(
      <MystiqueProvider value={system}>
        <Div color="tomato">server</Div>
      </MystiqueProvider>,
    )

    expect(html).toContain('data-emotion="mystique-global ')
    expect(html).toContain('data-emotion="mystique ')
    expect(html).toContain('class="mystique-')
    expect(html).toContain('color:tomato')
  })

  it('serializes extended factory recipes in the recipes layer before public css', () => {
    const system = createSystem({
      preflight: false,
      utilities: { color: { property: 'color' } },
    })
    const Base = mystique('div', {
      base: { color: 'red' },
      className: 'base-recipe',
    })
    const Extended = mystique(Base, {
      base: { color: 'blue' },
      className: 'extended-recipe',
    })

    const html = renderToString(
      <MystiqueProvider value={system}>
        <Extended css={{ color: 'green' }}>server</Extended>
      </MystiqueProvider>,
    )

    expect(html).toContain('base-recipe')
    expect(html).toContain('extended-recipe')
    expect(html).toContain('@layer recipes')
    expect(html).toContain('color:blue')
    expect(html).toContain('color:green')
  })
})
