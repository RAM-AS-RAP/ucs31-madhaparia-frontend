const TOKEN_KEY = 'respiracare_access_token'

const ASSESSMENT_KEYS = [
  'respiracare_symptom_mapping',
  'respiracare_symptom_confirmation',
  'respiracare_prediction_result',
]

export const AUTH_EXPIRED_EVENT = 'respiracare:auth-expired'

function clearAssessmentData() {
  ASSESSMENT_KEYS.forEach((key) => {
    sessionStorage.removeItem(key)
  })
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function saveAuthToken(token) {
  // A new session must not inherit another session's assessment.
  if (getAuthToken() !== token) {
    clearAssessmentData()
  }

  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  clearAssessmentData()
}

export function hasAuthToken() {
  return Boolean(getAuthToken())
}

export function notifyAuthExpired() {
  // Clear sensitive state even when expiry is triggered directly.
  clearAuthToken()

  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
}