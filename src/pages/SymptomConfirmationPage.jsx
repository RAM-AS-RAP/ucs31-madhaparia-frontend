import { useState } from 'react'
import {
  Link,
  Navigate,
} from 'react-router-dom'

import {
  clearSymptomConfirmation,
  confirmSymptoms,
  getSavedSymptomMapping,
  saveSymptomConfirmation,
} from '../services/symptoms'

import {
  clearPredictionResult,
} from '../services/predictions'  

function SymptomConfirmationPage() {
  const mapping = getSavedSymptomMapping()

  const recognised =
    mapping?.recognised_symptoms || []

  const [selectedCodes, setSelectedCodes] =
    useState(() =>
      recognised.map(
        (symptom) => symptom.code,
      ),
    )

  const [result, setResult] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  if (!mapping) {
    return (
      <Navigate
        to="/symptoms"
        replace
      />
    )
  }

  function toggleSymptom(code) {
    setError('')
    setResult(null)

    clearSymptomConfirmation()
    clearPredictionResult()

    setSelectedCodes((current) => {
      if (current.includes(code)) {
        return current.filter(
          (item) => item !== code,
        )
      }

      return [
        ...current,
        code,
      ]
    })
  }

  async function handleConfirmation() {
    setError('')

    if (selectedCodes.length === 0) {
      setError(
        'Please confirm at least one symptom or return to the previous step and revise your description.',
      )

      return
    }

    setLoading(true)

    try {
      const confirmation =
        await confirmSymptoms(
          mapping.input_text,
          selectedCodes,
        )

      setResult(confirmation)

      saveSymptomConfirmation(
        confirmation,
      )
    } catch (requestError) {
      if (
        requestError.code ===
        'ERR_NETWORK'
      ) {
        setError(
          'RespiraCare could not connect to the backend. Please try again.',
        )
      } else {
        setError(
          requestError.response?.data?.detail ||
            'Your symptoms could not be confirmed. Please try again.',
        )
      }
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

  const confirmed =
    result?.confirmed_symptoms || []

  const rejected =
    result?.rejected_symptoms || []

  return (
    <section className="confirmation-page">
      <div className="container confirmation-layout">
        <div className="confirmation-heading">
          <span className="symptom-eyebrow">
            Symptom review
          </span>

          <h1>
            Confirm what
            <span> RespiraCare recognised.</span>
          </h1>

          <p>
            Select the symptoms that correctly describe
            how you are feeling. Anything you leave
            unchecked will not be sent forward to the
            prediction stage.
          </p>
        </div>

        {!result && (
          <div className="confirmation-card">
            <div className="confirmation-card-header">
              <div>
                <span>
                  Step 2 of 3
                </span>

                <h2>
                  Review recognised symptoms
                </h2>

                <p>
                  We found {recognised.length}{' '}
                  recognised symptom
                  {recognised.length === 1
                    ? ''
                    : 's'}.
                </p>
              </div>

              <div className="confirmation-count">
                <strong>
                  {selectedCodes.length}
                </strong>

                <span>
                  selected
                </span>
              </div>
            </div>

            <div className="confirmation-original-text">
              <span>
                Your description
              </span>

              <p>
                “{mapping.input_text}”
              </p>
            </div>

            {mapping.has_red_flag && (
              <div className="confirmation-warning">
                <div>
                  !
                </div>

                <div>
                  <strong>
                    Safety-sensitive wording detected
                  </strong>

                  <p>
                    One or more recognised symptoms may
                    require urgent-review handling if
                    you confirm them below.
                  </p>
                </div>
              </div>
            )}

            <div className="confirmation-list">
              {recognised.map(
                (symptom) => {
                  const selected =
                    selectedCodes.includes(
                      symptom.code,
                    )

                  return (
                    <button
                      type="button"
                      key={symptom.code}
                      className={
                        selected
                          ? `confirmation-option selected${
                              symptom.is_red_flag
                                ? ' warning'
                                : ''
                            }`
                          : `confirmation-option${
                              symptom.is_red_flag
                                ? ' warning'
                                : ''
                            }`
                      }
                      onClick={() =>
                        toggleSymptom(
                          symptom.code,
                        )
                      }
                    >
                      <div className="confirmation-checkbox">
                        {selected
                          ? '✓'
                          : ''}
                      </div>

                      <div className="confirmation-option-text">
                        <div className="confirmation-option-top">
                          <h3>
                            {
                              symptom.display_name
                            }
                          </h3>

                          {symptom.is_red_flag && (
                            <span className="confirmation-red-flag">
                              Safety-sensitive
                            </span>
                          )}
                        </div>

                        <p>
                          Recognised from{' '}
                          <strong>
                            “{
                              symptom.matched_text
                            }”
                          </strong>
                        </p>
                      </div>
                    </button>
                  )
                },
              )}
            </div>

            {error && (
              <div className="form-message error-message">
                {error}
              </div>
            )}

            <div className="confirmation-actions">
              <Link
                to="/symptoms"
                className="button button-secondary"
              >
                Back to symptom input
              </Link>

              <button
                type="button"
                className="button button-primary"
                disabled={loading}
                onClick={
                  handleConfirmation
                }
              >
                {loading
                  ? 'Confirming...'
                  : 'Confirm selected symptoms'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="confirmation-result">
            {result.safety_status ===
            'urgent_review' ? (
              <div className="urgent-review-card">
                <div className="urgent-review-icon">
                  !
                </div>

                <div>
                  <span>
                    Urgent review recommended
                  </span>

                  <h2>
                    A confirmed symptom needs
                    prompt attention.
                  </h2>

                  <p>
                    RespiraCare detected a
                    safety-sensitive confirmed symptom.
                    Consider seeking prompt professional
                    medical assessment, especially if
                    symptoms are severe, worsening, or
                    causing breathing difficulty.
                  </p>
                </div>
              </div>
            ) : (
              <div className="confirmation-success-card">
                <div className="confirmation-success-icon">
                  ✓
                </div>

                <div>
                  <span>
                    Confirmation complete
                  </span>

                  <h2>
                    Your symptoms are ready for
                    the next stage.
                  </h2>

                  <p>
                    Only the symptoms you confirmed
                    will be used when RespiraCare
                    prepares the prediction request.
                  </p>
                </div>
              </div>
            )}

            <div className="confirmation-summary">
              <div className="confirmation-summary-header">
                <div>
                  <span>
                    Confirmed
                  </span>

                  <h3>
                    Selected symptoms
                  </h3>
                </div>

                <strong>
                  {confirmed.length}
                </strong>
              </div>

              <div className="confirmation-summary-list">
                {confirmed.map(
                  (symptom) => (
                    <div
                      className="confirmation-summary-item"
                      key={symptom.code}
                    >
                      <div>
                        <strong>
                          {
                            symptom.display_name
                          }
                        </strong>

                        <span>
                          {
                            symptom.matched_text
                          }
                        </span>
                      </div>

                      {symptom.is_red_flag && (
                        <span className="confirmation-red-flag">
                          Safety-sensitive
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>

            {rejected.length > 0 && (
              <div className="confirmation-rejected">
                <span>
                  Not confirmed
                </span>

                <h3>
                  Excluded symptoms
                </h3>

                <div className="rejected-list">
                  {rejected.map(
                    (symptom) => (
                      <span
                        key={symptom.code}
                      >
                        {
                          symptom.display_name
                        }
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}

            <div className="confirmation-next-step">
              <div>
                <span>
                  Next step
                </span>

                <h3>
                  Generate health-awareness results
                </h3>

                <p>
                  Prediction will be connected in
                  Frontend Issue #6.
                </p>
              </div>

              <Link
                to="/prediction"
                className="button button-primary"
              >
                Continue to prediction
              </Link>
            </div>

            <button
              type="button"
              className="confirmation-review-again"
              onClick={handleReviewAgain}
            >
              Review selections again
            </button>
          </div>
        )}

        <div className="symptom-safety-footer">
          <strong>
            Important
          </strong>

          <p>
            RespiraCare provides preliminary
            health-awareness support and is not a
            medical diagnosis.
          </p>

          <Link to="/dashboard">
            Return to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SymptomConfirmationPage