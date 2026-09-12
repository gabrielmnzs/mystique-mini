import type { CSSProperties } from 'react';

import type {
  SemanticTokenDefinition,
  TokenDefinition,
} from './token-dictionary';

export type CssValue = string | number;
export type Nil = null | undefined;

export type ConditionalValue<T> =
  T | readonly (T | Nil)[] | { readonly [condition: string]: T | Nil };

type PropertyValue<K extends keyof CSSProperties> = ConditionalValue<
  CSSProperties[K] | CssValue
>;

/** Style props accepted directly by Mystique components. */
export interface SystemProperties {
  m?: PropertyValue<'margin'>;
  mt?: PropertyValue<'marginTop'>;
  mr?: PropertyValue<'marginRight'>;
  mb?: PropertyValue<'marginBottom'>;
  ml?: PropertyValue<'marginLeft'>;
  mx?: PropertyValue<'marginInline'>;
  my?: PropertyValue<'marginBlock'>;
  margin?: PropertyValue<'margin'>;
  marginTop?: PropertyValue<'marginTop'>;
  marginRight?: PropertyValue<'marginRight'>;
  marginBottom?: PropertyValue<'marginBottom'>;
  marginLeft?: PropertyValue<'marginLeft'>;
  marginX?: PropertyValue<'marginInline'>;
  marginY?: PropertyValue<'marginBlock'>;
  marginInline?: PropertyValue<'marginInline'>;
  marginInlineStart?: PropertyValue<'marginInlineStart'>;
  marginInlineEnd?: PropertyValue<'marginInlineEnd'>;
  marginBlock?: PropertyValue<'marginBlock'>;
  marginBlockStart?: PropertyValue<'marginBlockStart'>;
  marginBlockEnd?: PropertyValue<'marginBlockEnd'>;

  p?: PropertyValue<'padding'>;
  pt?: PropertyValue<'paddingTop'>;
  pr?: PropertyValue<'paddingRight'>;
  pb?: PropertyValue<'paddingBottom'>;
  pl?: PropertyValue<'paddingLeft'>;
  px?: PropertyValue<'paddingInline'>;
  py?: PropertyValue<'paddingBlock'>;
  padding?: PropertyValue<'padding'>;
  paddingTop?: PropertyValue<'paddingTop'>;
  paddingRight?: PropertyValue<'paddingRight'>;
  paddingBottom?: PropertyValue<'paddingBottom'>;
  paddingLeft?: PropertyValue<'paddingLeft'>;
  paddingX?: PropertyValue<'paddingInline'>;
  paddingY?: PropertyValue<'paddingBlock'>;
  paddingInline?: PropertyValue<'paddingInline'>;
  paddingInlineStart?: PropertyValue<'paddingInlineStart'>;
  paddingInlineEnd?: PropertyValue<'paddingInlineEnd'>;
  paddingBlock?: PropertyValue<'paddingBlock'>;
  paddingBlockStart?: PropertyValue<'paddingBlockStart'>;
  paddingBlockEnd?: PropertyValue<'paddingBlockEnd'>;

  w?: PropertyValue<'width'>;
  h?: PropertyValue<'height'>;
  minW?: PropertyValue<'minWidth'>;
  maxW?: PropertyValue<'maxWidth'>;
  minH?: PropertyValue<'minHeight'>;
  maxH?: PropertyValue<'maxHeight'>;
  boxSize?: PropertyValue<'width'>;
  width?: PropertyValue<'width'>;
  height?: PropertyValue<'height'>;
  minWidth?: PropertyValue<'minWidth'>;
  maxWidth?: PropertyValue<'maxWidth'>;
  minHeight?: PropertyValue<'minHeight'>;
  maxHeight?: PropertyValue<'maxHeight'>;
  aspectRatio?: PropertyValue<'aspectRatio'>;

