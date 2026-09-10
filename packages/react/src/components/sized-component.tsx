import { forwardRef } from 'react'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { mystique, type MystiqueComponent } from '../system/factory'
import type { RecipeStyleObject } from '../theme'
import type { CSSValue, ResponsiveValue } from '../system/types'

type SizedProps = { size?: ResponsiveValue<CSSValue> }

export function createSizedComponent(
  componentName: string,
  options: { themeKey: string; baseStyle: RecipeStyleObject },
): MystiqueComponent<'div', SizedProps> {
  const Base = mystique('div', options)
  const Component = forwardRef(function SizedComponent(
    inputProps: SizedProps & { as?: ElementType } & Record<string, unknown>,
    ref: ComponentPropsWithRef<'div'>['ref'],
  ) {
    const { size, as, ...props } = inputProps
    const mapped = size === undefined ? props : { ...props, boxSize: size }
    return as === undefined ? <Base {...mapped} ref={ref} /> : <Base {...mapped} as={as} ref={ref} />
  })

  Component.displayName = componentName
  // The assertion is contained at the shared React 19 forwardRef boundary.
  return Component as unknown as MystiqueComponent<'div', SizedProps>
}
