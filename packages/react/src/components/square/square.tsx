import { createSizedComponent } from '../sized-component'

export const Square = createSizedComponent('Square', {
  themeKey: 'Square',
  baseStyle: { display: 'flex', align: 'center', justify: 'center' },
})
