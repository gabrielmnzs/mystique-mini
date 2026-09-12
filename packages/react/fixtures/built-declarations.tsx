import {
  Box,
  Center,
  Circle,
  Flex,
  MystiqueProvider,
  Span,
  Square,
  Text,
  cva,
  createRecipeContext,
  createSlotRecipeContext,
  createSystem,
  defaultConfig,
  defineConfig,
  defineGlobalStyles,
  defineRecipe,
  mystique,
  type CircleProps,
  type ConditionalValue,
  type CssValue,
  type RecipeContextProps,
  type SquareProps,
  type SlotRecipeTypegenSlots,
  type SystemStyleObject,
  type TextProps,
} from '@gabrielmnzs/mystique-react'
import { createRef, type ComponentProps, type ComponentRef } from 'react'

declare module '@gabrielmnzs/mystique-react' {
  interface MystiqueTypegen {
    recipeNames: 'button' | 'text'
    recipes: {
      button: { tone: 'ghost' | 'solid' }
      text: { tone: 'body' | 'caption' }
    }
    slotRecipeSlots: {
      badge: 'root' | 'label'
      field: 'root' | 'label'
    }
  }
}

const customSystem = createSystem(defaultConfig, defineConfig({
  theme: { tokens: { colors: { brand: { value: '#9f3d2d' } } } },
}))
const responsiveSize: ConditionalValue<CssValue> = { base: 1, md: 2 }
const styles: SystemStyleObject = { p: responsiveSize, color: 'brand' }
const globalStyles = defineGlobalStyles({
  body: { color: 'brand', '& strong': { fontWeight: 700 } },
  '@media (prefers-contrast: more)': { body: { color: 'black' } },
})
defineGlobalStyles({
  body: {
    // @ts-expect-error built declarations reject misspelled global properties
    colro: 'red',
  },
})
const Anchor = mystique.a
const compiledRecipe = cva(defineRecipe({
  variants: {
    state: {
      true: { opacity: 1 },
      false: { opacity: 0.5 },
      auto: { opacity: 0.8 },
    },
  },
}))
const Compiled = mystique('div', compiledRecipe)
const valid = <MystiqueProvider value={customSystem}>
  <Box as="a" href="/box" ref={createRef<HTMLAnchorElement>()} />
  <Flex /><Center /><Span /><Text unstyled />
  <Square size={responsiveSize} />
  <Circle as="a" href="/circle" size="sm" ref={createRef<HTMLAnchorElement>()} />
  <Anchor href="/factory" />
  <Compiled state={{ base: true, md: 'auto' }} />
</MystiqueProvider>
const componentProps: ComponentProps<typeof Square> = { size: 2 }
const componentRef: ComponentRef<typeof Circle> = document.createElement('div')
const squareProps: SquareProps = { size: responsiveSize }
const circleProps: CircleProps = { size: 'sm' }
const fieldContext = createSlotRecipeContext({ key: 'field' })
const FieldRoot = fieldContext.withProvider('div', 'root')
const FieldLabel = fieldContext.withContext('span', 'label')
type FieldSlot = SlotRecipeTypegenSlots<'field'>
const validFieldSlot: FieldSlot = 'label'
const buttonContext = createRecipeContext({ key: 'button' })
const RecipeButton = buttonContext.withContext('button')
const validRecipeButton = <RecipeButton tone={{ base: 'solid', md: 'ghost' }} />
const validRecipeProps: RecipeContextProps<'button', undefined> = { tone: 'solid' }
const validRecipeText = <Text tone="body" />
const validTextProps: TextProps = { tone: { base: 'body', md: 'caption' } }
const compiledStyles = compiledRecipe({ state: false })
const [compiledVariants, compiledRest] = compiledRecipe.splitVariantProps({
  state: 'auto',
  id: 'compiled',
} as const)
const compiledState: 'auto' = compiledVariants.state
const compiledId: 'compiled' = compiledRest.id
void [
  valid,
  styles,
  globalStyles,
  componentProps,
  componentRef,
  squareProps,
  circleProps,
  FieldRoot,
  FieldLabel,
  validFieldSlot,
  validRecipeButton,
  validRecipeProps,
  validRecipeText,
  validTextProps,
  compiledStyles,
  compiledState,
  compiledId,
]

// @ts-expect-error href is not valid on the default div target
const invalidHref = <Box href="/no" />
// @ts-expect-error selected option refs must point to HTMLOptionElement
const invalidSelectedRef = <Circle as="option" selected ref={document.createElement('a')} />
// @ts-expect-error native size is replaced by htmlSize
const invalidNativeSize = <Box size={4} />
// @ts-expect-error unknown props are rejected by built declarations
const invalidUnknownProp = <Text totallyUnknown />
// @ts-expect-error keyed slot recipes reject names absent from generated metadata
const invalidFieldComponent = fieldContext.withProvider('div', 'missing')
// @ts-expect-error keyed slot contexts reject names absent from generated metadata
const invalidFieldContextComponent = fieldContext.withContext('span', 'missing')
// @ts-expect-error generated slot unions reject unknown values
const invalidFieldSlot: FieldSlot = 'missing'
// @ts-expect-error generated regular recipe variants reject unknown values
const invalidRecipeButton = <RecipeButton tone="missing" />
// @ts-expect-error Text consumes the generated metadata for the text recipe
const invalidRecipeText = <Text tone="missing" />
// @ts-expect-error compiled recipe calls reject undeclared selections
const invalidCompiledCall = compiledRecipe({ state: 'missing' })
const invalidCompiledSplit = compiledRecipe.splitVariantProps({
  // @ts-expect-error compiled recipe splitting validates selections too
  state: 'missing',
  id: 'invalid',
})
// @ts-expect-error compiled recipe components reject boolean string literals
const invalidCompiledComponent = <Compiled state="true" />
void [
  invalidHref,
  invalidSelectedRef,
  invalidNativeSize,
  invalidUnknownProp,
  invalidFieldComponent,
  invalidFieldContextComponent,
  invalidFieldSlot,
  invalidRecipeButton,
  invalidRecipeText,
  invalidCompiledCall,
  invalidCompiledSplit,
  invalidCompiledComponent,
]

type IsAny<T> = 0 extends (1 & T) ? true : false
type AssertFalse<T extends false> = T
type _BoxPropsAreNotAny = AssertFalse<IsAny<ComponentProps<typeof Box>>>
type _BoxRefIsNotAny = AssertFalse<IsAny<ComponentProps<typeof Box>['ref']>>
void (null as unknown as [_BoxPropsAreNotAny, _BoxRefIsNotAny])
