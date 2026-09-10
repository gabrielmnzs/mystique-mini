import { createSizedComponent } from '../sized-component'

export const Circle = createSizedComponent('Circle', {
  themeKey: 'Circle',
  baseStyle: { display: 'flex', align: 'center', justify: 'center', rounded: 'full' },
})
