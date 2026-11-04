import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import App from '../../App'
import { useAuth } from '../../context/useAuth'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { getAuthToken, saveAuthToken } from '../../services/authToken'
import { confirmPasswordReset, requestPasswordReset } from '../../services/passwordReset'

vi.mock('../../context/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../../services/passwordReset', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, requestPasswordReset: vi.fn(), confirmPasswordReset: vi.fn() }
})

const CHALLENGE = '11111111-1111-4111-8111-111111111111'
const REQUESTED = { challenge_id: CHALLENGE, expires_in_seconds: 600, resend_after_seconds: 60 }
const PASSWORD = 'SyntheticNewPassword123!'
const logout = vi.fn()

function showReset({ language = 'en', path = '/forgot-password' } = {}) {
  return render(
    <LanguageContext.Provider value={{ language, t: (key, values) => translate(language, key, values) }}>
      <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
    </LanguageContext.Provider>,
  )
}

async function enterCodeStage() {
  requestPasswordReset.mockResolvedValueOnce(REQUESTED)
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'PERSON@EXAMPLE.COM' } })
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
  })
  expect(screen.getByLabelText('Verification code')).toBeInTheDocument()
}

function fillReset({ code = '012345', password = PASSWORD, confirmation = PASSWORD } = {}) {
  fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: code } })
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: password } })
  fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: confirmation } })
}

function submitReset() {
  fireEvent.click(screen.getByRole('button', { name: 'Reset password' }))
}

