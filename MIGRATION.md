# Migrating to 0.2.0

Version 0.2.0 replaces the original theme-object implementation with a
system-based architecture inspired by Chakra UI v3 and prepares public npm
publication under the unscoped name `mystique-mini-react`. It is intentionally a
clean breaking release.

## Package rename

Replace `@gabrielmnzs/mystique-react` in dependencies, imports, TypeScript
module augmentations, Next.js `transpilePackages`, and generated typegen output
with `mystique-mini-react`. The new package is configured for public publication
on npmjs.org; after the initial release it will no longer require GitHub
Packages registry or token configuration:

```bash
pnpm add mystique-mini-react @emotion/react
```

Two internal `Symbol.for` registry keys intentionally retain the former package
identifier. They are not public import paths: retaining them lets systems and
factory metadata from coexisting pre-rename and renamed 0.2 copies interoperate
during a package-name migration.

## Consumer inventory and compatibility decision

The inventory performed on 2026-09-12 found:

- one workspace application consumer, `apps/sandbox`;
- two dedicated compatibility fixtures, `apps/next15-smoke` and
  `apps/next16-smoke`, which are test infrastructure rather than application or
  external consumers;
- a GitHub remote plus a gated npm release workflow; and
- no confirmed external source or package consumers.

The package tarball smoke and the two Next.js fixtures validate distribution and
framework compatibility; they do not add consumers to the inventory. On the
inventory evidence, 0.2.0 does not ship a `/legacy` subpath and does not
maintain the 0.1 provider and theme model alongside the new system. If an
external consumer is identified before distribution, reassess an explicit,
temporary `/legacy` subpath with a removal date before 1.0.

## Provider and system

Replace a theme passed to the provider with a system created from config.

Before:

```tsx
import {
  Box,
  MystiqueProvider,
  extendTheme,
} from '@gabrielmnzs/mystique-react';

const theme = extendTheme({
  colors: { brand: '#9f3d2d' },
});

export function App() {
  return (
    <MystiqueProvider theme={theme}>
      <Box color="brand">Mystique</Box>
    </MystiqueProvider>
  );
}
```

After:

```tsx
import {
  Box,
  MystiqueProvider,
  createSystem,
  defaultConfig,
  defineConfig,
} from 'mystique-mini-react';

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: { value: '#9f3d2d' },
      },
    },
  },
});

const system = createSystem(defaultConfig, customConfig);

export function App() {
  return (
    <MystiqueProvider value={system}>
      <Box color="brand">Mystique</Box>
    </MystiqueProvider>
  );
}
```

The context is strict in 0.2. Render styled components under `MystiqueProvider`;
do not rely on an implicit default theme.

## Tokens and semantic tokens

Token leaves now use the Design Tokens Community Group-style `{ value }` shape.
Convert scalar leaves such as:

```ts
colors: {
  brand: '#9f3d2d';
}
```

to:

```ts
tokens: {
  colors: {
    brand: {
      value: '#9f3d2d';
    }
  }
}
```

Semantic tokens belong under `theme.semanticTokens` and may reference regular
tokens. Generated CSS variables use the `--mystique-` prefix, so code that
asserted the old generated names must be updated.

## Factory and recipes

- Prefer intrinsic factories such as `mystique.div` when no custom target is
  needed.
- Continue to use `as` for polymorphic intrinsic targets.
- Use `asChild` when the child must own rendering, including framework link or
  image components.
- Move 0.1 component style configuration to `recipes` or `slotRecipes`; do not
  pass it through the removed `components` theme field.

The seven public components remain `Box`, `Flex`, `Center`, `Square`, `Circle`,
`Span`, and `Text`. No additional Chakra components are introduced by this
migration.

## Next.js and Emotion

App Router consumers that stream styled content through `Suspense` should
install the required `@emotion/react` peer and mount `MystiqueNextProvider` from
`mystique-mini-react/next`. The package declares `@emotion/cache` as a direct
dependency. Create or import the system inside a client module; a created system
contains functions and is not a serializable Server Component prop.

Pages Router consumers mount the core `MystiqueProvider` in `pages/_app.tsx`.
The repository fixtures use `@emotion/cache` and `@emotion/server` in a custom
`pages/_document.tsx` to verify server-side extraction; `@emotion/server` is
fixture/consumer integration rather than a dependency of the published Mystique
package.

The documented Emotion hydration limitation under Turbopack does not change the
streaming-registry contract. On Next.js 15, Webpack is already the default:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

The pinned Next.js 15.5.25 CLI does not accept `--webpack`. Starting with
Next.js 16, Turbopack is the default, so opt into Webpack while that limitation
applies:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack"
  }
}
```
