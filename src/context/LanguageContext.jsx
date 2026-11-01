
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import LanguageContext from './LanguageContextBase'
import { translate } from '../i18n/translations'

import {
  GUEST_LANGUAGE_KEY,
  languageStorageKey,
  normalizeLanguage,
  readStoredLanguage,
  saveStoredLanguage,
} from './languagePreference'

export function LanguageProvider({ children }) {
  const { user, loading } = useAuth()

  const storageKey = languageStorageKey(user, loading)

  const [selection, setSelection] = useState(() => ({
    key: storageKey,
    language: readStoredLanguage(storageKey),
  }))

  const language =
    selection.key === storageKey
      ? selection.language
      : readStoredLanguage(storageKey)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  function setLanguage(value) {
    if (!storageKey) return

    const next = normalizeLanguage(value)

    setSelection({
      key: storageKey,
      language: next,
    })

    saveStoredLanguage(storageKey, next)

    // Retain the selected language on public pages after logout.
    saveStoredLanguage(GUEST_LANGUAGE_KEY, next)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: (key, values) => translate(language, key, values),
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