  display?: PropertyValue<'display'>;
  boxSizing?: PropertyValue<'boxSizing'>;
  position?: PropertyValue<'position'>;
  inset?: PropertyValue<'inset'>;
  insetX?: PropertyValue<'insetInline'>;
  insetY?: PropertyValue<'insetBlock'>;
  top?: PropertyValue<'top'>;
  right?: PropertyValue<'right'>;
  bottom?: PropertyValue<'bottom'>;
  left?: PropertyValue<'left'>;
  overflow?: PropertyValue<'overflow'>;
  overflowX?: PropertyValue<'overflowX'>;
  overflowY?: PropertyValue<'overflowY'>;
  visibility?: PropertyValue<'visibility'>;
  textRendering?: PropertyValue<'textRendering'>;
  WebkitTextSizeAdjust?: PropertyValue<'WebkitTextSizeAdjust'>;
  float?: PropertyValue<'float'>;
  isolation?: PropertyValue<'isolation'>;
  objectFit?: PropertyValue<'objectFit'>;
  objectPosition?: PropertyValue<'objectPosition'>;
  zIndex?: PropertyValue<'zIndex'>;

  align?: PropertyValue<'alignItems'>;
  alignItems?: PropertyValue<'alignItems'>;
  alignContent?: PropertyValue<'alignContent'>;
  alignSelf?: PropertyValue<'alignSelf'>;
  justify?: PropertyValue<'justifyContent'>;
  justifyContent?: PropertyValue<'justifyContent'>;
  justifyItems?: PropertyValue<'justifyItems'>;
  justifySelf?: PropertyValue<'justifySelf'>;
  placeItems?: PropertyValue<'placeItems'>;
  placeContent?: PropertyValue<'placeContent'>;
  placeSelf?: PropertyValue<'placeSelf'>;
  direction?: PropertyValue<'flexDirection'>;
  flexDirection?: PropertyValue<'flexDirection'>;
  wrap?: PropertyValue<'flexWrap'>;
  flexWrap?: PropertyValue<'flexWrap'>;
  flex?: PropertyValue<'flex'>;
  basis?: PropertyValue<'flexBasis'>;
  flexBasis?: PropertyValue<'flexBasis'>;
  grow?: PropertyValue<'flexGrow'>;
  flexGrow?: PropertyValue<'flexGrow'>;
  shrink?: PropertyValue<'flexShrink'>;
  flexShrink?: PropertyValue<'flexShrink'>;
  gap?: PropertyValue<'gap'>;
  rowGap?: PropertyValue<'rowGap'>;
  columnGap?: PropertyValue<'columnGap'>;
  order?: PropertyValue<'order'>;

  gridArea?: PropertyValue<'gridArea'>;
  gridColumn?: PropertyValue<'gridColumn'>;
  gridRow?: PropertyValue<'gridRow'>;
  gridAutoFlow?: PropertyValue<'gridAutoFlow'>;
  gridAutoColumns?: PropertyValue<'gridAutoColumns'>;
  gridAutoRows?: PropertyValue<'gridAutoRows'>;
  gridTemplateColumns?: PropertyValue<'gridTemplateColumns'>;
  gridTemplateRows?: PropertyValue<'gridTemplateRows'>;
  gridTemplateAreas?: PropertyValue<'gridTemplateAreas'>;
  columnCount?: PropertyValue<'columnCount'>;

  font?: PropertyValue<'font'>;
  fontFamily?: PropertyValue<'fontFamily'>;
  fontSize?: PropertyValue<'fontSize'>;
  fontWeight?: PropertyValue<'fontWeight'>;
  fontStyle?: PropertyValue<'fontStyle'>;
  lineHeight?: PropertyValue<'lineHeight'>;
  letterSpacing?: PropertyValue<'letterSpacing'>;
  textAlign?: PropertyValue<'textAlign'>;
  textDecoration?: PropertyValue<'textDecoration'>;
  textDecorationColor?: PropertyValue<'textDecorationColor'>;
  textTransform?: PropertyValue<'textTransform'>;
  textOverflow?: PropertyValue<'textOverflow'>;
  textIndent?: PropertyValue<'textIndent'>;
  whiteSpace?: PropertyValue<'whiteSpace'>;
  wordBreak?: PropertyValue<'wordBreak'>;
  overflowWrap?: PropertyValue<'overflowWrap'>;

