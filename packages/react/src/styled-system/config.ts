import type {
  ConditionProperties,
  ConditionalValue,
  CssValue,
  GlobalCss,
  RecipeDefinition,
  SlotRecipeDefinition,
  SystemConfig,
  SystemProperties,
  ThemingConfig,
  UtilityDefinition,
} from './types';

export type { SystemConfig, ThemingConfig } from './types';

/**
 * Marks a value as a Mystique system configuration while preserving its exact
 * inferred type. The function intentionally has no runtime transformation.
 */
export function defineConfig<const T extends SystemConfig>(config: T): T {
  return config;
}

export function defineRecipe<const T extends RecipeDefinition>(recipe: T): T {
  return recipe;
}

export function defineSlotRecipe<const T extends SlotRecipeDefinition>(
  recipe: T,
): T {
  return recipe;
}

export function defineTokens<
  const T extends NonNullable<ThemingConfig['tokens']>,
>(tokens: T): T {
  return tokens;
}

export function defineSemanticTokens<
  const T extends NonNullable<ThemingConfig['semanticTokens']>,
>(tokens: T): T {
  return tokens;
}

interface FontFaceDescriptors {
  ascentOverride?: CssValue;
  descentOverride?: CssValue;
  fontDisplay?: CssValue;
  fontFamily?: CssValue;
  fontFeatureSettings?: CssValue;
  fontStretch?: CssValue;
  fontStyle?: CssValue;
  fontVariationSettings?: CssValue;
  fontWeight?: CssValue;
  lineGapOverride?: CssValue;
  sizeAdjust?: CssValue;
  src?: CssValue;
  unicodeRange?: CssValue;
}

type ValidateSystemStyle<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends keyof SystemProperties
          ? T[K] extends SystemProperties[K]
            ? T[K]
            : never
          : K extends keyof ConditionProperties
            ? ValidateSystemStyle<NonNullable<T[K]>>
            : K extends `--${string}`
              ? T[K] extends ConditionalValue<CssValue> | undefined
                ? T[K]
                : never
              : K extends `&${string}` | `@${string}`
                ? ValidateSystemStyle<NonNullable<T[K]>>
                : never;
      }
    : never;

type ValidateFontFace<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends keyof FontFaceDescriptors
          ? T[K] extends FontFaceDescriptors[K]
            ? T[K]
            : never
          : never;
      }
    : never;

type ValidateKeyframes<T> =
  T extends Record<string, unknown>
    ? { [K in keyof T]: ValidateSystemStyle<T[K]> }
    : never;

type ValidateGlobalStyles<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends `@font-face${string}`
          ? ValidateFontFace<T[K]>
          : K extends `@keyframes${string}`
            ? ValidateKeyframes<T[K]>
            : K extends `@${string}`
              ? ValidateGlobalStyles<T[K]>
              : ValidateSystemStyle<T[K]>;
      }
    : never;

export function defineGlobalStyles<const T extends GlobalCss>(
  styles: T & ValidateGlobalStyles<T>,
): T {
  return styles;
}

export function defineUtility<const T extends UtilityDefinition>(
  utility: T,
): T {
  return utility;
}
