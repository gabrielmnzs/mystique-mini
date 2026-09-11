import { createSizedComponent } from '../sized-component'
import type { CSSValue, ResponsiveValue } from '../../system/types'

export type CircleProps = { size?: ResponsiveValue<CSSValue> }

export const Circle = createSizedComponent('Circle', {
  themeKey: 'Circle',
  baseStyle: { display: 'flex', align: 'center', justify: 'center', rounded: 'full' },
})
