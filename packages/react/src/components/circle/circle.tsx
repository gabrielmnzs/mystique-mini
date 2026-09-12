import { createSizedComponent } from '../sized-component'
import type { ConditionalValue, CssValue } from '../../styled-system/types'

export type CircleProps = { size?: ConditionalValue<CssValue> }

export const Circle = createSizedComponent('Circle', {
  className: 'mystique-circle',
  base: { display: 'flex', align: 'center', justify: 'center', rounded: 'full' },
})
