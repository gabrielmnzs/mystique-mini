import { Global, ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { defaultTheme, mergeTheme, type DeepPartial, type Theme } from '../theme'
import { resetStyles } from './reset'

const ThemeContext = createContext<Theme>(defaultTheme)
const ProviderContext = createContext(false)

export interface MystiqueProviderProps {
  theme?: DeepPartial<Theme> | Theme
  resetCSS?: boolean
  children?: ReactNode
}

export function MystiqueProvider({ theme, resetCSS = true, children }: MystiqueProviderProps) {
  const parent = useContext(ThemeContext)
  const hasParentProvider = useContext(ProviderContext)
  const resolved = useMemo(() => theme === undefined ? parent : mergeTheme(parent, theme), [parent, theme])
  const isOuterProvider = !hasParentProvider
  return <ProviderContext.Provider value><ThemeContext.Provider value={resolved}><EmotionThemeProvider theme={resolved}>{resetCSS && isOuterProvider && <Global styles={resetStyles(resolved)} />}{children}</EmotionThemeProvider></ThemeContext.Provider></ProviderContext.Provider>
}

export function useMystiqueTheme(): Theme {
  return useContext(ThemeContext)
}
