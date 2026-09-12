# Upstream tracking

Mystique Mini is an independent design system with a deliberately small public
surface. Its 0.2 styled-system architecture is a selective adaptation of
Chakra UI rather than a drop-in fork.

## Reference snapshot

- Project: [`chakra-ui/chakra-ui`](https://github.com/chakra-ui/chakra-ui)
- Package: `@chakra-ui/react` 3.37.0
- Commit: [`67abe9fb80240035a49264ed946fc6bb90ec6cb5`](https://github.com/chakra-ui/chakra-ui/commit/67abe9fb80240035a49264ed946fc6bb90ec6cb5)
- Commit date: 2026-09-09
- License: MIT; see [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)

The commit is intentionally immutable. File links and comparisons must use the
SHA above rather than Chakra UI's moving default branch.

## Concept and file mapping

| Chakra UI 3.37.0 source | Mystique destination | Selective adaptation |
| --- | --- | --- |
| `packages/react/src/styled-system/config.ts` and `system.ts` | `packages/react/src/styled-system/config.ts`, `merge-config.ts`, and `system.ts` | Keep config composition and `createSystem`; restrict the public component catalog and apply Mystique defaults. |
| `packages/react/src/styled-system/token-dictionary.ts`, token middleware, and token transforms | `packages/react/src/styled-system/token-dictionary.ts` | Keep `{ value }` tokens, semantic tokens, references, and CSS-variable generation in one local dictionary pipeline; use the `mystique` prefix. |
| `packages/react/src/styled-system/breakpoints.ts` and `conditions.ts` | `packages/react/src/styled-system/breakpoints.ts` and `conditions.ts` | Preserve responsive conditions while limiting aliases to supported Mystique utilities. |
| `packages/react/src/styled-system/utility.ts` | `packages/react/src/styled-system/utility.ts` and `default-utilities.ts` | Port only utilities required by the styled-system and the seven public primitives. |
| `packages/react/src/styled-system/normalize.ts`, `serialize.ts`, and `css.ts` | Files with the same names under `packages/react/src/styled-system/` | Retain the processing pipeline; keep Mystique-specific types and diagnostics. |
| `packages/react/src/styled-system/layers.ts` and `preflight.ts` | `packages/react/src/styled-system/layers.ts` and `preflight.ts` | Retain cascade-layer and reset concepts with Mystique layer names and a configurable preflight. |
| `packages/react/src/styled-system/cva.ts` and `sva.ts` | Files with the same names under `packages/react/src/styled-system/` | Retain recipe and slot-recipe composition without exposing Chakra component recipes. |
| `packages/react/src/styled-system/create-recipe-context.tsx` and `create-slot-recipe-context.tsx` | Files with the same names under `packages/react/src/styled-system/` | Keep strict recipe contexts for internal composition and `Text`; expose only intentionally supported APIs. |
| `packages/react/src/styled-system/factory.tsx` and `factory.types.ts` | `packages/react/src/styled-system/factory.tsx`, `factory.types.ts`, and `interop-default.ts` | Adapt the low-level Emotion factory as `mystique`, including property access, `as`, `asChild`, ref forwarding, recipes, and prop separation; do not depend on `@emotion/styled`. |
| `packages/react/src/styled-system/provider.tsx` | `packages/react/src/styled-system/provider.tsx` | Use a strict system context and `value={system}`. There is no parallel legacy theme provider. |
| `packages/react/src/preset-base.ts`, `preset.ts`, and `theme/index.ts` | `packages/react/src/styled-system/preset-base.ts`, `packages/react/src/styled-system/preset.ts`, and the public `packages/react/src/preset.ts` entry point | Export Mystique equivalents of `defaultBaseConfig`, `defaultThemeConfig`, `defaultConfig`, and `defaultSystem`; keep the compact default theme beside the local styled-system. |
| `packages/react/src/components/box`, `flex`, `center`, `span`, and `typography` | `packages/react/src/components/box`, `flex`, `center`, `square`, `circle`, `span`, and `text` | Retain only `Box`, `Flex`, `Center`, `Square`, `Circle`, `Span`, and `Text`; preserve native semantics and avoid wrapper elements. |
| Generated styled-system declarations and Chakra type-generation concepts | `packages/react/src/styled-system/typegen.ts`, `packages/react/src/typegen.ts`, `packages/react/src/typegen-cli.ts`, and the five files under `packages/react/src/styled-system/generated/` | Generate Mystique conditions, props, recipes, system, and token declarations; expose a pure programmatic subpath and a separate Node.js CLI. |
| `apps/www/content/docs/get-started/frameworks/next-app.mdx`, `next-pages.mdx`, and the `sandbox/next-app-streaming` example | `packages/react/src/next/registry.tsx`, `apps/next15-smoke`, and `apps/next16-smoke` | Use `useServerInsertedHTML` for streamed Emotion styles, an Emotion cache key of `mystique`, and cold-server App Router, Pages Router, and streaming verification. |

The generated directory contains `conditions.gen.ts`, `prop-types.gen.ts`,
`recipes.gen.ts`, `system.gen.ts`, and `token.gen.ts`. These files describe the
default package surface; `styled-system/typegen.ts` produces consumer-specific
module augmentation through the public `typegen` entry point or the CLI.

## Deliberate deviations

- Mystique exports only `Box`, `Flex`, `Center`, `Square`, `Circle`, `Span`, and
  `Text` as public components. Chakra's broader component catalog is out of
  scope.
- Public exports and package subpaths are enumerated. Chakra's wildcard
  component-export pattern is not copied.
- CSS variables, Emotion cache keys, generated classes, and cascade layers use
  Mystique naming rather than Chakra naming.
- The provider accepts a system through `value={system}` and its context is
  strict. The 0.1 `theme` provider model is not maintained in parallel.
- The factory is implemented on Emotion's lower-level primitives so
  `@emotion/styled` is not a runtime dependency.
- React 19 is the declared runtime, type, SSR, and hydration target.
- Color-mode components, interactive components, Ark UI integrations, and
  Chakra-specific recipes and tokens are not part of this selective fork.
- Next.js integration is isolated from the core package so importing Mystique
  does not require Next.js and does not access browser globals at module load.

## Updating the reference

1. Select and record an immutable upstream commit and released package version.
2. Review only the upstream areas listed in the mapping table and their tests.
3. Preserve upstream copyright and MIT terms for every retained or adapted
   substantial portion.
4. Record intentional divergences rather than synchronizing unrelated Chakra
   features.
5. Regenerate types and run runtime, type, package-tarball, SSR, hydration, RSC,
   and cold-streaming consumer checks before changing the recorded snapshot.
