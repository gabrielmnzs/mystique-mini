import { type Breakpoints, createBreakpoints } from './breakpoints';
import { type Conditions, createConditions } from './conditions';
import type { SystemConfig } from './config';
import { createCva } from './cva';
import {
  type Layers,
  createLayers,
  serializeCssRule,
  serializeGlobalCss,
} from './layers';
import { mergeConfigs } from './merge-config';
import { type NormalizeFn, createNormalize } from './normalize';
import { defaultPreflight } from './preflight';
import { type SerializeFn, createSerialize } from './serialize';
import { createSva } from './sva';
import {
  type SemanticTokenDefinition,
  type Token,
  type TokenDefinition,
  type TokenDictionary,
  createTokenDictionary,
} from './token-dictionary';
import type {
  CssFn,
  CssValue,
  CvaFn,
  GlobalAtRuleObject,
  GlobalCss,
  RecipeDefinition,
  RecipeVariantProps,
  SlotRecipeDefinition,
  SlotRecipeVariantProps,
  SvaFn,
  SystemStyleObject,
  UtilityConfig,
} from './types';
import { type Utility, createUtility } from './utility';
import { hash, isPlainObject } from './utils';

// Intentionally retain the pre-rename registry key so a SystemContext created
// by `@gabrielmnzs/mystique-react` 0.2 is still nominally accepted by the
// renamed `mystique-mini-react` provider (and vice versa) during migration.
const SYSTEM_CONTEXT_MARKER = Symbol.for(
  '@gabrielmnzs/mystique-react/system-context',
);

interface ThemeConfigShape {
  breakpoints?: Record<string, string | { value: string }>;
  tokens?: TokenDefinition;
  semanticTokens?: SemanticTokenDefinition;
  recipes?: Record<string, RecipeDefinition>;
  slotRecipes?: Record<string, SlotRecipeDefinition>;
}

interface ConfigShape extends SystemConfig {
  cssVarsPrefix?: string;
  cssVarsRoot?: string;
  conditions?: Record<string, string>;
  utilities?: UtilityConfig;
  layers?: readonly string[];
  disableLayers?: boolean;
  preflight?: boolean | Record<string, SystemStyleObject>;
  globalCss?: GlobalCss;
  theme?: ThemeConfigShape;
}

export interface SystemQuery {
  tokens(category?: string): readonly Token[];
  token(name: string): Token | undefined;
}

export interface SystemContext {
  readonly $$mystique: true;
  readonly _config: ConfigShape;
  readonly _global: readonly Record<string, SystemStyleObject>[];
  readonly _globalCss: string;
  readonly breakpoints: Breakpoints;
  readonly conditions: Conditions;
  readonly utility: Utility;
  readonly tokens: TokenDictionary;
  readonly properties: ReadonlySet<string>;
  readonly layers: Layers;
  readonly normalizeValue: NormalizeFn;
  readonly serialize: SerializeFn;
  readonly css: CssFn;
  readonly cva: <const T extends RecipeDefinition = RecipeDefinition>(
    definition?: T,
  ) => CvaFn<RecipeVariantProps<T>>;
  readonly sva: <const T extends SlotRecipeDefinition>(
    definition: T,
  ) => SvaFn<SlotRecipeVariantProps<T>>;
  readonly query: SystemQuery;
  token(path: string, fallback?: CssValue): CssValue;
  getTokenCss(): string;
  getPreflightCss(): string;
  getGlobalCss(): string;
  isValidProperty(name: string): boolean;
  splitCssProps<T extends Record<string, unknown>>(
    props: T,
  ): [Record<string, unknown>, Record<string, unknown>];
  getRecipe(key: string): RecipeDefinition | undefined;
  getSlotRecipe(key: string): SlotRecipeDefinition | undefined;
  getRecipeFn(key: string): CvaFn | undefined;
  getSlotRecipeFn(key: string): SvaFn | undefined;
  isRecipe(key: string): boolean;
  isSlotRecipe(key: string): boolean;
  hasRecipe(key: string): boolean;
  hasSlotRecipe(key: string): boolean;
}

