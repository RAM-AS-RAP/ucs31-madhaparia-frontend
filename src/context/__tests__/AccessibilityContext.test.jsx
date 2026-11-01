
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AccessibilityProvider } from '../AccessibilityContext'
import { useAccessibility } from '../useAccessibility'
import { accessibilityStorageKey } from '../accessibilityPreference'

const auth = vi.hoisted(() => ({
  user: null,
  loading: false,
}))

vi.mock('../useAuth', () => ({
  useAuth: () => auth,
}))

function TestControls() {
  const { preferences, setPreference, resetAccessibility } =
    useAccessibility()

  return (
    <div>
      <span data-testid="text-size">{preferences.textSize}</span>
      <span data-testid="contrast">
        {String(preferences.highContrast)}
      </span>
      <span data-testid="bold">
        {String(preferences.boldText)}
      </span>

      <button onClick={() => setPreference('textSize', 'huge')}>
        Huge text
      </button>

      <button onClick={() => setPreference('highContrast', true)}>
        High contrast
      </button>

      <button onClick={() => setPreference('boldText', true)}>
        Bold text
      </button>

      <button onClick={() => setPreference('reduceMotion', true)}>
        Reduce motion
      </button>

      <button onClick={resetAccessibility}>
        Reset
      </button>
    </div>
  )
}

function renderAccessibility() {
  return render(
    <AccessibilityProvider>
      <TestControls />
    </AccessibilityProvider>
  )
}

describe('accessibility preferences', () => {
  beforeEach(() => {
    localStorage.clear()
    auth.user = null
    auth.loading = false
  })

  it('starts with default settings', () => {
    renderAccessibility()

    expect(screen.getByTestId('text-size'))
      .toHaveTextContent('normal')

    expect(screen.getByTestId('contrast'))
      .toHaveTextContent('false')
  })

  it('applies accessibility preferences', () => {
    renderAccessibility()

    fireEvent.click(screen.getByRole('button', { name: 'Huge text' }))
    fireEvent.click(screen.getByRole('button', { name: 'High contrast' }))
    fireEvent.click(screen.getByRole('button', { name: 'Bold text' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reduce motion' }))

    const root = document.documentElement

    expect(root.dataset.a11ySize).toBe('huge')
    expect(root.dataset.a11yContrast).toBe('true')
    expect(root.dataset.a11yBold).toBe('true')
    expect(root.dataset.a11yReduceMotion).toBe('true')
  })

  it('saves preferences and restores them', () => {
    const view = renderAccessibility()

    fireEvent.click(screen.getByRole('button', { name: 'Huge text' }))

    view.unmount()
    renderAccessibility()

    expect(screen.getByTestId('text-size'))
      .toHaveTextContent('huge')
  })

  it('keeps settings separate for different users', () => {
    auth.user = { id: 10 }

    const view = renderAccessibility()

    fireEvent.click(screen.getByRole('button', { name: 'Bold text' }))

    expect(
      JSON.parse(localStorage.getItem(accessibilityStorageKey(auth.user)))
        .boldText
    ).toBe(true)

    auth.user = { id: 11 }

    view.rerender(
      <AccessibilityProvider>
        <TestControls />
      </AccessibilityProvider>
    )

    expect(screen.getByTestId('bold'))
      .toHaveTextContent('false')

    auth.user = { id: 10 }

    view.rerender(
      <AccessibilityProvider>
        <TestControls />
      </AccessibilityProvider>
    )

    expect(screen.getByTestId('bold'))
      .toHaveTextContent('true')
  })

  it('resets accessibility settings', () => {
    renderAccessibility()

    fireEvent.click(screen.getByRole('button', { name: 'Huge text' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByTestId('text-size'))
      .toHaveTextContent('normal')
  })
})
