import { createElement, forwardRef, type ComponentPropsWithoutRef, type ComponentPropsWithRef, type ElementType, type ReactElement } from 'react'
import type React from 'react'
import { styled } from './emotion-interop'
import { useMystiqueTheme } from './provider'
import { filterProps } from './should-forward-prop'
import { resolveComponentStyles } from './style-resolver'
import type { RecipeStyleObject, Theme } from '../theme'
import type { MystiqueStyleProps } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MystiqueOptions {
  themeKey?: string
  baseStyle?: RecipeStyleObject
}

type PropsOf<T extends ElementType> = ComponentPropsWithoutRef<T>
type IntrinsicElement = keyof React.JSX.IntrinsicElements
type TargetProps<T extends ElementType, OwnProps extends object = object> = MystiqueStyleProps & OwnProps & Omit<PropsOf<T>, keyof MystiqueStyleProps | keyof OwnProps | (T extends IntrinsicElement ? 'size' : never)> & { htmlSize?: number | string }
export type PolymorphicProps<T extends ElementType, OwnProps extends object = object> = TargetProps<T, OwnProps> & { as?: T; ref?: ComponentPropsWithRef<T>['ref'] }

/**
 * The concrete overload is deliberately last: React's ComponentProps extracts
 * it as the default-target contract. The generic overload is only selected
 * when an `as` target is supplied, so it cannot widen default props (or ref)
 * to `any`.
 */
export interface MystiqueComponent<T extends ElementType = ElementType, OwnProps extends object = object> {
  <C extends ElementType>(props: TargetProps<C, OwnProps> & { as: C; ref?: ComponentPropsWithRef<C>['ref'] }): ReactElement | null
  (props: TargetProps<T, OwnProps> & { as?: never; ref?: ComponentPropsWithRef<T>['ref'] }): ReactElement | null
}

export function mystique<T extends ElementType>(component: T, options: MystiqueOptions = {}): MystiqueComponent<T> {
  const InternalRenderer = forwardRef(function InternalRenderer(inputProps: any, ref: any) {
    const { __mystiqueTarget: target, __mystiqueHtmlSize: htmlSize, __mystiqueTheme: _theme, ...incoming } = inputProps
    void _theme
    const props = { ...incoming, ...(htmlSize === undefined || typeof target !== 'string' ? {} : { size: htmlSize }), ref }
    return createElement(target, filterProps(props, target))
  })
  const StyledRenderer = (styled as any)(InternalRenderer, { shouldForwardProp: () => true })((props: Record<string, unknown>) => {
    const emotionTheme = props.__mystiqueTheme as Theme
    const themeKey = options.themeKey
    const resolved = resolveComponentStyles({ theme: emotionTheme, component: themeKey ? (emotionTheme.components[themeKey] ?? {}) : {}, factoryBaseStyle: options.baseStyle, props: props as MystiqueStyleProps & Record<string, unknown> })
    return resolved.styles
  })

  // The assertion is contained at the React 19 forwardRef boundary; the public callable remains polymorphic.
  const Component = forwardRef(function MystiqueComponent(inputProps: any, ref: any) {
    const { as, htmlSize, ...incoming } = inputProps
    const theme = useMystiqueTheme()
    const finalTarget = (as ?? component) as ElementType
    return <StyledRenderer {...incoming} __mystiqueTarget={finalTarget} __mystiqueHtmlSize={htmlSize} __mystiqueTheme={theme} ref={ref} />
  } as any)
  return Component as unknown as MystiqueComponent<T>
}
