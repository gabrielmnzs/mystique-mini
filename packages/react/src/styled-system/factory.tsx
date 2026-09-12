'use client';

import * as React from 'react';
import emotionIsPropValid from '@emotion/is-prop-valid';
import { ClassNames } from '@emotion/react';

import { mergeCvaStyles } from './cva';
import type {
  JsxFactory,
  JsxFactoryOptions,
  RecipeInput,
  StyledFactoryFn,
} from './factory.types';
import { interopDefault } from './interop-default';
import { useMystiqueContext } from './provider';
import type { SystemContext } from './system';
import type { CvaFn, SystemStyleObject, SystemStyleObjectInput } from './types';

/**
 * Private transport used by recipe contexts for styles that have already gone
 * through the system serializer. It deliberately is not part of the public
 * component prop types or the styled-system barrel.
 */
export const MYSTIQUE_RESOLVED_STYLES_PROP = '__mystiqueResolvedStyles';

const isPropValid = interopDefault(emotionIsPropValid);
const eventName = /^on[A-Z]/;
// Intentionally retain the pre-rename registry key. Factories created by
// `@gabrielmnzs/mystique-react` 0.2 and `mystique-mini-react` must be able to
// unwrap each other's metadata when both package names are present during a
// consumer migration.
const FACTORY_METADATA = Symbol.for(
  '@gabrielmnzs/mystique-react/factory-metadata',
);
const htmlPropMap = {
  dirName: 'dirname',
  htmlAlign: 'align',
  htmlAs: 'as',
  htmlBorder: 'border',
  htmlColor: 'color',
  htmlContent: 'content',
  htmlHeight: 'height',
  htmlSize: 'size',
  htmlTranslate: 'translate',
  htmlWidth: 'width',
  htmlWrap: 'wrap',
} as const;

