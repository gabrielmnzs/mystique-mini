import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { extendTheme, MystiqueProvider } from '../index'
import { Box, Center, Circle, Flex, Span, Square, Text } from './index'

/* eslint-disable no-undef */

describe('base components', () => {
  it('uses the documented default tags and forwards refs', () => {
    const boxRef = { current: null as HTMLDivElement | null }
    const textRef = { current: null as HTMLParagraphElement | null }
    render(<><Box ref={boxRef} data-testid="box" /><Text ref={textRef} data-testid="text" /></>)
    expect(screen.getByTestId('box').tagName).toBe('DIV')
    expect(boxRef.current).toBe(screen.getByTestId('box'))
    expect(screen.getByTestId('text').tagName).toBe('P')
    expect(textRef.current).toBe(screen.getByTestId('text'))
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
})
