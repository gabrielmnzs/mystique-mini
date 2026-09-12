const blockedKeys = new Set(['__proto__', 'prototype', 'constructor'])

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
export function isBlockedKey(key: string): boolean {
  return blockedKeys.has(key)
}

export function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cloneValue) as T
  if (!isPlainObject(value)) return value
  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    if (!isBlockedKey(key)) result[key] = cloneValue(item)
  }
  return result as T
}

export function mergeObjects<T extends Record<string, unknown>>(
  ...sources: readonly (T | Record<string, unknown> | undefined)[]
): T {
  const result: Record<string, unknown> = {}
  for (const source of sources) mergeInto(result, source)
  return result as T
}

export function mergeInto(
  target: Record<string, unknown>,
  source: Record<string, unknown> | undefined,
): void {
  if (!source) return
  for (const [key, value] of Object.entries(source)) {
    if (isBlockedKey(key)) continue
    if (isPlainObject(value) && isPlainObject(target[key])) {
      mergeInto(target[key] as Record<string, unknown>, value)
      continue
    }
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      value: cloneValue(value),
      writable: true,
    })
  }
}

export function compact<T>(values: readonly (T | null | undefined | false)[]): T[] {
  return values.filter((value): value is T => value !== null && value !== undefined && value !== false)
}

export function memo<T>(factory: () => T): () => T {
  let initialized = false
  let value: T
  return () => {
    if (!initialized) {
      value = factory()
      initialized = true
    }
    return value
  }
}

export function toKebabCase(value: string): string {
  if (value.startsWith('--')) return value
  return value
    .replace(/^ms-/, '-ms-')
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

export function hash(value: string): string {
  let output = 5381
  for (let index = 0; index < value.length; index += 1) {
    output = (output * 33) ^ value.charCodeAt(index)
  }
  return (output >>> 0).toString(36)
}
