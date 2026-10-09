import { useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../services/api'

function LoginPage() {
  const location = useLocation()

  const {
    isAuthenticated,
    login,
    user,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const accountCreated =
    location.state?.accountCreated

  const authenticationRequired =
    location.state?.authenticationRequired

  // All redirects after login happen here, once
  // the user is known. Sending the user back to the
  // page they asked for (location.state.from) is
  // done in this one place so that two different
  // navigations cannot race each other.
  if (isAuthenticated) {
    const requestedRoute =
      location.state?.from

    const defaultRoute =
      user?.role === 'admin'
        ? '/admin'
        : '/dashboard'

    return (
      <Navigate
        to={requestedRoute || defaultRoute}
        replace
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError(
        'Please enter your email address and password.',
      )
      return
    }

    setLoading(true)

    try {
      // On success the user state changes and the
      // redirect above takes the user onwards.
      await login(
        email.trim(),
        password,
      )
    } catch (requestError) {
      const status =
        requestError.response?.status

      if (status === 401) {
        setError(
          'The email or password you entered is incorrect.',
        )
      } else if (status === 422) {
        setError(
          'Please check your email address and password.',
        )
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            'Login could not be completed. Please try again.',
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="container auth-grid">
        <div className="auth-intro">
          <span className="auth-eyebrow">
            Welcome back
          </span>

          <h1>
            Continue your respiratory
            <span> health-awareness journey.</span>
          </h1>

          <p>
            Sign in to access RespiraCare and continue
            using your personal health-awareness tools.
          </p>

          <div className="auth-benefits">
            <div>
              <span>✓</span>

              <div>
                <strong>
                  Your personal history
                </strong>

                <p>
                  Access your stored respiratory
                  health-awareness sessions.
                </p>
              </div>
            </div>

            <div>
              <span>✓</span>

              <div>
                <strong>
                  Private account access
                </strong>

                <p>
                  Your prediction history is linked
                  only to your account.
                </p>
              </div>
            </div>

            <div>
              <span>✓</span>

              <div>
                <strong>
                  English + Kiswahili
                </strong>

                <p>
                  Describe symptoms naturally using
                  supported language input.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-label">
              RespiraCare account
            </span>

            <h2>Log in</h2>

            <p>
              Enter your account details to continue.
            </p>
          </div>

          {accountCreated && (
            <div className="form-message success-message">
              Your account was created successfully.
              You can now log in.
            </div>
          )}

          {authenticationRequired && (
            <div className="form-message info-message">
              Please log in to access that page.
            </div>
          )}

          {error && (
            <div className="form-message error-message">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>Email address</span>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span>Password</span>

              <div className="password-field">
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                >
                  {showPassword
                    ? 'Hide'
                    : 'Show'}
                </button>
              </div>
            </label>

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Logging in...'
                : 'Log in'}
            </button>
          </form>

          <p className="auth-switch">
            New to RespiraCare?{' '}
            <Link to="/register">
              Create an account
            </Link>
          </p>

          <div className="auth-disclaimer">
            RespiraCare provides health-awareness
            information only and does not provide a
            medical diagnosis.
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
