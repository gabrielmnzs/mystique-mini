import type { ConditionalValue } from './types';
import { isPlainObject } from './utils';

export interface NormalizeOptions {
  breakpointKeys: readonly string[];
}
export interface NormalizeFn {
  <T>(value: ConditionalValue<T>): Record<string, T>;
}

/** Converts arrays and condition maps into a deterministic condition object. */
export function createNormalize(options: NormalizeOptions): NormalizeFn {
  const { breakpointKeys } = options;
  return function normalize<T>(value: ConditionalValue<T>): Record<string, T> {
    if (Array.isArray(value)) {
      const result: Record<string, T> = {};
      value.forEach((item, index) => {
        if (item === null || item === undefined) return;
        const key = index === 0 ? 'base' : breakpointKeys[index - 1];
        if (key) result[key] = item;
      });
      return result;
    }
    if (isPlainObject(value)) {
      const result: Record<string, T> = {};
      for (const [key, item] of Object.entries(value)) {
        if (item !== null && item !== undefined) result[key] = item as T;
      }
      return result;
    }
    return { base: value as T };
  };
}
