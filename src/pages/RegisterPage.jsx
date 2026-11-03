import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useLanguage } from '../context/useLanguage'
import { useAccountText } from '../i18n/accountTranslations'
import { registerPatient } from '../services/auth'
import {
  passwordStrength,
  profilePayload,
  validateRegistration,
} from '../utils/accountValidation'

const initialValues = {
  fullName: '',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const a = useAccountText()

  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState('')

  const pending = useRef(false)
  const active = useRef(true)

  useEffect(() => {
    active.current = true

    return () => {
      active.current = false
    }
  }, [])

  const errors = validateRegistration(values)
  const strength = passwordStrength(values.password)

  const fields = [
    {
      key: 'fullName',
      label: a('fullName'),
      type: 'text',
      autoComplete: 'name',
      maxLength: 200,
      help: a('nameHelp'),
    },
    {
      key: 'phoneNumber',
      label: a('phoneNumber'),
      type: 'tel',
      autoComplete: 'tel',
      maxLength: 64,
      help: a('phoneHelp'),
      optional: true,
    },
    {
      key: 'email',
      label: t('auth.email'),
      type: 'email',
      autoComplete: 'email',
      maxLength: 254,
      placeholder: 'you@example.com',
      help: t('register.emailHelp'),
    },
    {
      key: 'password',
      label: t('auth.password'),
      type: showPasswords ? 'text' : 'password',
      autoComplete: 'new-password',
      maxLength: 128,
      help: a('passwordHelp'),
    },
    {
      key: 'confirmPassword',
      label: t('auth.confirmPassword'),
      type: showPasswords ? 'text' : 'password',
      autoComplete: 'new-password',
      maxLength: 128,
      help: t('register.confirmEmpty'),
    },
  ]

  function changeValue(key, value) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
    setErrorKey('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (pending.current) return

    setAttempted(true)
    setErrorKey('')

    const firstInvalid = fields.find(
      (field) => errors[field.key],
    )

    if (firstInvalid) {
      event.currentTarget
        .querySelector(`#register-${firstInvalid.key}`)
        ?.focus()
      return
    }

    pending.current = true
    setLoading(true)

    try {
      await registerPatient(
        values.email.trim().toLowerCase(),
        values.password,
        profilePayload(values.fullName, values.phoneNumber),
      )

      if (!active.current) return

      navigate('/login', {
        replace: true,
        state: { accountCreated: true },
      })
    } catch (error) {
      if (!active.current) return

      const status = error.response?.status

      setErrorKey(
        status === 409
          ? 'exists'
          : status === 422
            ? 'invalidRegistration'
            : 'registrationFailed',
      )
    } finally {
      pending.current = false

      if (active.current) {
        setLoading(false)
      }
    }
  }

  return (
    <section
      className="register-page"
      aria-labelledby="register-heading"
    >
      <div className="rc-container">
        <div className="row align-items-center gx-xl-5 gy-5 register-grid">
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

              {errorKey && (
                <div
                  className="form-message error-message"
                  role="alert"
                >
                  {a(errorKey)}
                </div>
              )}

              <form
                className="register-form"
                onSubmit={handleSubmit}
                aria-busy={loading}
                noValidate
              >
                <fieldset
                  disabled={loading}
                  className="border-0 p-0 m-0"
                >
                  {fields.map((field) => {
                    const showError =
                      Boolean(errors[field.key]) &&
                      (attempted || touched[field.key])

                    const id = `register-${field.key}`

                    return (
                      <div className="register-field" key={field.key}>
                        <label className="form-label" htmlFor={id}>
                          {field.label}
                        </label>

                        <input
                          id={id}
                          className="form-control register-input"
                          type={field.type}
                          value={values[field.key]}
                          autoComplete={field.autoComplete}
                          maxLength={field.maxLength}
                          placeholder={field.placeholder}
                          required={!field.optional}
                          aria-invalid={Boolean(showError)}
                          aria-describedby={`${id}-help`}
                          onChange={(event) =>
                            changeValue(field.key, event.target.value)
                          }
                          onBlur={() =>
                            setTouched((current) => ({
                              ...current,
                              [field.key]: true,
                            }))
                          }
                        />

                        <p
                          id={`${id}-help`}
                          className={`register-field-note${
                            showError
                              ? ' register-field-note-error'
                              : ''
                          }`}
                        >
                          {showError
                            ? a(errors[field.key])
                            : field.help}
                        </p>

                        {field.key === 'password' && (
                          <>
                            <div
                              className="register-strength-heading"
                              aria-live="polite"
                            >
                              <span>
                                {t('register.passwordFeedback')}
                              </span>
                              <strong>
                                {a(`strength${strength}`)}
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
                                    level <= strength
                                      ? 'is-filled'
                                      : ''
                                  }
                                />
                              ))}
                            </div>

                            <p className="register-field-note">
                              {a('strengthNote')}
                            </p>
                          </>
                        )}
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    className="button button-secondary mb-3"
                    aria-pressed={showPasswords}
                    onClick={() =>
                      setShowPasswords((current) => !current)
                    }
                  >
                    {a(
                      showPasswords
                        ? 'hidePasswords'
                        : 'showPasswords',
                    )}
                  </button>

                  <div className="register-role-note">
                    <span aria-hidden="true">✓</span>
                    <p>{t('register.roleNote')}</p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary register-submit"
                    disabled={loading}
                  >
                    {loading
                      ? t('register.creating')
                      : t('register.create')}
                  </button>
                </fieldset>
              </form>

              <p className="register-switch">
                {t('register.existing')}{' '}
                <Link to="/login">{t('nav.login')}</Link>
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