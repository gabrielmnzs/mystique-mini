import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Box,
  Center,
  Circle,
  Flex,
  MystiqueProvider,
  Square,
  Span,
  Text,
  extendTheme,
  mystique,
} from '@gabrielmnzs/mystique-react'
import './styles.css'

const theme = extendTheme({
  colors: {
    ink: '#15231f',
    paper: '#f4f0e8',
    mist: '#e4ebe3',
    coral: '#e36d4d',
    moss: '#496b58',
    lilac: '#ded7ec',
  },
  space: { page: 'clamp(1.25rem, 4vw, 4rem)', section: 'clamp(3rem, 8vw, 7rem)' },
  fonts: { body: "'Avenir Next', 'Helvetica Neue', sans-serif", heading: "'Iowan Old Style', 'Baskerville', serif", mono: "'SFMono-Regular', Consolas, monospace" },
  components: {
    Specimen: {
      baseStyle: { rounded: 'md', border: '1px solid', borderColor: 'ink', bg: 'paper', color: 'ink' },
      sizes: { sm: { p: 3 }, lg: { p: 6 } },
      variants: { quiet: { bg: 'mist' }, featured: { bg: 'ink', color: 'paper', borderColor: 'ink' } },
      defaultProps: { recipeSize: 'lg', variant: 'quiet' },
    },
  },
})

const Specimen = mystique('article', { themeKey: 'Specimen' })

const installCode = `pnpm add @gabrielmnzs/mystique-react @emotion/react`
const usageCode = `import { Box, MystiqueProvider, extendTheme } from
  '@gabrielmnzs/mystique-react'

const theme = extendTheme({ colors: { ink: '#15231f' } })

<MystiqueProvider theme={theme}>
  <Box as="a" href="/docs" color="ink" _hover={{ color: 'coral' }}>
    Read the docs
  </Box>
</MystiqueProvider>`

function SectionLabel({ number, children }: { number: string; children: string }) {
  return <Flex className="section-label" align="center" gap="0.65rem"><Span className="section-number">{number}</Span><Span>{children}</Span></Flex>
}

