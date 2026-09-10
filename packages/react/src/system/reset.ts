import type { GlobalProps } from '@emotion/react'

export const resetStyles: GlobalProps['styles'] = {
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: { lineHeight: 1.5 },
  body: { margin: 0 },
}
