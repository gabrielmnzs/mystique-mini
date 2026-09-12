export interface BreakpointEntry {
  name: string;
  min: string;
  max?: string;
}

export type ResponsiveInput<T> =
  | T
  | readonly (T | null | undefined)[]
  | Readonly<Record<string, T | null | undefined>>;

export interface Breakpoints {
  values: readonly BreakpointEntry[];
  conditions: Readonly<Record<string, string>>;
  keys(): string[];
  getCondition(key: string): string | undefined;
  up(name: string): string;
  down(name: string): string;
  only(name: string): string;
  /** Aliases used by the Mystique system API. */
  min(name: string): string;
  max(name: string): string;
  normalize<T>(value: ResponsiveInput<T>): Record<string, T>;
}

const adjustment = '0.04px';

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function parseLength(value: string): { pixels: number; rem: string } {
  const match = value.trim().match(/^(-?\d*\.?\d+)\s*(px|em|rem)?$/i);
  if (!match) throw new Error(`Invalid breakpoint value: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? 'px';
  const remValue = unit === 'px' ? amount / 16 : amount;
  const normalized = Number.isInteger(remValue)
    ? String(remValue)
    : String(Number(remValue.toFixed(5)));
  return {
    pixels: unit === 'px' ? amount : amount * 16,
    rem: `${normalized}rem`,
  };
}

function subtractAdjustment(value: string): string {
  const pixels = parseLength(value).pixels - Number.parseFloat(adjustment);
  const remValue = pixels / 16;
  const normalized = Number.isInteger(remValue)
    ? String(remValue)
    : String(Number(remValue.toFixed(5)));
  return `${normalized}rem`;
}

function mediaQuery(parts: { min?: string; max?: string }): string {
  const expressions = [
    parts.min ? `(min-width: ${parts.min})` : undefined,
    parts.max ? `(max-width: ${parts.max})` : undefined,
  ].filter(Boolean);
  return `@media screen and ${expressions.join(' and ')}`;
}

function capitalize(value: string): string {
  return value.length === 0
    ? value
    : `${value[0]?.toUpperCase()}${value.slice(1)}`;
}

export function createBreakpoints(
  input: Readonly<Record<string, string>>,
): Breakpoints {
  const values = Object.entries(input)
    .filter(([name]) => name !== 'base')
    .map(([name, value]) => ({ name, ...parseLength(value) }))
    .sort(
      (left, right) =>
        left.pixels - right.pixels || compareText(left.name, right.name),
    )
    .map<BreakpointEntry>((entry, index, entries) => ({
      max: entries[index + 1]
        ? subtractAdjustment(entries[index + 1].rem)
        : undefined,
      min: entry.rem,
      name: entry.name,
    }));

  const byName = new Map(values.map((entry) => [entry.name, entry]));
  const requireEntry = (name: string) => {
    const entry = byName.get(name);
    if (!entry) throw new Error(`Unknown breakpoint: ${name}`);
    return entry;
  };
  const up = (name: string) => mediaQuery({ min: requireEntry(name).min });
  const down = (name: string) =>
    mediaQuery({ max: subtractAdjustment(requireEntry(name).min) });
  const only = (name: string) => {
    const entry = requireEntry(name);
    return mediaQuery({ min: entry.min, max: entry.max });
  };
  const between = (from: string, to: string) =>
    mediaQuery({
      min: requireEntry(from).min,
      max: subtractAdjustment(requireEntry(to).min),
    });

  const conditions: Record<string, string> = {};
  for (const entry of values) {
    conditions[entry.name] = up(entry.name);
    conditions[`${entry.name}Only`] = only(entry.name);
    conditions[`${entry.name}Down`] = down(entry.name);
    for (const target of values) {
      if (
        target.min === entry.min ||
        parseLength(target.min).pixels <= parseLength(entry.min).pixels
      )
        continue;
      conditions[`${entry.name}To${capitalize(target.name)}`] = between(
        entry.name,
        target.name,
      );
    }
  }

  const keys = () => ['base', ...values.map((entry) => entry.name)];
  const normalize = <T>(value: ResponsiveInput<T>): Record<string, T> => {
    if (Array.isArray(value)) {
      const names = keys();
      const result: Record<string, T> = {};
      for (
        let index = 0;
        index < value.length && index < names.length;
        index += 1
      ) {
        const item = value[index];
        const name = names[index];
        if (item != null && name) result[name] = item;
      }
      return result;
    }

    if (value !== null && typeof value === 'object') {
      const source = value as Readonly<Record<string, T | null | undefined>>;
      const orderedNames = [
        ...keys(),
        ...Object.keys(source)
          .filter((name) => !keys().includes(name))
          .sort(compareText),
      ];
      const result: Record<string, T> = {};
      for (const name of orderedNames) {
        const item = source[name];
        if (item != null) result[name] = item;
      }
      return result;
    }

    return { base: value as T };
  };

  return {
    conditions: Object.freeze(conditions),
    down,
    getCondition: (key) => conditions[key],
    keys,
    max: down,
    min: up,
    normalize,
    only,
    up,
    values: Object.freeze(values),
  };
}