  color?: PropertyValue<'color'>;
  bg?: PropertyValue<'background'>;
  bgColor?: PropertyValue<'backgroundColor'>;
  background?: PropertyValue<'background'>;
  backgroundColor?: PropertyValue<'backgroundColor'>;
  backgroundImage?: PropertyValue<'backgroundImage'>;
  backgroundSize?: PropertyValue<'backgroundSize'>;
  backgroundPosition?: PropertyValue<'backgroundPosition'>;
  backgroundRepeat?: PropertyValue<'backgroundRepeat'>;
  backgroundClip?: PropertyValue<'backgroundClip'>;
  opacity?: PropertyValue<'opacity'>;

  border?: PropertyValue<'border'>;
  borderWidth?: PropertyValue<'borderWidth'>;
  borderStyle?: PropertyValue<'borderStyle'>;
  borderColor?: PropertyValue<'borderColor'>;
  borderTop?: PropertyValue<'borderTop'>;
  borderRight?: PropertyValue<'borderRight'>;
  borderBottom?: PropertyValue<'borderBottom'>;
  borderLeft?: PropertyValue<'borderLeft'>;
  borderTopWidth?: PropertyValue<'borderTopWidth'>;
  borderRightWidth?: PropertyValue<'borderRightWidth'>;
  borderBottomWidth?: PropertyValue<'borderBottomWidth'>;
  borderLeftWidth?: PropertyValue<'borderLeftWidth'>;
  borderTopColor?: PropertyValue<'borderTopColor'>;
  borderRightColor?: PropertyValue<'borderRightColor'>;
  borderBottomColor?: PropertyValue<'borderBottomColor'>;
  borderLeftColor?: PropertyValue<'borderLeftColor'>;
  rounded?: PropertyValue<'borderRadius'>;
  borderRadius?: PropertyValue<'borderRadius'>;
  roundedTop?: PropertyValue<'borderStartStartRadius'>;
  roundedBottom?: PropertyValue<'borderEndStartRadius'>;
  outline?: PropertyValue<'outline'>;
  outlineColor?: PropertyValue<'outlineColor'>;
  outlineOffset?: PropertyValue<'outlineOffset'>;

  shadow?: PropertyValue<'boxShadow'>;
  boxShadow?: PropertyValue<'boxShadow'>;
  textShadow?: PropertyValue<'textShadow'>;
  filter?: PropertyValue<'filter'>;
  backdropFilter?: PropertyValue<'backdropFilter'>;
  mixBlendMode?: PropertyValue<'mixBlendMode'>;
  cursor?: PropertyValue<'cursor'>;
  pointerEvents?: PropertyValue<'pointerEvents'>;
  resize?: PropertyValue<'resize'>;
  userSelect?: PropertyValue<'userSelect'>;
  transform?: PropertyValue<'transform'>;
  transformOrigin?: PropertyValue<'transformOrigin'>;
  translate?: PropertyValue<'translate'>;
  rotate?: PropertyValue<'rotate'>;
  scale?: PropertyValue<'scale'>;
  transition?: PropertyValue<'transition'>;
  transitionProperty?: PropertyValue<'transitionProperty'>;
  transitionDuration?: PropertyValue<'transitionDuration'>;
  transitionTimingFunction?: PropertyValue<'transitionTimingFunction'>;
  animation?: PropertyValue<'animation'>;
}

export interface ConditionProperties {
  _hover?: SystemStyleObject;
  _active?: SystemStyleObject;
  _focus?: SystemStyleObject;
  _focusVisible?: SystemStyleObject;
  _focusWithin?: SystemStyleObject;
  _disabled?: SystemStyleObject;
  _readOnly?: SystemStyleObject;
  _invalid?: SystemStyleObject;
  _checked?: SystemStyleObject;
  _expanded?: SystemStyleObject;
  _selected?: SystemStyleObject;
  _placeholder?: SystemStyleObject;
  _before?: SystemStyleObject;
  _after?: SystemStyleObject;
  _first?: SystemStyleObject;
  _last?: SystemStyleObject;
  _odd?: SystemStyleObject;
  _even?: SystemStyleObject;
  _dark?: SystemStyleObject;
  _light?: SystemStyleObject;
  _motionReduce?: SystemStyleObject;
  _portrait?: SystemStyleObject;
  _landscape?: SystemStyleObject;
}