export function isSystemContext(value: unknown): value is SystemContext {
  if (value === null || typeof value !== 'object' || !Object.isFrozen(value)) {
    return false;
  }

  const candidate = value as SystemContext & Record<PropertyKey, unknown>;
  return (
    candidate[SYSTEM_CONTEXT_MARKER] === true &&
    candidate.$$mystique === true &&
    typeof candidate.css === 'function' &&
    typeof candidate.cva === 'function' &&
    typeof candidate.sva === 'function' &&
    typeof candidate.token === 'function' &&
    typeof candidate.getGlobalCss === 'function' &&
    typeof candidate.isValidProperty === 'function'
  );
}

function unwrapBreakpoints(
  values: ThemeConfigShape['breakpoints'] = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : value.value,
    ]),
  );
}

function resolveGlobalStyles(
  source: GlobalCss | undefined,
  css: CssFn,
): Record<string, Record<string, unknown>> {
  if (!source) return {};

  const resolveAtRule = (
    value: SystemStyleObject | GlobalAtRuleObject,
  ): Record<string, unknown> => {
    const entries = Object.entries(value);
    const onlyDeclarations = entries.every(
      ([, item]) =>
        item === null ||
        item === undefined ||
        typeof item === 'string' ||
        typeof item === 'number',
    );
    if (onlyDeclarations) return { ...value };

    return Object.fromEntries(
      entries.map(([name, item]) => {
        if (!isPlainObject(item)) return [name, item];
        return [
          name,
          name.startsWith('@')
            ? resolveAtRule(item as GlobalAtRuleObject)
            : css(item as SystemStyleObject),
        ];
      }),
    );
  };

  return Object.fromEntries(
    Object.entries(source).map(([selector, style]) => [
      selector,
      selector.startsWith('@')
        ? resolveAtRule(style)
        : css(style as SystemStyleObject),
    ]),
  );
}

function variablesRule(selector: string, values: Map<string, string>): string {
  return serializeCssRule(selector, Object.fromEntries(values));
}

function conditionVariablesRule(
  root: string,
  condition: string,
  values: Map<string, string>,
  conditions: Conditions,
): string {
  if (condition === 'base') return variablesRule(root, values);
  if (!conditions.has(condition)) return '';
  const resolved = conditions.resolve(condition);
  if (resolved.startsWith('@'))
    return `${resolved}{${variablesRule(root, values)}}`;
  const selector = resolved.includes('&')
    ? resolved.replaceAll('&', root)
    : `${resolved} ${root}`;
  return variablesRule(selector, values);
}

