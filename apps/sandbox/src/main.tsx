import { StrictMode, useEffect, useRef, useState } from 'react'
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
  createSystem,
  defaultConfig,
  defineConfig,
  mystique,
} from '@gabrielmnzs/mystique-react'
import './styles.css'

const sandboxConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        ink: { value: '#15231f' },
        paper: { value: '#f4f0e8' },
        mist: { value: '#e4ebe3' },
        coral: { value: '#9f3d2d' },
        peach: { value: '#ffad98' },
        moss: { value: '#496b58' },
        lilac: { value: '#ded7ec' },
      },
      spacing: {
        page: { value: 'clamp(1.25rem, 4vw, 4rem)' },
        section: { value: 'clamp(3rem, 8vw, 7rem)' },
      },
      fonts: {
        body: { value: "'Manrope', sans-serif" },
        heading: { value: "'Newsreader', Georgia, serif" },
        mono: { value: "'DM Mono', monospace" },
      },
    },
    semanticTokens: {
      colors: {
        bg: { value: '{colors.paper}' },
        fg: { value: '{colors.ink}' },
        muted: { value: '{colors.moss}' },
        accent: { value: '{colors.coral}' },
      },
    },
    recipes: {
      specimen: {
        className: 'mystique-specimen',
        base: { rounded: 'md', border: 'thin', borderColor: 'fg', bg: 'bg', color: 'fg' },
        variants: {
          size: { sm: { p: 3 }, lg: { p: 6 } },
          variant: {
            quiet: { bg: 'mist' },
            featured: { bg: 'ink', color: 'paper', borderColor: 'ink' },
          },
        },
        defaultVariants: { size: 'lg', variant: 'quiet' },
      },
    },
  },
})

export const sandboxSystem = createSystem(defaultConfig, sandboxConfig)
const Specimen = mystique('article', sandboxConfig.theme.recipes.specimen)

const installCode = `pnpm add @gabrielmnzs/mystique-react @emotion/react`
const registryCode = `//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}`
const usageCode = `import {
  Box, MystiqueProvider, createSystem, defaultConfig, defineConfig,
} from '@gabrielmnzs/mystique-react'

const config = defineConfig({
  theme: {
    tokens: { colors: {
      ink: { value: '#15231f' },
      coral: { value: '#9f3d2d' },
    } },
    semanticTokens: { colors: {
      accent: { value: '{colors.coral}' },
    } },
  },
})
const system = createSystem(defaultConfig, config)

<MystiqueProvider value={system}>
  <Box as="a" href="/docs" color="ink" _hover={{ color: 'accent' }}>
    Read the docs
  </Box>
</MystiqueProvider>`

function SectionLabel({ number, children }: { number: string; children: string }) {
  return <Flex className="section-label" align="center" gap="0.65rem"><Span className="section-number">{number}</Span><Span>{children}</Span></Flex>
}

