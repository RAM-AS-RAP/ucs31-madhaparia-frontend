import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import { getApiErrorMessage } from '../services/api'

import {
  getPatientHistory,
} from '../services/history'

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

function statusLabel(status) {
  if (status === 'prediction_complete') {
    return 'Prediction complete'
  }

  if (status === 'urgent_review') {
    return 'Urgent review'
  }

  return status
}

function PatientHistoryPage() {
  const [history, setHistory] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const data =
          await getPatientHistory()

        if (!active) {
          return
        }

        setHistory(
          data.history || [],
        )
      } catch (requestError) {
        if (!active) {
          return
        }

        if (
          requestError.response?.status ===
          401
        ) {
          setError(
            'Your login session is no longer valid. Please log in again.',
          )
        } else {
          setError(
            getApiErrorMessage(
              requestError,
              'RespiraCare could not load your prediction history.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      active = false
    }
  }, [])

  return (
    <section className="history-page">
      <div className="container history-layout">
        <div className="history-heading">
          <span className="symptom-eyebrow">
            Patient history
          </span>

          <h1>
            Your previous
            <span> RespiraCare sessions.</span>
          </h1>

          <p>
            Review your previous respiratory
            health-awareness sessions and open any
            result for more detail.
          </p>
        </div>

        {loading && (
          <div className="history-state-card">
            <div className="auth-spinner" />

            <h2>
              Loading your history...
            </h2>

            <p>
              RespiraCare is retrieving your saved
              prediction sessions.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="history-state-card history-error-card">
            <div>
              !
            </div>

            <h2>
              History could not be loaded
            </h2>

            <p>
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          history.length === 0 && (
            <div className="history-state-card">
              <div>
                0
              </div>

              <h2>
                No prediction history yet
              </h2>

              <p>
                Once you complete a RespiraCare
                prediction, the session will appear
                here.
              </p>

              <Link
                to="/symptoms"
                className="button button-primary"
              >
                Check symptoms
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          history.length > 0 && (
            <>
              <div className="history-summary">
                <div>
                  <span>
                    Saved sessions
                  </span>

                  <strong>
                    {history.length}
                  </strong>
                </div>

                <p>
                  Your most recent sessions appear
                  first.
                </p>
              </div>

              <div className="history-list">
                {history.map(
                  (item) => {
                    const topPrediction =
                      item.predictions?.[0]

                    return (
                      <article
                        className={
                          item.has_red_flag
                            ? 'history-card history-card-warning'
                            : 'history-card'
                        }
                        key={
                          item.prediction_id
                        }
                      >
                        <div className="history-card-top">
                          <div>
                            <span className="history-date">
                              {formatDate(
                                item.created_at,
                              )}
                            </span>

                            <h2>
                              {item.has_red_flag
                                ? 'Urgent-review session'
                                : topPrediction?.display_name ||
                                  'Prediction session'}
                            </h2>
                          </div>

                          <span
                            className={
                              item.status ===
                              'urgent_review'
                                ? 'history-status urgent'
                                : 'history-status complete'
                            }
                          >
                            {statusLabel(
                              item.status,
                            )}
                          </span>
                        </div>

                        <div className="history-input-text">
                          <span>
                            Symptom description
                          </span>

                          <p>
                            “{item.input_text}”
                          </p>
                        </div>

                        <div className="history-meta">
                          <div>
                            <span>
                              Age
                            </span>

                            <strong>
                              {item.age}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Sex
                            </span>

                            <strong>
                              {sexLabel(
                                item.sex,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Confirmed symptoms
                            </span>

                            <strong>
                              {
                                item
                                  .confirmed_codes
                                  ?.length || 0
                              }
                            </strong>
                          </div>
                        </div>

                        {topPrediction &&
                          !item.has_red_flag && (
                            <div className="history-top-result">
                              <span>
                                Top pattern
                              </span>

                              <div>
                                <strong>
                                  {
                                    topPrediction.display_name
                                  }
                                </strong>

                                <span>
                                  {
                                    topPrediction.model_confidence_percent
                                  }
                                  % model confidence
                                </span>
                              </div>
                            </div>
                          )}

                        {item.has_red_flag && (
                          <div className="history-red-flag-note">
                            <strong>
                              Safety-sensitive session
                            </strong>

                            <p>
                              This session was routed
                              through urgent-review
                              handling instead of normal
                              condition prediction.
                            </p>
                          </div>
                        )}

                        <div className="history-card-footer">
                          <code>
                            {item.prediction_id}
                          </code>

                          <Link
                            to={`/history/${item.prediction_id}`}
                            className="button button-secondary"
                          >
                            View details
                          </Link>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            </>
          )}

        <div className="symptom-safety-footer">
          <strong>
            Important
          </strong>

          <p>
            RespiraCare prediction history contains
            health-awareness results and does not
            represent a medical diagnosis.
          </p>

          <Link to="/dashboard">
            Return to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PatientHistoryPage