'use client'

import { useState, type ReactNode } from 'react'
import { Box, Flex, Text } from '@gabrielmnzs/mystique-react'

type FixtureName = 'next15' | 'next16'
type HydrationScope = 'app' | 'pages'

function HydrationProbe({ scope }: { scope: HydrationScope }) {
  const [count, setCount] = useState(0)
  const hydrated = count > 0

  return (
    <Box
      as="button"
      type="button"
      data-smoke={`${scope}-hydration`}
      data-hydrated={hydrated ? 'true' : 'false'}
      data-count={count}
      onClick={() => setCount((value) => value + 1)}
      bg="accent"
      color="white"
      border="none"
      rounded="md"
      px={4}
      py={3}
      _hover={{ opacity: 0.82 }}
      _focusVisible={{ outline: '3px solid', outlineColor: 'content' }}
    >
      {scope} hydrated interaction: {count}
    </Box>
  )
}

function RouterLinks() {
  return (
    <Flex as="nav" gap={4} wrap="wrap" aria-label="Smoke fixture routes">
      <Box as="a" href="/" color="accent" _hover={{ textDecoration: 'underline' }}>
        App Router
      </Box>
      <Box as="a" href="/streaming" color="accent" _hover={{ textDecoration: 'underline' }}>
        Streaming
      </Box>
      <Box as="a" href="/pages-smoke" color="accent" _hover={{ textDecoration: 'underline' }}>
        Pages Router
      </Box>
    </Flex>
  )
}

function Surface({
  children,
  marker,
}: {
  children: ReactNode
  marker: string
}) {
  return (
    <Box
      as="main"
      data-smoke={marker}
      data-mystique-styled="true"
      minH="100vh"
      p={{ base: 6, md: 10 }}
      bg="canvas"
      color="content"
    >
      <Box
        maxW="48rem"
        mx="auto"
        bg="surface"
        border="thin"
        borderColor="accent"
        rounded="lg"
        p={{ base: 5, md: 8 }}
      >
        {children}
      </Box>
    </Box>
  )
}

export function AppRouterSurface({
  fixture,
  presetMarker,
}: {
  fixture: FixtureName
  presetMarker: string
}) {
  return (
    <Surface marker="app-router-ssr">
      <Text as="h1" fontSize="2xl" color="content">
        Mystique {fixture} App Router smoke
      </Text>
      <Text data-smoke="pure-preset" data-preset={presetMarker} my={4}>
        Server Component used the pure preset entrypoint: {presetMarker}
      </Text>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="start">
        <HydrationProbe scope="app" />
        <RouterLinks />
      </Flex>
    </Surface>
  )
}

export function StreamedSurface({ fixture }: { fixture: FixtureName }) {
  return (
    <Box
      as="section"
      data-smoke="streaming-resolved"
      data-fixture={fixture}
      data-mystique-styled="true"
      bg="surface"
      border="thin"
      borderColor="accent"
      rounded="md"
      p={6}
      _hover={{ bg: 'canvas' }}
    >
      <Text as="h2">Streamed Mystique segment resolved</Text>
      <HydrationProbe scope="app" />
    </Box>
  )
}

export function PagesRouterSurface({
  fixture,
  ssrMarker,
}: {
  fixture: FixtureName
  ssrMarker: string
}) {
  return (
    <Surface marker="pages-router-ssr">
      <Text as="h1" fontSize="2xl">
        Mystique {fixture} Pages Router smoke
      </Text>
      <Text data-smoke="pages-server-props" data-server={ssrMarker} my={4}>
        Pages SSR marker: {ssrMarker}
      </Text>
      <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="start">
        <HydrationProbe scope="pages" />
        <RouterLinks />
      </Flex>
    </Surface>
  )
}
