import {
  extendTheme,
  type ComponentStyleConfig,
  type ComponentThemeConfig,
  type MystiqueStyleProps,
  type PseudoProps,
  type RecipeDefaultProps,
  type RecipeStyleObject,
  type StyleProps,
} from '@gabrielmnzs/mystique-react'

const styles: StyleProps = { mx: 4, color: { base: 'red', md: 'blue' } }
const pseudos: PseudoProps = { _hover: { color: 'white' } }
const controls: RecipeDefaultProps = { recipeSize: 'sm', variant: 'solid', ml: 2 }
const recipeStyle: RecipeStyleObject = { ...styles, ...pseudos }
const recipe: ComponentThemeConfig & ComponentStyleConfig = {
  baseStyle: recipeStyle,
  defaultProps: controls,
}
const props: MystiqueStyleProps = { ...styles, ...pseudos, recipeSize: 'sm' }
const theme = extendTheme({ components: { Button: recipe } })
void props
void theme

// @ts-expect-error recipe styles reject unknown CSS keys
const invalidStyle: RecipeStyleObject = { backgroundImage: 'url(x)' }
void invalidStyle

// @ts-expect-error controls reject polymorphic props
const invalidControls: RecipeDefaultProps = { as: 'div' }
void invalidControls

// @ts-expect-error component recipes reject unknown configuration keys
const invalidRecipe: ComponentThemeConfig = { defaultProps: { htmlSize: 2 } }
void invalidRecipe
