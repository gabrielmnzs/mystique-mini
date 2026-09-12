'use client'

import { forwardRef } from 'react'
import type { ComponentPropsWithRef, ComponentType, ElementType } from 'react'
import { mystique } from '../styled-system/factory'
import type { MystiqueComponent } from '../styled-system/factory.types'
import type { ConditionalValue, CssValue, RecipeDefinition } from '../styled-system/types'

type SizedProps = { size?: ConditionalValue<CssValue> }

export function createSizedComponent(
  componentName: string,
  recipe: RecipeDefinition,
): MystiqueComponent<'div', SizedProps> {
  const Base = mystique('div', recipe)
  const BaseImpl = Base as ComponentType<Record<string, unknown>>
  const Component = forwardRef(function SizedComponent(
    inputProps: SizedProps & { as?: ElementType } & Record<string, unknown>,
    ref: ComponentPropsWithRef<'div'>['ref'],
  ) {
    const { size, as, ...props } = inputProps
    const mapped = size === undefined ? props : { ...props, boxSize: size }
    return <BaseImpl {...mapped} {...(as === undefined ? {} : { as })} ref={ref} />
  })

  Component.displayName = componentName
  // The assertion is contained at the shared React 19 forwardRef boundary.
  return Component as unknown as MystiqueComponent<'div', SizedProps>
}
