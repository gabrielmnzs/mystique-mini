import styled from '@emotion/styled'
import { forwardRef, useMemo, type ComponentPropsWithoutRef, type ComponentPropsWithRef, type ElementType, type ReactElement } from 'react'
import { useMystiqueTheme } from './provider'
import { shouldForwardProp } from './should-forward-prop'
import { resolveComponentStyles } from './style-resolver'
import type { RecipeStyleObject, Theme } from '../theme'
import type { MystiqueStyleProps } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface MystiqueOptions {
  themeKey?: string
  baseStyle?: RecipeStyleObject
}

type PropsOf<T extends ElementType> = ComponentPropsWithoutRef<T>
export type PolymorphicProps<T extends ElementType> = MystiqueStyleProps & Omit<PropsOf<T>, keyof MystiqueStyleProps | 'size'> & { as?: T; htmlSize?: number | string }
export type MystiqueComponent<T extends ElementType = ElementType> = <E extends ElementType = T>(props: PolymorphicProps<E> & { ref?: ComponentPropsWithRef<E>['ref'] }) => ReactElement | null

export function mystique<T extends ElementType>(component: T, options: MystiqueOptions = {}): MystiqueComponent<T> {
  // The assertion is contained at the React 19 forwardRef boundary; the public callable remains polymorphic.
  const Component = forwardRef(function MystiqueComponent(inputProps: any, ref: any) {
    const { as, htmlSize, ...incoming } = inputProps
    const theme = useMystiqueTheme()
    const finalTarget = (as ?? component) as ElementType
    const StyledTarget = useMemo(() => (styled as any)(finalTarget, { shouldForwardProp: (prop: string) => shouldForwardProp(prop, finalTarget) })((props: Record<string, unknown>) => {
      const emotionTheme = props.theme as Theme | undefined
      const themeKey = options.themeKey
      const resolved = resolveComponentStyles({ theme: emotionTheme?.breakpoints ? emotionTheme : theme, component: themeKey ? (theme.components[themeKey] ?? {}) : {}, factoryBaseStyle: options.baseStyle, props: props as MystiqueStyleProps & Record<string, unknown> })
      return resolved.styles
    }), [finalTarget, theme])
    const props = { ...incoming, ...(htmlSize === undefined ? {} : { size: htmlSize }), ref }
    return <StyledTarget {...props} />
  } as any)
  return Component as unknown as MystiqueComponent<T>
}