// Emotion validates most React DOM names, but it neither tracks the final
// `as`/`asChild` target nor every React 19 attribute. The explicit map is
// authoritative for known HTML targets; custom elements and SVG fall back to
// Emotion's syntax validation.
const htmlTargets = new Set([
  'a',
  'abbr',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'data',
  'datalist',
  'dd',
  'del',
  'details',
  'dfn',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'main',
  'map',
  'mark',
  'menu',
  'menuitem',
  'meta',
  'meter',
  'nav',
  'noindex',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'picture',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'search',
  'section',
  'select',
  'slot',
  'small',
  'source',
  'span',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
  'webview',
]);
const targetSpecificProps: Readonly<Record<string, ReadonlySet<string>>> = {
  abbr: new Set(['td', 'th']),
  acceptCharset: new Set(['form']),
  accept: new Set(['input']),
  action: new Set(['form']),
  align: new Set(['table', 'td', 'th']),
  alt: new Set(['area', 'img', 'input']),
  autoComplete: new Set(['form', 'input', 'select', 'textarea']),
  autoPlay: new Set(['audio', 'video']),
  allow: new Set(['iframe']),
  allowFullScreen: new Set(['iframe', 'webview']),
  allowTransparency: new Set(['iframe']),
  allowpopups: new Set(['webview']),
  as: new Set(['link']),
  async: new Set(['script']),
  autosize: new Set(['webview']),
  bgcolor: new Set(['table']),
  blinkfeatures: new Set(['webview']),
  blocking: new Set(['link', 'script', 'style']),
  border: new Set(['table']),
  capture: new Set(['input']),
  cellPadding: new Set(['table']),
  cellSpacing: new Set(['table']),
  challenge: new Set(['keygen']),
  charSet: new Set(['link', 'meta', 'script']),
  checked: new Set(['input']),
  cite: new Set(['blockquote', 'del', 'ins', 'q']),
  classID: new Set(['object']),
  closedby: new Set(['dialog']),
  cols: new Set(['textarea']),
  colSpan: new Set(['td', 'th']),
  contentEditable: new Set(htmlTargets),
  controls: new Set(['audio', 'video']),
  controlsList: new Set(['audio', 'video']),
  coords: new Set(['area']),
  crossOrigin: new Set(['audio', 'img', 'link', 'script', 'video']),
  data: new Set(['object']),
  dateTime: new Set(['del', 'ins', 'time']),
  decoding: new Set(['img']),
  default: new Set(['track']),
  defaultChecked: new Set(['input']),
  defaultValue: new Set(['input', 'option', 'select', 'textarea']),
  defer: new Set(['script']),
  dirname: new Set(['textarea']),
  disabled: new Set([
    'button',
    'fieldset',
    'input',
    'keygen',
    'optgroup',
    'option',
    'select',
    'textarea',
  ]),
  disablePictureInPicture: new Set(['video']),
  disableRemotePlayback: new Set(['audio', 'video']),
  disableblinkfeatures: new Set(['webview']),
  disableguestresize: new Set(['webview']),
  disablewebsecurity: new Set(['webview']),
  download: new Set(['a', 'area']),
  encType: new Set(['form']),
  fetchPriority: new Set(['img', 'link', 'script']),
  form: new Set([
    'button',
    'fieldset',
    'input',
    'keygen',
    'label',
    'meter',
    'object',
    'output',
    'select',
    'textarea',
  ]),
  formAction: new Set(['button', 'input']),
  formEncType: new Set(['button', 'input']),
  formMethod: new Set(['button', 'input']),
  formNoValidate: new Set(['button', 'input']),
  formTarget: new Set(['button', 'input']),
  frame: new Set(['table']),
  frameBorder: new Set(['iframe']),
  guestinstance: new Set(['webview']),
  headers: new Set(['td', 'th']),
  href: new Set([
    'a',
    'animate',
    'animateMotion',
    'animateTransform',
    'area',
    'base',
    'feImage',
    'image',
    'link',
    'mpath',
    'set',
    'textPath',
    'use',
    'style',
  ]),
  hrefLang: new Set(['a', 'area', 'link']),
  httpEquiv: new Set(['meta']),
  htmlFor: new Set(['label', 'output']),
  integrity: new Set(['link', 'script']),
  high: new Set(['meter']),
  httpreferrer: new Set(['webview']),
  imageSizes: new Set(['link']),
  imageSrcSet: new Set(['link']),
  isMap: new Set(['img']),
  keyParams: new Set(['keygen']),
  keyType: new Set(['keygen']),
  kind: new Set(['track']),
  label: new Set(['optgroup', 'option', 'track']),
  list: new Set(['input']),
  loading: new Set(['iframe', 'img']),
  loop: new Set(['audio', 'video']),
  low: new Set(['meter']),
  manifest: new Set(['html']),
  marginHeight: new Set(['iframe']),
  marginWidth: new Set(['iframe']),
  max: new Set(['input', 'meter', 'progress']),
  media: new Set(['a', 'area', 'link', 'meta', 'source', 'style']),
  mediaGroup: new Set(['audio', 'video']),
  content: new Set(['meta']),
  height: new Set([
    'canvas',
    'embed',
    'iframe',
    'img',
    'input',
    'object',
    'source',
    'td',
    'video',
  ]),
  method: new Set(['form']),
  maxLength: new Set(['input', 'textarea']),
  min: new Set(['input', 'meter']),
  minLength: new Set(['input', 'textarea']),
  multiple: new Set(['input', 'select']),
  muted: new Set(['audio', 'video']),
  name: new Set([
    'button',
    'details',
    'fieldset',
    'form',
    'iframe',
    'input',
    'keygen',
    'map',
    'meta',
    'object',
    'output',
    'param',
    'select',
    'slot',
    'textarea',
  ]),
  nodeintegration: new Set(['webview']),
  noModule: new Set(['script']),
  noValidate: new Set(['form']),
  open: new Set(['details', 'dialog']),
  onCancel: new Set(['dialog']),
  onClose: new Set(['dialog']),
  onResize: new Set(['video']),
  onResizeCapture: new Set(['video']),
  optimum: new Set(['meter']),
  partition: new Set(['webview']),
  pattern: new Set(['input']),
  placeholder: new Set(['input', 'textarea']),
  playsInline: new Set(['audio', 'video']),
  ping: new Set(['a', 'area']),
  plugins: new Set(['webview']),
  poster: new Set(['video']),
  popoverTarget: new Set(['button', 'input']),
  popoverTargetAction: new Set(['button', 'input']),
  precedence: new Set(['link', 'style']),
  preload: new Set(['audio', 'video', 'webview']),
  readOnly: new Set(['input', 'textarea']),
  referrerPolicy: new Set(['a', 'area', 'iframe', 'img', 'link', 'script']),
  rel: new Set(['a', 'area', 'form', 'link']),
  required: new Set(['input', 'select', 'textarea']),
  reversed: new Set(['ol']),
  rules: new Set(['table']),
  rows: new Set(['textarea']),
  rowSpan: new Set(['td', 'th']),
  sandbox: new Set(['iframe']),
  scope: new Set(['td', 'th']),
  scoped: new Set(['style']),
  scrolling: new Set(['iframe']),
  seamless: new Set(['iframe']),
  selected: new Set(['option']),
  shape: new Set(['area']),
  size: new Set(['input', 'select']),
  sizes: new Set(['img', 'link', 'source']),
  span: new Set(['col', 'colgroup']),
  src: new Set([
    'audio',
    'embed',
    'iframe',
    'img',
    'input',
    'script',
    'source',
    'track',
    'video',
    'webview',
  ]),
  srcLang: new Set(['track']),
  srcDoc: new Set(['iframe']),
  srcSet: new Set(['img', 'source']),
  start: new Set(['ol']),
  step: new Set(['input']),
  summary: new Set(['table']),
  target: new Set(['a', 'area', 'base', 'form']),
  type: new Set([
    'a',
    'button',
    'embed',
    'input',
    'link',
    'menu',
    'object',
    'ol',
    'script',
    'source',
    'style',
  ]),
  useMap: new Set(['img', 'object']),
  useragent: new Set(['webview']),
  value: new Set([
    'button',
    'data',
    'input',
    'li',
    'meter',
    'option',
    'param',
    'progress',
    'select',
    'textarea',
  ]),
  width: new Set([
    'canvas',
    'col',
    'embed',
    'iframe',
    'img',
    'input',
    'object',
    'source',
    'table',
    'td',
    'video',
  ]),
  valign: new Set(['td']),
  webpreferences: new Set(['webview']),
  wmode: new Set(['object']),
  wrap: new Set(['textarea']),
};
const internalProps = new Set([
  'as',
  'asChild',
  'className',
  'css',
  MYSTIQUE_RESOLVED_STYLES_PROP,
  'recipe',
  'ref',
  'unstyled',
]);

