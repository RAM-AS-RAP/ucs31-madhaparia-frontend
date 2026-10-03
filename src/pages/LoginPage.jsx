import { useState } from 'react'
import {
  Link,
  useLocation,
} from 'react-router-dom'

import {
  clearAuthToken,
  hasAuthToken,
  loginPatient,
  saveAuthToken,
} from '../services/auth'

function LoginPage() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(
    location.state?.accountCreated
        ? 'Your account was created successfully. You can now log in.'
        : '',
  )
  const [signedIn, setSignedIn] = useState(
    hasAuthToken(),
  )

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!email.trim() || !password) {
      setError(
        'Please enter your email address and password.',
      )
      return
    }

    setLoading(true)

    try {
      const data = await loginPatient(
        email.trim(),
        password,
      )

      saveAuthToken(data.access_token)
      setSignedIn(true)

      setSuccess(
        'Login successful. Your RespiraCare session is ready.',
      )
    } catch (requestError) {
      const status =
        requestError.response?.status

      if (status === 401) {
        setError(
          'The email or password you entered is incorrect.',
        )
      } else if (
        requestError.code === 'ERR_NETWORK'
      ) {
        setError(
          'RespiraCare could not connect to the backend. Please try again.',
        )
      } else {
        setError(
          requestError.response?.data?.detail ||
            'Login could not be completed. Please try again.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    clearAuthToken()

    setSignedIn(false)
    setPassword('')
    setSuccess('You have been logged out.')
    setError('')
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

          {success && (
            <div className="form-message success-message">
              {success}
            </div>
          )}

          {error && (
            <div className="form-message error-message">
              {error}
            </div>
          )}

          {signedIn ? (
            <div className="signed-in-panel">
              <div className="signed-in-icon">
                ✓
              </div>

              <h3>You are signed in</h3>

              <p>
                Authentication state and protected
                patient pages will be connected in the
                next development stage.
              </p>

              <Link
                to="/"
                className="button button-primary auth-full-button"
              >
                Return home
              </Link>

              <button
                type="button"
                className="button button-secondary auth-full-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          ) : (
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
          )}

          {!signedIn && (
            <p className="auth-switch">
              New to RespiraCare?{' '}
              <Link to="/register">
                Create an account
              </Link>
            </p>
          )}

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