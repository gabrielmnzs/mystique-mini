import type { NormalizeFn } from './normalize';
import type {
  CssFn,
  CvaFn,
  RecipeDefinition,
  RecipeVariantProps,
  SystemStyleObject,
} from './types';
import { isPlainObject, mergeInto } from './utils';

function selectedStyle(
  variants: Record<string, SystemStyleObject> | undefined,
  value: unknown,
): SystemStyleObject | undefined {
  if (!variants || (typeof value !== 'string' && typeof value !== 'boolean'))
    return;
  return variants[String(value)];
}

function matchesCompound(
  compound: Record<string, unknown>,
  selections: Record<string, unknown>,
): boolean {
  return Object.entries(compound).every(([key, expected]) => {
    if (key === 'css') return true;
    const actual = selections[key];
    return Array.isArray(expected)
      ? expected.includes(actual)
      : expected === actual;
  });
}

export function createCva(
  css: CssFn,
  normalize: NormalizeFn,
  wrap?: (styles: Record<string, unknown>) => Record<string, unknown>,
) {
  return function cva<const T extends RecipeDefinition = RecipeDefinition>(
    definition: T = {} as T,
  ): CvaFn<RecipeVariantProps<T>> {
    const variants = definition.variants ?? {};
    const variantKeys = Object.freeze(Object.keys(variants));
    const variantMap = Object.freeze(
      Object.fromEntries(
        Object.entries(variants).map(([key, values]) => [
          key,
          Object.freeze(Object.keys(values)),
        ]),
      ),
    );

    const recipe = ((props: Record<string, unknown> = {}) => {
      const selections = { ...definition.defaultVariants, ...props };
      const layers: SystemStyleObject[] = [];
      if (definition.base) layers.push(definition.base);

      for (const key of variantKeys) {
        const value = selections[key];
        if (isPlainObject(value) || Array.isArray(value)) {
          const conditional = normalize(value as never);
          const style: Record<string, unknown> = {};
          for (const [condition, selected] of Object.entries(conditional)) {
            const resolved = selectedStyle(variants[key], selected);
            if (resolved) style[condition] = resolved;
          }
          layers.push(style as SystemStyleObject);
          continue;
        }
        const style = selectedStyle(variants[key], value);
        if (style) layers.push(style);
      }

      for (const compound of definition.compoundVariants ?? []) {
        if (matchesCompound(compound, selections)) layers.push(compound.css);
      }

      const resolved = css(...layers);
      return wrap?.(resolved) ?? resolved;
    }) as CvaFn<RecipeVariantProps<T>>;

    Object.defineProperties(recipe, {
      className: { enumerable: true, value: definition.className },
      variantKeys: { enumerable: true, value: variantKeys },
      variantMap: { enumerable: true, value: variantMap },
      splitVariantProps: {
        enumerable: true,
        value: <T extends Record<string, unknown>>(props: T) => {
          const selected: Record<string, unknown> = {};
          const rest: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(props)) {
            (variantKeys.includes(key) ? selected : rest)[key] = value;
          }
          return [selected, rest];
        },
      },
    });
    return recipe;
  };
}

export function mergeCvaStyles(
  ...styles: readonly Record<string, unknown>[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const style of styles) mergeInto(result, style);
  return result;
}