type AnyProps = Record<string, unknown>;
type AnyRef = React.Ref<unknown>;

interface FactoryLayer {
  options: JsxFactoryOptions;
  recipe: RecipeInput;
}

interface FactoryMetadata {
  baseTarget: React.ElementType;
  layers: readonly FactoryLayer[];
}

interface ResolvedFactoryLayer extends FactoryLayer {
  variantKeys: readonly string[];
}

function getFactoryMetadata(
  target: React.ElementType,
): FactoryMetadata | undefined {
  if (typeof target === 'string') return;
  return (target as unknown as Record<PropertyKey, unknown>)[
    FACTORY_METADATA
  ] as FactoryMetadata | undefined;
}

function isCvaFn(value: RecipeInput): value is CvaFn {
  return (
    typeof value === 'function' &&
    Array.isArray(value.variantKeys) &&
    typeof value.splitVariantProps === 'function'
  );
}

function mergeDefined(
  defaults: Readonly<AnyProps> | undefined,
  props: Readonly<AnyProps>,
): AnyProps {
  const result: AnyProps = { ...defaults };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) result[key] = value;
  }
  return result;
}

function mergeElementProps(parent: AnyProps, child: AnyProps): AnyProps {
  const result: AnyProps = { ...parent };

  for (const [key, childValue] of Object.entries(child)) {
    if (key === 'ref' || childValue === undefined) continue;
    const parentValue = result[key];

    if (
      eventName.test(key) &&
      typeof parentValue === 'function' &&
      typeof childValue === 'function'
    ) {
      result[key] = (...args: unknown[]) => {
        parentValue(...args);
        childValue(...args);
      };
      continue;
    }

    if (key === 'style') {
      result.style = {
        ...(typeof parentValue === 'object' && parentValue !== null
          ? parentValue
          : {}),
        ...(typeof childValue === 'object' && childValue !== null
          ? childValue
          : {}),
      };
      continue;
    }

    result[key] = childValue;
  }

  return result;
}

