import { describe, expect, it } from 'vitest'
import { defaultTheme, extendTheme } from '../theme'
import { resolveComponentStyles, resolveStyleLayers, resolveStyles } from './style-resolver'

describe('style resolver', () => {
  it.each([
    ['m', 'margin'], ['mt', 'marginTop'], ['mr', 'marginRight'], ['mb', 'marginBottom'], ['ml', 'marginLeft'],
    ['p', 'padding'], ['pt', 'paddingTop'], ['pr', 'paddingRight'],
    ['pb', 'paddingBottom'], ['pl', 'paddingLeft'],
    ['w', 'width'], ['h', 'height'], ['minW', 'minWidth'], ['maxW', 'maxWidth'], ['minH', 'minHeight'], ['maxH', 'maxHeight'],
    ['display', 'display'], ['position', 'position'], ['top', 'top'], ['right', 'right'], ['bottom', 'bottom'], ['left', 'left'],
    ['overflow', 'overflow'], ['overflowX', 'overflowX'], ['overflowY', 'overflowY'], ['zIndex', 'zIndex'],
    ['align', 'alignItems'], ['justify', 'justifyContent'], ['direction', 'flexDirection'], ['wrap', 'flexWrap'], ['flex', 'flex'], ['basis', 'flexBasis'], ['grow', 'flexGrow'], ['shrink', 'flexShrink'], ['gap', 'gap'], ['rowGap', 'rowGap'], ['columnGap', 'columnGap'],
    ['fontFamily', 'fontFamily'], ['fontSize', 'fontSize'], ['fontWeight', 'fontWeight'], ['lineHeight', 'lineHeight'], ['letterSpacing', 'letterSpacing'], ['textAlign', 'textAlign'], ['textTransform', 'textTransform'], ['whiteSpace', 'whiteSpace'],
    ['color', 'color'], ['bg', 'background'], ['bgColor', 'backgroundColor'], ['opacity', 'opacity'],
    ['border', 'border'], ['borderWidth', 'borderWidth'], ['borderStyle', 'borderStyle'], ['borderColor', 'borderColor'], ['rounded', 'borderRadius'], ['borderRadius', 'borderRadius'],
    ['shadow', 'boxShadow'], ['boxShadow', 'boxShadow'], ['cursor', 'cursor'], ['transform', 'transform'], ['transition', 'transition'],
  ])('maps %s to %s', (prop, css) => {
    expect(resolveStyles({ [prop]: 'raw' }, defaultTheme)).toEqual({ [css]: 'raw' })
  })

  it('expands aliases and boxSize without dropping zero', () => {
    expect(resolveStyles({ mx: 0, my: 1, px: 2, py: 3, boxSize: 'sm' }, defaultTheme)).toEqual({
      marginLeft: '0rem', marginRight: '0rem', marginTop: '0.25rem', marginBottom: '0.25rem',
      paddingLeft: '0.5rem', paddingRight: '0.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', width: '24rem', height: '24rem',
    })
  })

  it('uses every required scale and raw fallback', () => {
    const theme = extendTheme({ zIndices: { modal: 99 }, borders: { thin: '2px solid' }, shadows: { card: '0 0 1px red' } })
    expect(resolveStyles({ w: 'sm', m: 4, zIndex: 'modal', fontSize: 'lg', color: 'blue.500', border: 'thin', rounded: 'md', shadow: 'card', gap: 99, display: 'grid', unknown: 'ignored' } as never, theme)).toEqual({
      width: '24rem', margin: '1rem', zIndex: 99, fontSize: '1.125rem', color: '#3182ce', border: '2px solid', borderRadius: '0.25rem', boxShadow: '0 0 1px red', gap: 99, display: 'grid',
    })
  })

  it('resolves responsive arrays and objects in order', () => {
    expect(resolveStyles({ color: ['red', null, 'blue', 'green', 'white', 'ignored'] }, defaultTheme)).toEqual({
      color: 'red',
      '@media screen and (min-width: 48em)': { color: 'blue' }, '@media screen and (min-width: 62em)': { color: 'green' }, '@media screen and (min-width: 80em)': { color: '#ffffff' },
    })
  })

  it('skips sparse responsive entries and merges media properties', () => {
    expect(resolveStyles({ color: { base: 'red', lg: 'blue', nope: 'x' }, p: { md: 2 }, m: { md: 3 } }, defaultTheme)).toEqual({
      color: 'red', '@media screen and (min-width: 48em)': { padding: '0.5rem', margin: '0.75rem' }, '@media screen and (min-width: 62em)': { color: 'blue' },
    })
  })

  it('orders media queries by theme breakpoint order, not prop order', () => {
    const theme = { ...defaultTheme, breakpoints: { lg: '62em', md: '48em', sm: '30em', xl: '80em' } }
    expect(Object.keys(resolveStyles({ color: { md: 'blue', lg: 'red' }, bg: { lg: 'yellow', md: 'green' } }, theme))).toEqual([
      '@media screen and (min-width: 62em)', '@media screen and (min-width: 48em)',
    ])
  })

  it('does not use space when a sizing token resolves to itself', () => {
    const theme = extendTheme({ sizes: { auto: 'auto' }, space: { auto: '1rem' } })
    expect(resolveStyles({ w: 'auto' }, theme)).toEqual({ width: 'auto' })
  })

  it('keeps dotted values raw after scalar token leaves', () => {
    expect(resolveStyles({ color: 'white.0', w: 'sm.0' }, defaultTheme)).toEqual({ color: 'white.0', width: 'sm.0' })
  })

  it('ignores non-scalar sizing groups and falls back through space to raw values', () => {
    const theme = extendTheme({
      sizes: { grouped: { sm: '24rem' }, list: ['24rem'] },
      space: { grouped: '1rem' },
    })
    expect(resolveStyles({ w: 'grouped', h: 'list', minW: 'missing' }, theme)).toEqual({
      width: '1rem', height: 'list', minWidth: 'missing',
    })
  })

  it('merges independently resolved layers in order without losing siblings', () => {
    const theme = extendTheme({ components: { Button: { baseStyle: { color: 'blue' } } } })
    expect(resolveStyleLayers(theme,
      { m: 1, _hover: { color: 'red' }, color: 'red' },
      { m: 2, mx: 3, _hover: { bg: 'white' }, color: 'blue' },
      { p: 2, _focus: { color: 'green' } },
      { ml: 4, color: 'green' },
      { mr: 5, color: 'white' },
    )).toEqual({
      margin: '0.5rem', marginLeft: '1rem', marginRight: '1.25rem', padding: '0.5rem', color: '#ffffff',
      '&:hover': { color: 'red', background: '#ffffff' }, '&:focus, &[data-focus=true]': { color: 'green' },
    })
  })

  it('limits responsive arrays to base and canonical breakpoints', () => {
    const theme = extendTheme({ breakpoints: { custom: '20em', sm: '30em', md: '48em', lg: '62em', xl: '80em' } })
    expect(resolveStyles({ color: ['base', 'sm', 'md', 'lg', 'xl', 'ignored'] }, theme)).toEqual({
      color: 'base', '@media screen and (min-width: 30em)': { color: 'sm' }, '@media screen and (min-width: 48em)': { color: 'md' },
      '@media screen and (min-width: 62em)': { color: 'lg' }, '@media screen and (min-width: 80em)': { color: 'xl' },
    })
    expect(resolveStyles({ color: { custom: 'custom' } }, theme)).toEqual({ '@media screen and (min-width: 20em)': { color: 'custom' } })
  })

  it.each([
    ['fontFamily', 'fonts', 'body', 'system-ui, sans-serif'], ['fontWeight', 'fontWeights', 'bold', 700],
    ['lineHeight', 'lineHeights', 'tight', 1.25], ['letterSpacing', 'letterSpacings', 'wide', '0.025em'],
  ])('resolves the %s token scale', (prop, _scale, value, expected) => {
    expect(resolveStyles({ [prop]: value }, defaultTheme)).toEqual({ [prop === 'fontFamily' ? 'fontFamily' : prop]: expected })
  })

  it('resolves component recipes with strict precedence and filled controls', () => {
    const theme = extendTheme({ components: {
      Button: {
        baseStyle: { color: 'theme', m: 2, _hover: { color: 'theme-hover' } },
        sizes: { sm: { color: 'size', p: 1 } },
        variants: { solid: { color: 'variant', px: 3, _hover: { bg: 'white' } } },
        defaultProps: { recipeSize: 'sm', variant: 'solid', color: 'default', ml: 1 },
      },
    } })
    const result = resolveComponentStyles({
      theme,
      component: theme.components.Button,
      factoryBaseStyle: { color: 'factory', m: 1, _hover: { color: 'factory-hover' } },
      props: { color: 'local', mx: 4, ml: 5, _hover: { color: 'local-hover' }, customThing: 'kept' } as never,
    })
    expect(result.props).toMatchObject({ recipeSize: 'sm', variant: 'solid', customThing: 'kept' })
    expect(result.styles).toEqual({
      color: 'local', margin: '0.5rem', marginLeft: '1.25rem', marginRight: '1rem', padding: '0.25rem',
      paddingLeft: '0.75rem', paddingRight: '0.75rem',
      '&:hover': { color: 'local-hover', background: '#ffffff' },
    })
  })

  it('uses explicit controls over defaults and keeps sibling pseudo/media rules', () => {
    const theme = extendTheme({ components: {
      Card: {
        baseStyle: { color: 'theme', _hover: { color: 'red' }, _focus: { color: 'blue' } },
        sizes: { lg: { color: 'size' } },
        variants: { outline: { color: 'variant' } },
        defaultProps: { recipeSize: 'lg', variant: 'outline' },
      },
    } })
    const result = resolveComponentStyles({
      theme, component: theme.components.Card,
      props: { recipeSize: 'missing', variant: 'missing', color: { base: 'local', md: 'local-md' } },
    })
    expect(result.props.recipeSize).toBe('missing')
    expect(result.props.variant).toBe('missing')
    expect(result.styles).toEqual({ color: 'local', '&:hover': { color: 'red' }, '&:focus, &[data-focus=true]': { color: 'blue' }, '@media screen and (min-width: 48em)': { color: 'local-md' } })
  })

  it('applies default style props before explicit local style props', () => {
    const theme = extendTheme({ components: {
      Button: {
        defaultProps: { mx: 4, _hover: { mx: 3 }, color: { md: 'default-md' } },
      },
    } })
    const result = resolveComponentStyles({
      theme,
      component: theme.components.Button,
      props: { ml: 5, _hover: { ml: 6 }, color: { md: 'local-md' } } as never,
    })

    expect(result.styles).toEqual({
      marginLeft: '1.25rem', marginRight: '1rem',
      '&:hover': { marginLeft: '1.5rem', marginRight: '0.75rem' },
      '@media screen and (min-width: 48em)': { color: 'local-md' },
    })
  })

  it('lets each recipe layer win the same property at its precedence point', () => {
    const component = {
      baseStyle: { color: 'theme' },
      sizes: { sm: { color: 'size' } },
      variants: { solid: { color: 'variant' } },
    }
    const factory = { color: 'factory' }
    expect(resolveComponentStyles({ theme: defaultTheme, component: {}, factoryBaseStyle: factory }).styles.color).toBe('factory')
    expect(resolveComponentStyles({ theme: defaultTheme, component, factoryBaseStyle: factory }).styles.color).toBe('theme')
    expect(resolveComponentStyles({ theme: defaultTheme, component, factoryBaseStyle: factory, props: { recipeSize: 'sm' } }).styles.color).toBe('size')
    expect(resolveComponentStyles({ theme: defaultTheme, component, factoryBaseStyle: factory, props: { recipeSize: 'sm', variant: 'solid' } }).styles.color).toBe('variant')
    expect(resolveComponentStyles({ theme: defaultTheme, component, factoryBaseStyle: factory, props: { recipeSize: 'sm', variant: 'solid', color: 'local' } }).styles.color).toBe('local')
  })

  it.each([
    ['_focus', '&:focus, &[data-focus=true]'], ['_active', '&:active, &[data-active=true]'], ['_placeholder', '&::placeholder'],
  ])('resolves %s exactly', (pseudo, selector) => {
    expect(resolveStyles({ [pseudo]: { color: 'red' } }, defaultTheme)).toEqual({ [selector]: { color: 'red' } })
  })
})
