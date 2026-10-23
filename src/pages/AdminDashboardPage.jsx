import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  getAdminFeedback,
  getAdminHistory,
} from '../services/admin'

import { getApiErrorMessage } from '../services/api'

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

  return sex || 'Unknown'
}

function AdminDashboardPage() {
  const [history, setHistory] =
    useState([])

  const [feedback, setFeedback] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [activeView, setActiveView] =
    useState('history')

  useEffect(() => {
    let active = true

    async function loadAdminData() {
      try {
        const [
          historyResponse,
          feedbackResponse,
        ] = await Promise.all([
          getAdminHistory(),
          getAdminFeedback(),
        ])

        if (!active) {
          return
        }

        setHistory(
          historyResponse.history || [],
        )

        setFeedback(
          feedbackResponse.feedback || [],
        )
      } catch (requestError) {
        if (!active) {
          return
        }

        if (
          requestError.response?.status ===
          403
        ) {
          setError(
            'Administrator access is required to view this information.',
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
            getApiErrorMessage(
              requestError,
              'RespiraCare could not load the administrator dashboard.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadAdminData()

    return () => {
      active = false
    }
  }, [])

  const statistics =
    useMemo(() => {
      const urgentCount =
        history.filter(
          (item) =>
            item.has_red_flag ||
            item.status ===
              'urgent_review',
        ).length

      const normalCount =
        history.length - urgentCount

      const helpfulCount =
        feedback.filter(
          (item) =>
            item.was_helpful === true,
        ).length

      const notHelpfulCount =
        feedback.filter(
          (item) =>
            item.was_helpful === false,
        ).length

      const helpfulPercent =
        feedback.length > 0
          ? Math.round(
              (helpfulCount /
                feedback.length) *
                100,
            )
          : 0

      return {
        urgentCount,
        normalCount,
        helpfulCount,
        notHelpfulCount,
        helpfulPercent,
      }
    }, [history, feedback])

  function ownerForPrediction(
    predictionId,
  ) {
    return history.find(
      (item) =>
        item.prediction_id ===
        predictionId,
    )
  }

  if (loading) {
    return (
      <section className="admin-page">
        <div className="rc-container admin-layout">
          <div className="admin-state-card">
            <div className="auth-spinner" />

            <h2>
              Loading administrator dashboard...
            </h2>

            <p>
              RespiraCare is retrieving prediction
              and feedback records.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-page">
        <div className="rc-container admin-layout">
          <div
            className="admin-state-card admin-state-error"
            role="alert"
          >
            <div>
              !
            </div>

            <h2>
              Administrator data unavailable
            </h2>

            <p>
              {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="rc-container admin-layout">
        <header className="admin-heading">
          <span>
            RespiraCare administration
          </span>

          <h1>
            System activity
            <strong> overview.</strong>
          </h1>

          <p>
            Review prediction sessions and patient
            feedback across the RespiraCare system.
          </p>
        </header>

        <div className="admin-stat-grid">
          <article className="admin-stat-card">
            <span>
              Prediction sessions
            </span>

            <strong>
              {history.length}
            </strong>

            <p>
              Sessions currently returned by the
              administrator history endpoint.
            </p>
          </article>

          <article className="admin-stat-card">
            <span>
              Normal results
            </span>

            <strong>
              {statistics.normalCount}
            </strong>

            <p>
              Sessions that completed the normal
              prediction route.
            </p>
          </article>

          <article className="admin-stat-card admin-stat-warning">
            <span>
              Urgent review
            </span>

            <strong>
              {statistics.urgentCount}
            </strong>

            <p>
              Sessions containing confirmed
              safety-sensitive symptoms.
            </p>
          </article>

          <article className="admin-stat-card">
            <span>
              Feedback responses
            </span>

            <strong>
              {feedback.length}
            </strong>

            <p>
              {feedback.length > 0
                ? `${statistics.helpfulPercent}% marked helpful`
                : 'No feedback has been submitted yet.'}
            </p>
          </article>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            aria-pressed={activeView === 'history'}
            className={
              activeView === 'history'
                ? 'admin-tab active'
                : 'admin-tab'
            }
            onClick={() =>
              setActiveView('history')
            }
          >
            Prediction history
            <span>
              {history.length}
            </span>
          </button>

          <button
            type="button"
            aria-pressed={activeView === 'feedback'}
            className={
              activeView === 'feedback'
                ? 'admin-tab active'
                : 'admin-tab'
            }
            onClick={() =>
              setActiveView('feedback')
            }
          >
            Feedback
            <span>
              {feedback.length}
            </span>
          </button>
        </div>

        {activeView === 'history' && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span>
                  All prediction sessions
                </span>

                <h2>
                  Prediction history
                </h2>

                <p>
                  Administrators can review
                  prediction sessions created across
                  patient accounts.
                </p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="admin-empty-state">
                <strong>
                  No prediction sessions
                </strong>

                <p>
                  Prediction sessions will appear
                  here when patients use RespiraCare.
                </p>
              </div>
            ) : (
              <div className="admin-history-list">
                {history.map(
                  (item) => {
                    const topPrediction =
                      item.predictions?.[0]

                    return (
                      <article
                        key={
                          item.prediction_id
                        }
                        className={
                          item.has_red_flag
                            ? 'admin-history-card admin-history-warning'
                            : 'admin-history-card'
                        }
                      >
                        <div className="admin-history-top">
                          <div>
                            <span>
                              {formatDate(
                                item.created_at,
                              )}
                            </span>

                            <h3>
                              {item.has_red_flag
                                ? 'Urgent-review session'
                                : topPrediction?.display_name ||
                                  'Prediction session'}
                            </h3>
                          </div>

                          <span
                            className={
                              item.has_red_flag
                                ? 'admin-status urgent'
                                : 'admin-status normal'
                            }
                          >
                            {item.has_red_flag
                              ? 'Urgent review'
                              : 'Prediction complete'}
                          </span>
                        </div>

                        <div className="admin-session-owner">
                          <span>
                            User ID
                          </span>

                          <code>
                            {item.user_id ||
                              'Legacy / unassigned session'}
                          </code>
                        </div>

                        <div className="admin-history-text">
                          <span>
                            Symptom description
                          </span>

                          <p>
                            “{item.input_text}”
                          </p>
                        </div>

                        <div className="admin-history-meta">
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

                          <div>
                            <span>
                              Results
                            </span>

                            <strong>
                              {
                                item
                                  .predictions
                                  ?.length || 0
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="admin-history-footer">
                          <code>
                            {item.prediction_id}
                          </code>

                          <Link
                            to={`/admin/history/${item.prediction_id}`}
                            className="button button-secondary"
                          >
                            View session
                          </Link>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            )}
          </section>
        )}

        {activeView === 'feedback' && (
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span>
                  Patient responses
                </span>

                <h2>
                  Prediction feedback
                </h2>

                <p>
                  Review whether patients found
                  RespiraCare results helpful and
                  read optional comments.
                </p>
              </div>

              <div className="admin-feedback-summary">
                <span>
                  Helpful
                </span>

                <strong>
                  {statistics.helpfulCount}
                </strong>

                <span>
                  Not helpful
                </span>

                <strong>
                  {statistics.notHelpfulCount}
                </strong>
              </div>
            </div>

            {feedback.length === 0 ? (
              <div className="admin-empty-state">
                <strong>
                  No feedback yet
                </strong>

                <p>
                  Patient feedback will appear here
                  after a response is submitted.
                </p>
              </div>
            ) : (
              <div className="admin-feedback-list">
                {feedback.map(
                  (item) => {
                    const relatedSession =
                      ownerForPrediction(
                        item.prediction_id,
                      )

                    return (
                      <article
                        className="admin-feedback-card"
                        key={
                          item.feedback_id
                        }
                      >
                        <div className="admin-feedback-top">
                          <div>
                            <span>
                              {formatDate(
                                item.created_at,
                              )}
                            </span>

                            <h3>
                              Patient feedback
                            </h3>
                          </div>

                          <span
                            className={
                              item.was_helpful
                                ? 'admin-feedback-result helpful'
                                : 'admin-feedback-result not-helpful'
                            }
                          >
                            {item.was_helpful
                              ? 'Helpful'
                              : 'Not helpful'}
                          </span>
                        </div>

                        <div className="admin-feedback-reference">
                          <div>
                            <span>
                              Prediction
                            </span>

                            <code>
                              {
                                item.prediction_id
                              }
                            </code>
                          </div>

                          <div>
                            <span>
                              User
                            </span>

                            <code>
                              {relatedSession?.user_id ||
                                'Unavailable'}
                            </code>
                          </div>
                        </div>

                        <div className="admin-feedback-comment">
                          <span>
                            Comment
                          </span>

                          <p>
                            {item.comment ||
                              'No additional comment was provided.'}
                          </p>
                        </div>

                        <div className="admin-feedback-footer">
                          <code>
                            Feedback ID: {
                              item.feedback_id
                            }
                          </code>

                          <Link
                            to={`/admin/history/${item.prediction_id}`}
                          >
                            Open prediction
                          </Link>
                        </div>
                      </article>
                    )
                  },
                )}
              </div>
            )}
          </section>
        )}

        <div className="admin-disclaimer">
          <strong>
            Administrator access
          </strong>

          <p>
            This dashboard contains system-level
            prediction and feedback records and is
            restricted to authenticated
            administrators.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboardPage