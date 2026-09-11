import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './main'

const installButton = () => screen.getByRole('button', { name: /copy install command|copied to clipboard/i })

describe('install command clipboard feedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('reports success after copying', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<App />)

    fireEvent.click(installButton())
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/copied/i))
    expect(writeText).toHaveBeenCalledWith('pnpm add @gabrielmnzs/mystique-react @emotion/react')
  })

  it('shows success feedback in React StrictMode', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    render(<StrictMode><App /></StrictMode>)

    fireEvent.click(installButton())

    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/copied/i))
  })

  it('reports rejection and unavailable clipboard distinctly', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    render(<App />)
    fireEvent.click(installButton())
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/could not copy/i))

    cleanup()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    render(<App />)
    fireEvent.click(installButton())
    expect(screen.getByRole('status')).toHaveTextContent(/not available/i)
  })

  it('replaces the previous timeout when activated again', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    Object.assign(navigator, { clipboard: { writeText } })
    render(<App />)

    fireEvent.click(installButton())
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/copied/i))
    vi.advanceTimersByTime(1000)
    fireEvent.click(installButton())
    await Promise.resolve()
    await Promise.resolve()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(/copied/i)
    await vi.advanceTimersByTimeAsync(1600)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('clears the feedback timeout on unmount', async () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const { unmount } = render(<App />)
    fireEvent.click(installButton())
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/copied/i))
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })

  it('ignores a pending clipboard write that resolves after unmount', async () => {
    let resolveWrite!: () => void
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => new Promise<void>((resolve) => { resolveWrite = resolve })) } })
    const { unmount } = render(<App />)
    fireEvent.click(installButton())
    unmount()

    resolveWrite()
    await Promise.resolve()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('only shows feedback for the newest overlapping write', async () => {
    const writes: Array<() => void> = []
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => new Promise<void>((resolve) => writes.push(resolve))) } })
    render(<App />)
    fireEvent.click(installButton())
    fireEvent.click(installButton())

    writes[0]()
    await Promise.resolve()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    writes[1]()
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/copied/i))
  })

  it('scrolls to and focuses Setup from the polymorphic button', () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /as button.*setup/i }))

    expect(scrollIntoView).toHaveBeenCalled()
    expect(document.activeElement).toBe(document.getElementById('setup'))
  })
})
