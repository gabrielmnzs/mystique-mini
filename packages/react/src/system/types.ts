import type { ComponentThemeConfig, SystemStyleObject, Theme } from '../theme'

export type CSSValue = string | number
export type ResponsiveValue<T> = T | readonly (T | null | undefined)[] | { readonly base?: T | null; readonly [breakpoint: string]: T | null | undefined }

export interface StyleProps {
  [property: string]: unknown
  m?: ResponsiveValue<CSSValue>; mt?: ResponsiveValue<CSSValue>; mr?: ResponsiveValue<CSSValue>; mb?: ResponsiveValue<CSSValue>; ml?: ResponsiveValue<CSSValue>; mx?: ResponsiveValue<CSSValue>; my?: ResponsiveValue<CSSValue>
  p?: ResponsiveValue<CSSValue>; pt?: ResponsiveValue<CSSValue>; pr?: ResponsiveValue<CSSValue>; pb?: ResponsiveValue<CSSValue>; pl?: ResponsiveValue<CSSValue>; px?: ResponsiveValue<CSSValue>; py?: ResponsiveValue<CSSValue>
  w?: ResponsiveValue<CSSValue>; h?: ResponsiveValue<CSSValue>; minW?: ResponsiveValue<CSSValue>; maxW?: ResponsiveValue<CSSValue>; minH?: ResponsiveValue<CSSValue>; maxH?: ResponsiveValue<CSSValue>; boxSize?: ResponsiveValue<CSSValue>
  display?: ResponsiveValue<CSSValue>; position?: ResponsiveValue<CSSValue>; top?: ResponsiveValue<CSSValue>; right?: ResponsiveValue<CSSValue>; bottom?: ResponsiveValue<CSSValue>; left?: ResponsiveValue<CSSValue>; overflow?: ResponsiveValue<CSSValue>; overflowX?: ResponsiveValue<CSSValue>; overflowY?: ResponsiveValue<CSSValue>; zIndex?: ResponsiveValue<CSSValue>
  align?: ResponsiveValue<CSSValue>; justify?: ResponsiveValue<CSSValue>; direction?: ResponsiveValue<CSSValue>; wrap?: ResponsiveValue<CSSValue>; flex?: ResponsiveValue<CSSValue>; basis?: ResponsiveValue<CSSValue>; grow?: ResponsiveValue<CSSValue>; shrink?: ResponsiveValue<CSSValue>; gap?: ResponsiveValue<CSSValue>; rowGap?: ResponsiveValue<CSSValue>; columnGap?: ResponsiveValue<CSSValue>
  fontFamily?: ResponsiveValue<CSSValue>; fontSize?: ResponsiveValue<CSSValue>; fontWeight?: ResponsiveValue<CSSValue>; lineHeight?: ResponsiveValue<CSSValue>; letterSpacing?: ResponsiveValue<CSSValue>; textAlign?: ResponsiveValue<CSSValue>; textTransform?: ResponsiveValue<CSSValue>; whiteSpace?: ResponsiveValue<CSSValue>
  color?: ResponsiveValue<CSSValue>; bg?: ResponsiveValue<CSSValue>; bgColor?: ResponsiveValue<CSSValue>; opacity?: ResponsiveValue<CSSValue>
  border?: ResponsiveValue<CSSValue>; borderWidth?: ResponsiveValue<CSSValue>; borderStyle?: ResponsiveValue<CSSValue>; borderColor?: ResponsiveValue<CSSValue>; rounded?: ResponsiveValue<CSSValue>; borderRadius?: ResponsiveValue<CSSValue>
  shadow?: ResponsiveValue<CSSValue>; boxShadow?: ResponsiveValue<CSSValue>; cursor?: ResponsiveValue<CSSValue>; transform?: ResponsiveValue<CSSValue>; transition?: ResponsiveValue<CSSValue>
}

export interface PseudoProps {
  _hover?: StyleProps
  _focus?: StyleProps
  _active?: StyleProps
  _disabled?: StyleProps
  _placeholder?: StyleProps
}

export type MystiqueStyleProps = StyleProps & PseudoProps & {
  variant?: string
  recipeSize?: string
  htmlSize?: number | string
  theme?: Theme
  as?: unknown
}

export type StyleConfig = SystemStyleObject
export type StyleConfigValue = StyleConfig | undefined
export type ComponentStyleConfig = ComponentThemeConfig
export interface ResolvedStyle { [property: string]: CSSValue | ResolvedStyle }
