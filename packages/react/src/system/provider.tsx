import React, { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Global, ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { defaultTheme, mergeTheme, type DeepPartial, type Theme } from '../theme'

const ThemeContext = createContext<Theme>(defaultTheme)

export interface MystiqueProviderProps {
  theme?: DeepPartial<Theme>
  resetCSS?: boolean
  children?: ReactNode
}

export function MystiqueProvider({ theme, resetCSS = true, children }: MystiqueProviderProps) {
  const parent = useContext(ThemeContext)
  const value = useMemo(() => mergeTheme(parent, theme), [parent, theme])
  return (
    <EmotionThemeProvider theme={value}>
      <ThemeContext.Provider value={value}>
        {resetCSS && <Global styles={{
          '*, *::before, *::after': { boxSizing: 'border-box' },
          body: { margin: 0, fontFamily: 'inherit', color: 'inherit', backgroundColor: 'inherit' },
          'button, input, optgroup, select, textarea': { font: 'inherit', color: 'inherit' },
          'img, svg, video, canvas, audio, iframe, embed, object': { display: 'block', maxWidth: '100%' },
        }} />}
        {children}
      </ThemeContext.Provider>
    </EmotionThemeProvider>
  )
}

export function useMystiqueTheme(): Theme {
  return useContext(ThemeContext)
}
