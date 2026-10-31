
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeProvider } from '../ThemeContext'
import { useTheme } from '../useTheme'
import { themeStorageKey } from '../themePreference'

const auth = vi.hoisted(() => ({ user: null, loading: false }))

vi.mock('../useAuth', () => ({
  useAuth: () => auth,
}))

function ThemeExample() {
  const { theme, effectiveTheme, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="selected-theme">{theme}</span>
      <span data-testid="effective-theme">{effectiveTheme}</span>

      <button type="button" onClick={() => setTheme('dark')}>
        Choose Dark
      </button>

      <button type="button" onClick={() => setTheme('light')}>
        Choose Light
      </button>

      <button type="button" onClick={() => setTheme('system')}>
        Choose System
      </button>
    </div>
  )
}

function renderTheme() {
  return render(
    <ThemeProvider>
      <ThemeExample />
    </ThemeProvider>
  )
}

describe('personalised theme settings', () => {
  beforeEach(() => {
    localStorage.clear()
    auth.user = null
    auth.loading = false

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  it('uses Default Purple for new users', () => {
    renderTheme()

    expect(screen.getByTestId('selected-theme'))
      .toHaveTextContent('default')

    expect(document.documentElement.dataset.theme)
      .toBe('default')
  })

  it('saves and restores the selected theme', () => {
    const view = renderTheme()

    fireEvent.click(screen.getByRole('button', { name: 'Choose Dark' }))

    expect(localStorage.getItem('rc-theme:guest')).toBe('dark')
    expect(document.documentElement.dataset.colorMode).toBe('dark')

    view.unmount()
    renderTheme()

    expect(screen.getByTestId('selected-theme'))
      .toHaveTextContent('dark')
  })

  it('keeps preferences separate for different users', () => {
    const view = renderTheme()

    auth.user = { id: 10, email: 'user-a@example.com' }
    view.rerender(<ThemeProvider><ThemeExample /></ThemeProvider>)

    fireEvent.click(screen.getByRole('button', { name: 'Choose Light' }))

    expect(localStorage.getItem(themeStorageKey(auth.user)))
      .toBe('light')

    auth.user = { id: 11, email: 'user-b@example.com' }
    view.rerender(<ThemeProvider><ThemeExample /></ThemeProvider>)

    expect(screen.getByTestId('selected-theme'))
      .toHaveTextContent('default')

    auth.user = { id: 10, email: 'user-a@example.com' }
    view.rerender(<ThemeProvider><ThemeExample /></ThemeProvider>)

    expect(screen.getByTestId('selected-theme'))
      .toHaveTextContent('light')
  })

  it('follows system appearance changes', async () => {
    const subscribers = []

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: (_event, callback) => subscribers.push(callback),
      removeEventListener: vi.fn(),
    }))

    renderTheme()

    fireEvent.click(screen.getByRole('button', { name: 'Choose System' }))

    await waitFor(() => {
      expect(screen.getByTestId('effective-theme'))
        .toHaveTextContent('dark')
    })

    subscribers.forEach((callback) => callback({ matches: false }))

    await waitFor(() => {
      expect(screen.getByTestId('effective-theme'))
        .toHaveTextContent('light')
    })
  })
  it('keeps dark mode on public pages after logout', () => {
    auth.user = { id: 42, email: 'patient@example.com' }

    const view = renderTheme()

    fireEvent.click(
      screen.getByRole('button', { name: 'Choose Dark' })
    )

    expect(localStorage.getItem('rc-theme:guest')).toBe('dark')

    auth.user = null

    view.rerender(
      <ThemeProvider>
        <ThemeExample />
      </ThemeProvider>
    )

    expect(screen.getByTestId('selected-theme'))
      .toHaveTextContent('dark')
  })

})
