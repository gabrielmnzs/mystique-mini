import type { GlobalProps } from '@emotion/react'
import type { Theme } from '../theme'

export function resetStyles(theme: Theme): GlobalProps['styles'] {
  return {
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: { lineHeight: 1.5 },
  'body, button, input, textarea, select': { font: 'inherit', color: 'inherit' },
  body: { margin: 0, fontFamily: (theme.fonts as Record<string, unknown>).body as string, color: theme.colors.gray[800], backgroundColor: theme.colors.white },
  'img, svg, video, canvas, audio, iframe, embed, object': { display: 'block', maxWidth: '100%' },
  }
}
