export type TokenLookup = { found: boolean; value: unknown }

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const isTokenContainer = (value: unknown): value is Record<string, unknown> | unknown[] =>
  Array.isArray(value) || isPlainObject(value)

export function lookupToken(source: unknown, value: string | number): TokenLookup {
  let current = source
  for (const segment of String(value).split('.')) {
    if (!isTokenContainer(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return { found: false, value }
    }
    current = current[segment as keyof typeof current]
  }
  return { found: current !== undefined, value: current }
}
