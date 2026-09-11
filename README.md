# Mystique Mini

Mystique Mini is a compact React design system for learning and building small, expressive interfaces. v1 combines a token-based styled-system, a theme/provider, a polymorphic component factory, and seven focused components. The repository is `mystique-mini`; the published package is `@gabrielmnzs/mystique-react`.

## Requirements and development

- Node.js 24
- pnpm 11

```bash
pnpm install
pnpm dev             # sandbox at http://localhost:5173
pnpm test
pnpm check-types
pnpm lint
pnpm build
```

This is a pnpm/Turborepo monorepo:

```text
apps/sandbox/       Vite demonstration app
packages/react/     @gabrielmnzs/mystique-react source and package
```

## Public API

The package exports `MystiqueProvider` and `useMystiqueTheme`, `defaultTheme` and `extendTheme`, the `mystique()` factory, the public theme/style types, and these seven components:

`Box`, `Flex`, `Center`, `Square`, `Circle`, `Span`, and `Text`.

Components accept style props such as spacing, sizing, layout, typography, color, borders, and effects. Values may be raw CSS values or keys in the corresponding theme scale. Components are polymorphic through `as` and forward refs.

## Usage

```tsx
import {
  Box,
  Circle,
  MystiqueProvider,
  Square,
  extendTheme,
  mystique,
} from '@gabrielmnzs/mystique-react'

const theme = extendTheme({
  colors: { ink: '#15231f', paper: '#f4f0e8', accent: '#9f3d2d' },
  components: {
    Card: {
      baseStyle: { rounded: 'md', border: '1px solid', borderColor: 'ink' },
      sizes: { sm: { p: 3 }, lg: { p: 6 } },
      variants: { quiet: { bg: 'paper' }, featured: { bg: 'ink', color: 'paper' } },
      defaultProps: { recipeSize: 'lg', variant: 'quiet' },
    },
  },
})

const Card = mystique('article', { themeKey: 'Card' })

export function Example() {
  return (
    <MystiqueProvider theme={theme}>
      <Card variant="featured" recipeSize="sm" p={{ base: 3, md: 6 }}>
        <Box
          as="a"
          href="/docs"
          color="paper"
          direction={{ base: 'column', md: 'row' }}
          _hover={{ color: 'accent' }}
        >
          Read the docs
        </Box>
        <Square size={{ base: '2rem', md: '3rem' }} bg="accent" />
        <Circle size="2rem" bg="accent" />
      </Card>
    </MystiqueProvider>
  )
}
```

Responsive values use an object (`{ base, sm, md, lg, xl }`) or an array whose first entry is the base value and subsequent entries follow the theme breakpoints. Supported pseudo props include `_hover`, `_focus`, `_active`, `_disabled`, and `_placeholder`; their values use style props and may also be responsive. `Square` and `Circle` reserve `size` for equal dimensions. `boxSize` is the general width/height prop, while `htmlSize` maps to a native element's `size` attribute.

The outermost `MystiqueProvider` applies a small global reset by default. Set `resetCSS={false}` to disable it:

```tsx
<MystiqueProvider resetCSS={false}>{children}</MystiqueProvider>
```

When wrapping a custom component with `mystique()`, that component must forward both the generated `className` and its ref to the rendered element. Mystique supplies the generated styles through `className`; without forwarding it, styling will not reach the DOM.

## v1 scope

Dark mode is not part of v1. Also deferred to the roadmap are semantic tokens, extended selectors, the full CSS prop catalog, advanced layouts, interactive and form controls, SSR adapters, Storybook visual regression, and motion components.
