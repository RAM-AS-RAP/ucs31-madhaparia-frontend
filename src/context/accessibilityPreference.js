
export const TEXT_SIZE_OPTIONS = [
  'normal',
  'large',
  'extra-large',
  'huge',
]

export const DEFAULT_ACCESSIBILITY = Object.freeze({
  textSize: 'normal',
  highContrast: false,
  boldText: false,
  reduceMotion: false,
})

export function normalizeAccessibility(value = {}) {
  const source =
    value && typeof value === 'object' ? value : {}

  return {
    textSize: TEXT_SIZE_OPTIONS.includes(source.textSize)
      ? source.textSize
      : DEFAULT_ACCESSIBILITY.textSize,
    highContrast: source.highContrast === true,
    boldText: source.boldText === true,
    reduceMotion: source.reduceMotion === true,
  }
}

export function accessibilityStorageKey(user, loading = false) {
  if (loading) return null

  const identifier = user?.id ?? user?.user_id ?? user?.email

  if (!identifier) return 'rc-accessibility:guest'

  return `rc-accessibility:user:${encodeURIComponent(
    String(identifier).toLowerCase()
  )}`
}

export function readStoredAccessibility(key) {
  if (!key) return { ...DEFAULT_ACCESSIBILITY }

  try {
    const value = localStorage.getItem(key)

    return value
      ? normalizeAccessibility(JSON.parse(value))
      : { ...DEFAULT_ACCESSIBILITY }
  } catch {
    return { ...DEFAULT_ACCESSIBILITY }
  }
}

export function saveStoredAccessibility(key, preferences) {
  if (!key) return

  try {
    localStorage.setItem(
      key,
      JSON.stringify(normalizeAccessibility(preferences))
    )
  } catch {
    // Settings can still work if storage is unavailable.
  }
}
