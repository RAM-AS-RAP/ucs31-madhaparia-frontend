import { useState } from 'react'
import {
  Link,
  Navigate,
} from 'react-router-dom'

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

function confidenceClass(index) {
  if (index === 0) {
    return 'prediction-primary'
  }

  return 'prediction-secondary'
}

function PredictionPage() {
  const mapping =
    getSavedSymptomMapping()

  const confirmation =
    getSavedSymptomConfirmation()

  const [age, setAge] =
    useState('')

  const [sex, setSex] =
    useState('')

  // Only reuse a saved result when it was made
  // from the same symptom text and confirmed
  // codes. Otherwise a result from an earlier
  // set of symptoms could be shown again.
  const [result, setResult] =
    useState(() => {
      const saved =
        getSavedPredictionResult()

      return isPredictionForConfirmation(
        saved,
        mapping?.input_text,
        confirmation?.confirmed_codes,
      )
        ? saved
        : null
    })

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  if (!mapping || !confirmation) {
    return (
      <Navigate
        to="/symptoms"
        replace
      />
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const numericAge =
      Number(age)

    if (
      !age ||
      !Number.isInteger(numericAge) ||
      numericAge < 0 ||
      numericAge > 120
    ) {
      setError(
        'Please enter a valid age between 0 and 120.',
      )

      return
    }

    if (
      sex !== 'M' &&
      sex !== 'F'
    ) {
      setError(
        'Please select your sex before continuing.',
      )

      return
    }

    if (
      !confirmation.confirmed_codes ||
      confirmation.confirmed_codes.length === 0
    ) {
      setError(
        'No confirmed symptoms are available for prediction.',
      )

      return
    }

    setLoading(true)

    try {
      clearPredictionResult()

      const prediction =
        await createPrediction({
          age: numericAge,
          sex,
          text: mapping.input_text,
          confirmedCodes:
            confirmation.confirmed_codes,
        })

      setResult(prediction)

      savePredictionResult(
        prediction,
        mapping.input_text,
      )
    } catch (requestError) {
      if (
        requestError.response?.status === 401
      ) {
        setError(
          'Your login session is no longer valid. Please log in again.',
        )
      } else if (
          requestError.response?.status === 422
        ) {
          setError(
            getApiErrorMessage(
              requestError,
              'Please check your details and confirmed symptoms before trying again.',
            ),
          )
        }else {
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

  const predictions =
    (result?.predictions || []).slice(0, 1)

  return (
    <section className="prediction-page">
      <div className="container prediction-layout">
        <div className="prediction-heading">
          <span className="symptom-eyebrow">
            Health awareness
          </span>

          <h1>
            Understand your
            <span> symptom pattern.</span>
          </h1>

          <p>
            RespiraCare compares your confirmed
            symptom pattern with patterns learned
            by the trained model. The results are
            for health awareness and are not a
            medical diagnosis.
          </p>
        </div>

        {!result && (
          <div className="prediction-form-card">
            <div className="prediction-form-header">
              <div>
                <span>
                  Step 3 of 3
                </span>

                <h2>
                  Complete your information
                </h2>

                <p>
                  Age and sex are required model
                  inputs before the prediction can
                  be generated.
                </p>
              </div>

              <div className="prediction-ready-badge">
                Ready
              </div>
            </div>

            <div className="prediction-confirmed-summary">
              <span>
                Confirmed symptom
                {confirmation.confirmed_codes.length === 1
                  ? ''
                  : 's'}
              </span>

              <div>
                {confirmation.confirmed_symptoms.map(
                  (symptom) => (
                    <span
                      key={symptom.code}
                      className="prediction-symptom-chip"
                    >
                      {symptom.display_name}
                    </span>
                  ),
                )}
              </div>
            </div>

            {confirmation.safety_status ===
              'urgent_review' && (
              <div className="prediction-warning">
                <div>
                  !
                </div>

                <div>
                  <strong>
                    Safety-sensitive symptom confirmed
                  </strong>

                  <p>
                    RespiraCare will send this case
                    through the backend urgent-review
                    route rather than generate condition
                    predictions.
                  </p>
                </div>
              </div>
            )}

            <form
              className="prediction-form"
              onSubmit={handleSubmit}
            >
              <div className="prediction-fields">
                <div className="prediction-field">
                  <label htmlFor="prediction-age">
                    Age
                  </label>

                  <input
                    id="prediction-age"
                    type="number"
                    min="0"
                    max="120"
                    value={age}
                    onChange={(event) => {
                      setAge(
                        event.target.value,
                      )

                      setError('')
                    }}
                    placeholder="e.g. 25"
                  />
                </div>

                <div className="prediction-field">
                  <label htmlFor="prediction-sex">
                    Sex
                  </label>

                  <select
                    id="prediction-sex"
                    value={sex}
                    onChange={(event) => {
                      setSex(
                        event.target.value,
                      )

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

              <div className="prediction-input-note">
                <strong>
                  Why are these required?
                </strong>

                <p>
                  The trained model uses age and sex
                  together with your confirmed symptom
                  features when comparing health
                  patterns.
                </p>
              </div>

              {error && (
                <div
                  className="form-message error-message"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="prediction-actions">
                <Link
                  to="/symptoms/confirm"
                  className="button button-secondary"
                >
                  Back to confirmation
                </Link>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={loading}
                >
                  {loading
                    ? 'Generating result...'
                    : confirmation.safety_status ===
                        'urgent_review'
                      ? 'Continue safety review'
                      : 'Generate awareness result'}
                </button>
              </div>
            </form>
          </div>
        )}

        {result && (
          <div className="prediction-result">
            {result.status ===
            'urgent_review' ? (
              <section className="prediction-urgent-result">
                <div className="prediction-urgent-icon">
                  !
                </div>

                <div>
                  <span>
                    Urgent review
                  </span>

                  <h2>
                    Seek prompt medical assessment.
                  </h2>

                  <p>
                    {result.health_guidance}
                  </p>
                </div>
              </section>
            ) : (
              <>
                <section className="prediction-result-intro">
                  <div>
                    <span>
                      Analysis complete
                    </span>

                    <h2>
                      Your health-awareness result
                    </h2>

                    <p>
                      This result shows how strongly
                      your submitted symptom pattern
                      matched a pattern in the trained
                      model.
                    </p>
                  </div>
                </section>

                <div className="prediction-confidence-note">
                  <strong>
                    About model confidence
                  </strong>

                  <p>
                    {result.confidence_explanation}
                  </p>
                </div>

                <div className="prediction-list">
                  {predictions.map(
                    (
                      prediction,
                      index,
                    ) => (
                      <article
                        key={
                          prediction.condition
                        }
                        className={`prediction-card ${confidenceClass(
                          index,
                        )}`}
                      >
                        <div className="prediction-card-content">
                          <div className="prediction-card-heading">
                            <div>
                              <span>
                                Condition pattern
                              </span>

                              <h3>
                                {
                                  prediction.display_name
                                }
                              </h3>
                            </div>

                            <div className="prediction-confidence">
                              <strong>
                                {
                                  prediction.model_confidence_percent
                                }
                                %
                              </strong>

                              <span>
                                model confidence
                              </span>
                            </div>
                          </div>

                          <p>
                            {
                              prediction.description
                            }
                          </p>

                          <div className="prediction-confidence-track">
                            <div
                              className="prediction-confidence-fill"
                              style={{
                                width: `${Math.min(
                                  prediction.model_confidence_percent,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </div>

                <section className="prediction-guidance-card">
                  <span>
                    Health guidance
                  </span>

                  <h3>
                    What to do next
                  </h3>

                  <p>
                    {result.health_guidance}
                  </p>
                </section>
              </>
            )}

            <section className="prediction-disclaimer">
              <strong>
                Important
              </strong>

              <p>
                {result.disclaimer}
              </p>
            </section>

            <PredictionFeedback
              key={result.prediction_id}
              predictionId={result.prediction_id}
            />

            <div className="prediction-reference">
              <span>
                Session reference
              </span>

              <code>
                {result.prediction_id}
              </code>
            </div>

            <div className="prediction-result-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={handleStartAgain}
              >
                Review another result
              </button>

              <Link
                to="/dashboard"
                className="button button-primary"
              >
                Return to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default PredictionPage