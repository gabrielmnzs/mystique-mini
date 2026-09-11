import { createSizedComponent } from '../sized-component'
import type { CSSValue, ResponsiveValue } from '../../system/types'

export type SquareProps = { size?: ResponsiveValue<CSSValue> }

export const Square = createSizedComponent('Square', {
  themeKey: 'Square',
  baseStyle: { display: 'flex', align: 'center', justify: 'center' },
})
