import type { Conditions } from './conditions';
import type { NormalizeFn } from './normalize';
import type { CssValue, SystemStyleObjectInput } from './types';
import type { Utility } from './utility';
import { compact, isPlainObject, mergeInto } from './utils';

export interface SerializeOptions {
  conditions: Conditions;
  normalize: NormalizeFn;
  utility: Utility;
}

export interface SerializeFn {
  (...styles: SystemStyleObjectInput[]): Record<string, unknown>;
}

function isCssValue(value: unknown): value is CssValue {
  return typeof value === 'string' || typeof value === 'number';
}

type WalkInput =
  | { readonly kind: 'style'; readonly value: Record<string, unknown> }
  | { readonly kind: 'resolved'; readonly value: Record<string, unknown> };

function appendInput(
  buckets: Map<string, WalkInput[]>,
  key: string,
  input: WalkInput,
): void {
  const bucket = buckets.get(key);
  if (bucket) {
    bucket.push(input);
  } else {
    buckets.set(key, [input]);
  }
}

export function createSerialize(options: SerializeOptions): SerializeFn {
  const { conditions, normalize, utility } = options;
  const conditionOrder = new Map(
    conditions.keys().map((condition, index) => [condition, index]),
  );

  const walk = (inputs: readonly WalkInput[]): Record<string, unknown> => {
    const declarations: Record<string, unknown> = {};
    const selectorInputs = new Map<string, WalkInput[]>();
    const selectorConditionOrder = new Map<string, number>();
    const selectorLastSequence = new Map<string, number>();
    const selectorsWithRawContributions = new Set<string>();
    let sequence = 0;

    const appendSelectorInput = (
      selector: string,
      input: WalkInput,
      source: 'condition' | 'raw',
    ): void => {
      appendInput(selectorInputs, selector, input);
      selectorLastSequence.set(selector, sequence);
      sequence += 1;
      if (source === 'raw') selectorsWithRawContributions.add(selector);
    };

    const processInputs = (scopeInputs: readonly WalkInput[]): void => {
      for (const input of scopeInputs) {
        if (input.kind === 'resolved') {
          mergeInto(declarations, input.value);
          continue;
        }

        const layerConditions = new Map<string, WalkInput[]>();

        // Raw selectors join their resolved-selector bucket immediately. Named
        // conditions from this layer join afterwards in canonical order. This
        // keeps raw/alias collisions layer-aware while making mixed structural
        // and responsive forms equivalent inside one layer.
        for (const [property, value] of Object.entries(input.value)) {
          if (value === null || value === undefined || value === false)
            continue;

          if (conditions.has(property) && isPlainObject(value)) {
            appendInput(layerConditions, property, { kind: 'style', value });
            continue;
          }

          if (
            (property.startsWith('&') || property.startsWith('@')) &&
            isPlainObject(value)
          ) {
            appendSelectorInput(property, { kind: 'style', value }, 'raw');
            continue;
          }

          if (!utility.has(property) && !property.startsWith('--')) continue;
          if (typeof value === 'boolean') continue;

          const normalized = normalize(value as never);
          for (const [condition, normalizedValue] of Object.entries(
            normalized,
          )) {
            if (!isCssValue(normalizedValue)) continue;
            const transformed = utility.transform(property, normalizedValue);
            if (condition === 'base') {
              mergeInto(declarations, transformed);
            } else if (conditions.has(condition)) {
              appendInput(layerConditions, condition, {
                kind: 'resolved',
                value: transformed,
              });
            }
          }
        }

        for (const condition of conditions.sort([...layerConditions.keys()])) {
          const bucket = layerConditions.get(condition);
          if (!bucket) continue;
          if (condition === 'base') {
            processInputs(bucket);
            continue;
          }

          const resolved = conditions.resolve(condition);
          if (!resolved) {
            processInputs(bucket);
            continue;
          }
          for (const contribution of bucket) {
            appendSelectorInput(resolved, contribution, 'condition');
          }
          const rank = conditionOrder.get(condition);
          if (rank !== undefined) {
            selectorConditionOrder.set(
              resolved,
              Math.max(
                selectorConditionOrder.get(resolved) ??
                  Number.NEGATIVE_INFINITY,
                rank,
              ),
            );
          }
        }
      }
    };

    processInputs(inputs);

    interface SelectorEntry {
      readonly entry: [string, unknown];
      readonly rank: number | undefined;
      readonly sequence: number;
    }

    const authoredSelectors: SelectorEntry[] = [];
    const conditionalSelectors: SelectorEntry[] = [];
    for (const [selector, bucket] of selectorInputs) {
      const selectorEntry: SelectorEntry = {
        entry: [selector, walk(bucket)],
        rank: selectorConditionOrder.get(selector),
        sequence: selectorLastSequence.get(selector)!,
      };
      (selectorEntry.rank !== undefined &&
      !selectorsWithRawContributions.has(selector)
        ? conditionalSelectors
        : authoredSelectors
      ).push(selectorEntry);
    }
    conditionalSelectors.sort((left, right) => left.rank! - right.rank!);
    authoredSelectors.sort((left, right) => left.sequence - right.sequence);

    // Pure named conditions retain canonical ordering. Raw and mixed buckets
    // are inserted at their author/layer position relative to those anchors;
    // revisiting a raw selector therefore gives its final layer precedence.
    const authoredSlots = Array.from(
      { length: conditionalSelectors.length + 1 },
      () => [] as Array<[string, unknown]>,
    );
    for (const authored of authoredSelectors) {
      const slot = conditionalSelectors.filter(
        (conditional) => conditional.sequence <= authored.sequence,
      ).length;
      authoredSlots[slot]!.push(authored.entry);
    }
    const selectors: Array<[string, unknown]> = [];
    for (let index = 0; index <= conditionalSelectors.length; index += 1) {
      selectors.push(...authoredSlots[index]!);
      const conditional = conditionalSelectors[index];
      if (conditional) selectors.push(conditional.entry);
    }

    return Object.fromEntries([...Object.entries(declarations), ...selectors]);
  };

  return (...styles) => {
    const inputs: WalkInput[] = [];
    const visit = (input: SystemStyleObjectInput): void => {
      if (!input) return;
      if (Array.isArray(input)) {
        for (const item of compact(input)) visit(item);
        return;
      }
      if (isPlainObject(input)) inputs.push({ kind: 'style', value: input });
    };
    for (const style of styles) visit(style);
    return walk(inputs);
  };
}

/** Emotion-compatible output is intentionally just a serializable CSS object. */
export const createCss = createSerialize;
