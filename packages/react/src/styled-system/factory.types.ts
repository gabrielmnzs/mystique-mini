import type {
  ComponentPropsWithoutRef,
  ComponentRef,
  ElementType,
  JSX,
  ReactElement,
  Ref,
} from 'react'
import type {
  ConditionalValue,
  CvaFn,
  RecipeDefinition,
  SystemStyleObject,
  SystemStyleObjectInput,
} from './types'

export type Assign<T, U> = Omit<T, keyof U> & U

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

export interface UnstyledProp {
  unstyled?: boolean
}

interface PolymorphicOptions<T extends ElementType = ElementType> {
  as?: T
  asChild?: boolean
}

/**
 * Native attributes whose names overlap Mystique style props. The `html*`
 * escape hatches are converted back to their native names by the factory.
 */
export interface HtmlProps {
  htmlAlign?: string
  htmlAs?: string
  htmlBorder?: string | number
  htmlColor?: string
  htmlSize?: string | number
  htmlWidth?: string | number
  htmlHeight?: string | number
  htmlTranslate?: 'yes' | 'no'
  htmlContent?: string
  htmlWrap?: string
}

export type HtmlProp =
  | 'align'
  | 'as'
  | 'border'
  | 'color'
  | 'content'
  | 'height'
  | 'size'
  | 'transition'
  | 'translate'
  | 'width'
  | 'wrap'

export type PatchHtmlProps<T> = DistributiveOmit<T, HtmlProp> & HtmlProps

export type JsxStyleProps = SystemStyleObject & {
  css?: SystemStyleObjectInput
}

export type JsxHtmlProps<T extends object, P extends object = object> = Assign<
  PatchHtmlProps<T>,
  P
>

export type HTMLMystiqueProps<
  T extends ElementType,
  P extends object = object,
> = JsxHtmlProps<
  ComponentPropsWithoutRef<T>,
  Assign<JsxStyleProps, P> & PolymorphicOptions<T> & UnstyledProp
>

export type PolymorphicProps<
  T extends ElementType,
  P extends object = object,
> = HTMLMystiqueProps<T, P>

type AsChildMystiqueProps<
  T extends ElementType,
  P extends object,
> = Assign<
  Partial<PatchHtmlProps<ComponentPropsWithoutRef<T>>>,
  Assign<JsxStyleProps, P> & UnstyledProp
>

type BooleanVariant<T> = T extends 'true' | 'false' ? boolean : T

type VariantSelection<T> =
  T extends { variants: infer Variants extends Record<string, object> }
    ? {
        [K in keyof Variants]?: ConditionalValue<
          BooleanVariant<keyof Variants[K]>
        >
      }
    : object

export type RecipeSelection<T extends RecipeDefinition> = VariantSelection<T>

type ConditionalValueItem<T> = T extends readonly (infer Item)[]
  ? NonNullable<Item>
  : T extends Readonly<Record<string, infer Item>>
    ? NonNullable<Item>
    : NonNullable<T>

type MergeRecipeSelection<
  TBase extends object,
  TNext extends RecipeDefinition,
> = MergeVariantSelection<TBase, RecipeSelection<TNext>>

type MergeVariantSelection<
  TBase extends object,
  TNext extends object,
> = Omit<TBase, keyof TNext> & {
  [K in keyof TNext]: K extends keyof TBase
    ? ConditionalValue<
        ConditionalValueItem<TBase[K]> |
        ConditionalValueItem<TNext[K]>
      >
    : TNext[K]
}

export type SlotRecipeSelection<T extends import('./types').SlotRecipeDefinition> =
  VariantSelection<T>

export type RecipeInput = RecipeDefinition | CvaFn

export interface JsxFactoryOptions<TProps extends object = object> {
  defaultProps?: Partial<TProps>
  displayName?: string
  forwardProps?: readonly string[]
  /**
   * Runs after Mystique has removed recipe and style props. `target` is the
   * final `as`/`asChild` target, never merely the factory's original target.
   */
  shouldForwardProp?(
    prop: string,
    variantKeys: readonly string[],
    target: ElementType,
  ): boolean
}

export interface MystiqueComponent<
  TDefault extends ElementType,
  P extends object = object,
> {
  <TTarget extends ElementType>(
    props: Omit<HTMLMystiqueProps<TTarget, P>, 'asChild'> & {
      as: TTarget
      asChild?: false
      ref?: Ref<ComponentRef<TTarget>>
    },
  ): ReactElement | null
  (
    props: Omit<
      AsChildMystiqueProps<TDefault, P>,
      'children' | 'ref'
    > & {
      as?: never
      asChild: true
      children: ReactElement
      /** The child target determines this ref at runtime. */
      ref?: Ref<unknown>
    },
  ): ReactElement | null
  (
    props: Omit<HTMLMystiqueProps<TDefault, P>, 'as' | 'asChild'> & {
      as?: never
      asChild?: false
      ref?: Ref<ComponentRef<TDefault>>
    },
  ): ReactElement | null
  displayName?: string
  readonly __mystique_base?: TDefault
  readonly __mystique_recipe?: RecipeInput
}

export interface JsxFactory {
  <TDefault extends ElementType, PBase extends object>(
    component: MystiqueComponent<TDefault, PBase>,
  ): MystiqueComponent<TDefault, PBase>
  <
    TDefault extends ElementType,
    PBase extends object,
    PRecipe extends object,
  >(
    component: MystiqueComponent<TDefault, PBase>,
    recipe: CvaFn<PRecipe>,
    options?: JsxFactoryOptions<
      ComponentPropsWithoutRef<TDefault> & MergeVariantSelection<PBase, PRecipe>
    >,
  ): MystiqueComponent<TDefault, MergeVariantSelection<PBase, PRecipe>>
  <
    TDefault extends ElementType,
    PBase extends object,
    const R extends RecipeDefinition,
  >(
    component: MystiqueComponent<TDefault, PBase>,
    recipe: R,
    options?: JsxFactoryOptions<
      ComponentPropsWithoutRef<TDefault> & MergeRecipeSelection<PBase, R>
    >,
  ): MystiqueComponent<TDefault, MergeRecipeSelection<PBase, R>>
  <T extends ElementType>(component: T): MystiqueComponent<T>
  <T extends ElementType, PRecipe extends object>(
    component: T,
    recipe: CvaFn<PRecipe>,
    options?: JsxFactoryOptions<ComponentPropsWithoutRef<T> & PRecipe>,
  ): MystiqueComponent<T, PRecipe>
  <T extends ElementType, const R extends RecipeDefinition>(
    component: T,
    recipe: R,
    options?: JsxFactoryOptions<
      ComponentPropsWithoutRef<T> & RecipeSelection<R>
    >,
  ): MystiqueComponent<T, RecipeSelection<R>>
}

type JsxElements = {
  [K in keyof JSX.IntrinsicElements]: MystiqueComponent<K>
}

export type StyledFactoryFn = JsxFactory & JsxElements
