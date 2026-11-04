
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import { useLanguage } from '../context/useLanguage'
import { getApiErrorMessage } from '../services/api'
import { resolvePostLoginPath } from '../utils/roleRouting'
import { usePasswordResetText } from '../i18n/passwordResetTranslations'

function LoginPage() {
  const location = useLocation()
  const { isAuthenticated, login, user } = useAuth()
  const { t } = useLanguage()
  const resetText = usePasswordResetText()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const accountCreated = location.state?.accountCreated
  const authenticationRequired = location.state?.authenticationRequired

  // Redirect only to pages permitted for this role.
  if (isAuthenticated) {
    const requestedRoute = location.state?.from

    const destination = resolvePostLoginPath(
      user?.role,
      requestedRoute,
    )

    return <Navigate to={destination} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError(t('login.errorRequired'))
      return
    }

    setLoading(true)

    try {
      await login(email.trim(), password)
    } catch (requestError) {
      const status = requestError.response?.status

      if (status === 401) {
        setError(t('login.errorInvalid'))
      } else if (status === 422) {
        setError(t('login.errorValidation'))
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            t('login.errorGeneric'),
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="login-page"
      aria-labelledby="login-heading"
    >
      <div className="rc-container">
        <div className="row align-items-center gx-xl-5 gy-5 login-grid">

          {/* Introduction */}
          <div className="col-12 col-lg-6 order-2 order-lg-1 d-none d-lg-block">
            <div className="login-editorial">
              <p className="login-eyebrow">
                {t('login.eyebrow')}
              </p>

              <h1 id="login-heading">
                {t('login.title1')}
                <span> {t('login.title2')}</span>
              </h1>

              <p className="login-intro">
                {t('login.intro')}
              </p>

              <div
                className="login-benefits"
                aria-label={t('login.benefitsLabel')}
              >
                <div className="login-benefit">
                  <span
                    className="login-benefit-number"
                    aria-hidden="true"
                  >
                    01
                  </span>

                  <div>
                    <strong>{t('login.benefit1')}</strong>
                    <p>{t('login.benefit1Description')}</p>
                  </div>
                </div>

                <div className="login-benefit">
                  <span
                    className="login-benefit-number"
                    aria-hidden="true"
                  >
                    02
                  </span>

                  <div>
                    <strong>{t('login.benefit2')}</strong>
                    <p>{t('login.benefit2Description')}</p>
                  </div>
                </div>
              </div>

              <p className="login-editorial-note">
                {t('login.privacy')}
              </p>
            </div>
          </div>

          {/* Login form */}
          <div className="col-12 col-lg-6 order-1 order-lg-2">
            <div className="login-panel">

              <p className="login-panel-eyebrow">
                {t('login.access')}
              </p>

              <h2>{t('nav.login')}</h2>

              <p className="login-panel-description">
                {t('login.welcome')}
              </p>

              {accountCreated && (
                <div
                  className="form-message success-message"
                  role="status"
                >
                  {t('login.created')}
                </div>
              )}

              {location.state?.passwordReset && (
                <div className="form-message success-message" role="status">
                  {resetText('success')}
                </div>
              )}

              {authenticationRequired && (
                <div
                  className="form-message info-message"
                  role="status"
                >
                  {t('login.requiredPage')}
                </div>
              )}

              {error && (
                <div
                  className="form-message error-message"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form
                className="login-form"
                onSubmit={handleSubmit}
              >
                {/* Email */}
                <div className="login-field">
                  <label
                    className="form-label"
                    htmlFor="login-email"
                  >
                    {t('auth.email')}
                  </label>

                  <input
                    id="login-email"
                    className="form-control login-input"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="login-field">
                  <label
                    className="form-label"
                    htmlFor="login-password"
                  >
                    {t('auth.password')}
                  </label>

                  <div className="login-password-wrap">
                    <input
                      id="login-password"
                      className="form-control login-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder={t('auth.passwordPlaceholder')}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      className="login-password-toggle"
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
                </div>

                <div className="login-recovery">
                  <Link to="/forgot-password">{resetText('forgotLink')}</Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary login-submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? t('login.loading')
                      : t('nav.login')}
                  </span>

                  {!loading && (
                    <span aria-hidden="true">→</span>
                  )}
                </button>
              </form>

              <p className="login-register">
                {t('login.newUser')}{' '}
                <Link to="/register">
                  {t('footer.createAccount')}
                </Link>
              </p>

              <p className="login-disclaimer">
                {t('login.disclaimer')}
              </p>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default LoginPage
