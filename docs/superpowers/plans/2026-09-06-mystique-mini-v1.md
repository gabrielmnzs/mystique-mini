# Mystique Mini v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and privately distribute a tested React 19 design-system package with a Mystique styled-system API and seven base components.

**Architecture:** A single `@gabrielmnzs/mystique-react` package owns theme, system, and component modules. Emotion generates runtime styles, a pure resolver handles tokens/responsive/pseudo behavior, and a Vite sandbox consumes the workspace package.

**Tech Stack:** Node 24, pnpm 11, Turborepo, TypeScript, React 19, Emotion 11, tsup, Vitest, React Testing Library, Vite, Changesets, GitHub Actions, GitHub Packages.

---

### Task 1: Scaffold the workspace

**Files:** root manifests, TypeScript config, Turbo config, package manifests, and empty source entrypoints.

- [ ] Create root scripts for `dev`, `build`, `test`, `lint`, and `check-types`.
- [ ] Pin Node 24 and pnpm 11 and define `apps/*` plus `packages/*` workspaces.
- [ ] Configure Turbo with `tasks`, dependency-aware builds, declared outputs, and persistent uncached dev tasks.
- [ ] Configure `packages/react` for React 19, Emotion, tsup, Vitest, and package exports.
- [ ] Make ESM and CommonJS exports explicit and keep React, JSX runtime, React DOM, and Emotion external.
- [ ] Configure `apps/sandbox` with Vite and `@gabrielmnzs/mystique-react: workspace:*`.
- [ ] Install dependencies and verify the empty workspace builds and typechecks.

### Task 2: Implement the theme foundation with TDD

**Files:** `packages/react/src/theme/**` and colocated tests.

- [ ] Write failing tests for default tokens, dot-path lookup, custom breakpoints, deep object merge, array replacement, object-only component style configuration, and exact recipe precedence.
- [ ] Run focused tests and confirm failures are caused by missing theme behavior.
- [ ] Implement theme types, tokens, `defaultTheme`, and `extendTheme` minimally.
- [ ] Run focused tests and refactor only while green.

### Task 3: Implement the style resolver with TDD

**Files:** `packages/react/src/system/style-config.ts`, `responsive.ts`, `pseudos.ts`, `style-resolver.ts`, `should-forward-prop.ts`, `types.ts`, and tests.

- [ ] Write failing tests for every documented alias, token scale, raw CSS fallback, zero, sparse responsive arrays, unknown breakpoint keys, responsive objects, and responsive values inside pseudo objects.
- [ ] Write failing tests proving supported style props are filtered and valid DOM props are retained.
- [ ] Implement the smallest resolver and prop filter that satisfy those tests.
- [ ] Verify all pure-system tests pass without snapshots tied to Emotion class hashes.

### Task 4: Implement factory, provider, and reset with TDD

**Files:** `packages/react/src/system/factory.tsx`, `provider.tsx`, `reset.ts`, system exports, and integration tests.

- [ ] Write failing runtime tests for `mystique()`, polymorphic `as`, ref forwarding, default-theme fallback, nested/custom themes, component recipe precedence, reset cleanup/control, and native/custom prop forwarding.
- [ ] Write compile-time fixtures for intrinsic attributes, custom-component required props, polymorphic refs, `boxSize`, Square/Circle `size`, recipe `recipeSize`, native `htmlSize`, and negative cases with `@ts-expect-error`.
- [ ] Implement Emotion integration and `MystiqueProvider` minimally.
- [ ] Assert pseudo selectors and media queries with Emotion-aware style rules.
- [ ] Verify no style or recipe-control prop reaches rendered DOM nodes while `className`, `style`, events, `aria-*`, and `data-*` remain forwarded.

### Task 5: Implement components with TDD

**Files:** component folders under `packages/react/src/components/**`, public exports, and component tests.

- [ ] Write failing behavior tests for Box, Flex, Center, Square, Circle, Span, and Text.
- [ ] Implement each component from the public `mystique()` factory and shared types.
- [ ] Verify default tags, defaults, `size`, `as`, refs, responsive values, pseudo props, and theme recipes.
- [ ] Verify the package entrypoint exports every documented API and type.

### Task 6: Build the sandbox and usage documentation

**Files:** `apps/sandbox/**`, root README, and package README if needed for package publishing.

- [ ] Design a responsive sandbox demonstrating all components and system features without adding undocumented APIs.
- [ ] Demonstrate a custom theme, component variants, responsive arrays/objects, and pseudo states.
- [ ] Document setup, development, testing, package authentication, installation, and usage.
- [ ] Build the sandbox and manually inspect desktop and mobile layouts.

### Task 7: Add CI, releases, and distribution checks

**Files:** `.changeset/**`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `.npmrc`, and package metadata.

- [ ] Configure CI with Node 24 and pnpm 11 for lint, typecheck, tests, and build.
- [ ] Configure Changesets for private GitHub Packages releases and grant release-PR and package-write permissions without persisting tokens.
- [ ] Configure package scope, repository association, registry, and least-required workflow permissions.
- [ ] Add ESM-import, CommonJS-require, generated-declaration, packed-manifest, and clean React 19 consumer smoke checks.
- [ ] Verify the publishable package does not set `private: true`, contains the scoped registry and repository association, and does not bundle duplicate React or Emotion runtimes.
- [ ] Verify no token is committed and private installation instructions are accurate.

### Task 8: Create the GitHub repository and roadmap issues

**External target:** `gabrielmnzs/mystique-mini`.

- [ ] Create the repository without generated files that conflict with the local workspace.
- [ ] Search for duplicate issues before creating roadmap entries.
- [ ] Create one post-v1 issue for each deferred feature recorded in the design spec.
- [ ] Confirm issue titles, bodies, acceptance criteria, labels, and links.
- [ ] Run the release workflow to publish the initial package version to GitHub Packages.
- [ ] Confirm the package is associated with `gabrielmnzs/mystique-mini` and install that published version in a clean authenticated React 19 consumer.

### Task 9: Final verification and review

- [ ] Run the complete test suite, lint, typecheck, builds, local package smoke test, published-package smoke test, and sandbox validation under Node 24/pnpm 11.
- [ ] Review the complete diff for spec compliance, accessibility, package boundaries, secret safety, and unnecessary scope.
- [ ] Fix all actionable findings and rerun affected checks.
- [ ] Record final evidence and remaining limitations in the deepwork file.
