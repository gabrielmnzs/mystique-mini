# @gabrielmnzs/mystique-react

Mystique Mini is a compact React design system with theme tokens, responsive style props, polymorphic components, and a small component catalog. This package supports React 19 and React DOM 19.

## Install

For an existing React 19 app, install the package and its Emotion peer dependency:

```bash
pnpm add @gabrielmnzs/mystique-react @emotion/react
```

The package is configured for private publication to GitHub Packages; the actual publish gate is still pending. Before installing after that gate completes, add this to the consuming project's `.npmrc`:

```ini
@gabrielmnzs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The auth value is intentionally a literal environment-variable placeholder. Set `GITHUB_TOKEN` to a **classic** GitHub PAT with `read:packages` access; never put the token itself in `.npmrc`, source control, or documentation.

## Quick start

```tsx
import { Box, MystiqueProvider } from '@gabrielmnzs/mystique-react'

export function App() {
  return (
    <MystiqueProvider>
      <Box p="4" bg="gray.50" _hover={{ bg: 'gray.100' }}>
        Hello Mystique
      </Box>
    </MystiqueProvider>
  )
}
```

`MystiqueProvider` supplies the default theme and enables the root global reset. Pass `resetCSS={false}` to disable that reset. `extendTheme` deep-merges custom tokens and component recipes:

```tsx
import { Box, extendTheme, Flex, MystiqueProvider, mystique } from '@gabrielmnzs/mystique-react'

const theme = extendTheme({
  colors: { brand: '#9f3d2d' },
  components: {
    Notice: {
      baseStyle: { rounded: 'md', border: '1px solid', borderColor: 'brand' },
      sizes: { sm: { p: 3 }, lg: { p: 6 } },
      variants: { quiet: { bg: 'gray.50' }, strong: { bg: 'brand', color: 'white' } },
      defaultProps: { recipeSize: 'sm', variant: 'quiet' },
    },
  },
})
const Notice = mystique('aside', { themeKey: 'Notice' })

export function Example() {
  return (
    <MystiqueProvider theme={theme}>
      <Notice p={{ base: 3, md: 6 }} _focus={{ borderColor: 'brand' }}>
        <Flex direction={['column', 'row']} gap="2">
          <Box>Responsive content</Box>
          <Box>More content</Box>
        </Flex>
      </Notice>
    </MystiqueProvider>
  )
}
```

Responsive objects use `base`, `sm`, `md`, `lg`, and `xl`; arrays use base first, then those breakpoints. Pseudo props are `_hover`, `_focus`, `_active`, `_disabled`, and `_placeholder`, for example `_hover={{ color: 'brand' }}`. Style values can be CSS values or theme tokens.

Use `htmlSize` when the selected native element has an intrinsic HTML `size` attribute. It is separate from `Square` and `Circle`'s `size` prop:

```tsx
<Box as="input" type="text" htmlSize={24} />
<Box as="input" type="text" boxSize="full" />
```

The public components are `Box`, `Flex`, `Center`, `Square`, `Circle`, `Span`, and `Text`. The `mystique(component, options?)` factory accepts an intrinsic tag or React component, an optional `themeKey`, and an optional `baseStyle`; returned components support `as` and refs.

Custom components wrapped by `mystique()` must forward the generated `className` and ref to their rendered element. Otherwise generated styles and ref behavior cannot reach the DOM node.

## Types and modules

The package exports TypeScript types for themes, component recipes, responsive/style props, pseudo props, provider options, factory options, polymorphic props, and `Square`/`Circle` props. It ships both ESM and CommonJS entry points plus TypeScript declarations, so it can be consumed with either module format.
