/** Normalizes default imports when a neutral ESM bundle is required as CJS. */
export function interopDefault<T>(value: T): T {
  if (typeof value !== 'object' || value === null || !('default' in value)) {
    return value
  }
  return (value as { default: T }).default
}
