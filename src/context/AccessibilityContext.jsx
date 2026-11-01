
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import AccessibilityContext from './AccessibilityContextBase'

import {
  DEFAULT_ACCESSIBILITY,
  accessibilityStorageKey,
  normalizeAccessibility,
  readStoredAccessibility,
  saveStoredAccessibility,
} from './accessibilityPreference'

export function AccessibilityProvider({ children }) {
  const { user, loading } = useAuth()

  const storageKey = accessibilityStorageKey(user, loading)

  const [selection, setSelection] = useState(() => ({
    key: storageKey,
    preferences: readStoredAccessibility(storageKey),
  }))

  const preferences =
    selection.key === storageKey
      ? selection.preferences
      : readStoredAccessibility(storageKey)

  // Apply accessibility settings throughout the application.
  useEffect(() => {
    const root = document.documentElement

    root.dataset.a11ySize = preferences.textSize
    root.dataset.a11yContrast = String(preferences.highContrast)
    root.dataset.a11yBold = String(preferences.boldText)
    root.dataset.a11yReduceMotion = String(preferences.reduceMotion)

    return () => {
      delete root.dataset.a11ySize
      delete root.dataset.a11yContrast
      delete root.dataset.a11yBold
      delete root.dataset.a11yReduceMotion
    }
  }, [
    preferences.textSize,
    preferences.highContrast,
    preferences.boldText,
    preferences.reduceMotion,
  ])

  function setPreference(name, value) {
    if (!storageKey || !(name in DEFAULT_ACCESSIBILITY)) {
      return
    }

    const nextPreferences = normalizeAccessibility({
      ...preferences,
      [name]: value,
    })

    setSelection({
      key: storageKey,
      preferences: nextPreferences,
    })

    saveStoredAccessibility(storageKey, nextPreferences)

    // Keep the appearance preference on public pages after logout.
    if (storageKey !== 'rc-accessibility:guest') {
      saveStoredAccessibility(
        'rc-accessibility:guest',
        nextPreferences
      )
    }
  }

  function resetAccessibility() {
    if (!storageKey) return

    const defaults = { ...DEFAULT_ACCESSIBILITY }

    setSelection({
      key: storageKey,
      preferences: defaults,
    })

    saveStoredAccessibility(storageKey, defaults)

    if (storageKey !== 'rc-accessibility:guest') {
      saveStoredAccessibility('rc-accessibility:guest', defaults)
    }
  }

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        setPreference,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}
