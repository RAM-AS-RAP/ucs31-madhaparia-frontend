
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import {
  getSavedSymptomConfirmation,
  getSavedSymptomMapping,
} from '../services/symptoms'

import {
  clearPredictionResult,
  createPrediction,
  getSavedPredictionResult,
  isPredictionForConfirmation,
  savePredictionResult,
} from '../services/predictions'

import { getApiErrorMessage } from '../services/api'
import PredictionFeedback from '../components/PredictionFeedback'

function PredictionPage() {
  const mapping = getSavedSymptomMapping()
  const confirmation = getSavedSymptomConfirmation()

  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Keep a saved result only when it belongs to
  // this exact symptom description and selection.
  const [result, setResult] = useState(() => {
    const saved = getSavedPredictionResult()

    if (
      !isPredictionForConfirmation(
        saved,
        mapping?.input_text,
        confirmation?.confirmed_codes,
      )
    ) {
      return null
    }

    // An urgent confirmation must never reuse
    // an ordinary disease prediction.
    if (
      confirmation?.safety_status === 'urgent_review' &&
      saved?.status !== 'urgent_review'
    ) {
      return null
    }

    return saved
  })

  if (!mapping || !confirmation) {
    return <Navigate to="/symptoms" replace />
  }

  const isConfirmedUrgent =
    confirmation.safety_status === 'urgent_review'

  const confirmedSymptoms =
    confirmation.confirmed_symptoms || []

  const confirmedCodes =
    confirmation.confirmed_codes || []

  // The patient-facing UI always shows one condition.
  const prediction = Array.isArray(result?.predictions)
    ? result.predictions[0] || null
    : null

  const rawConfidence = prediction?.model_confidence_percent

  const numericConfidence =
    rawConfidence == null ? NaN : Number(rawConfidence)

  const hasConfidence = Number.isFinite(numericConfidence)

  const confidenceWidth = hasConfidence
    ? Math.max(0, Math.min(100, numericConfidence))
    : 0

  const isUrgentResult =
    result?.status === 'urgent_review' || isConfirmedUrgent

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const numericAge = Number(age)

    if (
      !age ||
      !Number.isInteger(numericAge) ||
      numericAge < 0 ||
      numericAge > 120
    ) {
      setError('Please enter a valid age between 0 and 120.')
      return
    }

    if (sex !== 'M' && sex !== 'F') {
      setError('Please select your sex before continuing.')
      return
    }

    if (confirmedCodes.length === 0) {
      setError(
        'No confirmed symptoms are available for prediction.',
      )
      return
    }

    setLoading(true)

    try {
      clearPredictionResult()

      const response = await createPrediction({
        age: numericAge,
        sex,
        text: mapping.input_text,
        confirmedCodes,
      })

      // The backend is responsible for red-flag routing.
      // Do not accept a disease prediction for a known
      // urgent-review confirmation.
      if (
        isConfirmedUrgent &&
        response.status !== 'urgent_review'
      ) {
        setError(
          'Urgent safety guidance could not be confirmed. Please seek prompt medical assessment rather than relying on an automated prediction.',
        )
        return
      }

      setResult(response)
      savePredictionResult(response, mapping.input_text)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError(
          'Your login session is no longer valid. Please log in again.',
        )
      } else if (requestError.response?.status === 422) {
        setError(
          getApiErrorMessage(
            requestError,
            'Please check your details and confirmed symptoms before trying again.',
          ),
        )
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            'RespiraCare could not generate the result. Please try again.',
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function handleStartAgain() {
    clearPredictionResult()
    setResult(null)
    setAge('')
    setSex('')
    setError('')
  }

  return (
    <section
      className="pred34-page"
      aria-labelledby="pred34-title"
    >
      <div className="rc-container pred34-container">

        {/* Shared page introduction */}
        <div className="row g-4 align-items-end pred34-intro">
          <div className="col-12 col-lg-8">
            <p className="pred34-eyebrow">
              Health awareness
            </p>

            <h1 id="pred34-title">
              Understand your
              <span> symptom pattern.</span>
            </h1>

            <p className="pred34-lead">
              RespiraCare compares your confirmed symptoms
              with patterns learned by the trained model.
              The information is for health awareness,
              not a medical diagnosis.
            </p>
          </div>

          <div className="col-12 col-lg-4">
            <div className="pred34-progress">
              <div className="pred34-progress-labels">
                <strong>Step 3 of 3</strong>
                <span>
                  {result ? 'Assessment complete' : 'Health awareness'}
                </span>
              </div>

              <div
                className="pred34-progress-track"
                role="progressbar"
                aria-label="Assessment progress"
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={result ? 3 : 2}
              >
                <span
                  style={{
                    width: result ? '100%' : '66.67%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Before a prediction is submitted */}
        {!result && (
          <div className="row g-4 pred34-workspace">
            <div className="col-12 col-lg-8">
              <section
                className="pred34-panel"
                aria-labelledby="pred34-form-title"
              >
                <div className="pred34-panel-header">
                  <div>
                    <p className="pred34-kicker">
                      Final step
                    </p>

                    <h2 id="pred34-form-title">
                      Complete your information
                    </h2>

                    <p>
                      Enter the remaining details required
                      for this assessment.
                    </p>
                  </div>

                  {!isConfirmedUrgent && (
                    <span className="pred34-ready">
                      Ready
                    </span>
                  )}
                </div>

                <div className="pred34-confirmed">
                  <div className="pred34-confirmed-heading">
                    <strong>Confirmed symptoms</strong>
                    <span>
                      {confirmedCodes.length} selected
                    </span>
                  </div>

                  <div className="pred34-symptom-list">
                    {confirmedSymptoms.map((symptom) => (
                      <span
                        key={symptom.code}
                        className="pred34-symptom"
                      >
                        {symptom.display_name}
                      </span>
                    ))}
                  </div>
                </div>

                {isConfirmedUrgent && (
                  <div
                    className="pred34-warning"
                    role="alert"
                  >
                    <strong>
                      Safety-sensitive symptom confirmed
                    </strong>

                    <p>
                      Your confirmed symptoms require
                      urgent-review handling. This page
                      can request the backend's safety
                      response, but must not generate a
                      disease prediction for this case.
                      Seek prompt medical assessment.
                    </p>
                  </div>
                )}

                <form
                  className="pred34-form"
                  onSubmit={handleSubmit}
                >
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="pred34-field">
                        <label htmlFor="prediction-age">
                          Age
                        </label>

                        <input
                          id="prediction-age"
                          className="form-control"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="120"
                          value={age}
                          placeholder="e.g. 25"
                          onChange={(event) => {
                            setAge(event.target.value)
                            setError('')
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="pred34-field">
                        <label htmlFor="prediction-sex">
                          Sex
                        </label>

                        <select
                          id="prediction-sex"
                          className="form-select"
                          value={sex}
                          onChange={(event) => {
                            setSex(event.target.value)
                            setError('')
                          }}
                        >
                          <option value="">
                            Select
                          </option>

                          <option value="M">
                            Male
                          </option>

                          <option value="F">
                            Female
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pred34-input-note">
                    <strong>
                      Why are these required?
                    </strong>

                    <p>
                      Age and sex are part of the
                      assessment request. For normal cases,
                      the trained model uses them alongside
                      your confirmed symptom features.
                      Urgent cases receive safety guidance
                      instead of a disease prediction.
                    </p>
                  </div>

                  {error && (
                    <div
                      className="form-message error-message pred34-form-error"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <div className="pred34-actions">
                    <Link
                      to="/symptoms/confirm"
                      className="button button-secondary pred34-secondary"
                    >
                      Back to confirmation
                    </Link>

                    <button
                      type="submit"
                      className="button button-primary pred34-primary"
                      disabled={loading}
                    >
                      {loading
                        ? 'Generating result...'
                        : isConfirmedUrgent
                          ? 'Continue safety review'
                          : 'Generate awareness result'}

                      {!loading && (
                        <span aria-hidden="true">→</span>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <div className="col-12 col-lg-4">
              <aside className="pred34-aside">
                <p className="pred34-kicker">
                  Before you continue
                </p>

                <h2>What happens next?</h2>

                <div className="pred34-aside-step">
                  <span>01</span>
                  <div>
                    <strong>Submit your details</strong>
                    <p>
                      We use your confirmed symptoms
                      and the details you provide.
                    </p>
                  </div>
                </div>

                <div className="pred34-aside-step">
                  <span>02</span>
                  <div>
                    <strong>Review the result</strong>
                    <p>
                      Non-urgent cases receive one
                      condition pattern and a model
                      confidence score.
                    </p>
                  </div>
                </div>

                <div className="pred34-aside-step">
                  <span>03</span>
                  <div>
                    <strong>Read the guidance</strong>
                    <p>
                      Understand the limitations and
                      when to seek medical help.
                    </p>
                  </div>
                </div>

                <p className="pred34-aside-footnote">
                  A model result cannot confirm or rule out
                  any disease.
                </p>
              </aside>
            </div>
          </div>
        )}

        {/* Result returned by the backend */}
        {result && (
          <div className="pred34-results">
            {isUrgentResult ? (
              <section
                className="pred34-urgent-result"
                aria-labelledby="pred34-urgent-title"
                role="alert"
              >
                <p className="pred34-kicker">
                  Urgent review
                </p>

                <h2 id="pred34-urgent-title">
                  Seek prompt medical assessment.
                </h2>

                <p>
                  {result.health_guidance ||
                    'Your confirmed symptoms may need prompt medical attention. Please consult a qualified healthcare professional.'}
                </p>

                <p className="pred34-urgent-footnote">
                  No automated disease prediction is
                  displayed for this urgent-review case.
                </p>
              </section>
            ) : (
              <>
                <div className="pred34-result-intro">
                  <p className="pred34-kicker">
                    Analysis complete
                  </p>

                  <h2>Your health-awareness result</h2>

                  <p>
                    The result below describes the condition
                    pattern selected by the trained model.
                    It does not establish what illness you have.
                  </p>
                </div>

                <div className="row g-4">
                  <div className="col-12 col-lg-8">
                    <section
                      className="pred34-condition-panel"
                      aria-labelledby="pred34-condition-title"
                    >
                      {prediction ? (
                        <>
                          <div className="pred34-condition-top">
                            <div>
                              <p className="pred34-kicker">
                                Condition pattern
                              </p>

                              <h3 id="pred34-condition-title">
                                {prediction.display_name}
                              </h3>
                            </div>

                            {hasConfidence && (
                              <div className="pred34-confidence-value">
                                <strong>
                                  {rawConfidence}%
                                </strong>
                                <span>
                                  model confidence
                                </span>
                              </div>
                            )}
                          </div>

                          {prediction.description && (
                            <p className="pred34-condition-description">
                              {prediction.description}
                            </p>
                          )}

                          {hasConfidence && (
                            <div className="pred34-confidence-visual">
                              <div
                                className="pred34-confidence-track"
                                aria-hidden="true"
                              >
                                <span
                                  style={{
                                    width: `${confidenceWidth}%`,
                                  }}
                                />
                              </div>

                              <p>
                                A model score, not the
                                probability that you have
                                this condition.
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="pred34-no-condition">
                          <h3 id="pred34-condition-title">
                            No condition result was returned
                          </h3>
                          <p>
                            Please review the guidance
                            provided with this assessment.
                          </p>
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="col-12 col-lg-4">
                    <aside className="pred34-confidence-note">
                      <p className="pred34-kicker">
                        Reading your result
                      </p>

                      <h3>About model confidence</h3>

                      <p>
                        {result.confidence_explanation ||
                          'Model confidence describes the score assigned to a condition pattern. It is not a clinical diagnosis.'}
                      </p>

                      {result.score_note && (
                        <p>{result.score_note}</p>
                      )}
                    </aside>
                  </div>
                </div>

                {result.uncertain === true &&
                  result.uncertainty_message && (
                    <div
                      className="pred34-uncertainty"
                      role="status"
                    >
                      <strong>
                        Important information about this result
                      </strong>

                      <p>
                        {result.uncertainty_message}
                      </p>
                    </div>
                  )}

                {Array.isArray(
                  result.unsupported_model_features,
                ) &&
                  result.unsupported_model_features.length > 0 && (
                    <div
                      className="pred34-warning"
                      role="note"
                      aria-label="Unsupported symptom information"
                    >
                      <strong>
                        Some symptom details were not used
                      </strong>

                      <p>
                        {result.unsupported_model_features.length}{' '}
                        confirmed symptom detail(s) could
                        not be used by this prediction model.
                        They were excluded from the model
                        calculation. This does not mean those
                        symptoms are absent.
                      </p>
                    </div>
                  )}

                <section
                  className="pred34-guidance"
                  aria-labelledby="pred34-guidance-title"
                >
                  <p className="pred34-kicker">
                    Health guidance
                  </p>

                  <h3 id="pred34-guidance-title">
                    What to do next
                  </h3>

                  <p>{result.health_guidance}</p>
                </section>
              </>
            )}

            <section
              className="pred34-disclaimer"
              aria-label="Medical disclaimer"
            >
              <strong>Important</strong>

              <p>{result.disclaimer}</p>
            </section>

            <div className="pred34-feedback">
              <PredictionFeedback
                key={result.prediction_id}
                predictionId={result.prediction_id}
              />
            </div>

            <div className="pred34-reference">
              <span>Session reference</span>
              <code>{result.prediction_id}</code>
            </div>

            <div className="pred34-result-actions">
              <button
                type="button"
                className="button button-secondary pred34-secondary"
                onClick={handleStartAgain}
              >
                Review another result
              </button>

              <Link
                to="/dashboard"
                className="button button-primary pred34-primary"
              >
                Return to dashboard
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

        <div className="pred34-bottom-note">
          <div>
            <strong>
              Health-awareness information only
            </strong>

            <p>
              RespiraCare is not a substitute for
              assessment by a qualified healthcare
              professional.
            </p>
          </div>

          <Link to="/dashboard">
            Return to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PredictionPage
