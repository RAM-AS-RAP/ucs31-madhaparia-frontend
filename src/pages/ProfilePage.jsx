import { useEffect, useRef, useState } from 'react'

import { useAuth } from '../context/useAuth'
import { useAccountText } from '../i18n/accountTranslations'
import {
  profilePayload,
  validateProfile,
} from '../utils/accountValidation'
import './ProfilePage.css'

function ProfileForm({ user, updateProfile }) {
  const a = useAccountText()

  const [fullName, setFullName] = useState(user.full_name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number ?? '')
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorKey, setErrorKey] = useState('')
  const [saved, setSaved] = useState(false)

  const pending = useRef(false)
  const active = useRef(true)

  useEffect(() => {
    active.current = true

    return () => {
      active.current = false
    }
  }, [])

  const errors = validateProfile(fullName, phoneNumber)
  const dirty =
    fullName !== (user.full_name ?? '') ||
    phoneNumber !== (user.phone_number ?? '')

  function clearMessages() {
    setErrorKey('')
    setSaved(false)
  }

  function resetChanges() {
    setFullName(user.full_name ?? '')
    setPhoneNumber(user.phone_number ?? '')
    setTouched({})
    setAttempted(false)
    clearMessages()
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (pending.current || !dirty) return

    setAttempted(true)
    clearMessages()

    if (errors.fullName || errors.phoneNumber) {
      const id = errors.fullName
        ? '#profile-fullName'
        : '#profile-phoneNumber'

      event.currentTarget.querySelector(id)?.focus()
      return
    }

    pending.current = true
    setLoading(true)

    try {
      const updatedUser = await updateProfile(
        profilePayload(fullName, phoneNumber),
      )

      if (!active.current) return

      setFullName(updatedUser.full_name ?? '')
      setPhoneNumber(updatedUser.phone_number ?? '')
      setTouched({})
      setAttempted(false)
      setSaved(true)
    } catch (error) {
      if (!active.current) return

      const status = error.response?.status

      setErrorKey(
        status === 401
          ? 'sessionExpired'
          : status === 422
            ? 'invalidProfile'
            : 'profileFailed',
      )
    } finally {
      pending.current = false

      if (active.current) setLoading(false)
    }
  }

  const fields = [
    {
      key: 'fullName',
      value: fullName,
      label: a('fullName'),
      help: a('nameHelp'),
      type: 'text',
      autoComplete: 'name',
      maxLength: 200,
      required: true,
      change: setFullName,
    },
    {
      key: 'phoneNumber',
      value: phoneNumber,
      label: a('phoneNumber'),
      help: a('phoneHelp'),
      type: 'tel',
      autoComplete: 'tel',
      maxLength: 64,
      required: false,
      change: setPhoneNumber,
    },
  ]

  return (
    <section className="register-page profile-page" aria-labelledby="profile-heading">
      <div className="rc-container profile-container">
            <div className="register-panel profile-panel">
              <header className="profile-heading">
                <span className="profile-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <h1 id="profile-heading">{a('profileTitle')}</h1>
                  <p className="register-panel-description">{a('profileIntro')}</p>
                </div>
              </header>

              {errorKey && (
                <div className="form-message error-message" role="alert">
                  {a(errorKey)}
                </div>
              )}

              {saved && (
                <div className="form-message success-message" role="status">
                  {a('saved')}
                </div>
              )}

              <section className="profile-account" aria-labelledby="profile-account-heading">
                <h2 className="profile-section-title" id="profile-account-heading">
                  {a('accountDetails')}
                </h2>
                <div className="profile-account-grid">
              <div className="register-field profile-field">
                <label className="form-label" htmlFor="profile-email">
                  {a('email')}
                </label>
                <input
                  id="profile-email"
                  className="form-control register-input"
                  type="email"
                  value={user.email ?? ''}
                  aria-describedby="profile-email-help"
                  readOnly
                />
                <p id="profile-email-help" className="register-field-note">
                  {a('emailReadOnly')}
                </p>
              </div>

              <div className="register-field profile-field">
                <label className="form-label" htmlFor="profile-role">
                  {a('role')}
                </label>
                <input
                  id="profile-role"
                  className="form-control register-input"
                  value={
                    user.role === 'admin'
                      ? a('admin')
                      : user.role === 'patient'
                        ? a('patient')
                        : user.role ?? ''
                  }
                  readOnly
                />
              </div>
                </div>
              </section>

              <form
                className="register-form profile-form"
                onSubmit={handleSubmit}
                aria-busy={loading}
                noValidate
              >
                <fieldset disabled={loading} className="profile-editable">
                  <legend className="profile-section-title">{a('personalDetails')}</legend>
                  <div className="profile-fields">
                  {fields.map((field) => {
                    const id = `profile-${field.key}`
                    const showError =
                      Boolean(errors[field.key]) &&
                      (attempted || touched[field.key])

                    return (
                      <div className="register-field profile-field" key={field.key}>
                        <label className="form-label" htmlFor={id}>
                          {field.label}
                        </label>
                        <input
                          id={id}
                          className="form-control register-input"
                          type={field.type}
                          value={field.value}
                          autoComplete={field.autoComplete}
                          maxLength={field.maxLength}
                          required={field.required}
                          aria-invalid={Boolean(showError)}
                          aria-describedby={`${id}-help`}
                          onChange={(event) => {
                            field.change(event.target.value)
                            clearMessages()
                          }}
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
                            showError ? ' register-field-note-error' : ''
                          }`}
                        >
                          {showError ? a(errors[field.key]) : field.help}
                        </p>
                      </div>
                    )
                  })}
                  </div>

                  <div className="profile-actions">
                    <button
                      type="submit"
                      className="button button-primary"
                      disabled={loading || !dirty}
                    >
                      {a(loading ? 'saving' : 'save')}
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={resetChanges}
                      disabled={loading || !dirty}
                    >
                      {a('cancel')}
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
      </div>
    </section>
  )
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()

  if (!user) return null

  return (
    <ProfileForm
      key={user.id || user.email}
      user={user}
      updateProfile={updateProfile}
    />
  )
}