export type SystemStyleObject = SystemProperties &
  ConditionProperties & {
    [cssVariable: `--${string}`]: ConditionalValue<CssValue> | undefined;
    [selector: `&${string}`]: SystemStyleObject | undefined;
    [atRule: `@${string}`]: SystemStyleObject | undefined;
  };

export type SystemStyleObjectInput =
  SystemStyleObject | false | Nil | readonly SystemStyleObjectInput[];

export interface GlobalAtRuleObject {
  [name: string]:
    CssValue | SystemStyleObject | GlobalAtRuleObject | null | undefined;
}

export type GlobalCss = Record<string, SystemStyleObject | GlobalAtRuleObject>;

export interface UtilityTransformArgs {
  token: (path: string, fallback?: CssValue) => CssValue;
  raw: CssValue;
}

export interface UtilityDefinition {
  property?: string | readonly string[];
  values?: string;
  transform?: (
    value: CssValue,
    args: UtilityTransformArgs,
  ) => Record<string, CssValue>;
}

export type UtilityConfig = Record<string, UtilityDefinition>;

export interface RecipeCompoundVariant {
  css: SystemStyleObject;
  [variant: string]: unknown;
}

export interface RecipeDefinition {
  className?: string;
  base?: SystemStyleObject;
  variants?: Record<string, Record<string, SystemStyleObject>>;
  compoundVariants?: readonly RecipeCompoundVariant[];
  defaultVariants?: Record<string, string | boolean>;
}

export interface SlotRecipeCompoundVariant {
  css: Record<string, SystemStyleObject>;
  [variant: string]: unknown;
}

export interface SlotRecipeDefinition {
  className?: string;
  slots: readonly string[];
  base?: Record<string, SystemStyleObject>;
  variants?: Record<string, Record<string, Record<string, SystemStyleObject>>>;
  compoundVariants?: readonly SlotRecipeCompoundVariant[];
  defaultVariants?: Record<string, string | boolean>;
}

export interface ThemingConfig {
  breakpoints?: Record<string, string | { value: string }>;
  tokens?: TokenDefinition;
  semanticTokens?: SemanticTokenDefinition;
  recipes?: Record<string, RecipeDefinition>;
  slotRecipes?: Record<string, SlotRecipeDefinition>;
}

export interface SystemConfig {
  cssVarsRoot?: string;
  cssVarsPrefix?: string;
  globalCss?: GlobalCss;
  disableLayers?: boolean;
  layers?: readonly string[];
  theme?: ThemingConfig;
  utilities?: UtilityConfig;
  conditions?: Record<string, string>;
  preflight?: boolean | Record<string, SystemStyleObject>;
}

type BooleanVariant<T> = T extends 'true' | 'false' ? boolean : T;

export type RecipeVariantProps<T extends RecipeDefinition> = {
  [K in keyof NonNullable<T['variants']>]?: ConditionalValue<
    BooleanVariant<keyof NonNullable<T['variants']>[K] & string>
  >;
};

export type SlotRecipeVariantProps<T extends SlotRecipeDefinition> = {
  [K in keyof NonNullable<T['variants']>]?: ConditionalValue<
    BooleanVariant<keyof NonNullable<T['variants']>[K] & string>
  >;
};

export interface CssFn {
  (...styles: SystemStyleObjectInput[]): Record<string, unknown>;
}

type SplitVariantPropsResult<TProps extends object, T extends TProps> = [
  keyof TProps,
] extends [never]
  ? [Record<string, unknown>, Record<string, unknown>]
  : [Pick<T, Extract<keyof T, keyof TProps>>, Omit<T, keyof TProps>];

export interface CvaFn<TProps extends object = object> {
  (props?: TProps): Record<string, unknown>;
  readonly className?: string;
  readonly variantMap: Record<string, readonly string[]>;
  readonly variantKeys: readonly string[];
  splitVariantProps<T extends TProps>(
    props: T,
  ): SplitVariantPropsResult<TProps, T>;
}

export interface SvaFn<TProps extends object = object> {
  (props?: TProps): Record<string, Record<string, unknown>>;
  readonly className?: string;
  readonly variantMap: Record<string, readonly string[]>;
  readonly variantKeys: readonly string[];
  readonly slots: readonly string[];
  splitVariantProps<T extends TProps>(
    props: T,
  ): SplitVariantPropsResult<TProps, T>;
}
