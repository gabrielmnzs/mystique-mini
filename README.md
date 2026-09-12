# Mystique Mini

Mystique Mini is a compact React 19 design system. Version 0.2 replaces the old theme object with a Chakra-inspired styled-system: token dictionaries, semantic tokens, conditions, utilities, recipes, slot recipes, a polymorphic factory, and a strict system provider. Its intentionally small component catalog contains exactly seven primitives.

The repository is `mystique-mini`; the package is `@gabrielmnzs/mystique-react`. The 0.2 API and packed artifacts are covered by the local package smoke and dedicated Next.js consumer fixtures. Registry publication is a separate operation and is not implied by this checkout.

## Requirements and development

- Node.js 24
- pnpm 11 through Corepack
- React 19 in consuming applications

```bash
corepack enable
pnpm install
pnpm dev
pnpm test
pnpm check-types
pnpm lint
pnpm build
```

This is a pnpm/Turborepo monorepo:

```text
apps/sandbox/          Vite demonstration app
apps/next15-smoke/     Next.js 15 test fixture
apps/next16-smoke/     Next.js 16 test fixture
packages/react/        @gabrielmnzs/mystique-react source and package
```

## Install

Install the package with its Emotion peer dependency in a React 19 application:

```bash
pnpm add @gabrielmnzs/mystique-react @emotion/react
```

The package is configured for private GitHub Packages publication. A registry consumer can configure the scope without committing a credential:

```ini
@gabrielmnzs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Use a classic GitHub PAT with `read:packages` for `GITHUB_TOKEN`; keep the token itself out of `.npmrc` and source control.

## Strict provider

`MystiqueProvider` never creates or silently selects a system. Pass a `SystemContext` explicitly through `value`:

```tsx
import {
  Box,
  MystiqueProvider,
  Text,
  defaultSystem,
} from '@gabrielmnzs/mystique-react'

export function App() {
  return (
    <MystiqueProvider value={defaultSystem}>
      <Box bg="bg" color="fg" p="6">
        <Text color="accent">Hello Mystique</Text>
      </Box>
    </MystiqueProvider>
  )
}
```

Rendering a Mystique component outside the provider, omitting `value`, or passing an object that was not produced by `createSystem` fails immediately. The provider emits the system's token CSS, preflight, and global CSS through Emotion.

## Tokens, semantic tokens, and a custom theme/system

Token leaves use `{ value }`. Semantic-token leaves use the same shape and can select a value per condition, including `_dark`:

```tsx
import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineSemanticTokens,
  defineTokens,
} from '@gabrielmnzs/mystique-react'

const tokens = defineTokens({
  colors: {
    brand: {
      500: { value: '#7c3aed' },
      700: { value: '#5b21b6' },
    },
  },
  spacing: {
    gutter: { value: '1.25rem' },
  },
})

const semanticTokens = defineSemanticTokens({
  colors: {
    surface: {
      value: { base: '{colors.white}', _dark: '{colors.gray.950}' },
    },
    action: {
      value: { base: '{colors.brand.700}', _dark: '{colors.brand.500}' },
    },
  },
})

const cardRecipe = defineRecipe({
  className: 'mystique-card',
  base: { rounded: 'lg', p: 'gutter' },
  variants: {
    tone: {
      quiet: { bg: 'surface', color: 'fg' },
      action: { bg: 'action', color: 'white' },
    },
  },
  defaultVariants: { tone: 'quiet' },
})

const appConfig = defineConfig({
  theme: {
    tokens,
    semanticTokens,
    recipes: { card: cardRecipe },
  },
})

export const appSystem = createSystem(defaultConfig, appConfig)
```

`createSystem` merges one or more configs. Starting with `defaultConfig` keeps the default breakpoints, utilities, preflight, tokens, semantic tokens, and `text` recipe; starting with `defaultBaseConfig` gives only the foundational conditions, utilities, layers, and preflight.

Use the custom system with the same strict contract:

```tsx
<MystiqueProvider value={appSystem}>{children}</MystiqueProvider>
```

Responsive values can be arrays or condition objects, and condition props can be nested with style props:

```tsx
<Box
  p={{ base: '4', md: 'gutter' }}
  bg="surface"
  _hover={{ bg: 'action', color: 'white' }}
