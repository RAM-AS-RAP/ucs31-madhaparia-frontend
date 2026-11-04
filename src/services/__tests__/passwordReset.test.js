import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../api'
import {
  confirmPasswordReset,
  passwordResetErrorCode,
  passwordResetRetryAfter,
  requestPasswordReset,
} from '../passwordReset'

vi.mock('../api', () => ({ default: { post: vi.fn() } }))

const REQUESTED = {
  challenge_id: '11111111-1111-4111-8111-111111111111',
  expires_in_seconds: 600, resend_after_seconds: 60,
}

describe('password recovery API contract', () => {
  beforeEach(() => vi.resetAllMocks())

  it('requests a code without attaching authentication and supports cancellation', async () => {
    const controller = new AbortController()
    api.post.mockResolvedValueOnce({ data: REQUESTED })
    expect(await requestPasswordReset('person@example.com', 'sw', { signal: controller.signal })).toEqual(REQUESTED)
    expect(api.post).toHaveBeenCalledWith(
      '/auth/password-reset/request', { email: 'person@example.com', language: 'sw' },
      { skipAuth: true, signal: controller.signal },
    )
  })

  it.each([
    {}, { ...REQUESTED, challenge_id: 'invalid' },
    { ...REQUESTED, expires_in_seconds: 0 },
    { ...REQUESTED, resend_after_seconds: -1 },
  ])('rejects malformed request responses', async (result) => {
    api.post.mockResolvedValueOnce({ data: result })
    await expect(requestPasswordReset('person@example.com', 'en')).rejects.toThrow()
  })

  it('preserves leading zeroes and never creates a login session', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'password_reset' } })
    expect(await confirmPasswordReset(REQUESTED.challenge_id, '012345', 'SyntheticPassword123!'))
      .toEqual({ status: 'password_reset' })
    expect(api.post).toHaveBeenCalledWith('/auth/password-reset/confirm', {
      challenge_id: REQUESTED.challenge_id, code: '012345', new_password: 'SyntheticPassword123!',
    }, { skipAuth: true, signal: undefined })
  })

  it('rejects an unexpected confirmation response', async () => {
    api.post.mockResolvedValueOnce({ data: { status: 'prediction_complete' } })
    await expect(confirmPasswordReset(REQUESTED.challenge_id, '012345', 'SyntheticPassword123!')).rejects.toThrow()
  })

  it('reads structured failures and bounded retry delays', () => {
    expect(passwordResetErrorCode({ response: { data: { detail: { code: 'expired_code' } } } }))
      .toBe('expired_code')
    expect(passwordResetErrorCode({ code: 'ERR_NETWORK' })).toBe('network_error')
    expect(passwordResetRetryAfter({ response: { headers: { 'retry-after': '120' } } })).toBe(120)
    expect(passwordResetRetryAfter({ response: { headers: { 'retry-after': '99999' } } })).toBe(3600)
    expect(passwordResetRetryAfter({})).toBe(60)
  })
})