function App() {
  const [copied, setCopied] = useState(false)
  const copyInstall = async () => {
    await navigator.clipboard?.writeText(installCode)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <MystiqueProvider theme={theme}>
      <Box as="main" className="site-shell">
        <Flex as="header" className="topbar" align="center" justify="space-between">
          <Flex align="center" gap="0.65rem"><Circle className="brand-mark" boxSize="1.6rem" bg="coral" /><Text className="brand-name">mystique <Span color="coral">mini</Span></Text></Flex>
          <Flex as="nav" className="nav-links" gap="1.5rem" aria-label="Primary navigation"><Box as="a" href="#catalog">Catalog</Box><Box as="a" href="#setup">Setup</Box><Box as="a" href="https://github.com/gabrielmnzs/mystique-mini" target="_blank" rel="noreferrer">GitHub ↗</Box></Flex>
        </Flex>

        <Box as="section" className="hero" aria-labelledby="hero-title">
          <Flex className="hero-kicker" align="center" gap="0.75rem"><Square boxSize="0.55rem" bg="coral" transform="rotate(45deg)" /><Span>COMPONENT LAB / 01</Span></Flex>
          <Text as="h1" id="hero-title" className="hero-title">A small system<br /><em>with room to play.</em></Text>
          <Flex className="hero-bottom" align="end" justify="space-between" gap="2rem">
            <Text className="hero-copy">Mystique Mini is a compact React component set for building interfaces that feel considered. Explore the building blocks, then make them yours.</Text>
            <Box as="a" href="#catalog" className="scroll-cue" aria-label="Scroll to catalog"><Span>↓</Span> Explore the pieces</Box>
          </Flex>
        </Box>

        <Box as="section" id="catalog" className="catalog" aria-labelledby="catalog-title">
          <SectionLabel number="01">The catalog</SectionLabel>
          <Flex className="catalog-intro" align="end" justify="space-between" gap="2rem"><Text as="h2" id="catalog-title">Components, <em>unvarnished.</em></Text><Text className="intro-note">Seven focused components.<br />One expressive foundation.</Text></Flex>

          <Box className="specimen-grid">
            <Specimen className="specimen specimen-wide" variant="featured" recipeSize="lg">
              <Flex justify="space-between" align="start"><Box><Span className="eyebrow">Box / Flex</Span><Text as="h3">The quiet frame</Text><Text className="specimen-copy">A layout surface and a flexible row, working in concert. Resize the viewport to see the gap breathe.</Text></Box><Square boxSize="3rem" bg="coral" rounded="sm" /></Flex>
              <Flex className="mini-layout" direction={{ base: 'column', md: 'row' }} gap={['0.5rem', '1rem']} mt="2rem"><Box className="mini-block" flex="1" bg="moss" /><Box className="mini-block" flex="2" bg="coral" /><Box className="mini-block" flex="1" bg="lilac" /></Flex>
            </Specimen>
            <Specimen className="specimen" variant="quiet" recipeSize="sm"><Span className="eyebrow">Center / Square / Circle</Span><Flex className="shape-stage" align="center" justify="center" gap="0.75rem"><Center className="center-demo"><Circle boxSize="2.3rem" bg="coral" /></Center><Square boxSize="3.5rem" bg="ink" rounded="sm" /><Circle boxSize="3.5rem" bg="moss" /></Flex><Text className="caption">Geometry with a point of view.</Text></Specimen>
            <Specimen className="specimen" variant="quiet" recipeSize="sm"><Span className="eyebrow">Text / Span</Span><Text className="type-demo">Make it <Span color="coral">legible.</Span></Text><Text className="caption">Type hierarchy without ceremony.</Text></Specimen>
            <Specimen className="specimen specimen-polymorph" variant="featured"><Span className="eyebrow">Polymorphic component</Span><Text as="h3">One component,<br /><em>many voices.</em></Text><Flex gap="0.65rem" wrap="wrap" mt="1.5rem"><Box as="button" className="sample-control" _hover={{ bg: 'coral', color: 'ink' }} _active={{ transform: 'translateY(2px)' }}>as button</Box><Box as="a" href="#setup" className="sample-control" _hover={{ bg: 'paper', color: 'ink' }} _focus={{ borderColor: 'coral' }}>as link ↗</Box></Flex></Specimen>
          </Box>
        </Box>

        <Box as="section" className="recipe-section" aria-labelledby="recipe-title"><SectionLabel number="02">Recipe card</SectionLabel><Flex className="recipe-layout" gap="clamp(2rem, 7vw, 7rem)" align="center"><Box flex="1"><Text as="h2" id="recipe-title">Tokens in,<br /><em>character out.</em></Text><Text className="body-copy">Theme configuration stays close to the surface. Add your palette, shape a component recipe, and let the components carry the rhythm.</Text></Box><Specimen className="recipe-preview"><Span className="eyebrow">Specimen / default</Span><Text as="h3">A custom recipe</Text><Flex align="center" gap="0.75rem" mt="2rem"><Circle boxSize="2.5rem" bg="coral" /><Box><Text fontWeight="bold">Default props in action</Text><Text className="muted">variant: quiet · size: lg</Text></Box></Flex></Specimen></Flex></Box>

        <Box as="section" id="setup" className="setup-section" aria-labelledby="setup-title"><SectionLabel number="03">Start here</SectionLabel><Flex className="setup-layout" gap="clamp(2rem, 7vw, 7rem)"><Box flex="1"><Text as="h2" id="setup-title">Bring your<br /><em>own atmosphere.</em></Text><Text className="body-copy">For an existing React 19 app. Node 24 and pnpm 11 keep the baseline pleasantly modern.</Text><Text className="reset-note">Provider resetCSS: on by default.</Text><Box as="button" className="copy-install" onClick={copyInstall}>{copied ? 'Copied to clipboard ✓' : 'Copy install command'}<Span>↗</Span></Box></Box><Box flex="1" className="code-column"><Box className="code-block"><Flex justify="space-between" className="code-head"><Span>INSTALL</Span><Span>pnpm 11 · node 24</Span></Flex><Text as="code">{installCode}</Text></Box><Box className="code-block"><Flex justify="space-between" className="code-head"><Span>USAGE</Span><Span>React 19</Span></Flex><Text as="pre">{usageCode}</Text></Box></Box></Flex></Box>
        <Flex as="footer" className="footer" justify="space-between" align="center"><Text>© 2026 Mystique Mini</Text><Text>React components for thoughtful interfaces.</Text></Flex>
      </Box>
    </MystiqueProvider>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
