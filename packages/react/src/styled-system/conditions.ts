export interface Conditions {
  readonly values: Readonly<Record<string, string>>;
  keys(): string[];
  has(key: string): boolean;
  resolve(key: string): string;
  sort(paths: readonly string[]): string[];
}

export interface ConditionsOptions {
  conditions?: Record<string, string>;
  breakpoints?: { conditions?: Readonly<Record<string, string>> };
}

export function createConditions(options: ConditionsOptions = {}): Conditions {
  const custom = options.conditions ?? {};
  const breakpointConditions = options.breakpoints?.conditions ?? {};
  // Replacing an existing object key does not move its insertion position.
  // Remove custom collisions first so breakpoint names always retain the
  // canonical min-width order produced by createBreakpoints.
  const customConditions = Object.fromEntries(
    Object.entries(custom).filter(
      ([key]) =>
        !Object.prototype.hasOwnProperty.call(breakpointConditions, key),
    ),
  );
  const values = Object.freeze({
    ...customConditions,
    ...breakpointConditions,
  });
  const names = Object.freeze(Object.keys(values));
  const order = new Map(names.map((key, index) => [key, index]));

  return Object.freeze({
    keys() {
      return [...names];
    },
    values,
    has(key: string) {
      return (
        key === 'base' || Object.prototype.hasOwnProperty.call(values, key)
      );
    },
    resolve(key: string) {
      return key === 'base' ? '' : (values[key] ?? key);
    },
    sort(paths: readonly string[]) {
      return [...paths].sort((left, right) => {
        if (left === 'base') return -1;
        if (right === 'base') return 1;
        return (
          (order.get(left) ?? Number.MAX_SAFE_INTEGER) -
          (order.get(right) ?? Number.MAX_SAFE_INTEGER)
        );
      });
    },
  });
}
