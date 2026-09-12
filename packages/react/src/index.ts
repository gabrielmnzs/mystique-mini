'use client'

export { Box, Center, Circle, Flex, Span, Square, Text } from './components'
export type { CircleProps, SquareProps, TextProps } from './components'
export { mystique } from './styled-system/factory'
export type {
  Assign,
  HTMLMystiqueProps,
  HtmlProps,
  JsxFactory,
  JsxFactoryOptions,
  JsxHtmlProps,
  JsxStyleProps,
  MystiqueComponent,
  PolymorphicProps,
  RecipeInput,
  RecipeSelection,
  SlotRecipeSelection,
  StyledFactoryFn,
  UnstyledProp,
} from './styled-system/factory.types'
export {
  MYSTIQUE_CACHE_KEY,
  MystiqueProvider,
  useMystiqueContext,
} from './styled-system/provider'
export { useMystiqueContext as useSystemContext } from './styled-system/provider'
export type { MystiqueProviderProps } from './styled-system/provider'
export { createRecipeContext } from './styled-system/create-recipe-context'
export type { RecipeContextProps } from './styled-system/create-recipe-context'
export { createSlotRecipeContext } from './styled-system/create-slot-recipe-context'
export type {
  SlotRecipeContextProps,
  SlotRecipeContextSlot,
} from './styled-system/create-slot-recipe-context'
export {
  defineConfig,
  defineGlobalStyles,
  defineRecipe,
  defineSemanticTokens,
  defineSlotRecipe,
  defineTokens,
  defineUtility,
} from './styled-system/config'
export type { SystemConfig, ThemingConfig } from './styled-system/config'
export { mergeConfigs } from './styled-system/merge-config'
export type { MergeConfigs } from './styled-system/merge-config'
export { createSystem } from './styled-system/system'
export type { SystemContext, SystemQuery } from './styled-system/system'
export { defaultBaseConfig } from './styled-system/preset-base'
export {
  defaultConfig,
  defaultSystem,
  defaultThemeConfig,
  system,
} from './styled-system/preset'
export { defaultSystem as defaultMystiqueSystem } from './styled-system/preset'
export { generateTypegen } from './styled-system/typegen'
export type {
  ConditionName,
  MystiqueTypegen,
  RecipeName,
  RecipeTypegenProps,
  SlotRecipeName,
  SlotRecipeTypegenProps,
  SlotRecipeTypegenSlots,
  TokenName,
  TypegenOptions,
  UtilityName,
} from './styled-system/typegen'
export type {
  ConditionalValue,
  ConditionProperties,
  CssValue,
  CvaFn,
  GlobalAtRuleObject,
  GlobalCss,
  RecipeDefinition,
  RecipeVariantProps,
  SlotRecipeDefinition,
  SlotRecipeVariantProps,
  SvaFn,
  SystemProperties,
  SystemStyleObject,
  SystemStyleObjectInput,
  UtilityConfig,
  UtilityDefinition,
} from './styled-system/types'

import { defaultSystem } from './styled-system/preset'

export const css = defaultSystem.css
export const cva = defaultSystem.cva
export const sva = defaultSystem.sva
