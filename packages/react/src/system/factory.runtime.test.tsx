import { render, screen } from '@testing-library/react'
import { forwardRef } from 'react'
import type React from 'react'
import { describe, expect, it } from 'vitest'
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
    const Button = mystique('button', { name: 'Button', baseStyle: { color: 'black' } })
    render(<MystiqueProvider theme={theme}><Button data-testid="button" recipeSize="sm" variant="solid" color="purple.500" m={{ base: 1, md: 2 }} _hover={{ color: 'yellow.500' }}>go</Button></MystiqueProvider>)
    const button = screen.getByTestId('button')
    expect(button).toHaveStyle({ color: '#805ad5', margin: '0.25rem' })
    expect(document.head.innerHTML).toContain('hover')
    expect(document.head.innerHTML).toContain('min-width: 48em')
  })

  it('uses runtime as as the final target and forwards required custom props', () => {
    const Required = forwardRef<HTMLDivElement, { required: string; children?: React.ReactNode }>(({ required, ...props }, ref) => <div ref={ref} data-required={required} {...props} />)
    const Component = mystique(Required)
    const ref = { current: null as HTMLDivElement | null }
    render(<Component ref={ref} required="yes" data-testid="custom" color="red.500" />)
    expect(ref.current).toBe(screen.getByTestId('custom'))
    expect(screen.getByTestId('custom')).toHaveAttribute('data-required', 'yes')
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

  it('supports reset defaults, opt-out, and cleanup', () => {
    const { unmount } = render(<MystiqueProvider><span>reset</span></MystiqueProvider>)
    expect(document.head.innerHTML).toContain('box-sizing')
    const withReset = document.head.querySelectorAll('style[data-emotion^="css-global"]').length
    unmount()
    expect(document.head.querySelectorAll('style[data-emotion^="css-global"]').length).toBeLessThanOrEqual(withReset)
    const before = document.head.querySelectorAll('style[data-emotion^="css-global"]').length
    render(<MystiqueProvider resetCSS={false}><span>no reset</span></MystiqueProvider>)
    expect(document.head.querySelectorAll('style[data-emotion^="css-global"]').length).toBe(before)
  })
})
