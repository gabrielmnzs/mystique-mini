import type { CSSValue } from './types'

export const stylePropConfig: Record<string, { property: string; scale?: string }> = {
  m: { property: 'margin', scale: 'space' }, mt: { property: 'marginTop', scale: 'space' }, mr: { property: 'marginRight', scale: 'space' }, mb: { property: 'marginBottom', scale: 'space' }, ml: { property: 'marginLeft', scale: 'space' },
  p: { property: 'padding', scale: 'space' }, pt: { property: 'paddingTop', scale: 'space' }, pr: { property: 'paddingRight', scale: 'space' }, pb: { property: 'paddingBottom', scale: 'space' }, pl: { property: 'paddingLeft', scale: 'space' },
  w: { property: 'width', scale: 'sizes' }, h: { property: 'height', scale: 'sizes' }, minW: { property: 'minWidth', scale: 'sizes' }, maxW: { property: 'maxWidth', scale: 'sizes' }, minH: { property: 'minHeight', scale: 'sizes' }, maxH: { property: 'maxHeight', scale: 'sizes' }, boxSize: { property: 'width', scale: 'sizes' },
  display: { property: 'display' }, position: { property: 'position' }, top: { property: 'top' }, right: { property: 'right' }, bottom: { property: 'bottom' }, left: { property: 'left' }, overflow: { property: 'overflow' }, overflowX: { property: 'overflowX' }, overflowY: { property: 'overflowY' }, zIndex: { property: 'zIndex', scale: 'zIndices' },
  align: { property: 'alignItems' }, justify: { property: 'justifyContent' }, direction: { property: 'flexDirection' }, wrap: { property: 'flexWrap' }, flex: { property: 'flex' }, basis: { property: 'flexBasis' }, grow: { property: 'flexGrow' }, shrink: { property: 'flexShrink' }, gap: { property: 'gap', scale: 'space' }, rowGap: { property: 'rowGap', scale: 'space' }, columnGap: { property: 'columnGap', scale: 'space' },
  fontFamily: { property: 'fontFamily', scale: 'fonts' }, fontSize: { property: 'fontSize', scale: 'fontSizes' }, fontWeight: { property: 'fontWeight', scale: 'fontWeights' }, lineHeight: { property: 'lineHeight', scale: 'lineHeights' }, letterSpacing: { property: 'letterSpacing', scale: 'letterSpacings' }, textAlign: { property: 'textAlign' }, textTransform: { property: 'textTransform' }, whiteSpace: { property: 'whiteSpace' },
  color: { property: 'color', scale: 'colors' }, bg: { property: 'background', scale: 'colors' }, bgColor: { property: 'backgroundColor', scale: 'colors' }, opacity: { property: 'opacity' },
  border: { property: 'border', scale: 'borders' }, borderWidth: { property: 'borderWidth' }, borderStyle: { property: 'borderStyle' }, borderColor: { property: 'borderColor', scale: 'colors' }, rounded: { property: 'borderRadius', scale: 'radii' }, borderRadius: { property: 'borderRadius', scale: 'radii' },
  shadow: { property: 'boxShadow', scale: 'shadows' }, boxShadow: { property: 'boxShadow', scale: 'shadows' }, cursor: { property: 'cursor' }, transform: { property: 'transform' }, transition: { property: 'transition' },
}

export const aliases: Record<string, readonly string[]> = {
  mx: ['marginLeft', 'marginRight'], my: ['marginTop', 'marginBottom'], px: ['paddingLeft', 'paddingRight'], py: ['paddingTop', 'paddingBottom'], boxSize: ['width', 'height'],
}

export const stylePropNames = new Set([...Object.keys(stylePropConfig), ...Object.keys(aliases)])
export const isStyleProp = (name: string): boolean => stylePropNames.has(name)
export const isCSSValue = (value: unknown): value is CSSValue => typeof value === 'string' || typeof value === 'number'
