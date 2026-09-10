import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { extendTheme, MystiqueProvider } from '../index'
import { Box, Center, Circle, Flex, Span, Square, Text } from './index'

/* eslint-disable no-undef */

describe('base components', () => {
  it('uses the documented default tags and forwards refs for every component', () => {
    const refs = {
      Box: createRef<HTMLDivElement>(),
      Flex: createRef<HTMLDivElement>(),
      Center: createRef<HTMLDivElement>(),
      Square: createRef<HTMLDivElement>(),
      Circle: createRef<HTMLDivElement>(),
      Span: createRef<HTMLSpanElement>(),
      Text: createRef<HTMLParagraphElement>(),
    }
    render(<><Box ref={refs.Box} data-testid="Box" /><Flex ref={refs.Flex} data-testid="Flex" /><Center ref={refs.Center} data-testid="Center" /><Square ref={refs.Square} data-testid="Square" /><Circle ref={refs.Circle} data-testid="Circle" /><Span ref={refs.Span} data-testid="Span" /><Text ref={refs.Text} data-testid="Text" /></>)
    for (const [name, tag] of Object.entries({ Box: 'DIV', Flex: 'DIV', Center: 'DIV', Square: 'DIV', Circle: 'DIV', Span: 'SPAN', Text: 'P' })) {
      const element = screen.getByTestId(name)
      expect(element.tagName).toBe(tag)
      expect(refs[name as keyof typeof refs].current).toBe(element)
    }
  })

  it('supports polymorphic anchors and maps Square/Circle size without leaking it', () => {
    const squareRef = { current: null as HTMLAnchorElement | null }
    render(<><Square as="a" ref={squareRef} href="/square" size={{ base: 2, md: 4 }} data-testid="square" /><Circle size="sm" data-testid="circle" /></>)
    expect(squareRef.current).toBe(screen.getByTestId('square'))
    expect(screen.getByTestId('square')).toHaveAttribute('href', '/square')
    expect(screen.getByTestId('square')).not.toHaveAttribute('size')
    expect(screen.getByTestId('circle')).not.toHaveAttribute('size')
    expect(screen.getByTestId('circle')).toHaveStyle({ width: '24rem', height: '24rem' })
    // @ts-expect-error Emotion's matcher is installed at runtime by the Vitest setup.
    expect(screen.getByTestId('square')).toHaveStyleRule('width', '1rem', { media: '(min-width: 48em)' })
  })

  it('applies component defaults while allowing local overrides and recipes', () => {
    const theme = extendTheme({ components: {
      Flex: { baseStyle: { color: 'red.500' } },
      Box: { variants: { loud: { color: 'green.500' } } },
      Circle: { baseStyle: { rounded: 'sm' } },
    } })
    render(<MystiqueProvider theme={theme}><><Flex data-testid="flex" display="block" /><Center data-testid="center" justify="flex-start" /><Circle data-testid="circle" rounded="none" /><Span data-testid="span" /><Box data-testid="box" variant="loud" /><Text data-testid="text" fontSize="lg" /></></MystiqueProvider>)
    expect(screen.getByTestId('flex')).toHaveStyle({ display: 'block', color: '#e53e3e' })
    expect(screen.getByTestId('center')).toHaveStyle({ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' })
    expect(screen.getByTestId('circle')).toHaveStyle({ borderRadius: '0' })
    expect(screen.getByTestId('span')).toHaveStyle({ display: 'inline-block' })
    expect(screen.getByTestId('box')).toHaveStyle({ color: '#38a169' })
    expect(screen.getByTestId('text')).toHaveStyle({ fontSize: '1.125rem' })
  })

  it('applies base layout contracts and lets local styles override them', () => {
    render(<><Flex data-testid="flex" /><Center data-testid="center" /><Square data-testid="square" /><Circle data-testid="circle" /><Span data-testid="span" /><Box data-testid="box" display="block" /><Center data-testid="override" align="flex-start" justify="flex-start" /></>)
    expect(screen.getByTestId('flex')).toHaveStyle({ display: 'flex' })
    expect(screen.getByTestId('center')).toHaveStyle({ display: 'flex', alignItems: 'center', justifyContent: 'center' })
    expect(screen.getByTestId('square')).toHaveStyle({ display: 'flex', alignItems: 'center', justifyContent: 'center' })
    expect(screen.getByTestId('circle')).toHaveStyle({ display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px' })
    expect(screen.getByTestId('span')).toHaveStyle({ display: 'inline-block' })
    expect(screen.getByTestId('box')).toHaveStyle({ display: 'block' })
    expect(screen.getByTestId('override')).toHaveStyle({ alignItems: 'flex-start', justifyContent: 'flex-start' })
  })

  it('resolves pseudo styles on a public base component', () => {
    render(<Box data-testid="box" _hover={{ color: 'red.500' }} />)
    // @ts-expect-error Emotion's matcher is installed at runtime by the Vitest setup.
    expect(screen.getByTestId('box')).toHaveStyleRule('color', '#e53e3e', { target: ':hover' })
  })

  it.each([
    ['Box', Box], ['Flex', Flex], ['Center', Center], ['Square', Square], ['Circle', Circle], ['Span', Span], ['Text', Text],
  ] as const)('resolves the exact %s themeKey recipe', (themeKey, Component) => {
    render(<MystiqueProvider theme={{ components: { [themeKey]: { baseStyle: { color: '#123456' } } } }}><Component data-testid="recipe" /></MystiqueProvider>)
    expect(screen.getByTestId('recipe')).toHaveStyle({ color: '#123456' })
  })
})