export function App() {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error' | 'unavailable'>('idle')
  const copyTimeout = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const copyRequestId = useRef(0)
  const clearCopyTimeout = () => {
    if (copyTimeout.current !== null) {
      window.clearTimeout(copyTimeout.current)
      copyTimeout.current = null
    }
  }
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      copyRequestId.current += 1
      if (copyTimeout.current !== null) window.clearTimeout(copyTimeout.current)
      copyTimeout.current = null
    }
  }, [])
  const showCopyState = (requestId: number, state: Exclude<typeof copyState, 'idle'>) => {
    if (!mountedRef.current || requestId !== copyRequestId.current) return
    clearCopyTimeout()
    setCopyState(state)
    copyTimeout.current = window.setTimeout(() => {
      copyTimeout.current = null
      if (mountedRef.current && requestId === copyRequestId.current) setCopyState('idle')
    }, 1600)
  }
  const copyInstall = async () => {
    const requestId = ++copyRequestId.current
    clearCopyTimeout()
    if (!navigator.clipboard?.writeText) {
      showCopyState(requestId, 'unavailable')
      return
    }
    try {
      await navigator.clipboard.writeText(installCode)
      showCopyState(requestId, 'success')
    } catch {
      showCopyState(requestId, 'error')
    }
  }
  const copyLabel = { idle: 'Copy install command', success: 'Copied to clipboard ✓', error: 'Could not copy command', unavailable: 'Clipboard not available' }[copyState]

  return (
    <MystiqueProvider value={sandboxSystem}>
      <Box className="site-shell">
        <Flex as="header" className="topbar" align="center" justify="space-between">
          <Flex align="center" gap="0.65rem"><Circle className="brand-mark" size="1.6rem" bg="coral" /><Text className="brand-name">mystique <Span color="accent">mini</Span></Text></Flex>
          <Flex as="nav" className="nav-links" gap="1.5rem" aria-label="Primary navigation"><Box as="a" href="#catalog">Catalog</Box><Box as="a" href="#setup">Setup</Box><Box as="a" href="https://github.com/gabrielmnzs/mystique-mini" target="_blank" rel="noreferrer">GitHub ↗</Box></Flex>
        </Flex>

        <Box as="main"><Box as="section" className="hero" aria-labelledby="hero-title">
          <Flex className="hero-kicker" align="center" gap="0.75rem"><Square size="0.55rem" bg="accent" transform="rotate(45deg)" /><Span>COMPONENT LAB / 02</Span></Flex>
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
            <Specimen className="specimen specimen-wide" variant="featured" size="lg">
              <Flex justify="space-between" align="start"><Box><Span className="eyebrow">Box / Flex</Span><Text as="h3">The quiet frame</Text><Text className="specimen-copy">A layout surface and a flexible row, working in concert. Resize the viewport to see the gap breathe.</Text></Box><Square boxSize="3rem" bg="coral" rounded="sm" /></Flex>
              <Flex className="mini-layout" direction={{ base: 'column', md: 'row' }} gap={['0.5rem', '1rem']} mt="2rem"><Box className="mini-block" flex="1" bg="moss" /><Box className="mini-block" flex="2" bg="coral" /><Box className="mini-block" flex="1" bg="lilac" /></Flex>
            </Specimen>
            <Specimen className="specimen" variant="quiet" size="sm"><Span className="eyebrow">Center / Square / Circle</Span><Flex className="shape-stage" align="center" justify="center" gap="0.75rem"><Center className="center-demo"><Circle size="2.3rem" bg="accent" /></Center><Square size={{ base: '3rem', md: '3.5rem' }} bg="ink" rounded="sm" /><Circle size="3.5rem" bg="moss" /></Flex><Text className="caption">Geometry with a point of view.</Text></Specimen>
            <Specimen className="specimen" variant="quiet" size="sm"><Span className="eyebrow">Text / Span</Span><Text className="type-demo">Make it <Span color="accent">legible.</Span></Text><Text className="caption">Type hierarchy without ceremony.</Text></Specimen>
            <Specimen className="specimen specimen-polymorph" variant="featured"><Span className="eyebrow">Polymorphic component</Span><Text as="h3">One component,<br /><em>many voices.</em></Text><Flex gap="0.65rem" wrap="wrap" mt="1.5rem"><Box as="button" className="sample-control" onClick={() => { const setup = document.getElementById('setup'); setup?.scrollIntoView(); setup?.focus(); }} _hover={{ bg: 'peach', color: 'ink' }} _active={{ transform: 'translateY(2px)' }}>as button → setup</Box><Box as="a" href="#setup" className="sample-control" _hover={{ bg: 'paper', color: 'ink' }} _focus={{ borderColor: 'peach' }}>as link ↗</Box></Flex></Specimen>
          </Box>
        </Box>

        <Box as="section" className="recipe-section" aria-labelledby="recipe-title"><SectionLabel number="02">Recipe card</SectionLabel><Flex className="recipe-layout" gap="clamp(2rem, 7vw, 7rem)" align="center"><Box flex="1"><Text as="h2" id="recipe-title">Tokens in,<br /><em>character out.</em></Text><Text className="body-copy">System configuration stays close to the surface. Add token values and semantic aliases, shape a recipe, then inject the finished system into the provider.</Text></Box><Specimen className="recipe-preview"><Span className="eyebrow">Specimen / default</Span><Text as="h3">A custom recipe</Text><Flex align="center" gap="0.75rem" mt="2rem"><Circle size="2.5rem" bg="accent" /><Box><Text fontWeight="bold">Default variants in action</Text><Text className="muted">variant: quiet · size: lg</Text></Box></Flex></Specimen></Flex></Box>

        <Box as="section" id="setup" tabIndex={-1} className="setup-section" aria-labelledby="setup-title"><SectionLabel number="03">Start here</SectionLabel><Flex className="setup-layout" gap="clamp(2rem, 7vw, 7rem)"><Box flex="1"><Text as="h2" id="setup-title">Bring your<br /><em>own atmosphere.</em></Text><Text className="body-copy">For an existing React 19 app. Node 24 and pnpm 11 keep the baseline pleasantly modern.</Text><Text className="reset-note">Provider contract: value={'{system}'} · preflight from config.</Text><Box className="install-prerequisite"><strong>Private registry prerequisite</strong><br /><span>Put both registry lines in <code>.npmrc</code>:</span><br />@gabrielmnzs:registry=https://npm.pkg.github.com<br /><code>{registryCode}</code><br /><span>Then set <code>GITHUB_TOKEN</code> to a classic PAT with <code>read:packages</code> access:</span><br /><code>export GITHUB_TOKEN=your-token</code>.</Box><Box as="button" className="copy-install" onClick={copyInstall}>{copyLabel}<Span>↗</Span></Box><Text role="status" aria-live="polite" className="copy-status">{copyState === 'idle' ? '' : copyLabel}</Text></Box><Box flex="1" className="code-column"><Box className="code-block"><Flex justify="space-between" className="code-head"><Span>INSTALL</Span><Span>pnpm 11 · node 24</Span></Flex><Text as="code">{installCode}</Text></Box><Box className="code-block"><Flex justify="space-between" className="code-head"><Span>USAGE</Span><Span>React 19 · API 0.2</Span></Flex><Text as="pre">{usageCode}</Text></Box></Box></Flex></Box>
        </Box>
        <Flex as="footer" className="footer" justify="space-between" align="center"><Text>© 2026 Mystique Mini</Text><Text>React components for thoughtful interfaces.</Text></Flex>
      </Box>
    </MystiqueProvider>
  )
}

const root = document.getElementById('root')
if (root) createRoot(root).render(<StrictMode><App /></StrictMode>)
