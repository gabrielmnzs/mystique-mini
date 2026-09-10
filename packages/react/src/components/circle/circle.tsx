import { forwardRef } from 'react'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { mystique, type MystiqueComponent } from '../../system/factory'
import type { CSSValue, ResponsiveValue } from '../../system/types'

type CircleProps = { size?: ResponsiveValue<CSSValue> }
const CircleBase = mystique('div', { themeKey: 'Circle', baseStyle: { display: 'flex', align: 'center', justify: 'center', rounded: 'full' } })

const CircleImpl = forwardRef(function Circle(inputProps: CircleProps & { as?: ElementType } & Record<string, unknown>, ref: ComponentPropsWithRef<'div'>['ref']) {
  const { size, as, ...props } = inputProps
  const mapped = size === undefined ? props : { ...props, boxSize: size }
  return as === undefined ? <CircleBase {...mapped} ref={ref} /> : <CircleBase {...mapped} as={as} ref={ref} />
})

export const Circle = CircleImpl as unknown as MystiqueComponent<'div', CircleProps>
