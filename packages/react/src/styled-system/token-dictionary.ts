export type TokenPrimitive = string | number;

export interface TokenSchema {
  value: TokenPrimitive;
  description?: string;
}

export interface TokenCategory {
  [name: string]: TokenCategory | TokenSchema;
}

export type TokenDefinition = Record<string, TokenCategory>;

export interface SemanticTokenSchema {
  value:
    | TokenPrimitive
    | readonly (TokenPrimitive | null | undefined)[]
    | Readonly<Record<string, TokenPrimitive>>;
  description?: string;
}

export interface SemanticTokenCategory {
  [name: string]: SemanticTokenCategory | SemanticTokenSchema;
}

export type SemanticTokenDefinition = Record<string, SemanticTokenCategory>;

export interface TokenCssVar {
  var: string;
  ref: string;
}

export interface TokenExtensions {
  originalPath: readonly string[];
  category: string;
  prop: string;
  condition?: string;
  conditions?: Readonly<Record<string, TokenPrimitive>>;
  cssVar: TokenCssVar;
}

export interface Token {
  name: string;
  path: readonly string[];
  value: TokenPrimitive;
  originalValue: TokenPrimitive;
  extensions: TokenExtensions;
}

export interface FlattenedToken {
  name: string;
  path: readonly string[];
  value: TokenPrimitive;
  originalValue: TokenPrimitive;
  condition?: string;
  conditions?: Readonly<Record<string, TokenPrimitive>>;
}

export interface TokenDictionaryOptions {
  prefix?: string;
  cssVarsPrefix?: string;
  breakpoints?: Readonly<Record<string, string>>;
  tokens?: TokenDefinition;
  semanticTokens?: SemanticTokenDefinition;
}

export interface TokenDictionary {
  prefix: string;
  allTokens: readonly Token[];
  /** Alias kept for the compact Mystique public contract. */
  all: readonly Token[];
  tokenMap: Map<string, Token>;
  flatMap: Map<string, string>;
  cssVarMap: Map<string, Map<string, string>>;
  /** Alias kept for the compact Mystique public contract. */
  cssVars: Map<string, Map<string, string>>;
  categoryMap: Map<string, Map<string, Token>>;
  colorPaletteMap: Map<string, Map<string, string>>;
  registerToken(token: Token): void;
  getByName(name: string): Token | undefined;
  getVar(
    path: string | readonly string[],
    fallback?: string,
  ): string | undefined;
  getCategoryValues(category: string): Record<string, string>;
  expandReferenceInValue(value: string): string;
  formatTokenName(path: string | readonly string[]): string;
  formatCssVar(path: string | readonly string[], prefix?: string): TokenCssVar;
}