function assignRef(ref: AnyRef, value: unknown): void | (() => void) {
  if (typeof ref === 'function') return ref(value);
  if (ref !== null) {
    (ref as React.MutableRefObject<unknown>).current = value;
  }
}

const supportsRefCleanup = Number.parseInt(React.version, 10) >= 19;

function mergeRefs(
  ...refs: Array<AnyRef | undefined>
): React.RefCallback<unknown> {
  const available = refs.filter((ref): ref is AnyRef => ref != null);

  return (node) => {
    const cleanups = available.map((ref) => ({
      cleanup: assignRef(ref, node),
      ref,
    }));

    if (!supportsRefCleanup) return;
    return () => {
      for (const item of cleanups) {
        if (typeof item.cleanup === 'function') item.cleanup();
        else assignRef(item.ref, null);
      }
    };
  };
}

function getElementRef(
  element: React.ReactElement<AnyProps>,
): AnyRef | undefined {
  if (supportsRefCleanup) return element.props.ref as AnyRef | undefined;
  return (element as unknown as { ref?: AnyRef }).ref;
}

function flattenCssInput(
  input: SystemStyleObjectInput | undefined,
  output: SystemStyleObject[] = [],
): SystemStyleObject[] {
  if (!input) return output;
  if (Array.isArray(input)) {
    for (const item of input) flattenCssInput(item, output);
    return output;
  }
  if (typeof input === 'object') output.push(input as SystemStyleObject);
  return output;
}

function targetAcceptsProp(target: React.ElementType, prop: string): boolean {
  if (typeof target === 'string') {
    const targets = targetSpecificProps[prop];
    if (targets && htmlTargets.has(target)) return targets.has(target);
    return isPropValid(prop);
  }
  return prop !== 'theme';
}

function explicitlyForwardsProp(
  prop: string,
  layers: readonly ResolvedFactoryLayer[],
): boolean {
  return layers.some((layer) => layer.options.forwardProps?.includes(prop));
}

function optionLayersAcceptProp(
  prop: string,
  target: React.ElementType,
  layers: readonly ResolvedFactoryLayer[],
): boolean {
  return layers.every(
    (layer) =>
      layer.options.shouldForwardProp?.(prop, layer.variantKeys, target) ??
      true,
  );
}

function shouldForwardProp(
  prop: string,
  target: React.ElementType,
  system: SystemContext,
  variantKeys: readonly string[],
  layers: readonly ResolvedFactoryLayer[],
): boolean {
  const explicitlyForwarded = explicitlyForwardsProp(prop, layers);
  if (
    !explicitlyForwarded &&
    (internalProps.has(prop) ||
      variantKeys.includes(prop) ||
      system.isValidProperty(prop))
  ) {
    return false;
  }
  if (!targetAcceptsProp(target, prop)) return false;
  return optionLayersAcceptProp(prop, target, layers);
}

