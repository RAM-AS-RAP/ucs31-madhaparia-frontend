
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useLanguage } from '../context/useLanguage'
import { getApiErrorMessage } from '../services/api'
import { registerPatient } from '../services/auth'

const strengthLabels = [
  'register.strength0',
  'register.strength1',
  'register.strength2',
  'register.strength3',
]

function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [email, setEmail] = useState('')
  const [emailVisited, setEmailVisited] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordVisited, setPasswordVisited] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const trimmedEmail = email.trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
  const passwordValid = password.length >= 8

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword

  // Keep the existing password-strength calculation.
  const strengthLevel = !password
    ? 0
    : !passwordValid
      ? 1
      : password.length >= 12 &&
          /[a-zA-Z]/.test(password) &&
          /[^a-zA-Z]/.test(password)
        ? 3
        : 2

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setEmailVisited(true)
    setPasswordVisited(true)

    if (!trimmedEmail) {
      setError(t('register.errorEmail'))
      return
    }

    if (!emailValid) {
      setError(t('register.errorInvalidEmail'))
      return
    }

    if (!passwordValid) {
      setError(t('register.errorPassword'))
      return
    }

    if (!confirmPassword || !passwordsMatch) {
      setError(t('register.errorMismatch'))
      return
    }

    setLoading(true)

    try {
      await registerPatient(trimmedEmail, password)

      navigate('/login', {
        state: { accountCreated: true },
      })
    } catch (requestError) {
      const status = requestError.response?.status

      if (status === 409) {
        setError(t('register.errorExists'))
      } else if (status === 422) {
        setError(t('register.errorValidation'))
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            t('register.errorGeneric'),
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="register-page"
      aria-labelledby="register-heading"
    >
      <div className="rc-container">
        <div className="row align-items-center gx-xl-5 gy-5 register-grid">

          {/* Desktop introduction */}
          <div className="col-12 col-lg-6 d-none d-lg-block">
            <div className="register-editorial">

              <p className="register-eyebrow">
                {t('register.eyebrow')}
              </p>

              <h2>
                {t('register.title1')}{' '}
                <span>{t('register.title2')}</span>
              </h2>

              <p className="register-intro">
                {t('register.intro')}
              </p>

              <div className="register-benefits">
                <div className="register-benefit">
                  <span aria-hidden="true">01</span>

                  <div>
                    <strong>{t('login.benefit2')}</strong>
                    <p>{t('login.benefit2Description')}</p>
                  </div>
                </div>

                <div className="register-benefit">
                  <span aria-hidden="true">02</span>

                  <div>
                    <strong>{t('register.benefit2')}</strong>
                    <p>{t('register.benefit2Description')}</p>
                  </div>
                </div>
              </div>

              <p className="register-editorial-note">
                {t('register.note')}
              </p>
            </div>
          </div>

          {/* Registration form */}
          <div className="col-12 col-lg-6">
            <div className="register-panel">

              <p className="register-panel-eyebrow">
                {t('register.patient')}
              </p>

              <h1 id="register-heading">
                {t('register.title')}
              </h1>

              <p className="register-panel-description">
                {t('register.welcome')}
              </p>

              {error && (
                <div
                  className="form-message error-message"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form
                className="register-form"
                onSubmit={handleSubmit}
                noValidate
              >

                {/* Email */}
                <div className="register-field">
                  <label
                    className="form-label"
                    htmlFor="register-email"
                  >
                    {t('auth.email')}
                  </label>

                  <input
                    id="register-email"
                    className="form-control register-input"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      setError('')
                    }}
                    onBlur={() => setEmailVisited(true)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={emailVisited && !emailValid}
                    aria-describedby="register-email-help"
                    required
                  />

                  <p
                    id="register-email-help"
                    className={`register-field-note ${
                      emailVisited && !emailValid
                        ? 'register-field-note-error'
                        : ''
                    }`}
                  >
                    {emailVisited && !emailValid
                      ? t('register.emailInvalid')
                      : t('register.emailHelp')}
                  </p>
                </div>

                {/* Password */}
                <div className="register-field">
                  <label
                    className="form-label"
                    htmlFor="register-password"
                  >
                    {t('auth.password')}
                  </label>

                  <div className="register-password-wrap">
                    <input
                      id="register-password"
                      className="form-control register-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setError('')
                      }}
                      onBlur={() => setPasswordVisited(true)}
                      placeholder={t('register.passwordPlaceholder')}
                      autoComplete="new-password"
                      minLength={8}
                      aria-invalid={
                        passwordVisited && !passwordValid
                      }
                      aria-describedby="register-password-help"
                      required
                    />

                    <button
                      className="register-password-toggle"
                      type="button"
                      aria-pressed={showPassword}
                      aria-label={
                        showPassword
                          ? t('auth.hidePassword')
                          : t('auth.showPassword')
                      }
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                    >
                      {showPassword
                        ? t('auth.hide')
                        : t('auth.show')}
                    </button>
                  </div>

                  {/* Password strength */}
                  <div
                    className="register-strength-heading"
                    aria-live="polite"
                  >
                    <span>{t('register.passwordFeedback')}</span>
                    <strong>
                      {t(strengthLabels[strengthLevel])}
                    </strong>
                  </div>

                  <div
                    className="register-strength-bars"
                    aria-hidden="true"
                  >
                    {[1, 2, 3].map((level) => (
                      <span
                        key={level}
                        className={
                          level <= strengthLevel
                            ? 'is-filled'
                            : ''
                        }
                      />
                    ))}
                  </div>

                  <p
                    id="register-password-help"
                    className="register-field-note"
                  >
                    {t('register.passwordHelp')}
                  </p>
                </div>

                {/* Confirm password */}
                <div className="register-field">
                  <label
                    className="form-label"
                    htmlFor="register-confirm"
                  >
                    {t('auth.confirmPassword')}
                  </label>

                  <div className="register-password-wrap">
                    <input
                      id="register-confirm"
                      className="form-control register-input"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value)
                        setError('')
                      }}
                      placeholder={t('register.confirmPlaceholder')}
                      autoComplete="new-password"
                      aria-invalid={
                        confirmPassword.length > 0 &&
                        !passwordsMatch
                      }
                      aria-describedby="register-confirm-help"
                      required
                    />

                    <button
                      className="register-password-toggle"
                      type="button"
                      aria-pressed={showConfirmPassword}
                      aria-label={
                        showConfirmPassword
                          ? t('auth.hideConfirm')
                          : t('auth.showConfirm')
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current,
                        )
                      }
                    >
                      {showConfirmPassword
                        ? t('auth.hide')
                        : t('auth.show')}
                    </button>
                  </div>

                  <p
                    id="register-confirm-help"
                    className={[
                      'register-field-note',
                      confirmPassword && !passwordsMatch
                        ? 'register-field-note-error'
                        : '',
                      passwordsMatch
                        ? 'register-field-note-valid'
                        : '',
                    ].filter(Boolean).join(' ')}
                    aria-live="polite"
                  >
                    {!confirmPassword
                      ? t('register.confirmEmpty')
                      : passwordsMatch
                        ? t('register.confirmMatch')
                        : t('register.confirmMismatch')}
                  </p>
                </div>

                {/* Patient role notice */}
                <div className="register-role-note">
                  <span aria-hidden="true">✓</span>

                  <p>{t('register.roleNote')}</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary register-submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? t('register.creating')
                      : t('register.create')}
                  </span>

                  {!loading && (
                    <span aria-hidden="true">→</span>
                  )}
                </button>
              </form>

              <p className="register-switch">
                {t('register.existing')}{' '}
                <Link to="/login">
                  {t('nav.login')}
                </Link>
              </p>

              <p className="register-disclaimer">
                {t('register.disclaimer')}
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default RegisterPage
