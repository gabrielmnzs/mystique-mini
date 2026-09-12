import type { NormalizeFn } from './normalize';
import type {
  CssFn,
  SlotRecipeDefinition,
  SlotRecipeVariantProps,
  SvaFn,
  SystemStyleObject,
} from './types';
import { isPlainObject } from './utils';

function mergeSlot(
  target: Record<string, SystemStyleObject[]>,
  source: Record<string, SystemStyleObject> | undefined,
): void {
  if (!source) return;
  for (const [slot, style] of Object.entries(source)) {
    (target[slot] ??= []).push(style);
  }
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

export function createSva(
  css: CssFn,
  normalize: NormalizeFn,
  wrap?: (styles: Record<string, unknown>) => Record<string, unknown>,
) {
  return function sva<const T extends SlotRecipeDefinition>(
    definition: T,
  ): SvaFn<SlotRecipeVariantProps<T>> {
    const variants = definition.variants ?? {};
    const slots = Object.freeze([...definition.slots]);
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
      const layers: Record<string, SystemStyleObject[]> = {};
      mergeSlot(layers, definition.base);

      for (const key of variantKeys) {
        const value = selections[key];
        if (isPlainObject(value) || Array.isArray(value)) {
          const conditional = normalize(value as never);
          for (const [condition, selected] of Object.entries(conditional)) {
            const selectedSlots = variants[key]?.[String(selected)];
            if (!selectedSlots) continue;
            for (const [slot, style] of Object.entries(selectedSlots)) {
              (layers[slot] ??= []).push({
                [condition]: style,
              } as unknown as SystemStyleObject);
            }
          }
          continue;
        }
        mergeSlot(layers, variants[key]?.[String(value)]);
      }

      for (const compound of definition.compoundVariants ?? []) {
        if (matchesCompound(compound, selections))
          mergeSlot(layers, compound.css);
      }

      return Object.fromEntries(
        slots.map((slot) => {
          const resolved = css(...(layers[slot] ?? []));
          return [slot, wrap?.(resolved) ?? resolved];
        }),
      );
    }) as SvaFn<SlotRecipeVariantProps<T>>;

    Object.defineProperties(recipe, {
      className: { enumerable: true, value: definition.className },
      slots: { enumerable: true, value: slots },
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
