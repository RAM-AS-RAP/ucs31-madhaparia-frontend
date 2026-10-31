
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import ThemeContext from './ThemeContextBase'

import {
  DEFAULT_THEME,
  normalizeTheme,
  readStoredTheme,
  saveStoredTheme,
  themeStorageKey,
} from './themePreference'

function devicePrefersDark() {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

export function ThemeProvider({ children }) {
  const { user, loading } = useAuth()

  const storageKey = themeStorageKey(user, loading)

  const [selection, setSelection] = useState(() => ({
    key: storageKey,
    theme: readStoredTheme(storageKey),
  }))

  const [systemDark, setSystemDark] = useState(devicePrefersDark)

  const theme =
    selection.key === storageKey
      ? selection.theme
      : readStoredTheme(storageKey)

  const effectiveTheme =
    theme === 'system'
      ? systemDark ? 'dark' : 'light'
      : theme

  // Listen for device appearance changes.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined
    }

    const media = window.matchMedia(
      '(prefers-color-scheme: dark)'
    )

    function onChange(event) {
      setSystemDark(event.matches)
    }

    media.addEventListener?.('change', onChange)

    return () => {
      media.removeEventListener?.('change', onChange)
    }
  }, [])

  // Apply the selected theme to the entire application.
  useEffect(() => {
    const root = document.documentElement

    root.dataset.theme = theme
    root.dataset.colorMode =
      effectiveTheme === 'dark' ? 'dark' : 'light'
    root.dataset.bsTheme =
      effectiveTheme === 'dark' ? 'dark' : 'light'

    root.style.colorScheme =
      effectiveTheme === 'dark' ? 'dark' : 'light'
  }, [theme, effectiveTheme])

  function setTheme(value) {
    const nextTheme = normalizeTheme(value)

    setSelection({
      key: storageKey,
      theme: nextTheme,
    })

    // Remember the preference for this signed-in account.
    saveStoredTheme(storageKey, nextTheme)

    // Also retain the appearance for public pages after logout.
    if (storageKey && storageKey !== 'rc-theme:guest') {
      saveStoredTheme('rc-theme:guest', nextTheme)
    }
  }


  return (
    <ThemeContext.Provider
      value={{
        theme: theme || DEFAULT_THEME,
        effectiveTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
