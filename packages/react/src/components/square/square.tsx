import { forwardRef } from 'react'
import type { ComponentPropsWithRef, ElementType } from 'react'
import { mystique, type MystiqueComponent } from '../../system/factory'
import type { CSSValue, ResponsiveValue } from '../../system/types'

type SquareProps = { size?: ResponsiveValue<CSSValue> }
const SquareBase = mystique('div', { themeKey: 'Square', baseStyle: { display: 'flex', align: 'center', justify: 'center' } })

const SquareImpl = forwardRef(function Square(inputProps: SquareProps & { as?: ElementType } & Record<string, unknown>, ref: ComponentPropsWithRef<'div'>['ref']) {
  const { size, as, ...props } = inputProps
  const mapped = size === undefined ? props : { ...props, boxSize: size }
  return as === undefined ? <SquareBase {...mapped} ref={ref} /> : <SquareBase {...mapped} as={as} ref={ref} />
})

export const Square = SquareImpl as unknown as MystiqueComponent<'div', SquareProps>
