import {
  extendTheme,
  type ComponentThemeConfig,
  type MystiqueStyleProps,
  type PseudoProps,
  type RecipeDefaultProps,
  type RecipeStyleObject,
  type SquareProps,
  type CircleProps,
  type StyleProps,
} from '@gabrielmnzs/mystique-react'

const styles: StyleProps = { mx: 4, color: { base: 'red', md: 'blue' } }
const pseudos: PseudoProps = { _hover: { color: 'white' } }
const controls: RecipeDefaultProps = { recipeSize: 'sm', variant: 'solid', ml: 2 }
const recipeStyle: RecipeStyleObject = { ...styles, ...pseudos }
const recipe: ComponentThemeConfig = {
  baseStyle: recipeStyle,
  defaultProps: controls,
}
const props: MystiqueStyleProps = { ...styles, ...pseudos, recipeSize: 'sm' }
const square: SquareProps = { size: { base: 2, md: 4 } }
const circle: CircleProps = { size: 'sm' }
const theme = extendTheme({ components: { Button: recipe } })
void [props, square, circle]
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
