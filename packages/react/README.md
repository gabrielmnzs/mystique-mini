# @gabrielmnzs/mystique-react

Mystique is a compact React 19 design-system package. Version 0.2 provides a token-driven styled-system, semantic tokens, conditions, recipes, slot recipes, a polymorphic factory, and exactly seven components: `Box`, `Flex`, `Center`, `Square`, `Circle`, `Span`, and `Text`.

The package is configured for private GitHub Packages publication. Its 0.2 API, packed ESM/CommonJS artifacts, and declarations are covered by the package smoke; dedicated Next.js consumer fixtures cover the integration matrix. Registry publication is a separate operation and is not implied by this document.

## Install

```bash
pnpm add @gabrielmnzs/mystique-react @emotion/react
```

For the private registry, configure the scope and supply the token through the environment:

```ini
@gabrielmnzs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Use a classic GitHub PAT with `read:packages`. Do not commit the token.

## Provider and default system

The provider is strict: `value` is required and must be a system returned by `createSystem`.

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

The provider emits tokens, preflight, and configured global styles through Emotion. It does not fall back to a hidden default system.

## Custom tokens, semantic tokens, and theme/system

Every token leaf has a `{ value }` wrapper. A semantic token can select referenced token values by condition:

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
  spacing: { gutter: { value: '1.25rem' } },
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
  base: { bg: 'surface', p: 'gutter', rounded: 'lg' },
  variants: {
    tone: {
      quiet: { color: 'fg' },
      action: { bg: 'action', color: 'white' },
    },
  },
  defaultVariants: { tone: 'quiet' },
})

export const appSystem = createSystem(
  defaultConfig,
  defineConfig({
    theme: {
      tokens,
      semanticTokens,
      recipes: { card: cardRecipe },
    },
  }),
)
```

`defaultConfig` includes the default theme and base system. Use `defaultBaseConfig` instead when you want only Mystique's foundational utilities, conditions, layers, and preflight.

```tsx
<MystiqueProvider value={appSystem}>{children}</MystiqueProvider>
```

## Recipes, `cva`, and `sva`

Recipes can be passed straight to `mystique`:

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

The root `cva` and `sva` helpers use `defaultSystem`. Compile against a custom system when a recipe depends on custom tokens or conditions:

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

`cva` returns one resolved style object. `sva` returns one resolved object per declared slot and integrates with `createSlotRecipeContext` for multi-part components.

## Components and style props

The entire component catalog is:

| Component | Default behavior |
| --- | --- |
| `Box` | neutral `div` |
| `Flex` | `div` with `display: flex` |
| `Center` | `div` centered on both flex axes |
| `Square` | centered `div`; `size` sets equal dimensions |
| `Circle` | centered square with full radius |
| `Span` | native inline `span`, without a display override |
| `Text` | `p` backed by the active system's `text` recipe |

Style props accept raw CSS values or configured token names. Responsive values use arrays or condition objects; selectors and conditions use props such as `_hover`, `_focusVisible`, `_dark`, and `_motionReduce`.

```tsx
<Box
  p={{ base: '4', md: '6' }}
  bg="surface"
  _hover={{ bg: 'action', color: 'white' }}
/>
```

## Factory, `as`, `asChild`, and refs

The factory is available as a function and as intrinsic shortcuts such as `mystique.div`:

```tsx
import { Box, mystique } from '@gabrielmnzs/mystique-react'
import { useRef } from 'react'

const Panel = mystique.div

export function Example() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <Panel as="section" ref={sectionRef} p="4">
      <Box asChild color="accent" _hover={{ textDecoration: 'underline' }}>
        <a href="/docs">Read the docs</a>
      </Box>
    </Panel>
  )
}
```

`as` changes the target and its native prop/ref types. `asChild` requires exactly one non-Fragment React element and composes class names, styles, event handlers, and refs. A custom component used as a target must forward its `className` and ref.

For native attributes that collide with polymorphism or style props, use
`htmlAlign`, `htmlAs`, `htmlBorder`, `htmlColor`, `htmlContent`, `htmlHeight`,
`htmlSize`, `htmlTranslate`, `htmlWidth`, or `htmlWrap`. Mystique restores the
native name only when the final intrinsic target supports it.

## 0.2 subpaths and module formats

| Import | Contents |
| --- | --- |
| `@gabrielmnzs/mystique-react` | Components, provider, factory, common config API, default system, `css`, `cva`, and `sva` |
| `@gabrielmnzs/mystique-react/preset` | Base/default configs and default system |
| `@gabrielmnzs/mystique-react/styled-system` | Low-level system construction primitives |
| `@gabrielmnzs/mystique-react/next` | App Router streaming registry and providers |
| `@gabrielmnzs/mystique-react/typegen` | Programmatic type generation without browser globals |

Each public subpath has explicit ESM (`.js`/`.d.ts`) and CommonJS (`.cjs`/`.d.cts`) conditions. Wildcard deep imports are not public. The package tarball smoke checks every export and packed file, executes the Next-free subpaths through both module formats, compiles both declaration formats, renders all seven components through SSR, and verifies client directives.

## Next.js App Router

The target matrix is Next.js 15 and 16 with React 19. Keep system creation/import inside the client provider module because a `SystemContext` contains functions and must not be serialized across an RSC boundary.

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
// app/layout.tsx — Server Component
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```

`MystiqueNextProvider` combines `MystiqueProvider` with an Emotion registry based on `useServerInsertedHTML`. The cache key is `mystique`, flushes are incremental across streamed segments, global styles are preserved, and `nonce` is supported. The registry is needed when Mystique components first appear inside a streamed `Suspense` chunk; Cache Components in Next.js 16 make that scenario the default reason to mount it.

Mystique's root, preset, styled-system, Next, and typegen modules do not read `window` or `document` at import time. This keeps module evaluation safe during SSR/RSC; React client boundaries still apply to rendered providers and components.

The source repository includes two dedicated compatibility fixtures:

- `apps/next15-smoke` pins Next.js 15.5.25 and uses its default Webpack build.
- `apps/next16-smoke` pins Next.js 16.3.4 and explicitly selects Webpack.

Both exercise App Router SSR, Pages Router SSR with Emotion extraction, a cold production server, and multi-chunk streamed `Suspense`. These are test fixtures, not production applications or known external consumers.

### Pages Router

`useServerInsertedHTML` is an App Router API. Pages applications mount the core provider in `pages/_app.tsx`:

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

Do not use `MystiqueNextProvider` in `_app`; it is the App Router streaming adapter.

### Emotion and Turbopack

The current official Chakra UI guidance for [App Router](https://chakra-ui.com/docs/get-started/frameworks/next-app#hydration-errors-turbopack) and [Pages Router](https://chakra-ui.com/docs/get-started/frameworks/next-pages#hydration-errors) documents incorrect Emotion CSS hydration under Turbopack. The symptom is a server/client mismatch between an Emotion `<style>` tag and the rendered element. Use the command appropriate to the Next.js major version.

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

The streaming registry does not remove this Turbopack limitation.

## Typegen

The package exposes the `mystique-typegen` CLI and a programmatic generator:

```bash
pnpm exec mystique-typegen ./src/mystique.config.ts ./src/mystique.generated.d.ts
```

The config module may export `default`, `system`, or `config`. Include the generated declaration in the consuming TypeScript project.

```ts
import { generateTypegen } from '@gabrielmnzs/mystique-react/typegen'

const declaration = generateTypegen(appSystem)
```

Generation is deterministic and augments token, condition, utility, recipe, and slot-recipe inventories. `TokenName`, `ConditionName`, and `UtilityName` consume the generated metadata; the raw 0.2 style-prop surface is not narrowed exclusively to generated names.

See the repository's `MIGRATION.md`, `UPSTREAM.md`, `THIRD_PARTY_NOTICES.md`, and MIT `LICENSE` for migration, provenance, notices, and licensing.
