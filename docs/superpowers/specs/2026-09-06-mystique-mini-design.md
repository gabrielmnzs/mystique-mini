# Mystique Mini v1 Design

## Purpose

Mystique Mini is a compact React design system inspired by Chakra UI's developer experience without copying its name or shipping its complete component catalog. It provides an understandable source layout for learning how a styled-system factory, theme, and React components work together.

## Architecture

The repository is a pnpm 11 and Turborepo monorepo running on Node 24. The published package is `@gabrielmnzs/mystique-react`; `apps/sandbox` consumes it through `workspace:*`. The package emits ESM, CommonJS, and TypeScript declarations through tsup.

The package is organized into three public concepts:

- `theme`: default tokens, theme types, component style configurations, and `extendTheme`
- `system`: style resolution, responsive values, pseudo props, DOM prop filtering, the `mystique()` factory, and provider APIs
- `components`: Box, Flex, Center, Square, Circle, Span, and Text

## Styled-system behavior

Style values may be raw CSS values or theme tokens. The finite v1 prop contract is:

| Group | Props and aliases | Theme scale |
| --- | --- | --- |
| Spacing | `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`, `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` | `space` |
| Sizing | `w`, `h`, `minW`, `maxW`, `minH`, `maxH`, `boxSize` | `sizes`, then `space` |
| Layout | `display`, `position`, `top`, `right`, `bottom`, `left`, `overflow`, `overflowX`, `overflowY`, `zIndex` | `zIndices` for `zIndex` |
| Flexbox | `align`, `justify`, `direction`, `wrap`, `flex`, `basis`, `grow`, `shrink`, `gap`, `rowGap`, `columnGap` | `space` for gaps |
| Typography | `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `textAlign`, `textTransform`, `whiteSpace` | matching typography scale |
| Color | `color`, `bg`, `bgColor`, `opacity` | `colors` |
| Border | `border`, `borderWidth`, `borderStyle`, `borderColor`, `rounded`, `borderRadius` | `borders`, `colors`, or `radii` |
| Effects | `shadow`, `boxShadow`, `cursor`, `transform`, `transition` | `shadows` for shadows |

Token lookup happens before raw CSS fallback. Numeric values for tokenized props first resolve against their scale; unresolved numbers remain numbers for Emotion to serialize according to the CSS property. Zero is preserved. Negative token syntax is not part of v1.

Responsive values support arrays and objects. Array index zero is the base style, followed by `sm`, `md`, `lg`, and `xl`; `null` and `undefined` skip an entry and values beyond the breakpoint list are ignored. Responsive objects are emitted in theme-breakpoint order, with `base` emitted without a media query; unknown keys are ignored. Responsive and token resolution also work inside supported pseudo props.

The v1 pseudo mappings are `_hover` to `&:hover`, `_focus` to `&:focus, &[data-focus=true]`, `_active` to `&:active, &[data-active=true]`, `_disabled` to `&:disabled, &[disabled], &[aria-disabled=true], &[data-disabled=true]`, and `_placeholder` to `&::placeholder`. Pseudo objects may contain style props with responsive values, but pseudos nested inside pseudos are outside v1. Style, pseudo, `variant`, and `recipeSize` props are removed before DOM forwarding. Unknown token strings remain valid raw CSS values.

## Public factory and polymorphism

The public factory contract is `mystique(component, options?)`, where `component` is an intrinsic tag or a React element type and `options` may provide `themeKey` and `baseStyle`. The returned ref-forwarding component defaults to that element and accepts an `as` override.

Compile-time fixtures prove intrinsic attributes, custom-component required props, and element-specific refs remain typed. Invalid attributes fail with `@ts-expect-error`, and no public prop surface may widen to `any`. These checks run against source declarations and the packed artifact.

`boxSize` is the global style prop that sets width and height. `size` is reserved for Square and Circle dimensions. `recipeSize` selects a theme recipe size. `htmlSize` maps explicitly to the native HTML `size` attribute, avoiding collisions.

## Theme behavior

`MystiqueProvider` deep-merges a supplied theme into the default theme. `extendTheme` deep-merges theme objects while replacing arrays. Component configuration supports object-only `baseStyle`, `sizes`, `variants`, and `defaultProps`; recipe functions are outside v1. `defaultProps` only fills absent props. The style order is built-in defaults, theme `baseStyle`, selected `recipeSize`, selected `variant`, then local style props. A factory component finds its recipe through `options.themeKey`.

A minimal global reset is enabled by default through Emotion `Global` and can be disabled with `resetCSS={false}`. Components still receive the default theme when no provider is present. Color mode is not part of v1.

## Component behavior

- Box renders a polymorphic `div`.
- Flex extends Box with `display: flex` and flex aliases.
- Center centers children in both axes.
- Square accepts `size` and applies equal width and height.
- Circle extends Square with the `full` radius token.
- Span renders a semantic `span`.
- Text renders a `p` and supports typography props.

All components forward refs, preserve valid attributes for the selected `as` element, consume theme component styles, and accept responsive and pseudo props. `className`, `style`, events, `aria-*`, and `data-*` are forwarded. Intrinsic elements receive DOM filtering; custom components receive their declared non-Mystique props.

## Distribution

React 19, React DOM 19, and `@emotion/react` are peer dependencies. `@emotion/styled` is a runtime dependency installed transitively. React, React DOM, JSX runtime, and Emotion remain external in ESM and CommonJS builds so consumers have one physical runtime instance. A pre-existing React 19 application installs only:

```bash
pnpm add @gabrielmnzs/mystique-react @emotion/react
```

Private installation requires the `@gabrielmnzs` scope to point to `https://npm.pkg.github.com` and a token with `read:packages`. The published package itself must not set `private: true`. Releases use Changesets and GitHub Actions with `contents: write`, `pull-requests: write`, and `packages: write`; tokens are passed through environment variables and never committed.

The release acceptance path includes an actual workflow publication, confirmation that the resulting package version is associated with `gabrielmnzs/mystique-mini`, and an authenticated clean install of that published version from `npm.pkg.github.com`. A local tarball smoke test remains the pre-publication gate.

## Verification

Vitest, jsdom, React Testing Library, and Emotion-aware style assertions cover pure style resolution and rendered components. Tests include sparse responsive values, zero, unknown breakpoints, nested providers, reset cleanup, native/custom prop forwarding, and recipe-control prop filtering. Packaging checks independently import ESM, require CommonJS, compile declaration fixtures, inspect the packed manifest, and install the tarball into a clean React 19 consumer. The Vite sandbox demonstrates every component, custom theme recipes, responsive syntax, and pseudo states on desktop and mobile.

## Explicitly deferred

Color mode, semantic tokens, extended selectors, the full CSS prop catalog, advanced layouts, interactive controls, form controls, SSR adapters, Storybook visual regression, and motion components are post-v1 roadmap work.