function filterParentProps(
  props: AnyProps,
  target: React.ElementType,
  system: SystemContext,
  variantKeys: readonly string[],
  layers: readonly ResolvedFactoryLayer[],
): AnyProps {
  const result: AnyProps = {};
  for (const [key, value] of Object.entries(props)) {
    const nativeProp = htmlPropMap[key as keyof typeof htmlPropMap];
    if (nativeProp) {
      if (
        targetAcceptsProp(target, nativeProp) &&
        optionLayersAcceptProp(nativeProp, target, layers)
      ) {
        result[nativeProp] = value;
      }
      continue;
    }
    if (shouldForwardProp(key, target, system, variantKeys, layers)) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Props authored on an `asChild` child belong to that child. In particular,
 * another Mystique component must receive its own `as`, `css`, style, and
 * recipe props so it can interpret them itself. Intrinsic children still get
 * target-aware DOM filtering.
 */
function filterChildProps(
  props: AnyProps,
  target: React.ElementType,
): AnyProps {
  const result: AnyProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'ref' || key === 'className') continue;

    if (typeof target !== 'string') {
      if (key !== 'theme') result[key] = value;
      continue;
    }

    const nativeProp = htmlPropMap[key as keyof typeof htmlPropMap];
    if (nativeProp) {
      if (targetAcceptsProp(target, nativeProp)) {
        result[nativeProp] = value;
      }
      continue;
    }
    if (targetAcceptsProp(target, key)) {
      result[key] = value;
    }
  }
  return result;
}

function resolveRecipe(
  system: SystemContext,
  recipe: RecipeInput,
  cache: WeakMap<SystemContext, CvaFn>,
): CvaFn {
  if (isCvaFn(recipe)) return recipe;
  const cached = cache.get(system);
  if (cached) return cached;
  const value = system.cva(recipe);
  cache.set(system, value);
  return value;
}

function getDisplayName(target: React.ElementType): string {
  if (typeof target === 'string') return target;
  return target.displayName || target.name || 'Component';
}

function createStyled(
  baseTarget: React.ElementType,
  recipe: RecipeInput = {},
  options: JsxFactoryOptions = {},
) {
  if (baseTarget === undefined || baseTarget === null) {
    throw new Error(
      '[mystique > factory] Cannot create a styled element from an undefined target.',
    );
  }

  const inheritedMetadata = getFactoryMetadata(baseTarget);
  const factoryMetadata: FactoryMetadata = Object.freeze({
    baseTarget: inheritedMetadata?.baseTarget ?? baseTarget,
    layers: Object.freeze([
      ...(inheritedMetadata?.layers ?? []),
      Object.freeze({ options, recipe }),
    ]),
  });
  const recipeCaches = factoryMetadata.layers.map(
    () => new WeakMap<SystemContext, CvaFn>(),
  );
  const defaultProps = factoryMetadata.layers.reduce<AnyProps>(
    (result, layer) =>
      mergeDefined(
        result,
        (layer.options.defaultProps as AnyProps | undefined) ?? {},
      ),
    {},
  );
  const forwardedProps = new Set(
    factoryMetadata.layers.flatMap((layer) => layer.options.forwardProps ?? []),
  );

  const Styled = React.forwardRef<unknown, AnyProps>(
    function MystiqueStyled(inputProps, forwardedRef) {
      const system = useMystiqueContext();
      const cvaRecipes = React.useMemo(
        () =>
          factoryMetadata.layers.map((layer, index) =>
            resolveRecipe(system, layer.recipe, recipeCaches[index]!),
          ),
        [system],
      );
      const resolvedFactoryLayers = React.useMemo(
        () =>
          factoryMetadata.layers.map((layer, index) => ({
            ...layer,
            variantKeys: cvaRecipes[index]!.variantKeys,
          })),
        [cvaRecipes],
      );
      const props = mergeDefined(defaultProps, inputProps);
      const variantKeys = React.useMemo(
        () =>
          Array.from(new Set(cvaRecipes.flatMap((item) => item.variantKeys))),
        [cvaRecipes],
      );
      const variantProps: AnyProps = {};
      const styleProps: AnyProps = {};
      const elementProps: AnyProps = {};

      const as = props.as as React.ElementType | undefined;
      const asChild = props.asChild === true;
      const unstyled = props.unstyled === true;
      const inputClassName = props.className as string | undefined;
      const cssProp = props.css as SystemStyleObjectInput | undefined;
      const contextStyles = props[MYSTIQUE_RESOLVED_STYLES_PROP] as
        Record<string, unknown> | undefined;
      const children = props.children as React.ReactNode;

      for (const [key, value] of Object.entries(props)) {
        if (internalProps.has(key) || key === 'children') continue;
        if (forwardedProps.has(key)) {
          elementProps[key] = value;
        } else if (variantKeys.includes(key)) {
          variantProps[key] = value;
        } else if (system.isValidProperty(key)) {
          styleProps[key] = value;
        } else {
          elementProps[key] = value;
        }
      }

      const recipeStyles = unstyled
        ? []
        : cvaRecipes.map((item) => item(variantProps as Parameters<CvaFn>[0]));
      const resolvedStyles = mergeCvaStyles(
        ...recipeStyles,
        contextStyles ?? {},
        system.css(
          ...flattenCssInput(cssProp),
          styleProps as SystemStyleObject,
        ),
      );

      let child: React.ReactElement<AnyProps> | undefined;
      let finalTarget = as ?? factoryMetadata.baseTarget;

      if (asChild) {
        let onlyChild: React.ReactNode;
        try {
          onlyChild = React.Children.only(children);
        } catch {
          throw new Error(
            '[mystique > factory] `asChild` requires exactly one valid React element.',
          );
        }
        if (!React.isValidElement<AnyProps>(onlyChild)) {
          throw new Error(
            '[mystique > factory] `asChild` requires exactly one valid React element.',
          );
        }
        if (onlyChild.type === React.Fragment) {
          throw new Error(
            '[mystique > factory] `asChild` cannot target a React.Fragment.',
          );
        }
        child = onlyChild;
        finalTarget = onlyChild.type as React.ElementType;
      }

      const filteredParentProps = filterParentProps(
        elementProps,
        finalTarget,
        system,
        variantKeys,
        resolvedFactoryLayers,
      );
      const childClassName = child?.props.className as string | undefined;
      let mergedProps = child
        ? mergeElementProps(
            filteredParentProps,
            filterChildProps(child.props, finalTarget),
          )
        : { ...filteredParentProps, children };
      const childRef = child ? getElementRef(child) : undefined;
      Reflect.deleteProperty(mergedProps, 'className');

      const finalProps: AnyProps = { ...mergedProps };

      const refs = [forwardedRef as AnyRef | undefined, childRef].filter(
        Boolean,
      );
      if (refs.length === 1) finalProps.ref = refs[0];
      if (refs.length > 1) finalProps.ref = mergeRefs(...refs);
      if (child?.key != null) finalProps.key = child.key;

      return (
        <ClassNames>
          {({ css, cx }) => {
            const generatedClassName = Object.keys(resolvedStyles).length
              ? css(resolvedStyles as Parameters<typeof css>[0])
              : undefined;
            const className = cx(
              ...(unstyled ? [] : cvaRecipes.map((item) => item.className)),
              inputClassName,
              childClassName,
              generatedClassName,
            );
            if (className) finalProps.className = className;
            return React.createElement(finalTarget, finalProps);
          }}
        </ClassNames>
      );
    },
  );

  Styled.displayName =
    options.displayName ?? `mystique(${getDisplayName(baseTarget)})`;
  Object.defineProperties(Styled, {
    [FACTORY_METADATA]: { value: factoryMetadata },
    __mystique_base: { value: factoryMetadata.baseTarget },
    __mystique_recipe: { value: recipe },
  });
  return Styled;
}

const styledFactory = createStyled.bind(undefined) as unknown as JsxFactory;
const intrinsicCache = new Map<string, unknown>();

const mystiqueImpl = new Proxy(styledFactory, {
  apply(_target, _thisArg, args: Parameters<typeof createStyled>) {
    return createStyled(...args);
  },
  get(target, property, receiver) {
    if (typeof property !== 'string' || Reflect.has(target, property)) {
      return Reflect.get(target, property, receiver);
    }
    let component = intrinsicCache.get(property);
    if (!component) {
      component = createStyled(property as React.ElementType);
      intrinsicCache.set(property, component);
    }
    return component;
  },
});

export const mystique = mystiqueImpl as unknown as StyledFactoryFn;
