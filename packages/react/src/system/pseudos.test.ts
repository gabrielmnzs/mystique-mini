import { describe, expect, it } from 'vitest'
import { defaultTheme } from '../theme'
import { resolveStyles } from './style-resolver'

describe('pseudo styles', () => {
  it('maps supported pseudos and resolves responsive values', () => {
    expect(resolveStyles({ _hover: { color: ['red', 'blue'], _focus: { color: 'bad' } }, _disabled: { opacity: 0.5 } } as never, defaultTheme)).toEqual({
      '&:hover': { color: 'red', '@media screen and (min-width: 30em)': { color: 'blue' } },
      '&:disabled, &[disabled], &[aria-disabled=true], &[data-disabled=true]': { opacity: 0.5 },
    })
  })
})
