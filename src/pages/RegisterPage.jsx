import { useState } from 'react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'

import { getApiErrorMessage } from '../services/api'
import { registerPatient } from '../services/auth'

function RegisterPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    if (!email.trim()) {
      setError(
        'Please enter your email address.',
      )
      return
    }

    if (password.length < 8) {
      setError(
        'Please use a password with at least 8 characters.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'The passwords do not match.',
      )
      return
    }

    setLoading(true)

    try {
      await registerPatient(
        email.trim(),
        password,
      )

      navigate('/login', {
        state: {
          accountCreated: true,
        },
      })
    } catch (requestError) {
      const status =
        requestError.response?.status

      if (status === 409) {
        setError(
          'An account with this email already exists.',
        )
      } else if (status === 422) {
        setError(
          'Please check your email and password details.',
        )
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            'Your account could not be created. Please try again.',
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
            Join RespiraCare
          </span>

          <h1>
            Your respiratory health awareness,
            <span> in one place.</span>
          </h1>

          <p>
            Create your patient account to use
            personalised symptom awareness tools and
            securely access your own prediction
            history.
          </p>

          <div className="auth-benefits">
            <div>
              <span>01</span>

              <div>
                <strong>
                  Describe symptoms naturally
                </strong>

                <p>
                  Use English, Kiswahili or a mixture
                  of both.
                </p>
              </div>
            </div>

            <div>
              <span>02</span>

              <div>
                <strong>
                  Review what RespiraCare understands
                </strong>

                <p>
                  Confirm recognised symptoms before
                  prediction.
                </p>
              </div>
            </div>

            <div>
              <span>03</span>

              <div>
                <strong>
                  Understand possible patterns
                </strong>

                <p>
                  Receive clear awareness guidance,
                  not a medical diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <span className="auth-card-label">
              Patient registration
            </span>

            <h2>Create your account</h2>

            <p>
              Registration creates a patient account
              only.
            </p>
          </div>

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
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength="8"
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

            <label>
              <span>Confirm password</span>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                placeholder="Enter password again"
                autoComplete="new-password"
                required
              />
            </label>

            <div className="patient-role-note">
              <div>✓</div>

              <p>
                Public registration creates a
                <strong> patient </strong>
                account. Administrator accounts
                cannot be created here.
              </p>
            </div>

            <button
              type="submit"
              className="button button-primary auth-submit"
              disabled={loading}
            >
              {loading
                ? 'Creating account...'
                : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">
              Log in
            </Link>
          </p>

          <div className="auth-disclaimer">
            By continuing, you acknowledge that
            RespiraCare provides health-awareness
            information and not medical diagnosis.
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage