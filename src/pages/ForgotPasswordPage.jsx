import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import { useLanguage } from '../context/useLanguage'
import { usePasswordResetText } from '../i18n/passwordResetTranslations'
import { getAuthToken } from '../services/authToken'
import {
  confirmPasswordReset,
  passwordResetErrorCode,
  passwordResetRetryAfter,
  requestPasswordReset,
} from '../services/passwordReset'
import { validRegistrationPassword } from '../utils/accountValidation'
import './ForgotPasswordPage.css'

function remainingSeconds(deadline, now) {
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

export default function ForgotPasswordPage() {
  const t = usePasswordResetText()
  const { language } = useLanguage()
  const { logout } = useAuth()

  const [stage, setStage] = useState('email')
  const [email, setEmail] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [errorKey, setErrorKey] = useState('')
  const [blocked, setBlocked] = useState(false)
  const [busy, setBusy] = useState('')
  const [now, setNow] = useState(Date.now)
  const [expiresAt, setExpiresAt] = useState(0)
  const [resendAt, setResendAt] = useState(0)
  const active = useRef(true)
  const pending = useRef(false)
  const generation = useRef(0)
  const controller = useRef(null)
  const codeInput = useRef(null)
  const heading = useRef(null)

  useEffect(() => {
    if (stage === 'code') codeInput.current?.focus()
    if (stage === 'done') heading.current?.focus()
  }, [stage, challenge])

  useEffect(() => {
    active.current = true
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => {
      active.current = false
      generation.current += 1
      controller.current?.abort()
      window.clearInterval(timer)
    }
  }, [])

  const normalisedEmail = email.trim().toLowerCase()
  const validEmail = normalisedEmail.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalisedEmail)
  const validCode = /^[0-9]{6}$/.test(code)
  const validPassword = validRegistrationPassword(password)
  const passwordsMatch = confirmation.length > 0 && confirmation === password
  const resendRemaining = remainingSeconds(resendAt, now)
  const expiresRemaining = remainingSeconds(expiresAt, now)
  const expired = stage === 'code' && expiresRemaining === 0
  const timeLeft = `${Math.floor(expiresRemaining / 60)}:${String(expiresRemaining % 60).padStart(2, '0')}`

  function startRequest(kind) {
    pending.current = true
    controller.current?.abort()
    controller.current = new AbortController()
    const version = ++generation.current
    setBusy(kind)
    setErrorKey('')
    return { version, signal: controller.current.signal }
  }

  function isCurrent(operation) {
    return active.current && generation.current === operation.version && !operation.signal.aborted
  }

  function finishRequest(operation) {
    if (!isCurrent(operation)) return
    pending.current = false
    setBusy('')
  }

  function handleError(error, operation) {
    if (!isCurrent(operation)) return
    const key = passwordResetErrorCode(error)
    setErrorKey(key)
    if (key === 'reset_rate_limited') {
      const currentTime = Date.now()
      setNow(currentTime)
      setResendAt(currentTime + passwordResetRetryAfter(error) * 1000)
    }
    if (key === 'expired_code' || key === 'attempts_exhausted') setBlocked(true)
  }

  async function sendCode(event) {
    event?.preventDefault()
    if (pending.current || resendRemaining > 0) return
    if (stage === 'email') setAttempted(true)
    if (!validEmail) {
      event?.currentTarget.querySelector('#reset-email')?.focus()
      return
    }

    const operation = startRequest('request')
    try {
      const result = await requestPasswordReset(
        normalisedEmail, language === 'sw' ? 'sw' : 'en', { signal: operation.signal },
      )
      if (!isCurrent(operation)) return
      const currentTime = Date.now()
      setNow(currentTime)
      setChallenge(result.challenge_id)
      setExpiresAt(currentTime + result.expires_in_seconds * 1000)
      setResendAt(currentTime + result.resend_after_seconds * 1000)
      setCode('')
      setBlocked(false)
      setAttempted(false)
      setStage('code')
    } catch (error) {
      handleError(error, operation)
    } finally {
      finishRequest(operation)
    }
  }

  async function resetPassword(event) {
    event.preventDefault()
    if (pending.current) return
    setAttempted(true)
    setErrorKey('')
    if (expired || blocked) return
    if (!validCode || !validPassword || !passwordsMatch) {
      const id = !validCode ? '#reset-code' : !validPassword ? '#reset-password' : '#reset-confirmation'
      event.currentTarget.querySelector(id)?.focus()
      return
    }

    const tokenAtSubmit = getAuthToken()
    const operation = startRequest('confirm')
    try {
      await confirmPasswordReset(challenge, code, password, { signal: operation.signal })
      if (!isCurrent(operation)) return
      // Never sign out a different session created while this request was pending.
      if (getAuthToken() === tokenAtSubmit) logout()
      setStage('done')
      setChallenge(null)
      setCode('')
      setPassword('')
      setConfirmation('')
      setShowPasswords(false)
      setAttempted(false)
    } catch (error) {
      handleError(error, operation)
    } finally {
      finishRequest(operation)
    }
  }

  function changeEmail() {
    controller.current?.abort()
    generation.current += 1
    pending.current = false
    setBusy('')
    setStage('email')
    setChallenge(null)
    setCode('')
    setPassword('')
    setConfirmation('')
    setShowPasswords(false)
    setAttempted(false)
    setErrorKey('')
    setBlocked(false)
    setExpiresAt(0)
    setResendAt(0)
  }

  const step = stage === 'email' ? 0 : stage === 'code' ? 1 : 2
  const passwordFields = [
    { id: 'reset-password', label: t('newPassword'), value: password, change: setPassword, valid: validPassword, help: 'passwordHelp', error: 'passwordError' },
    { id: 'reset-confirmation', label: t('confirmPassword'), value: confirmation, change: setConfirmation, valid: passwordsMatch, help: null, error: 'confirmError' },
  ]

  return (
    <section className="register-page reset-page" aria-labelledby="reset-heading">
      <div className="rc-container reset-container">
        <div className="register-panel reset-panel">
          <ol className="reset-progress" aria-label={t('steps')}>
            {['stepEmail', 'stepCode', 'stepDone'].map((key, index) => (
              <li key={key} className={index <= step ? 'is-active' : ''} aria-current={index === step ? 'step' : undefined}>
                <span aria-hidden="true">{index + 1}</span>{t(key)}
              </li>
            ))}
          </ol>

          <h1 id="reset-heading" ref={heading} tabIndex={-1}>{t(stage === 'done' ? 'successTitle' : 'title')}</h1>
          <p className="reset-intro">{t(stage === 'done' ? 'success' : stage === 'email' ? 'intro' : 'codeIntro')}</p>

          {errorKey && <div className="form-message error-message" role="alert">{t(errorKey)}</div>}

          {stage === 'email' && (
            <form onSubmit={sendCode} noValidate aria-busy={Boolean(busy)}>
              <div className="reset-field">
                <label htmlFor="reset-email">{t('email')}</label>
                <input
                  id="reset-email" className="form-control register-input" type="email"
                  autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={254}
                  value={email} disabled={Boolean(busy)} required
                  aria-invalid={attempted && !validEmail} aria-describedby="reset-email-help"
                  onChange={(event) => { setEmail(event.target.value); setErrorKey('') }}
                />
                <p id="reset-email-help" className={attempted && !validEmail ? 'reset-field-error' : 'reset-help'}>
                  {t(attempted && !validEmail ? 'emailError' : 'emailHelp')}
                </p>
              </div>
              <button type="submit" className="button button-primary reset-submit" disabled={Boolean(busy) || resendRemaining > 0}>
                {busy ? t('sending') : resendRemaining > 0 ? t('retryIn', { seconds: resendRemaining }) : t('send')}
              </button>
            </form>
          )}

          {stage === 'code' && (
            <>
              <div className="reset-delivery" role="status">
                <p>{t('sent')}</p><strong>{normalisedEmail}</strong>
              </div>
              <p className="reset-expiry" role="timer" aria-live="off">{t('expires', { time: timeLeft })}</p>
              {expired && <p className="form-message error-message" role="alert">{t('expired_code')}</p>}

              <form onSubmit={resetPassword} noValidate aria-busy={Boolean(busy)}>
                <fieldset disabled={Boolean(busy)} className="reset-fields">
                  <div className="reset-field">
                    <label htmlFor="reset-code">{t('code')}</label>
                    <input
                      id="reset-code" ref={codeInput} className="form-control register-input reset-code" type="text"
                      inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}"
                      value={code} required aria-invalid={attempted && !validCode} aria-describedby="reset-code-help"
                      onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setErrorKey('') }}
                    />
                    <p id="reset-code-help" className={attempted && !validCode ? 'reset-field-error' : 'reset-help'}>
                      {t(attempted && !validCode ? 'codeError' : 'codeHelp')}
                    </p>
                  </div>

                  {passwordFields.map((field) => (
                    <div className="reset-field" key={field.id}>
                      <label htmlFor={field.id}>{field.label}</label>
                      <input
                        id={field.id} className="form-control register-input" type={showPasswords ? 'text' : 'password'}
                        autoComplete="new-password" maxLength={128} value={field.value} required
                        aria-invalid={attempted && !field.valid}
                        aria-describedby={field.help || (attempted && !field.valid) ? `${field.id}-help` : undefined}
                        onChange={(event) => { field.change(event.target.value); setErrorKey('') }}
                      />
                      {(field.help || (attempted && !field.valid)) && (
                        <p id={`${field.id}-help`} className={attempted && !field.valid ? 'reset-field-error' : 'reset-help'}>
                          {t(attempted && !field.valid ? field.error : field.help)}
                        </p>
                      )}
                    </div>
                  ))}

                  <button type="button" className="reset-show" aria-pressed={showPasswords} onClick={() => setShowPasswords((value) => !value)}>
                    {t(showPasswords ? 'hide' : 'show')}
                  </button>
                  <button type="submit" className="button button-primary reset-submit" disabled={Boolean(busy) || expired || blocked}>
                    {t(busy === 'confirm' ? 'submitting' : 'submit')}
                  </button>
                </fieldset>
              </form>

              <div className="reset-secondary-actions">
                <button type="button" className="button button-secondary" onClick={sendCode} disabled={Boolean(busy) || resendRemaining > 0}>
                  {t(resendRemaining > 0 ? 'resendIn' : 'resend', { seconds: resendRemaining })}
                </button>
                <button type="button" className="reset-text-button" onClick={changeEmail}>{t('changeEmail')}</button>
              </div>
            </>
          )}

          <Link className={stage === 'done' ? 'button button-primary reset-submit' : 'reset-back'} to="/login" replace state={stage === 'done' ? { passwordReset: true } : null}>
            {t(stage === 'done' ? 'login' : 'back')}
          </Link>
        </div>
      </div>
    </section>
  )
}
