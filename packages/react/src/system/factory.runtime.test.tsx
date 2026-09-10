import { fireEvent, render, screen } from '@testing-library/react'
import { forwardRef } from 'react'
import type React from 'react'
import { describe, expect, it, vi } from 'vitest'
/// <reference types="@testing-library/jest-dom" />
import { mystique, MystiqueProvider, useMystiqueTheme } from '../index'
import { extendTheme } from '../theme'

/* eslint-disable no-undef, react/display-name */

const Box = mystique('div')

describe('mystique runtime', () => {
  it('renders with the default theme without a provider', () => {
    render(<Box data-testid="box" color="blue.500" />)
    expect(screen.getByTestId('box')).toHaveStyle({ color: '#3182ce' })
  })

  it('merges custom and nested provider themes', () => {
    function ReadTheme() {
      const theme = useMystiqueTheme()
      return <span data-testid="theme">{String(theme.colors.brand)}:{String(theme.colors.child)}</span>
    }
    render(<MystiqueProvider theme={{ colors: { brand: 'parent' } }}><MystiqueProvider theme={{ colors: { child: 'nested' } }}><ReadTheme /></MystiqueProvider></MystiqueProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('parent:nested')
  })

  it('uses exact recipe precedence and responsive/pseudo styles', () => {
    const theme = extendTheme({ components: { Button: { baseStyle: { color: 'red.500' }, sizes: { sm: { color: 'blue.500' } }, variants: { solid: { color: 'green.500' } } } } })
    const Button = mystique('button', { themeKey: 'Button', baseStyle: { color: 'black' } })
    render(<MystiqueProvider theme={theme}><Button data-testid="button" recipeSize="sm" variant="solid" color="purple.500" m={{ base: 1, md: 2 }} _hover={{ color: 'yellow.500' }}>go</Button></MystiqueProvider>)
    const button = screen.getByTestId('button')
    expect(button).toHaveStyle({ color: '#805ad5', margin: '0.25rem' })
    // @ts-expect-error Emotion's matcher is installed at runtime by the Vitest setup.
    expect(button).toHaveStyleRule('color', '#d69e2e', { target: ':hover' })
    // @ts-expect-error Emotion's matcher is installed at runtime by the Vitest setup.
    expect(button).toHaveStyleRule('margin', '0.5rem', { media: '(min-width: 48em)' })
  })

  it('uses runtime as as the final target and forwards required custom props', () => {
    const Required = forwardRef<HTMLDivElement, { required: string; children?: React.ReactNode; onClick?: () => void }>(({ required, ...props }, ref) => <div ref={ref} data-required={required} {...props} />)
    const Component = mystique(Required)
    const ref = { current: null as HTMLDivElement | null }
    const onClick = vi.fn()
    render(<Component ref={ref} required="yes" data-testid="custom" color="red.500" data-state="ready" onClick={onClick} />)
    expect(ref.current).toBe(screen.getByTestId('custom'))
    expect(screen.getByTestId('custom')).toHaveAttribute('data-required', 'yes')
    expect(screen.getByTestId('custom')).toHaveAttribute('data-state', 'ready')
    expect(screen.getByTestId('custom').className).toMatch(/\bcss-/)
    expect(screen.getByTestId('custom')).toHaveStyle({ color: '#e53e3e' })
    fireEvent.click(screen.getByTestId('custom'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('maps htmlSize, forwards standard props, and filters controls', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Box as="input" ref={ref} htmlSize={4} className="x" style={{ opacity: 0.5 }} aria-label="input" data-x="y" onClick={() => undefined} />)
    const input = screen.getByLabelText('input')
    expect(input).toHaveAttribute('size', '4')
    expect(input).toHaveClass('x')
    expect(input).toHaveStyle({ opacity: '0.5' })
    expect(input).not.toHaveAttribute('htmlsize')
    expect(input).not.toHaveAttribute('as')
  })

  it('switches from an intrinsic base to a custom target', () => {
    const Required = forwardRef<HTMLDivElement, { required: string; children?: React.ReactNode }>(({ required, ...props }, ref) => <div ref={ref} data-required={required} {...props} />)
    const Component = mystique('div')
    render(<Component as={Required} required="yes" data-testid="dynamic" color="red.500" variant="solid" recipeSize="sm" />)
    expect(screen.getByTestId('dynamic')).toHaveAttribute('data-required', 'yes')
    expect(screen.getByTestId('dynamic')).not.toHaveAttribute('as')
    expect(screen.getByTestId('dynamic')).not.toHaveAttribute('variant')
    expect(screen.getByTestId('dynamic')).not.toHaveAttribute('recipeSize')
  })

  it('switches from a custom base to an intrinsic target and filters custom props', () => {
    const Required = forwardRef<HTMLDivElement, { required: string; customOnly?: string }>(({ required, customOnly, ...props }, ref) => <div ref={ref} data-required={required} data-custom-only={customOnly} {...props} />)
    const Component = mystique(Required)
    render(<Component as="div" data-testid="dynamic-intrinsic" {...({ required: 'should-not-leak', customOnly: 'should-not-leak' } as Record<string, string>)} color="red.500" variant="solid" recipeSize="sm" />)
    const dynamic = screen.getByTestId('dynamic-intrinsic')
    expect(dynamic).not.toHaveAttribute('data-custom-only')
    expect(dynamic).toHaveAttribute('required')
    expect(dynamic).not.toHaveAttribute('variant')
    expect(dynamic).not.toHaveAttribute('recipeSize')
  })

  it('supports reset defaults, opt-out, and cleanup', () => {
    const { unmount } = render(<MystiqueProvider><span>reset</span></MystiqueProvider>)
    const resetRules = () => Array.from(document.head.querySelectorAll('style[data-emotion^="css-global"]')).flatMap((style) => Array.from(style.sheet?.cssRules ?? []))
    const ruleFor = (selector: string) => {
      const rule = resetRules().find((candidate) => 'selectorText' in candidate && candidate.selectorText === selector)
      expect(rule, `missing reset rule for ${selector}`).toBeDefined()
      return rule as CSSStyleRule
    }
    expect(ruleFor('*, *::before, *::after').style.boxSizing).toBe('border-box')
    expect(ruleFor('html').style.lineHeight).toBe('1.5')
    const body = ruleFor('body')
    expect(body.style.margin).toBe('0px')
    expect(body.style.fontFamily).toBe('system-ui, sans-serif')
    expect(body.style.color).toBe('#1a202c')
    expect(body.style.backgroundColor).toBe('#ffffff')
    const form = ruleFor('body, button, input, textarea, select')
    expect(form.style.font).toBe('inherit')
    expect(form.style.color).toBe('inherit')
    const media = ruleFor('img, svg, video, canvas, audio, iframe, embed, object')
    expect(media.style.display).toBe('block')
    expect(media.style.maxWidth).toBe('100%')
    unmount()
    expect(document.head.querySelectorAll('style[data-emotion^="css-global"]').length).toBe(0)
    const before = document.head.querySelectorAll('style[data-emotion^="css-global"]').length
    render(<MystiqueProvider resetCSS={false}><span>no reset</span></MystiqueProvider>)
    expect(document.head.querySelectorAll('style[data-emotion^="css-global"]').length).toBe(before)
  })
})
