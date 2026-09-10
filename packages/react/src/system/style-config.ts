import type { CSSValue, StyleProps } from './types'

type StylePropDefinition = { readonly targets: readonly string[]; readonly scale?: string }

const freezeStylePropDefinitions = <T extends Record<string, StylePropDefinition>>(definitions: T): Readonly<T> => {
  for (const definition of Object.values(definitions)) {
    Object.freeze(definition.targets)
    Object.freeze(definition)
  }
  return Object.freeze(definitions)
}

const stylePropDefinitions = freezeStylePropDefinitions({
  m: { targets: ['margin'], scale: 'space' }, mt: { targets: ['marginTop'], scale: 'space' }, mr: { targets: ['marginRight'], scale: 'space' }, mb: { targets: ['marginBottom'], scale: 'space' }, ml: { targets: ['marginLeft'], scale: 'space' },
  p: { targets: ['padding'], scale: 'space' }, pt: { targets: ['paddingTop'], scale: 'space' }, pr: { targets: ['paddingRight'], scale: 'space' }, pb: { targets: ['paddingBottom'], scale: 'space' }, pl: { targets: ['paddingLeft'], scale: 'space' },
  w: { targets: ['width'], scale: 'sizes' }, h: { targets: ['height'], scale: 'sizes' }, minW: { targets: ['minWidth'], scale: 'sizes' }, maxW: { targets: ['maxWidth'], scale: 'sizes' }, minH: { targets: ['minHeight'], scale: 'sizes' }, maxH: { targets: ['maxHeight'], scale: 'sizes' }, boxSize: { targets: ['width', 'height'], scale: 'sizes' },
  display: { targets: ['display'] }, position: { targets: ['position'] }, top: { targets: ['top'] }, right: { targets: ['right'] }, bottom: { targets: ['bottom'] }, left: { targets: ['left'] }, overflow: { targets: ['overflow'] }, overflowX: { targets: ['overflowX'] }, overflowY: { targets: ['overflowY'] }, zIndex: { targets: ['zIndex'], scale: 'zIndices' },
  align: { targets: ['alignItems'] }, justify: { targets: ['justifyContent'] }, direction: { targets: ['flexDirection'] }, wrap: { targets: ['flexWrap'] }, flex: { targets: ['flex'] }, basis: { targets: ['flexBasis'] }, grow: { targets: ['flexGrow'] }, shrink: { targets: ['flexShrink'] }, gap: { targets: ['gap'], scale: 'space' }, rowGap: { targets: ['rowGap'], scale: 'space' }, columnGap: { targets: ['columnGap'], scale: 'space' },
  fontFamily: { targets: ['fontFamily'], scale: 'fonts' }, fontSize: { targets: ['fontSize'], scale: 'fontSizes' }, fontWeight: { targets: ['fontWeight'], scale: 'fontWeights' }, lineHeight: { targets: ['lineHeight'], scale: 'lineHeights' }, letterSpacing: { targets: ['letterSpacing'], scale: 'letterSpacings' }, textAlign: { targets: ['textAlign'] }, textTransform: { targets: ['textTransform'] }, whiteSpace: { targets: ['whiteSpace'] },
  color: { targets: ['color'], scale: 'colors' }, bg: { targets: ['background'], scale: 'colors' }, bgColor: { targets: ['backgroundColor'], scale: 'colors' }, opacity: { targets: ['opacity'] },
  border: { targets: ['border'], scale: 'borders' }, borderWidth: { targets: ['borderWidth'] }, borderStyle: { targets: ['borderStyle'] }, borderColor: { targets: ['borderColor'], scale: 'colors' }, rounded: { targets: ['borderRadius'], scale: 'radii' }, borderRadius: { targets: ['borderRadius'], scale: 'radii' },
  shadow: { targets: ['boxShadow'], scale: 'shadows' }, boxShadow: { targets: ['boxShadow'], scale: 'shadows' }, cursor: { targets: ['cursor'] }, transform: { targets: ['transform'] }, transition: { targets: ['transition'] },
  mx: { targets: ['marginLeft', 'marginRight'], scale: 'space' }, my: { targets: ['marginTop', 'marginBottom'], scale: 'space' }, px: { targets: ['paddingLeft', 'paddingRight'], scale: 'space' }, py: { targets: ['paddingTop', 'paddingBottom'], scale: 'space' },
} as const satisfies Record<keyof StyleProps, StylePropDefinition>)

const stylePropNames: ReadonlySet<string> = new Set(Object.keys(stylePropDefinitions))
export const isStyleProp = (name: string): boolean => stylePropNames.has(name)
export const isCSSValue = (value: unknown): value is CSSValue => typeof value === 'string' || typeof value === 'number'

export const getStylePropDefinition = (name: keyof StyleProps): StylePropDefinition => stylePropDefinitions[name]
