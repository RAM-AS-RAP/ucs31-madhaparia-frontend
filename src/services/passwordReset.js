import api from './api'

export async function requestPasswordReset(email, language, { signal } = {}) {
  const response = await api.post(
    '/auth/password-reset/request',
    { email, language },
    { skipAuth: true, signal },
  )
  const result = response.data

  if (
    typeof result?.challenge_id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.challenge_id) ||
    !Number.isInteger(result.expires_in_seconds) ||
    result.expires_in_seconds <= 0 || result.expires_in_seconds > 1800 ||
    !Number.isInteger(result.resend_after_seconds) ||
    result.resend_after_seconds < 0 || result.resend_after_seconds > 3600
  ) {
    throw new Error('Invalid password recovery response.')
  }

  return result
}

export async function confirmPasswordReset(challengeId, code, newPassword, { signal } = {}) {
  const response = await api.post(
    '/auth/password-reset/confirm',
    { challenge_id: challengeId, code, new_password: newPassword },
    { skipAuth: true, signal },
  )

  if (response.data?.status !== 'password_reset') {
    throw new Error('Invalid password recovery response.')
  }

  return response.data
}

export function passwordResetErrorCode(error) {
  const code = error.response?.data?.detail?.code
  if (typeof code === 'string') return code
  if (error.response?.status === 429) return 'reset_rate_limited'
  if (error.response?.status === 503) return 'email_unavailable'
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') return 'network_error'
  return 'request_failed'
}

export function passwordResetRetryAfter(error) {
  const headers = error.response?.headers
  const value = Number(headers?.get?.('retry-after') ?? headers?.['retry-after'])
  return Number.isFinite(value) && value > 0
    ? Math.min(3600, Math.ceil(value))
    : 60
}
