import mystique = require('mystique-mini-react');

declare module 'mystique-mini-react' {
  interface MystiqueTypegen {
    recipeNames: 'button' | 'text';
    recipes: {
      button: { tone: 'ghost' | 'solid' };
      text: { tone: 'body' | 'caption' };
    };
    slotRecipeSlots: {
      badge: 'root' | 'label';
      field: 'root' | 'label';
    };
  }
}

const {
  Box,
  Circle,
  MystiqueProvider,
  Square,
  Text,
  cva,
  createRecipeContext,
  createSystem,
  defaultConfig,
  defineConfig,
  defineGlobalStyles,
  defineRecipe,
  mystique: styled,
} = mystique;
const system = createSystem(
  defaultConfig,
  defineConfig({
    theme: { tokens: { colors: { brand: { value: '#9f3d2d' } } } },
  }),
);
const squareProps: mystique.SquareProps = { size: { base: 2, md: 4 } };
const circleProps: mystique.CircleProps = { size: 'sm' };
const style: mystique.SystemStyleObject = {
  color: 'brand',
  _hover: { opacity: 0.8 },
};
const globalStyles = defineGlobalStyles({
  body: { color: 'brand', '& strong': { fontWeight: 700 } },
  '@media (prefers-contrast: more)': { body: { color: 'black' } },
});
defineGlobalStyles({
  body: {
    // @ts-expect-error built declarations reject misspelled global properties
    colro: 'red',
  },
});
const fieldContext = mystique.createSlotRecipeContext({ key: 'field' });
const FieldRoot = fieldContext.withProvider('div', 'root');
const FieldLabel = fieldContext.withContext('span', 'label');
const fieldSlot: mystique.SlotRecipeTypegenSlots<'field'> = 'label';
const buttonContext = createRecipeContext({ key: 'button' });
const RecipeButton = buttonContext.withContext('button');
const validRecipeButton = RecipeButton({
  tone: { base: 'solid', md: 'ghost' },
});
const validRecipeProps: mystique.RecipeContextProps<'button', undefined> = {
  tone: 'solid',
};
const validRecipeText = Text({ tone: 'body', unstyled: true });
const validTextProps: mystique.TextProps = {
  tone: { base: 'body', md: 'caption' },
};
const compiledRecipe = cva(
  defineRecipe({
    variants: {
      state: {
        true: { opacity: 1 },
        false: { opacity: 0.5 },
        auto: { opacity: 0.8 },
      },
    },
  }),
);
const Compiled = styled('div', compiledRecipe);
const compiledStyles = compiledRecipe({ state: false });
const [compiledVariants, compiledRest] = compiledRecipe.splitVariantProps({
  state: 'auto',
  id: 'compiled',
} as const);
const compiledState: 'auto' = compiledVariants.state;
const compiledId: 'compiled' = compiledRest.id;
const valid = [
  Box({ as: 'a', href: '/box', ref: { current: null } }),
  Square({ size: { base: 2, md: 4 } }),
  Circle({ as: 'a', href: '/circle', size: 'sm', ref: { current: null } }),
  MystiqueProvider({ value: system, children: null }),
  FieldRoot,
  FieldLabel,
  fieldSlot,
  validRecipeButton,
  validRecipeProps,
  validRecipeText,
  validTextProps,
  Compiled({ state: { base: true, md: 'auto' } }),
  compiledStyles,
  compiledState,
  compiledId,
];
void [valid, squareProps, circleProps, style, globalStyles];

// @ts-expect-error href is not valid on the default div target
const invalidHref = Box({ href: '/no' });
// @ts-expect-error native size is replaced by htmlSize
const invalidNativeSize = Box({ size: 4 });
// @ts-expect-error unknown props are rejected by built declarations
const invalidUnknownProp = Box({ totallyUnknown: true });
// @ts-expect-error keyed slot recipes reject names absent from generated metadata
const invalidFieldComponent = fieldContext.withProvider('div', 'missing');
const invalidFieldContextComponent = fieldContext.withContext(
  'span',
  // @ts-expect-error keyed slot contexts reject names absent from generated metadata
  'missing',
);
// @ts-expect-error generated slot unions reject unknown values
const invalidFieldSlot: mystique.SlotRecipeTypegenSlots<'field'> = 'missing';
// @ts-expect-error generated regular recipe variants reject unknown values
const invalidRecipeButton = RecipeButton({ tone: 'missing' });
// @ts-expect-error Text consumes the generated metadata for the text recipe
const invalidRecipeText = Text({ tone: 'missing' });
// @ts-expect-error compiled recipe calls reject undeclared selections
const invalidCompiledCall = compiledRecipe({ state: 'missing' });
const invalidCompiledSplit = compiledRecipe.splitVariantProps({
  // @ts-expect-error compiled recipe splitting validates selections too
  state: 'missing',
  id: 'invalid',
});
// @ts-expect-error compiled recipe components reject boolean string literals
const invalidCompiledComponent = Compiled({ state: 'true' });
void [
  invalidHref,
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
];