const reservedKeys = new Set(['__proto__', 'prototype', 'constructor']);
const referencePattern = /\{([^{}]+)\}/g;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isPrimitive(value: unknown): value is TokenPrimitive {
  return typeof value === 'string' || typeof value === 'number';
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeSegment(segment: string): string {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/_+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function normalizePrefix(prefix: string | undefined): string {
  return normalizeSegment(prefix ?? 'mystique') || 'mystique';
}

function tokenName(path: readonly string[]): string {
  return path.join('.');
}

function isTokenLeaf(value: unknown): value is { value: unknown } {
  return isPlainObject(value) && Object.hasOwn(value, 'value');
}

function sortConditions(
  conditions: Iterable<[string, TokenPrimitive]>,
): Array<[string, TokenPrimitive]> {
  return Array.from(conditions).sort(([left], [right]) => {
    if (left === 'base') return right === 'base' ? 0 : -1;
    if (right === 'base') return 1;
    return compareText(left, right);
  });
}

function compareConditions(
  left: string | undefined,
  right: string | undefined,
): number {
  const leftCondition = left ?? 'base';
  const rightCondition = right ?? 'base';
  if (leftCondition === 'base') return rightCondition === 'base' ? 0 : -1;
  if (rightCondition === 'base') return 1;
  return compareText(leftCondition, rightCondition);
}

function sortedBreakpointNames(
  breakpoints: Readonly<Record<string, string>> | undefined,
): string[] {
  if (!breakpoints) return [];
  const toPixels = (value: string) => {
    const match = value.trim().match(/^(-?\d*\.?\d+)\s*(px|em|rem)?$/i);
    if (!match) return Number.POSITIVE_INFINITY;
    const amount = Number(match[1]);
    return match[2]?.toLowerCase() === 'px' || match[2] === undefined
      ? amount
      : amount * 16;
  };
  return Object.entries(breakpoints)
    .sort(
      ([leftName, left], [rightName, right]) =>
        toPixels(left) - toPixels(right) || compareText(leftName, rightName),
    )
    .map(([name]) => name);
}

function semanticConditions(
  value: unknown,
  breakpoints: Readonly<Record<string, string>> | undefined,
): Array<[string, TokenPrimitive]> {
  if (isPrimitive(value)) return [['base', value]];
  if (Array.isArray(value)) {
    const names = ['base', ...sortedBreakpointNames(breakpoints)];
    return value.flatMap((item, index) =>
      isPrimitive(item) && names[index] ? [[names[index], item]] : [],
    );
  }
  if (!isPlainObject(value)) return [];
  return sortConditions(
    Object.entries(value).filter((entry): entry is [string, TokenPrimitive] =>
      isPrimitive(entry[1]),
    ),
  );
}

function walkTokens(
  source: Record<string, unknown>,
  path: readonly string[],
  output: FlattenedToken[],
): void {
  for (const key of Object.keys(source)
    .filter((item) => !reservedKeys.has(item))
    .sort(compareText)) {
    const value = source[key];
    const nextPath = [...path, key];
    if (isPrimitive(value)) {
      throw new TypeError(
        `Invalid token "${tokenName(nextPath)}": token leaves must use { value }.`,
      );
    }
    if (isTokenLeaf(value)) {
      if (!isPrimitive(value.value)) {
        throw new TypeError(
          `Invalid token "${tokenName(nextPath)}": value must be a string or number.`,
        );
      }
      output.push({
        name: tokenName(nextPath),
        path: nextPath,
        value: value.value,
        originalValue: value.value,
      });
      continue;
    }
    if (isPlainObject(value)) walkTokens(value, nextPath, output);
  }
}

function walkSemanticTokens(
  source: Record<string, unknown>,
  path: readonly string[],
  breakpoints: Readonly<Record<string, string>> | undefined,
  output: FlattenedToken[],
): void {
  for (const key of Object.keys(source)
    .filter((item) => !reservedKeys.has(item))
    .sort(compareText)) {
    const value = source[key];
    const nextPath = [...path, key];
    if (isPrimitive(value) || Array.isArray(value)) {
      throw new TypeError(
        `Invalid semantic token "${tokenName(nextPath)}": token leaves must use { value }.`,
      );
    }
    const leafValue = isTokenLeaf(value) ? value.value : undefined;
    const conditions = semanticConditions(leafValue, breakpoints);

    if (conditions.length > 0) {
      const conditionRecord = Object.freeze(Object.fromEntries(conditions));
      for (const [condition, conditionValue] of conditions) {
        output.push({
          condition,
          conditions: conditionRecord,
          name: tokenName(nextPath),
          originalValue: conditionValue,
          path: nextPath,
          value: conditionValue,
        });
      }
      continue;
    }

    if (isTokenLeaf(value)) {
      throw new TypeError(
        `Invalid semantic token "${tokenName(nextPath)}": value must be a string, number, array, or condition map.`,
      );
    }
    if (isPlainObject(value))
      walkSemanticTokens(value, nextPath, breakpoints, output);
  }
}

/** Flattens token trees in stable name/condition order. */
export function flattenTokens(
  options: Pick<
    TokenDictionaryOptions,
    'tokens' | 'semanticTokens' | 'breakpoints'
  >,
): FlattenedToken[] {
  const output: FlattenedToken[] = [];
  if (isPlainObject(options.tokens)) walkTokens(options.tokens, [], output);
  if (isPlainObject(options.semanticTokens)) {
    walkSemanticTokens(options.semanticTokens, [], options.breakpoints, output);
  }

  return output.sort((left, right) => {
    const byName = compareText(left.name, right.name);
    if (byName !== 0) return byName;
    return compareConditions(left.condition, right.condition);
  });
}

function breakpointTokens(
  breakpoints: Readonly<Record<string, string>> | undefined,
): FlattenedToken[] {
  if (!breakpoints) return [];
  return Object.entries(breakpoints)
    .flatMap(([name, value]) => [
      {
        name: `breakpoints.${name}`,
        originalValue: value,
        path: ['breakpoints', name],
        value,
      },
      {
        name: `sizes.breakpoint-${name}`,
        originalValue: value,
        path: ['sizes', `breakpoint-${name}`],
        value,
      },
    ])
    .sort((left, right) => compareText(left.name, right.name));
}

export function createTokenDictionary(
  options: TokenDictionaryOptions = {},
): TokenDictionary {
  const prefix = normalizePrefix(options.cssVarsPrefix ?? options.prefix);
  const allTokens: Token[] = [];
  const tokenMap = new Map<string, Token>();
  const flatMap = new Map<string, string>();
  const cssVarMap = new Map<string, Map<string, string>>();
  const categoryMap = new Map<string, Map<string, Token>>();
  const colorPaletteMap = new Map<string, Map<string, string>>();

  const formatTokenName = (path: string | readonly string[]): string =>
    typeof path === 'string' ? path : tokenName(path);
  const formatCssVar = (
    path: string | readonly string[],
    prefixOverride?: string,
  ): TokenCssVar => {
    const name = formatTokenName(path);
    const suffix = name
      .split('.')
      .map(normalizeSegment)
      .filter(Boolean)
      .join('-');
    const variable = `--${normalizePrefix(prefixOverride ?? prefix)}-${suffix}`;
    return { var: variable, ref: `var(${variable})` };
  };

  const knownNames = new Set([
    ...flattenTokens(options).map((token) => token.name),
    ...breakpointTokens(options.breakpoints).map((token) => token.name),
  ]);

  const getVar = (
    path: string | readonly string[],
    fallback?: string,
  ): string | undefined => {
    const name = formatTokenName(path);
    if (!knownNames.has(name)) return fallback;
    const { var: variable, ref } = formatCssVar(name);
    return fallback === undefined ? ref : `var(${variable}, ${fallback})`;
  };

  const expandReferenceInValue = (value: string): string =>
    value.replace(referencePattern, (match, reference: string) => {
      return getVar(reference.trim()) ?? match;
    });

  const registerToken = (token: Token): void => {
    const condition = token.extensions.condition ?? 'base';
    const existingIndex = allTokens.findIndex(
      (item) =>
        item.name === token.name &&
        (item.extensions.condition ?? 'base') === condition,
    );
    if (existingIndex >= 0) allTokens.splice(existingIndex, 1, token);
    else allTokens.push(token);
    allTokens.sort(
      (left, right) =>
        compareText(left.name, right.name) ||
        compareConditions(
          left.extensions.condition,
          right.extensions.condition,
        ),
    );

    knownNames.add(token.name);
    const current = tokenMap.get(token.name);
    if (!current || condition === 'base') tokenMap.set(token.name, token);
    flatMap.set(token.name, token.extensions.cssVar.ref);

    const declarations = cssVarMap.get(condition) ?? new Map<string, string>();
    declarations.set(token.extensions.cssVar.var, String(token.value));
    cssVarMap.set(condition, declarations);

    const categoryTokens =
      categoryMap.get(token.extensions.category) ?? new Map<string, Token>();
    if (!categoryTokens.has(token.name) || condition === 'base')
      categoryTokens.set(token.name, token);
    categoryMap.set(token.extensions.category, categoryTokens);

    if (token.extensions.category === 'colors') {
      const palette = token.path[1];
      if (palette) {
        const paletteTokens =
          colorPaletteMap.get(palette) ?? new Map<string, string>();
        if (!paletteTokens.has(token.name) || condition === 'base') {
          paletteTokens.set(token.name, token.extensions.cssVar.ref);
        }
        colorPaletteMap.set(palette, paletteTokens);
      }
    }
  };

  const flattened = [
    ...flattenTokens(options),
    ...breakpointTokens(options.breakpoints),
  ].sort(
    (left, right) =>
      compareText(left.name, right.name) ||
      compareConditions(left.condition, right.condition),
  );

  for (const item of flattened) {
    const cssVar = formatCssVar(item.path);
    registerToken({
      name: item.name,
      originalValue: item.originalValue,
      path: Object.freeze([...item.path]),
      value:
        typeof item.value === 'string'
          ? expandReferenceInValue(item.value)
          : item.value,
      extensions: {
        category: item.path[0] ?? '',
        condition: item.condition,
        conditions: item.conditions,
        cssVar,
        originalPath: Object.freeze([...item.path]),
        prop: item.path.at(-1) ?? '',
      },
    });
  }

  const getCategoryValues = (category: string): Record<string, string> => {
    const values: Record<string, string> = {};
    const entries = Array.from(categoryMap.get(category)?.entries() ?? []).sort(
      ([left], [right]) => compareText(left, right),
    );
    for (const [name, token] of entries) {
      const relativeName = name.startsWith(`${category}.`)
        ? name.slice(category.length + 1)
        : name;
      values[relativeName] = token.extensions.cssVar.ref;
    }
    return values;
  };

  return {
    all: allTokens,
    allTokens,
    categoryMap,
    colorPaletteMap,
    cssVarMap,
    cssVars: cssVarMap,
    expandReferenceInValue,
    flatMap,
    formatCssVar,
    formatTokenName,
    getByName: (name) => tokenMap.get(name),
    getCategoryValues,
    getVar,
    prefix,
    registerToken,
    tokenMap,
  };
}
