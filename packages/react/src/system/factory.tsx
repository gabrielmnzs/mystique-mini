import React, { forwardRef, type ElementType, type ComponentPropsWithRef, type ForwardedRef, type ReactElement } from 'react'
import styled from '@emotion/styled'
import { defaultTheme, type RecipeStyleObject, type Theme } from '../theme'
import type { CSSObject } from '@emotion/react'
import { resolveComponentStyles } from './style-resolver'
import { filterProps } from './should-forward-prop'
import { useMystiqueTheme } from './provider'
import type { MystiqueStyleProps } from './types'

export interface MystiqueOptions {
  baseStyle?: RecipeStyleObject
  themeKey?: string
}

type OwnProps = MystiqueStyleProps
type ValidTarget<C extends ElementType> = C
type NoInferTarget<T> = [T][T extends unknown ? 0 : never]
export type PolymorphicProps<C extends ElementType, Props extends object = OwnProps> =
  Props & { as?: C } & Omit<ComponentPropsWithRef<NoInferTarget<C>>, keyof Props | 'as' | 'size'> & { htmlSize?: number | string }

export type MystiqueComponent<C extends ElementType> = <T extends ElementType = C>(
  props: PolymorphicProps<ValidTarget<T>>,
) => ReactElement | null

type RuntimeProps = Record<string, unknown> & { as?: ElementType; htmlSize?: number | string; theme?: Theme; ref?: ForwardedRef<unknown> }

function renderTarget(base: ElementType, props: RuntimeProps, ref: ForwardedRef<unknown>) {
  const target = props.as ?? base
  const forwarded = filterProps({ ...props, ref }, target)
  delete forwarded.as
  delete forwarded.ref
  delete forwarded.theme
  if (props.htmlSize !== undefined && typeof target === 'string') (forwarded as Record<string, unknown>).size = props.htmlSize
  return React.createElement(target, { ...forwarded, ref })
}

export function mystique<C extends ElementType>(component: C, options: MystiqueOptions = {}): MystiqueComponent<C> {
  const Base = forwardRef<unknown, RuntimeProps>((props, ref) => renderTarget(component, props, ref))
  const Styled = styled(Base, {
    // The final target, rather than the factory target, performs DOM filtering.
    shouldForwardProp: () => true,
  })((props: RuntimeProps) => {
    const theme = props.theme ?? defaultTheme
    const componentTheme = options.themeKey ? theme.components[options.themeKey] ?? {} : {}
    return resolveComponentStyles({ theme, component: componentTheme, factoryBaseStyle: options.baseStyle, props }).styles as CSSObject
  })
  return forwardRef((props: RuntimeProps, ref: ForwardedRef<unknown>) => <Styled {...props} ref={ref} />) as MystiqueComponent<C>
}
