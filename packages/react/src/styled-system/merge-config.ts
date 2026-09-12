import type { SystemConfig } from './config'

type PlainRecord = Record<string, unknown>

type DeepMerge<Left, Right> = Left extends readonly unknown[]
  ? Right
  : Right extends readonly unknown[]
    ? Right
    : Left extends PlainRecord
      ? Right extends PlainRecord
        ? { [Key in keyof Left | keyof Right]: Key extends keyof Right
          ? Key extends keyof Left
            ? DeepMerge<Left[Key], Right[Key]>
            : Right[Key]
          : Key extends keyof Left
            ? Left[Key]
            : never }
        : Right
      : Right

export type MergeConfigs<Configs extends readonly unknown[], Result = Record<never, never>> =
  Configs extends readonly [infer Config, ...infer Rest]
    ? MergeConfigs<Rest, Config extends SystemConfig ? DeepMerge<Result, Config> : Result>
    : Result

const reservedKeys = new Set(['__proto__', 'prototype', 'constructor'])

function isPlainObject(value: unknown): value is PlainRecord {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T
  if (!isPlainObject(value)) return value

  const result: PlainRecord = {}
  for (const [key, item] of Object.entries(value)) {
    if (reservedKeys.has(key)) continue
    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      value: cloneValue(item),
      writable: true,
    })
  }
  return result as T
}

function mergeObjects(base: PlainRecord, override: PlainRecord): PlainRecord {
  const result = cloneValue(base)

  for (const [key, overrideValue] of Object.entries(override)) {
    if (reservedKeys.has(key)) continue
    const baseValue = result[key]
    const value = isPlainObject(baseValue) && isPlainObject(overrideValue)
      ? mergeObjects(baseValue, overrideValue)
      : cloneValue(overrideValue)

    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    })
  }

  return result
}

/**
 * Deeply merges system configurations without mutating or retaining mutable
 * array/plain-object branches from any input. Arrays are replaced, not merged.
 */
export function mergeConfigs<const Configs extends readonly (SystemConfig | undefined)[]>(...configs: Configs): MergeConfigs<Configs> {
  let result: PlainRecord = {}
  for (const config of configs) {
    if (config === undefined) continue
    result = mergeObjects(result, config as unknown as PlainRecord)
  }
  return result as MergeConfigs<Configs>
}
