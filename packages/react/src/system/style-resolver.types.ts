import type { MystiqueStyleProps } from './types'
import type { ComponentThemeConfig } from '../theme'

const valid: MystiqueStyleProps = { color: { base: 'red', custom: 'blue' }, _hover: { color: 'white' } }
void valid

// @ts-expect-error unknown style props are not part of the public contract
const unknownProp: MystiqueStyleProps = { colour: 'red' }
void unknownProp

// @ts-expect-error pseudo values cannot contain nested pseudos
const nestedPseudo: MystiqueStyleProps = { _hover: { _focus: { color: 'red' } } }
void nestedPseudo

const recipe: ComponentThemeConfig = {
  baseStyle: { color: 'red', _hover: { bg: 'blue.500' } },
  sizes: { sm: { p: 2 } },
  variants: { solid: { bg: 'blue.500' } },
  defaultProps: { variant: 'solid', recipeSize: 'sm', color: 'red' },
}
void recipe

// @ts-expect-error recipe style objects only accept finite Mystique props
const unsupportedRecipeKey: ComponentThemeConfig = { baseStyle: { backgroundImage: 'url(x)' } }
void unsupportedRecipeKey

// @ts-expect-error nested pseudo selectors are intentionally not recursive
const nestedRecipePseudo: ComponentThemeConfig = { variants: { bad: { _hover: { _focus: { color: 'red' } } } } }
void nestedRecipePseudo

// @ts-expect-error boolean style values are not CSS values
const booleanRecipeValue: ComponentThemeConfig = { baseStyle: { opacity: true } }
void booleanRecipeValue

// @ts-expect-error recipe controls cannot be embedded in style objects
const recipeControlInStyle: ComponentThemeConfig = { baseStyle: { variant: 'solid' } }
void recipeControlInStyle

// @ts-expect-error defaultProps only permits style props and variant/recipeSize
const invalidRecipeDefault: ComponentThemeConfig = { defaultProps: { as: 'div' } }
void invalidRecipeDefault
