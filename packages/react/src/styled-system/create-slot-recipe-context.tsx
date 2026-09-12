'use client'

import * as React from 'react'
import type { SlotRecipeDefinition, SvaFn } from './types'
import type {
  JsxFactoryOptions,
  MystiqueComponent,
  SlotRecipeSelection,
} from './factory.types'
import { MYSTIQUE_RESOLVED_STYLES_PROP, mystique } from './factory'
import { useMystiqueContext } from './provider'
import type {
  SlotRecipeName,
  SlotRecipeTypegenProps,
  SlotRecipeTypegenSlots,
} from './typegen'

type AnyProps = Record<string, unknown>
type SlotStyles = Record<string, Record<string, unknown>>

export type SlotRecipeKey = SlotRecipeName

export interface SlotRecipeContextOptions<
  K extends SlotRecipeKey = SlotRecipeKey,
  R extends SlotRecipeDefinition | undefined = undefined,
> {
  key?: K
  recipe?: R
}

export type SlotRecipeContextProps<
  K extends SlotRecipeKey,
  R extends SlotRecipeDefinition | undefined,
> = R extends SlotRecipeDefinition
  ? SlotRecipeSelection<R>
  : SlotRecipeTypegenProps<K>

export type SlotRecipeContextSlot<
  K extends SlotRecipeKey,
  R extends SlotRecipeDefinition | undefined,
> = R extends SlotRecipeDefinition
  ? R['slots'][number]
  : SlotRecipeTypegenSlots<K>

interface WrapElementProps<P> {
  wrapElement?(element: React.ReactElement, props: P): React.ReactElement
}

export interface WithRootProviderOptions<P extends object>
  extends WrapElementProps<P> {
  defaultProps?: Partial<P>
  displayName?: string
}

export interface WithProviderOptions<P extends object>
  extends JsxFactoryOptions<P>, WrapElementProps<P> {}

export type WithContextOptions<P extends object> = JsxFactoryOptions<P>

function isSvaFn(value: unknown): value is SvaFn {
  return (
    typeof value === 'function' &&
    Array.isArray((value as SvaFn).variantKeys) &&
    Array.isArray((value as SvaFn).slots) &&
    typeof (value as SvaFn).splitVariantProps === 'function'
  )
}

function joinClassNames(...values: unknown[]): string | undefined {
  const result = values
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')
  return result || undefined
}

function mergeContextProps(
  ...sources: Array<AnyProps | undefined>
): AnyProps {
  const result: AnyProps = {}
  for (const source of sources) {
    if (!source) continue
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue
      const previous = result[key]
      if (
        /^on[A-Z]/.test(key) &&
        typeof previous === 'function' &&
        typeof value === 'function'
      ) {
        result[key] = (...args: unknown[]) => {
          previous(...args)
          value(...args)
        }
      } else if (key === 'className') {
        result[key] = joinClassNames(previous, value)
      } else if (key === 'style') {
        result[key] = {
          ...(typeof previous === 'object' && previous !== null ? previous : {}),
          ...(typeof value === 'object' && value !== null ? value : {}),
        }
      } else {
        result[key] = value
      }
    }
  }
  return result
}

function upperFirst(value: string): string {
  return value ? `${value[0]?.toUpperCase()}${value.slice(1)}` : 'Component'
}

export function createSlotRecipeContext<
  const K extends SlotRecipeKey = SlotRecipeKey,
  const R extends SlotRecipeDefinition | undefined = undefined,
