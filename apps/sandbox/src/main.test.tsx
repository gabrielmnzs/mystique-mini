import { cleanup, fireEvent, render, screen } from '@testing-library/react'
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
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    render(<App />)

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
})