/>
```

## Recipes, `cva`, and `sva`

`defineRecipe` preserves inference for a recipe definition. Pass a definition directly to the factory, or compile it with the current system's `cva`:

```tsx
import { defineRecipe, mystique } from '@gabrielmnzs/mystique-react'

const badgeRecipe = defineRecipe({
  base: { display: 'inline-flex', rounded: 'full', px: '3', py: '1' },
  variants: {
    tone: {
      neutral: { bg: 'gray.100', color: 'gray.900' },
      accent: { bg: 'accent', color: 'white' },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export const Badge = mystique('span', badgeRecipe)
```

The root `cva` and `sva` exports are bound to `defaultSystem`. For a custom theme, use `appSystem.cva(...)` and `appSystem.sva(...)` so token and condition resolution comes from that system:

```tsx
const badge = appSystem.cva(badgeRecipe)
const SystemBadge = mystique('span', badge)

const notice = appSystem.sva({
  className: 'notice',
  slots: ['root', 'title'],
  base: {
    root: { p: 'gutter', bg: 'surface' },
    title: { color: 'action', fontWeight: 'bold' },
  },
  variants: {
    compact: {
      true: {
        root: { p: '2' },
        title: { fontSize: 'sm' },
      },
    },
  },
})
```

`cva` resolves a single style recipe. `sva` resolves one style object per declared slot and is the base for multi-part components through `createSlotRecipeContext`.

## The seven components

The public component catalog is deliberately limited to:

| Component | Default element and behavior |
| --- | --- |
| `Box` | `div`; neutral style-prop primitive |
| `Flex` | `div`; `display: flex` |
| `Center` | `div`; flex centering on both axes |
| `Square` | `div`; equal width and height through `size` |
| `Circle` | `div`; centered square with full radius |
| `Span` | native inline `span`, with no display override |
| `Text` | `p`; reads the consumer system's `text` recipe |

All seven use the same factory and accept system style props, `css`, conditions, responsive values, polymorphism, and refs. No buttons, forms, overlays, layouts, or motion components are part of the 0.2 catalog.

## Factory, polymorphism, composition, and refs

Use either the callable factory or intrinsic shorthand:

```tsx
import { Box, mystique } from '@gabrielmnzs/mystique-react'
import { useRef } from 'react'

const Panel = mystique.div
const Article = mystique('article', {
  base: { p: '4', rounded: 'lg' },
  variants: {
    elevated: { true: { shadow: 'md' } },
  },
})

export function Example() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <Article as="section" ref={sectionRef} elevated>
      <Panel>Polymorphic content</Panel>
      <Box asChild color="accent" _hover={{ textDecoration: 'underline' }}>
        <a href="/docs">Read the docs</a>
      </Box>
    </Article>
  )
}
```

`as` changes the rendered target and its native prop/ref types. `asChild` styles exactly one non-Fragment child and composes its class name, style, event handlers, and ref. Custom targets must pass the received `className` and ref to their rendered element.

When a native HTML attribute collides with the polymorphic or style API, use
its explicit escape hatch: `htmlAlign`, `htmlAs`, `htmlBorder`, `htmlColor`,
`htmlContent`, `htmlHeight`, `htmlSize`, `htmlTranslate`, `htmlWidth`, or
`htmlWrap`. The factory converts it back only when the final intrinsic target
accepts that attribute.

## 0.2 entry points

The 0.2 package publishes explicit ESM, CommonJS, and declaration outputs for every public entry point:

| Import | Purpose |
| --- | --- |
| `@gabrielmnzs/mystique-react` | Seven components, provider, factory, common config helpers, default system, and bound `css`/`cva`/`sva` |
| `@gabrielmnzs/mystique-react/preset` | `defaultBaseConfig`, `defaultThemeConfig`, `defaultConfig`, `defaultSystem`, and `system` |
| `@gabrielmnzs/mystique-react/styled-system` | Low-level config, dictionary, breakpoint, condition, utility, serialization, and system constructors |
| `@gabrielmnzs/mystique-react/next` | App Router streaming registry and `MystiqueNextProvider` |
| `@gabrielmnzs/mystique-react/typegen` | Browser-global-free programmatic type generator |

There are no wildcard deep imports. The package export map selects `.js` plus `.d.ts` for ESM and `.cjs` plus `.d.cts` for CommonJS. The package tarball smoke checks the export map and packed files for every public entry point, executes the Next-free subpaths through ESM and CommonJS, compiles both declaration formats, renders all seven components through SSR, and verifies client directives.

## Next.js App Router, SSR, RSC, and streaming

The integration target is Next.js 15 and 16 with React 19. Keep the system in a client provider module: `SystemContext` contains functions and is not a value to serialize from a Server Component into a Client Component.

```tsx
// app/providers.tsx
'use client'

import { defaultSystem } from '@gabrielmnzs/mystique-react/preset'
import { MystiqueNextProvider } from '@gabrielmnzs/mystique-react/next'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MystiqueNextProvider value={defaultSystem}>
      {children}
    </MystiqueNextProvider>
  )
}
```

```tsx
// app/layout.tsx — remains a Server Component
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```

`MystiqueNextProvider` combines the strict provider with a `mystique` Emotion cache and `useServerInsertedHTML`. It flushes only styles inserted since the previous streamed segment, including global styles. Pass `nonce` when a Content Security Policy requires it.

The registry matters when Mystique components first appear inside a streamed `Suspense` chunk. With Cache Components enabled in Next.js 16, streamed boundaries are the default reason to keep it mounted. Mystique's core entry point and Next adapter do not read `window`, `document`, or another browser global during module import.

The repository keeps the compatibility matrix as dedicated test fixtures rather than application consumers:

- `apps/next15-smoke` pins Next.js 15.5.25 and uses its default Webpack build.
- `apps/next16-smoke` pins Next.js 16.3.4 and explicitly selects Webpack.

Both fixtures exercise App Router SSR, Pages Router SSR with Emotion extraction, a cold production server, and a multi-chunk streamed `Suspense` route. They are validation fixtures, not production applications or evidence of external consumers.

### Pages Router

The Pages Router does not use `useServerInsertedHTML`. Mount the core provider in `pages/_app.tsx` instead:

```tsx
import { MystiqueProvider, defaultSystem } from '@gabrielmnzs/mystique-react'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MystiqueProvider value={defaultSystem}>
      <Component {...pageProps} />
    </MystiqueProvider>
  )
}
```

Do not mount `MystiqueNextProvider` in `_app`; it is the App Router streaming adapter.

### Current Emotion/Turbopack limitation

The current official Chakra UI guidance for both the [App Router](https://chakra-ui.com/docs/get-started/frameworks/next-app#hydration-errors-turbopack) and [Pages Router](https://chakra-ui.com/docs/get-started/frameworks/next-pages#hydration-errors) documents that Turbopack can hydrate Emotion CSS incorrectly, producing a server/client mismatch between an Emotion `<style>` tag and the rendered element. The exact command depends on the Next.js major version.

Next.js 15 uses Webpack by default. Keep the unflagged commands; the pinned 15.5.25 CLI does not accept `--webpack`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

[Next.js 16 makes Turbopack the default](https://nextjs.org/docs/app/guides/upgrading/version-16#turbopack-by-default). Opt back into Webpack for both development and production while the Emotion hydration limitation applies:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start"
  }
}
```

The registry solves streamed style insertion; it does not make that upstream Turbopack hydration limitation disappear.

## Type generation

The 0.2 package exposes both a CLI and a browser-global-free function. Export a config or system as `default`, `system`, or `config`, then generate the module augmentation:

```bash
pnpm exec mystique-typegen ./src/mystique.config.ts ./src/mystique.generated.d.ts
```

```ts
import { generateTypegen } from '@gabrielmnzs/mystique-react/typegen'

const declaration = generateTypegen(appSystem)
```

Keep the generated `.d.ts` inside the consuming TypeScript project's `include`. Generation is deterministic and records token, condition, utility, recipe, and slot-recipe names. The exported `TokenName`, `ConditionName`, and `UtilityName` types read that augmentation; 0.2 does not narrow every raw CSS/style prop to generated names.

## Project notes

- [Migration to 0.2](./MIGRATION.md)
- [Upstream mapping](./UPSTREAM.md)
- [Third-party notices](./THIRD_PARTY_NOTICES.md)
- [MIT license](./LICENSE)
