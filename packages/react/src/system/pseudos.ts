import type { Theme } from '../theme'
import { isStyleProp } from './style-config'
import type { PseudoProps, StyleProps } from './types'

export const pseudoSelectors: Record<keyof PseudoProps, string> = {
  _hover: '&:hover', _focus: '&:focus, &[data-focus=true]', _active: '&:active, &[data-active=true]', _disabled: '&:disabled, &[disabled], &[aria-disabled=true], &[data-disabled=true]', _placeholder: '&::placeholder',
}

export function pseudoEntries(props: PseudoProps, theme: Theme, resolve: (props: StyleProps, theme: Theme) => Record<string, unknown>) {
  const output: Record<string, unknown> = {}
  for (const [name, selector] of Object.entries(pseudoSelectors)) {
    const value = props[name as keyof PseudoProps]
    if (!value || typeof value !== 'object') continue
    const styles: StyleProps = {}
    for (const [key, item] of Object.entries(value)) if (isStyleProp(key)) (styles as Record<string, unknown>)[key] = item
    output[selector] = resolve(styles, theme)
  }
  return output
}
