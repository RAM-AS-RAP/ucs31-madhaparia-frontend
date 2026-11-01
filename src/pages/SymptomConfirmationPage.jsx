
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import {
  clearSymptomConfirmation,
  confirmSymptoms,
  getSavedSymptomMapping,
  saveSymptomConfirmation,
} from '../services/symptoms'

import { clearPredictionResult } from '../services/predictions'
import { getApiErrorMessage } from '../services/api'
import { useConfirmationText } from '../i18n/confirmationTranslations'

function SymptomConfirmationPage() {
  const t = useConfirmationText()

  const mapping = getSavedSymptomMapping()
  const recognised = mapping?.recognised_symptoms || []

  const [selectedCodes, setSelectedCodes] = useState(
    () => recognised.map((symptom) => symptom.code),
  )
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!mapping) {
    return <Navigate to="/symptoms" replace />
  }

  function toggleSymptom(code) {
    setError('')
    setResult(null)

    clearSymptomConfirmation()
    clearPredictionResult()

    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    )
  }

  async function handleConfirmation() {
    setError('')

    if (selectedCodes.length === 0) {
      setError(t('noSelection'))
      return
    }

    setLoading(true)
    clearPredictionResult()
    clearSymptomConfirmation()

    try {
      const confirmation = await confirmSymptoms(
        mapping.input_text,
        selectedCodes,
      )

      setResult(confirmation)
      saveSymptomConfirmation(confirmation)
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          t('confirmError'),
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  function handleReviewAgain() {
    setResult(null)
    setError('')

    clearSymptomConfirmation()
    clearPredictionResult()
  }

  const confirmed = result?.confirmed_symptoms || []
  const rejected = result?.rejected_symptoms || []
  const isUrgent = result?.safety_status === 'urgent_review'

  return (
    <section
      className="sym33-page"
      aria-labelledby="sym33-confirm-title"
    >
      <div className="rc-container sym33-container">

        {/* Heading */}
        <div className="row g-4 align-items-end sym33-intro-row">
          <div className="col-12 col-lg-8">
            <p className="sym33-eyebrow">
              {t('eyebrow')}
            </p>

            <h1 id="sym33-confirm-title">
              {t('title1')}
              <span> {t('title2')}</span>
            </h1>

            <p className="sym33-lead">
              {t('intro')}
            </p>
          </div>

          <div className="col-12 col-lg-4">
            <div className="sym33-progress">
              <div className="sym33-progress-top">
                <strong>{t('step')}</strong>
                <span>{t('stepLabel')}</span>
              </div>

              <div
                className="sym33-progress-track"
                role="progressbar"
                aria-label={t('progress')}
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={2}
              >
                <span style={{ width: '66.67%' }} />
              </div>
            </div>
          </div>
        </div>

        {!result ? (
          <div className="sym33-confirm-panel">

            {/* Selection heading */}
            <div className="sym33-confirm-header">
              <div>
                <p className="sym33-section-kicker">
                  {t('recognised')}
                </p>

                <h2>{t('review')}</h2>

                <p>
                  {t('recognisedCount', {
                    count: recognised.length,
                  })}
                </p>
              </div>

              <div className="sym33-total">
                <strong>{selectedCodes.length}</strong>
                <span>{t('selectedCount')}</span>
              </div>
            </div>

            {/* Original symptom description */}
            <div className="sym33-original-description">
              <strong>{t('original')}</strong>
              <p>“{mapping.input_text}”</p>
            </div>

            {/* Red-flag warning */}
            {mapping.has_red_flag && (
              <div
                className="sym33-alert sym33-alert-warning"
                role="alert"
              >
                <strong>{t('warning')}</strong>
                <p>{t('warningMessage')}</p>
              </div>
            )}

            {/* Select recognised symptoms */}
            <div
              className="sym33-selection-list"
              aria-label={t('selectSymptoms')}
            >
              {recognised.map((symptom) => {
                const selected = selectedCodes.includes(
                  symptom.code,
                )

                return (
                  <button
                    type="button"
                    key={symptom.code}
                    className={`sym33-selection-row${
                      selected ? ' is-selected' : ''
                    }${
                      symptom.is_red_flag ? ' is-warning' : ''
                    }`}
                    aria-pressed={selected}
                    disabled={loading}
                    onClick={() => toggleSymptom(symptom.code)}
                  >
                    <span
                      className="sym33-checkbox"
                      aria-hidden="true"
                    >
                      {selected ? '✓' : ''}
                    </span>

                    <span className="sym33-selection-copy">
                      <span className="sym33-selection-title">
                        <strong>
                          {symptom.display_name}
                        </strong>

                        {symptom.is_red_flag && (
                          <span className="sym33-warning-tag">
                            {t('safetySensitive')}
                          </span>
                        )}
                      </span>

                      <span className="sym33-selection-description">
                        {t('recognisedFrom')}{' '}
                        <b>“{symptom.matched_text}”</b>
                      </span>
                    </span>

                    <span className="sym33-selection-state">
                      {selected
                        ? t('selected')
                        : t('notSelected')}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="sym33-selection-help">
              {t('selectionHelp')}
            </p>

            {error && (
              <div
                className="form-message error-message sym33-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Confirmation actions */}
            <div className="sym33-confirm-actions">
              <Link
                to="/symptoms"
                className="button button-secondary sym33-secondary-button"
              >
                {t('back')}
              </Link>

              <button
                type="button"
                className="button button-primary sym33-primary-button"
                disabled={loading}
                onClick={handleConfirmation}
              >
                {loading
                  ? t('confirming')
                  : t('confirm')}

                {!loading && (
                  <span aria-hidden="true">→</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="sym33-confirm-result"
            aria-live="polite"
          >

            {/* Urgent and normal confirmation */}
            {isUrgent ? (
              <div
                className="sym33-alert sym33-alert-urgent"
                role="alert"
              >
                <p className="sym33-section-kicker">
                  {t('urgentLabel')}
                </p>

                <h2>{t('urgentTitle')}</h2>
                <p>{t('urgentMessage')}</p>
                <p>{t('urgentStop')}</p>
              </div>
            ) : (
              <div className="sym33-confirm-success">
                <p className="sym33-section-kicker">
                  {t('complete')}
                </p>

                <h2>{t('completeTitle')}</h2>
                <p>{t('completeMessage')}</p>
              </div>
            )}

            {/* Confirmed symptoms */}
            <section
              className="sym33-confirm-summary"
              aria-labelledby="sym33-summary-title"
            >
              <div className="sym33-results-heading">
                <div>
                  <p className="sym33-section-kicker">
                    {t('yourSelection')}
                  </p>

                  <h2 id="sym33-summary-title">
                    {t('confirmedTitle')}
                  </h2>
                </div>

                <div className="sym33-total">
                  <strong>{confirmed.length}</strong>
                  <span>{t('confirmedCount')}</span>
                </div>
              </div>

              <div className="sym33-summary-list">
                {confirmed.map((symptom) => (
                  <div
                    className="sym33-summary-row"
                    key={symptom.code}
                  >
                    <div>
                      <strong>
                        {symptom.display_name}
                      </strong>

                      <p>{symptom.matched_text}</p>
                    </div>

                    {symptom.is_red_flag && (
                      <span className="sym33-warning-tag">
                        {t('safetySensitive')}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rejected symptoms */}
              {rejected.length > 0 && (
                <div className="sym33-excluded">
                  <h3>{t('excludedTitle')}</h3>
                  <p>{t('excludedMessage')}</p>

                  <div className="sym33-excluded-list">
                    {rejected.map((symptom) => (
                      <span key={symptom.code}>
                        {symptom.display_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Prediction is available only when not urgent */}
            {!isUrgent && (
              <div className="sym33-next">
                <div>
                  <p className="sym33-section-kicker">
                    {t('next')}
                  </p>

                  <h3>{t('predictionTitle')}</h3>
                  <p>{t('predictionMessage')}</p>
                </div>

                <Link
                  to="/prediction"
                  className="button button-primary sym33-primary-button"
                >
                  {t('continue')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}

            <div className="sym33-result-actions">
              <button
                type="button"
                className="sym33-text-action"
                onClick={handleReviewAgain}
              >
                {t('reviewAgain')}
              </button>

              {isUrgent && (
                <Link
                  to="/dashboard"
                  className="button button-secondary sym33-secondary-button"
                >
                  {t('dashboard')}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="sym33-bottom-note">
          <div>
            <strong>{t('disclaimerTitle')}</strong>
            <p>{t('disclaimer')}</p>
          </div>

          <Link to="/dashboard">
            {t('dashboard')}
          </Link>
        </div>

      </div>
    </section>
  )
}

export default SymptomConfirmationPage
