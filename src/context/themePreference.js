
export const THEME_OPTIONS = ['default', 'light', 'dark', 'system']

export const DEFAULT_THEME = 'default'

export function normalizeTheme(value) {
  return THEME_OPTIONS.includes(value) ? value : DEFAULT_THEME
}

export function themeStorageKey(user, loading = false) {
  if (loading) return null

  const identifier = user?.id ?? user?.user_id ?? user?.email

  if (!identifier) return 'rc-theme:guest'

  return `rc-theme:user:${encodeURIComponent(
    String(identifier).toLowerCase()
  )}`
}

export function readStoredTheme(key) {
  if (!key) return DEFAULT_THEME

  try {
    return normalizeTheme(localStorage.getItem(key))
  } catch {
    return DEFAULT_THEME
  }
}

export function saveStoredTheme(key, value) {
  if (!key) return

  try {
    localStorage.setItem(key, normalizeTheme(value))
  } catch {
    // Theme switching still works if storage is unavailable.
  }
}
