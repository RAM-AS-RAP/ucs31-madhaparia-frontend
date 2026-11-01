
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LanguageProvider } from '../LanguageContext'
import { useLanguage } from '../useLanguage'
import { languageStorageKey } from '../languagePreference'

const auth = vi.hoisted(() => ({
  user: null,
  loading: false,
}))

vi.mock('../useAuth', () => ({
  useAuth: () => auth,
}))

function Controls() {
  const { language, t, setLanguage } = useLanguage()

  return (
    <>
      <p data-testid="language">{language}</p>
      <p>{t('nav.settings')}</p>

      <button type="button" onClick={() => setLanguage('sw')}>
        Kiswahili
      </button>

      <button type="button" onClick={() => setLanguage('en')}>
        English
      </button>
    </>
  )
}

function renderLanguage() {
  return render(
    <LanguageProvider>
      <Controls />
    </LanguageProvider>
  )
}

describe('English and Kiswahili language preferences', () => {
  beforeEach(() => {
    localStorage.clear()
    auth.user = null
    auth.loading = false
  })

  it('defaults to English', () => {
    renderLanguage()

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('switches language', () => {
    renderLanguage()

    fireEvent.click(
      screen.getByRole('button', { name: 'Kiswahili' })
    )

    expect(screen.getByText('Mipangilio')).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('sw')
  })

  it('restores the saved language', () => {
    const view = renderLanguage()

    fireEvent.click(
      screen.getByRole('button', { name: 'Kiswahili' })
    )

    view.unmount()
    renderLanguage()

    expect(screen.getByTestId('language')).toHaveTextContent('sw')
  })

  it('keeps languages separate for different accounts', () => {
    auth.user = { id: 10 }

    const view = renderLanguage()

    fireEvent.click(
      screen.getByRole('button', { name: 'Kiswahili' })
    )

    expect(
      localStorage.getItem(languageStorageKey(auth.user))
    ).toBe('sw')

    auth.user = { id: 11 }

    view.rerender(
      <LanguageProvider>
        <Controls />
      </LanguageProvider>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'English' })
    )

    expect(screen.getByTestId('language')).toHaveTextContent('en')

    auth.user = { id: 10 }

    view.rerender(
      <LanguageProvider>
        <Controls />
      </LanguageProvider>
    )

    expect(screen.getByTestId('language')).toHaveTextContent('sw')
  })
})