export function createSystem(
  ...inputConfigs: readonly SystemConfig[]
): SystemContext {
  const config = mergeConfigs(...inputConfigs) as ConfigShape;
  const theme = config.theme ?? {};
  const breakpointValues = unwrapBreakpoints(theme.breakpoints);
  const breakpoints = createBreakpoints(breakpointValues);
  const conditions = createConditions({
    breakpoints,
    conditions: config.conditions,
  });
  const tokens = createTokenDictionary({
    breakpoints: breakpointValues,
    cssVarsPrefix: config.cssVarsPrefix ?? 'mystique',
    semanticTokens: theme.semanticTokens,
    tokens: theme.tokens,
  });
  const token = (path: string, fallback?: CssValue): CssValue => {
    const variable = tokens.getVar(path);
    if (variable !== undefined) return variable;
    return fallback ?? path;
  };
  const utility = createUtility({ config: config.utilities ?? {}, token });
  const normalizeValue = createNormalize({
    breakpointKeys: breakpoints.keys().slice(1),
  });
  const serialize = createSerialize({
    conditions,
    normalize: normalizeValue,
    utility,
  });
  const css = serialize as CssFn;
  const layers = createLayers(config.disableLayers ? [] : config.layers);
  const wrapRecipe = (styles: Record<string, unknown>) =>
    layers.wrapObject('recipes', styles);
  const cva = createCva(css, normalizeValue, wrapRecipe);
  const sva = createSva(css, normalizeValue, wrapRecipe);
  const properties = new Set(utility.keys);
  const root = config.cssVarsRoot ?? ':where(:root, :host)';
  const recipes = theme.recipes ?? {};
  const slotRecipes = theme.slotRecipes ?? {};
  const recipeCache = new Map<string, CvaFn>();
  const slotRecipeCache = new Map<string, SvaFn>();

  const getTokenCss = () => {
    let output = '';
    for (const condition of conditions.sort([...tokens.cssVars.keys()])) {
      const values = tokens.cssVars.get(condition);
      if (!values) continue;
      output += conditionVariablesRule(root, condition, values, conditions);
    }
    return config.disableLayers ? output : layers.wrap('tokens', output);
  };

  const preflightSource =
    config.preflight === false
      ? undefined
      : isPlainObject(config.preflight)
        ? (config.preflight as Record<string, SystemStyleObject>)
        : defaultPreflight;
  const resolvedPreflight = resolveGlobalStyles(preflightSource, css);
  const resolvedGlobal = resolveGlobalStyles(config.globalCss, css);
  const getPreflightCss = () => {
    const output = serializeGlobalCss(resolvedPreflight);
    return config.disableLayers ? output : layers.wrap('reset', output);
  };
  const getBaseCss = () => {
    const output = serializeGlobalCss(resolvedGlobal);
    return config.disableLayers ? output : layers.wrap('base', output);
  };
  const getGlobalCss = () =>
    [layers.atRule, getTokenCss(), getPreflightCss(), getBaseCss()].join('');
  const globalCss = getGlobalCss();

  const isValidProperty = (name: string) => {
    return (
      name === 'css' ||
      name.startsWith('--') ||
      utility.has(name) ||
      conditions.has(name)
    );
  };

  const getRecipeFn = (key: string) => {
    const definition = recipes[key];
    if (!definition) return;
    let recipe = recipeCache.get(key);
    if (!recipe) {
      recipe = cva(definition);
      recipeCache.set(key, recipe);
    }
    return recipe;
  };

  const getSlotRecipeFn = (key: string) => {
    const definition = slotRecipes[key];
    if (!definition) return;
    let recipe = slotRecipeCache.get(key);
    if (!recipe) {
      recipe = sva(definition);
      slotRecipeCache.set(key, recipe);
    }
    return recipe;
  };

  const context: SystemContext = {
    $$mystique: true,
    _config: config,
    _global: [
      resolvedPreflight as Record<string, SystemStyleObject>,
      resolvedGlobal as Record<string, SystemStyleObject>,
    ],
    _globalCss: globalCss,
    breakpoints,
    conditions,
    utility,
    tokens,
    properties,
    layers,
    normalizeValue,
    serialize,
    css,
    cva,
    sva,
    query: {
      token: (name) => tokens.getByName(name),
      tokens: (category) =>
        category
          ? tokens.all.filter((item) => item.extensions.category === category)
          : tokens.all,
    },
    token,
    getTokenCss,
    getPreflightCss,
    getGlobalCss,
    isValidProperty,
    splitCssProps(props) {
      const styleProps: Record<string, unknown> = {};
      const elementProps: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        (isValidProperty(key) ? styleProps : elementProps)[key] = value;
      }
      return [styleProps, elementProps];
    },
    getRecipe: (key) => recipes[key],
    getSlotRecipe: (key) => slotRecipes[key],
    getRecipeFn,
    getSlotRecipeFn,
    isRecipe: (key) => Object.prototype.hasOwnProperty.call(recipes, key),
    isSlotRecipe: (key) =>
      Object.prototype.hasOwnProperty.call(slotRecipes, key),
    hasRecipe: (key) =>
      Object.prototype.hasOwnProperty.call(recipes, key) ||
      Object.prototype.hasOwnProperty.call(slotRecipes, key),
    hasSlotRecipe: (key) =>
      Object.prototype.hasOwnProperty.call(slotRecipes, key),
  };

  Object.defineProperties(context, {
    [SYSTEM_CONTEXT_MARKER]: { value: true },
    [Symbol.toStringTag]: { value: `MystiqueSystem:${hash(globalCss)}` },
  });
  return Object.freeze(context);
}