>(
  options: SlotRecipeContextOptions<K, R>,
) {
  const contextName = upperFirst(
    options.key ?? options.recipe?.className ?? 'Component',
  )
  const StylesContext = React.createContext<SlotStyles | undefined>(undefined)
  const ClassNamesContext = React.createContext<Record<string, string>>({})
  const PropsContext = React.createContext<AnyProps>({})
  StylesContext.displayName = `${contextName}StylesContext`
  ClassNamesContext.displayName = `${contextName}ClassNamesContext`
  PropsContext.displayName = `${contextName}PropsContext`

  function useStyles(): SlotStyles {
    const styles = React.useContext(StylesContext)
    if (styles === undefined) {
      throw new Error(
        `[mystique > slot recipe] use${contextName}Styles must be used within the recipe root.`,
      )
    }
    return styles
  }

  function useClassNames(): Record<string, string> {
    return React.useContext(ClassNamesContext)
  }

  function usePropsContext(): AnyProps {
    return React.useContext(PropsContext)
  }

  function useRecipeResult(inputProps: AnyProps) {
    const system = useMystiqueContext()
    const { recipe: recipeOverride, unstyled, ...restProps } = inputProps
    const recipe = React.useMemo(() => {
      if (isSvaFn(recipeOverride)) return recipeOverride
      if (recipeOverride && typeof recipeOverride === 'object') {
        return system.sva(recipeOverride as SlotRecipeDefinition)
      }
      if (options.recipe) return system.sva(options.recipe)
      if (options.key) {
        return system.getSlotRecipeFn(options.key) ?? system.sva({ slots: [] })
      }
      return system.sva({ slots: [] })
    }, [recipeOverride, system])
    const runtimeRecipe = recipe as unknown as SvaFn
    const [variantProps, otherProps] = React.useMemo(
      () => runtimeRecipe.splitVariantProps(restProps),
      [runtimeRecipe, restProps],
    )
    const styles = unstyled ? {} : runtimeRecipe(variantProps)
    const classNames = runtimeRecipe.className
      ? Object.fromEntries(
          runtimeRecipe.slots.map((slot) => [slot, `${runtimeRecipe.className}__${slot}`]),
        )
      : {}

    return {
      classNames,
      props: otherProps as AnyProps,
      styles,
    }
  }

  function withRootProvider<P extends object = SlotRecipeContextProps<K, R>>(
    Component: React.ElementType,
    rootOptions: WithRootProviderOptions<P> = {},
  ): React.FC<React.PropsWithoutRef<P>> {
    const RootProvider = (inputProps: React.PropsWithoutRef<P>) => {
      const propsContext = usePropsContext()
      const props = React.useMemo(
        () => mergeContextProps(
          rootOptions.defaultProps as AnyProps | undefined,
          propsContext,
          inputProps as AnyProps,
        ),
        [inputProps, propsContext],
      )
      const result = useRecipeResult(props)
      const element = (
        <StylesContext.Provider value={result.styles}>
          <ClassNamesContext.Provider value={result.classNames}>
            <Component {...result.props} />
          </ClassNamesContext.Provider>
        </StylesContext.Provider>
      )
      return rootOptions.wrapElement?.(element, props as P) ?? element
    }
    RootProvider.displayName =
      rootOptions.displayName ?? `${contextName}RootProvider`
    return RootProvider
  }

  const withProvider = <T extends React.ElementType, P extends object = SlotRecipeContextProps<K, R>>(
    Component: T,
    slot: SlotRecipeContextSlot<K, R>,
    providerOptions: WithProviderOptions<P> = {},
  ): MystiqueComponent<T, P> => {
    const {
      defaultProps,
      displayName,
      wrapElement,
      ...factoryOptions
    } = providerOptions
    const SuperComponent = mystique(
      Component,
      {},
      factoryOptions as JsxFactoryOptions,
    ) as React.ElementType
    const SlotProvider = React.forwardRef<React.ComponentRef<T>, P>((inputProps, ref) => {
      const propsContext = usePropsContext()
      const props = React.useMemo(
        () => mergeContextProps(
          defaultProps as AnyProps | undefined,
          propsContext,
          inputProps as AnyProps,
        ),
        [inputProps, propsContext],
      )
      const result = useRecipeResult(props)
      const {
        className,
        css: cssProp,
        ...localProps
      } = result.props
      const element = (
        <StylesContext.Provider value={result.styles}>
          <ClassNamesContext.Provider value={result.classNames}>
            <SuperComponent
              {...localProps}
              {...{ [MYSTIQUE_RESOLVED_STYLES_PROP]: result.styles[slot] }}
              ref={ref}
              css={cssProp}
              className={joinClassNames(className, result.classNames[slot])}
            />
          </ClassNamesContext.Provider>
        </StylesContext.Provider>
      )
      return wrapElement?.(element, props as P) ?? element
    })
    SlotProvider.displayName = displayName ?? `${contextName}${upperFirst(slot)}`
    return SlotProvider as unknown as MystiqueComponent<T, P>
  }

  const withContext = <T extends React.ElementType, P extends object = SlotRecipeContextProps<K, R>>(
    Component: T,
    slot?: SlotRecipeContextSlot<K, R>,
    contextOptions: WithContextOptions<P> = {},
  ): MystiqueComponent<T, P> => {
    const SuperComponent = mystique(
      Component,
      {},
      contextOptions as JsxFactoryOptions,
    ) as React.ElementType
    const SlotContext = React.forwardRef<React.ComponentRef<T>, P>((inputProps, ref) => {
      const styles = useStyles()
      const classNames = useClassNames()
      const {
        className,
        css: cssProp,
        unstyled,
        ...localProps
      } = inputProps as AnyProps
      return (
        <SuperComponent
          {...localProps}
          {...{
            [MYSTIQUE_RESOLVED_STYLES_PROP]:
              unstyled || !slot ? undefined : styles[slot],
          }}
          ref={ref}
          css={cssProp}
          className={joinClassNames(className, slot ? classNames[slot] : undefined)}
        />
      )
    })
    SlotContext.displayName =
      contextOptions.displayName ??
      (slot ? `${contextName}${upperFirst(slot)}` : contextName)
    return SlotContext as unknown as MystiqueComponent<T, P>
  }

  return {
    ClassNamesProvider: ClassNamesContext.Provider,
    PropsProvider: PropsContext.Provider,
    StylesProvider: StylesContext.Provider,
    useClassNames,
    usePropsContext,
    useRecipeResult,
    useStyles,
    withContext,
    withProvider,
    withRootProvider,
  }
}
