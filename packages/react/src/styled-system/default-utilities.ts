import type { CssValue, UtilityConfig, UtilityDefinition } from './types';

const define = (
  property?: string | readonly string[],
  values?: string,
): UtilityDefinition => ({ property, values });

const spacing = (property?: string | readonly string[]) =>
  define(property, 'spacing');
const color = (property?: string | readonly string[]) =>
  define(property, 'colors');

const sizing = (property: string | readonly string[]): UtilityDefinition => ({
  property,
  transform(value, { token }) {
    const missing = '__mystique_missing_token__';
    const sized = token(`sizes.${String(value)}`, missing);
    const resolved =
      sized === missing ? token(`spacing.${String(value)}`, value) : sized;
    const properties = Array.isArray(property) ? property : [property];
    return Object.fromEntries(properties.map((name) => [name, resolved]));
  },
});

const properties = (names: readonly string[], values?: string): UtilityConfig =>
  Object.fromEntries(names.map((name) => [name, define(name, values)]));

export const defaultUtilityConfig: UtilityConfig = {
  m: spacing('margin'),
  mt: spacing('marginTop'),
  mr: spacing('marginRight'),
  mb: spacing('marginBottom'),
  ml: spacing('marginLeft'),
  mx: spacing(['marginLeft', 'marginRight']),
  my: spacing(['marginTop', 'marginBottom']),
  marginX: spacing(['marginLeft', 'marginRight']),
  marginY: spacing(['marginTop', 'marginBottom']),
  ...properties(
    [
      'margin',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'marginInline',
      'marginInlineStart',
      'marginInlineEnd',
      'marginBlock',
      'marginBlockStart',
      'marginBlockEnd',
    ],
    'spacing',
  ),

  p: spacing('padding'),
  pt: spacing('paddingTop'),
  pr: spacing('paddingRight'),
  pb: spacing('paddingBottom'),
  pl: spacing('paddingLeft'),
  px: spacing(['paddingLeft', 'paddingRight']),
  py: spacing(['paddingTop', 'paddingBottom']),
  paddingX: spacing(['paddingLeft', 'paddingRight']),
  paddingY: spacing(['paddingTop', 'paddingBottom']),
  ...properties(
    [
      'padding',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'paddingInline',
      'paddingInlineStart',
      'paddingInlineEnd',
      'paddingBlock',
      'paddingBlockStart',
      'paddingBlockEnd',
    ],
    'spacing',
  ),

  w: sizing('width'),
  h: sizing('height'),
  minW: sizing('minWidth'),
  maxW: sizing('maxWidth'),
  minH: sizing('minHeight'),
  maxH: sizing('maxHeight'),
  boxSize: sizing(['width', 'height']),
  width: sizing('width'),
  height: sizing('height'),
  minWidth: sizing('minWidth'),
  maxWidth: sizing('maxWidth'),
  minHeight: sizing('minHeight'),
  maxHeight: sizing('maxHeight'),

  insetX: spacing(['left', 'right']),
  insetY: spacing(['top', 'bottom']),
  ...properties(['inset', 'top', 'right', 'bottom', 'left'], 'spacing'),
  ...properties([
    'display',
    'position',
    'overflow',
    'overflowX',
    'overflowY',
    'visibility',
    'float',
    'isolation',
    'objectFit',
    'objectPosition',
    'boxSizing',
  ]),
  zIndex: define('zIndex', 'zIndex'),
  aspectRatio: define('aspectRatio', 'aspectRatios'),

  align: define('alignItems'),
  justify: define('justifyContent'),
  direction: define('flexDirection'),
  wrap: define('flexWrap'),
  basis: define('flexBasis', 'sizes'),
  grow: define('flexGrow'),
  shrink: define('flexShrink'),
  ...properties([
    'alignItems',
    'alignContent',
    'alignSelf',
    'justifyContent',
    'justifyItems',
    'justifySelf',
    'placeItems',
    'placeContent',
    'placeSelf',
    'flexDirection',
    'flexWrap',
    'flex',
    'flexGrow',
    'flexShrink',
    'order',
  ]),
  flexBasis: define('flexBasis', 'sizes'),
  gap: spacing('gap'),
  rowGap: spacing('rowGap'),
  columnGap: spacing('columnGap'),

  ...properties([
    'gridArea',
    'gridColumn',
    'gridRow',
    'gridAutoFlow',
    'gridAutoColumns',
    'gridAutoRows',
    'gridTemplateColumns',
    'gridTemplateRows',
    'gridTemplateAreas',
    'columnCount',
  ]),

  fontFamily: define('fontFamily', 'fonts'),
  fontSize: define('fontSize', 'fontSizes'),
  fontWeight: define('fontWeight', 'fontWeights'),
  lineHeight: define('lineHeight', 'lineHeights'),
  letterSpacing: define('letterSpacing', 'letterSpacings'),
  textDecorationColor: color('textDecorationColor'),
  ...properties([
    'font',
    'fontStyle',
    'textAlign',
    'textDecoration',
    'textTransform',
    'textOverflow',
    'textIndent',
    'whiteSpace',
    'wordBreak',
    'overflowWrap',
    'textRendering',
    'WebkitTextSizeAdjust',
  ]),

  color: color('color'),
  bg: color('background'),
  bgColor: color('backgroundColor'),
  background: color('background'),
  backgroundColor: color('backgroundColor'),
  ...properties([
    'backgroundImage',
    'backgroundSize',
    'backgroundPosition',
    'backgroundRepeat',
    'backgroundClip',
    'opacity',
  ]),

  border: define('border', 'borders'),
  borderColor: color('borderColor'),
  borderTopColor: color('borderTopColor'),
  borderRightColor: color('borderRightColor'),
  borderBottomColor: color('borderBottomColor'),
  borderLeftColor: color('borderLeftColor'),
  borderWidth: define('borderWidth', 'borderWidths'),
  borderTopWidth: define('borderTopWidth', 'borderWidths'),
  borderRightWidth: define('borderRightWidth', 'borderWidths'),
  borderBottomWidth: define('borderBottomWidth', 'borderWidths'),
  borderLeftWidth: define('borderLeftWidth', 'borderWidths'),
  rounded: define('borderRadius', 'radii'),
  borderRadius: define('borderRadius', 'radii'),
  roundedTop: define(['borderTopLeftRadius', 'borderTopRightRadius'], 'radii'),
  roundedBottom: define(
    ['borderBottomLeftRadius', 'borderBottomRightRadius'],
    'radii',
  ),
  outlineColor: color('outlineColor'),
  ...properties([
    'borderStyle',
    'borderTop',
    'borderRight',
    'borderBottom',
    'borderLeft',
    'outline',
    'outlineOffset',
  ]),

  shadow: define('boxShadow', 'shadows'),
  boxShadow: define('boxShadow', 'shadows'),
  ...properties([
    'textShadow',
    'filter',
    'backdropFilter',
    'mixBlendMode',
    'cursor',
    'pointerEvents',
    'resize',
    'userSelect',
    'transform',
    'transformOrigin',
    'translate',
    'rotate',
    'scale',
    'transition',
    'transitionProperty',
    'transitionDuration',
    'transitionTimingFunction',
    'animation',
  ]),
};
export function createUtilityTokenResolver(
  token: (path: string, fallback?: CssValue) => CssValue,
) {
  return token;
}
