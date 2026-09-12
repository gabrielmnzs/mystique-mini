import { createSizedComponent } from '../sized-component'
import type { ConditionalValue, CssValue } from '../../styled-system/types'

export type SquareProps = { size?: ConditionalValue<CssValue> }

export const Square = createSizedComponent('Square', {
  className: 'mystique-square',
  base: { display: 'flex', align: 'center', justify: 'center' },
})
