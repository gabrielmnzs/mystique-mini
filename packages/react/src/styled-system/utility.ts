import type { CssValue, UtilityConfig, UtilityDefinition } from './types';

export interface Utility {
  readonly keys: readonly string[];
  has(name: string): boolean;
  get(name: string): UtilityDefinition | undefined;
  transform(name: string, value: CssValue): Record<string, CssValue>;
}

export interface UtilityOptions {
  config: UtilityConfig;
  token: (path: string, fallback?: CssValue) => CssValue;
}

function negate(value: CssValue): CssValue {
  if (typeof value === 'number') return value === 0 ? 0 : -value;
  if (value === '0' || value === '0px' || value === '0rem') return value;
  return `calc(${value} * -1)`;
}

export function createUtility(options: UtilityOptions): Utility {
  const { config, token } = options;
  const keys = Object.freeze(Object.keys(config));

  const resolveToken = (
    definition: UtilityDefinition,
    raw: CssValue,
  ): CssValue => {
    if (!definition.values) return raw;
    const stringValue = String(raw);
    const negative = stringValue.startsWith('-');
    const name = negative ? stringValue.slice(1) : stringValue;
    const resolved = token(`${definition.values}.${name}`, raw);
    return negative && resolved !== raw ? negate(resolved) : resolved;
  };

  return Object.freeze({
    keys,
    has(name: string) {
      return Object.prototype.hasOwnProperty.call(config, name);
    },
    get(name: string) {
      return config[name];
    },
    transform(name: string, raw: CssValue) {
      const definition = config[name];
      if (!definition) {
        const value =
          name.startsWith('--') && typeof raw === 'string'
            ? token(raw, raw)
            : raw;
        return { [name]: value };
      }
      const important = typeof raw === 'string' && raw.endsWith('!');
      const input = important ? raw.slice(0, -1) : raw;
      if (definition.transform) {
        const transformed = definition.transform(input, { raw: input, token });
        return important
          ? Object.fromEntries(
              Object.entries(transformed).map(([key, value]) => [
                key,
                `${value} !important`,
              ]),
            )
          : transformed;
      }
      const value = resolveToken(definition, input);
      const resolved = important ? `${value} !important` : value;
      const properties = Array.isArray(definition.property)
        ? definition.property
        : [definition.property ?? name];
      return Object.fromEntries(
        properties.map((property) => [property, resolved]),
      );
    },
  });
}
