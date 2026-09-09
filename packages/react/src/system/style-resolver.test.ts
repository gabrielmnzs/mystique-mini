import { describe, expect, it } from 'vitest'
import { defaultTheme, extendTheme } from '../theme'
import { resolveStyles } from './style-resolver'

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
    expect(resolveStyles({ w: 'sm', m: 4, zIndex: 'modal', fontSize: 'lg', color: 'blue.500', border: 'thin', rounded: 'md', shadow: 'card', gap: 99, display: 'grid', unknown: 'ignored' }, theme)).toEqual({
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
})