describe('forgotten-password recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
    useAuth.mockReturnValue({
      user: null, isAuthenticated: false, isAdmin: false, loading: false,
      sessionError: '', logout,
    })
  })

  afterEach(() => vi.useRealTimers())

  it('opens recovery from the login link', async () => {
    showReset({ path: '/login' })
    fireEvent.click(screen.getByRole('link', { name: 'Forgot password?' }))
    expect(await screen.findByRole('heading', { name: 'Reset your password' })).toBeInTheDocument()
  })

  it('validates email before sending a request', () => {
    showReset()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'invalid' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
    expect(requestPasswordReset).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email address')).toHaveFocus()
  })

  it('requests a code using a normalised email and shows a generic delivery message', async () => {
    showReset()
    await enterCodeStage()
    expect(requestPasswordReset).toHaveBeenCalledWith(
      'person@example.com', 'en', expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(screen.getByText(/If an account exists for this email/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resend in 60s' })).toBeDisabled()
    expect(screen.getByRole('timer')).toHaveTextContent('10:00')
  })

  it('resets the password without automatic login and clears sensitive fields', async () => {
    confirmPasswordReset.mockResolvedValueOnce({ status: 'password_reset' })
    showReset()
    await enterCodeStage()
    fillReset()
    submitReset()
    expect(await screen.findByRole('heading', { name: 'Password reset' })).toBeInTheDocument()
    expect(confirmPasswordReset).toHaveBeenCalledWith(
      CHALLENGE, '012345', PASSWORD, expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(logout).toHaveBeenCalledTimes(1)
    expect(screen.queryByLabelText('Verification code')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
    expect(sessionStorage.length).toBe(0)
    fireEvent.click(within(screen.getByRole('region', { name: 'Password reset' }))
      .getByRole('link', { name: 'Log in', exact: true }))
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Your password has been reset.')
  })

  it.each([
    [{ code: '123' }, 'Verification code'],
    [{ password: 'short' }, 'New password'],
    [{ confirmation: 'DifferentPassword123!' }, 'Confirm new password'],
  ])('rejects invalid reset fields before sending them', async (values, label) => {
    showReset()
    await enterCodeStage()
    fillReset(values)
    submitReset()
    expect(confirmPasswordReset).not.toHaveBeenCalled()
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText(label)).toHaveFocus()
  })

  it.each([
    ['invalid_code', /code is incorrect or has already been used/],
    ['expired_code', /code has expired/],
    ['attempts_exhausted', /Too many incorrect codes/],
  ])('explains the %s response without logging in', async (code, message) => {
    confirmPasswordReset.mockRejectedValueOnce({ response: { status: 400, data: { detail: { code } } } })
    showReset()
    await enterCodeStage()
    fillReset()
    submitReset()
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(logout).not.toHaveBeenCalled()
  })

  it('allows resend after the cooldown and replaces the challenge', async () => {
    vi.useFakeTimers()
    showReset()
    await enterCodeStage()
    await act(async () => { vi.advanceTimersByTime(60_000) })
    const nextId = '22222222-2222-4222-8222-222222222222'
    requestPasswordReset.mockResolvedValueOnce({ ...REQUESTED, challenge_id: nextId })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Resend code' })) })
    expect(screen.getByRole('button', { name: 'Resend in 60s' })).toBeDisabled()
    confirmPasswordReset.mockResolvedValueOnce({ status: 'password_reset' })
    fillReset()
    await act(async () => submitReset())
    expect(confirmPasswordReset.mock.calls[0][0]).toBe(nextId)
  })

  it('disables confirmation when the displayed code expires', async () => {
    vi.useFakeTimers()
    showReset()
    await enterCodeStage()
    await act(async () => { vi.advanceTimersByTime(600_000) })
    expect(screen.getByRole('button', { name: 'Reset password' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('This code has expired.')
    expect(screen.getByRole('button', { name: 'Resend code' })).toBeEnabled()
  })

  it('honours a server retry-after response', async () => {
    requestPasswordReset.mockRejectedValueOnce({
      response: { status: 429, headers: { 'retry-after': '120' }, data: { detail: { code: 'reset_rate_limited' } } },
    })
    showReset()
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'person@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many requests.')
    expect(screen.getByRole('button', { name: 'Try again in 120s' })).toBeDisabled()
  })

  it('preserves the current session if a different session appears during confirmation', async () => {
    let finish
    saveAuthToken('first-session')
    confirmPasswordReset.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    showReset()
    await enterCodeStage()
    fillReset()
    submitReset()
    saveAuthToken('another-session')
    await act(async () => { finish({ status: 'password_reset' }) })
    expect(logout).not.toHaveBeenCalled()
    expect(getAuthToken()).toBe('another-session')
  })

  it('ignores a completed reset after the user leaves the page', async () => {
    let finish
    confirmPasswordReset.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    showReset()
    await enterCodeStage()
    fillReset()
    submitReset()
    fireEvent.click(screen.getByRole('link', { name: 'Back to login' }))
    await act(async () => { finish({ status: 'password_reset' }) })
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument()
    expect(logout).not.toHaveBeenCalled()
    expect(confirmPasswordReset.mock.calls[0][3].signal.aborted).toBe(true)
  })

  it('prevents duplicate confirmation submissions', async () => {
    let finish
    confirmPasswordReset.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
    showReset()
    await enterCodeStage()
    fillReset()
    submitReset()
    fireEvent.submit(screen.getByLabelText('Verification code').closest('form'))
    expect(confirmPasswordReset).toHaveBeenCalledTimes(1)
    await act(async () => { finish({ status: 'password_reset' }) })
  })

  it('clears code and passwords when changing email', async () => {
    showReset()
    await enterCodeStage()
    fillReset()
    fireEvent.click(screen.getByRole('button', { name: 'Use a different email' }))
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
    expect(confirmPasswordReset).not.toHaveBeenCalled()
  })

  it('supports Kiswahili and a temporary email-service failure', async () => {
    requestPasswordReset.mockRejectedValueOnce({ response: { status: 503 } })
    showReset({ language: 'sw' })
    fireEvent.change(screen.getByLabelText('Barua pepe'), { target: { value: 'person@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tuma msimbo' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Huduma ya kurejesha nenosiri haipatikani')
    expect(requestPasswordReset.mock.calls[0][1]).toBe('sw')
  })
})
