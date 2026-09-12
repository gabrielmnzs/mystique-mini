import {
  type CircleProps,
  type ConditionalValue,
  type CssValue,
  type SquareProps,
  type SystemConfig,
  type SystemStyleObject,
  createSystem,
  defaultConfig,
  defineConfig,
  defineGlobalStyles,
  defineRecipe,
  defineSemanticTokens,
  defineTokens,
  mergeConfigs,
} from 'mystique-mini-react';

const tokens = defineTokens({
  colors: { brand: { value: '#9f3d2d' } },
  spacing: { card: { value: '1rem' } },
});
const semanticTokens = defineSemanticTokens({
  colors: { action: { value: '{colors.brand}' } },
});
const card = defineRecipe({
  className: 'mystique-card',
  base: { color: 'action', p: 'card' },
  variants: { tone: { quiet: { opacity: 0.8 }, loud: { opacity: 1 } } },
  defaultVariants: { tone: 'quiet' },
});
const globalCss = defineGlobalStyles({ body: { bg: 'bg', color: 'fg' } });
const customConfig = defineConfig({
  globalCss,
  theme: { tokens, semanticTokens, recipes: { card } },
});
const config: SystemConfig = mergeConfigs(defaultConfig, customConfig);
const system = createSystem(config);

const responsiveSize: ConditionalValue<CssValue> = { base: 2, md: 4 };
const styles: SystemStyleObject = {
  color: 'action',
  p: ['card', null, 8],
  _hover: { opacity: 0.9 },
};
const square: SquareProps = { size: responsiveSize };
const circle: CircleProps = { size: 'sm' };
void [
  styles,
  square,
  circle,
  system.css(styles),
  system.token('colors.action'),
];

// @ts-expect-error system style objects reject unknown top-level properties
const invalidStyle: SystemStyleObject = { totallyUnknownStyle: true };
// @ts-expect-error configuration rejects unknown top-level properties
const invalidConfig = defineConfig({ unexpected: true });
// @ts-expect-error token leaves require the explicit { value } shape
const invalidTokens = defineTokens({ colors: { brand: '#9f3d2d' } });
void [invalidStyle, invalidConfig, invalidTokens];
