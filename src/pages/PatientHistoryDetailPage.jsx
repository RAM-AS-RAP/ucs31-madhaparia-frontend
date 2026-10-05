import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getPatientHistoryItem,
} from '../services/history'

import PredictionFeedback from '../components/PredictionFeedback'

function formatDate(value) {
  if (!value) {
    return 'Unknown date'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function sexLabel(sex) {
  if (sex === 'M') {
    return 'Male'
  }

  if (sex === 'F') {
    return 'Female'
  }

  return sex
}

function PatientHistoryDetailPage() {
  const { predictionId } =
    useParams()

  const [session, setSession] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const data =
          await getPatientHistoryItem(
            predictionId,
          )

        if (active) {
          setSession(data)
        }
      } catch (requestError) {
        if (!active) {
          return
        }

        if (
          requestError.response?.status ===
          404
        ) {
          setError(
            'This prediction session could not be found.',
          )
        } else if (
          requestError.response?.status ===
          401
        ) {
          setError(
            'Your login session is no longer valid.',
          )
        } else {
          setError(
            requestError.response?.data?.detail ||
              requestError.message ||
              'RespiraCare could not load this prediction session.',
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [predictionId])

  if (loading) {
    return (
      <section className="history-page">
        <div className="container history-layout">
          <div className="history-state-card">
            <div className="auth-spinner" />

            <h2>
              Loading prediction details...
            </h2>
          </div>
        </div>
      </section>
    )
  }

  if (error || !session) {
    return (
      <section className="history-page">
        <div className="container history-layout">
          <div className="history-state-card history-error-card">
            <div>
              !
            </div>

            <h2>
              Prediction unavailable
            </h2>

            <p>
              {error}
            </p>

            <Link
              to="/history"
              className="button button-secondary"
            >
              Back to history
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const predictions =
    session.predictions || []

  return (
    <section className="history-page">
      <div className="container history-layout">
        <div className="history-detail-header">
          <div>
            <span className="symptom-eyebrow">
              Prediction history
            </span>

            <h1>
              Session details
            </h1>

            <p>
              {formatDate(
                session.created_at,
              )}
            </p>
          </div>

          <Link
            to="/history"
            className="button button-secondary"
          >
            Back to history
          </Link>
        </div>

        <section className="history-detail-card">
          <div className="history-detail-status">
            <div>
              <span>
                Status
              </span>

              <strong>
                {session.status ===
                'urgent_review'
                  ? 'Urgent review'
                  : 'Prediction complete'}
              </strong>
            </div>

            {session.has_red_flag && (
              <span className="history-status urgent">
                Safety-sensitive
              </span>
            )}
          </div>

          <div className="history-detail-description">
            <span>
              Original symptom description
            </span>

            <p>
              “{session.input_text}”
            </p>
          </div>

          <div className="history-detail-meta">
            <div>
              <span>
                Age
              </span>

              <strong>
                {session.age}
              </strong>
            </div>

            <div>
              <span>
                Sex
              </span>

              <strong>
                {sexLabel(
                  session.sex,
                )}
              </strong>
            </div>

            <div>
              <span>
                Date
              </span>

              <strong>
                {formatDate(
                  session.created_at,
                )}
              </strong>
            </div>
          </div>

          <div className="history-confirmed-codes">
            <span>
              Confirmed symptom codes
            </span>

            <div>
              {session.confirmed_codes?.map(
                (code) => (
                  <span
                    key={code}
                  >
                    {code}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {session.has_red_flag ? (
          <section className="history-urgent-detail">
            <div>
              !
            </div>

            <div>
              <span>
                Urgent-review session
              </span>

              <h2>
                A safety-sensitive symptom was
                confirmed.
              </h2>

              <p>
                This saved session did not generate
                ranked condition predictions because
                it followed RespiraCare's urgent-review
                route.
              </p>
            </div>
          </section>
        ) : (
          <section className="history-predictions-section">
            <div className="history-section-heading">
              <span>
                Saved result
              </span>

              <h2>
                Ranked condition patterns
              </h2>

              <p>
                These are the prediction results stored
                for this session.
              </p>
            </div>

            {predictions.length > 0 ? (
              <div className="history-prediction-list">
                {predictions.map(
                  (prediction) => (
                    <article
                      className="history-prediction-card"
                      key={
                        prediction.condition
                      }
                    >
                      <div className="history-prediction-rank">
                        <span>
                          Rank
                        </span>

                        <strong>
                          {
                            prediction.rank
                          }
                        </strong>
                      </div>

                      <div className="history-prediction-content">
                        <div>
                          <h3>
                            {
                              prediction.display_name
                            }
                          </h3>

                          <strong>
                            {
                              prediction.model_confidence_percent
                            }
                            %
                          </strong>
                        </div>

                        <p>
                          {
                            prediction.description
                          }
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <div className="history-state-card">
                <p>
                  No prediction rankings were stored
                  for this session.
                </p>
              </div>
            )}
          </section>
        )}

        <div className="history-reference-card">
          <span>
            Prediction session reference
          </span>

          <code>
            {session.prediction_id}
          </code>
        </div>

        <PredictionFeedback
          key={session.prediction_id}
          predictionId={session.prediction_id}
        />

        <div className="symptom-safety-footer">
          <strong>
            Important
          </strong>

          <p>
            Historical RespiraCare results are
            health-awareness information only and
            should not be interpreted as medical
            diagnoses.
          </p>

          <Link to="/dashboard">
            Dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PatientHistoryDetailPage