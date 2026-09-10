import { Global, ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { createContext, useContext, type ReactNode } from 'react'
import { defaultTheme, mergeTheme, type DeepPartial, type Theme } from '../theme'
import { resetStyles } from './reset'

const ThemeContext = createContext<Theme>(defaultTheme)

export interface MystiqueProviderProps {
  theme?: DeepPartial<Theme> | Theme
  resetCSS?: boolean
  children?: ReactNode
}

export function MystiqueProvider({ theme, resetCSS = true, children }: MystiqueProviderProps) {
  const parent = useContext(ThemeContext)
  const resolved = theme === undefined ? parent : mergeTheme(parent, theme)
  return <ThemeContext.Provider value={resolved}><EmotionThemeProvider theme={resolved}>{resetCSS && <Global styles={resetStyles} />}{children}</EmotionThemeProvider></ThemeContext.Provider>
}

export function useMystiqueTheme(): Theme {
  return useContext(ThemeContext)
}
