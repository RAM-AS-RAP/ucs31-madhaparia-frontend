
export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGES = ['en', 'sw']
export const GUEST_LANGUAGE_KEY = 'rc-language:guest'

export function normalizeLanguage(value) {
  return LANGUAGES.includes(value) ? value : DEFAULT_LANGUAGE
}

export function languageStorageKey(user, loading = false) {
  if (loading) return null

  const identifier = user?.id ?? user?.user_id ?? user?.email

  if (!identifier) return GUEST_LANGUAGE_KEY

  return `rc-language:user:${encodeURIComponent(
    String(identifier).toLowerCase()
  )}`
}

export function readStoredLanguage(key) {
  try {
    const saved = key ? localStorage.getItem(key) : null
    const guest = localStorage.getItem(GUEST_LANGUAGE_KEY)

    return normalizeLanguage(saved ?? guest)
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function saveStoredLanguage(key, language) {
  if (!key) return

  try {
    localStorage.setItem(key, normalizeLanguage(language))
  } catch {
    // Language switching still works if storage is unavailable.
  }
}
