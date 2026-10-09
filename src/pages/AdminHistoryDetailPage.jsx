import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useParams,
} from 'react-router-dom'

import {
  getAdminHistoryItem,
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

function AdminHistoryDetailPage() {
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
          await getAdminHistoryItem(
            predictionId,
          )

        if (active) {
          setSession(data)
        }
      } catch (requestError) {
        if (!active) {
          return
        }

        const status =
          requestError.response?.status

        // 422 means the id in the address is
        // not a valid session id.
        if (
          status === 404 ||
          status === 422
        ) {
          setError(
            'This prediction session could not be found.',
          )
        } else if (status === 403) {
          setError(
            'Administrator access is required.',
          )
        } else if (status === 401) {
          setError(
            'Your login session is no longer valid.',
          )
        } else {
          setError(
            getApiErrorMessage(
              requestError,
              'RespiraCare could not load this prediction session.',
            ),
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
      <section className="admin-page">
        <div className="container admin-layout">
          <div className="admin-state-card">
            <div className="auth-spinner" />

            <h2>
              Loading prediction session...
            </h2>
          </div>
        </div>
      </section>
    )
  }

  if (error || !session) {
    return (
      <section className="admin-page">
        <div className="container admin-layout">
          <div
            className="admin-state-card admin-state-error"
            role="alert"
          >
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
              to="/admin"
              className="button button-secondary"
            >
              Back to admin
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const predictions =
    session.predictions || []

  return (
    <section className="admin-page">
      <div className="container admin-layout">
        <header className="admin-detail-heading">
          <div>
            <span>
              Administrator history
            </span>

            <h1>
              Prediction session
            </h1>

            <p>
              {formatDate(
                session.created_at,
              )}
            </p>
          </div>

          <Link
            to="/admin"
            className="button button-secondary"
          >
            Back to admin
          </Link>
        </header>

        <section className="admin-detail-card">
          <div className="admin-detail-status">
            <div>
              <span>
                Status
              </span>

              <strong>
                {session.has_red_flag
                  ? 'Urgent review'
                  : 'Prediction complete'}
              </strong>
            </div>

            <span
              className={
                session.has_red_flag
                  ? 'admin-status urgent'
                  : 'admin-status normal'
              }
            >
              {session.has_red_flag
                ? 'Safety-sensitive'
                : 'Normal prediction'}
            </span>
          </div>

          <div className="admin-owner-card">
            <span>
              Patient user ID
            </span>

            <code>
              {session.user_id ||
                'Legacy / unassigned session'}
            </code>
          </div>

          <div className="admin-detail-description">
            <span>
              Original symptom description
            </span>

            <p>
              “{session.input_text}”
            </p>
          </div>

          <div className="admin-detail-meta">
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
                Created
              </span>

              <strong>
                {formatDate(
                  session.created_at,
                )}
              </strong>
            </div>
          </div>

          <div className="admin-confirmed-codes">
            <span>
              Confirmed symptom codes
            </span>

            <div>
              {session.confirmed_codes?.map(
                (code) => (
                  <span key={code}>
                    {code}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {session.has_red_flag ? (
          <section className="admin-urgent-card">
            <div>
              !
            </div>

            <div>
              <span>
                Urgent-review session
              </span>

              <h2>
                Safety-sensitive symptom confirmed
              </h2>

              <p>
                This session followed the urgent-review
                route and therefore contains no ranked
                condition predictions.
              </p>
            </div>
          </section>
        ) : (
          <section className="admin-prediction-panel">
            <div className="admin-panel-heading">
              <div>
                <span>
                  Stored prediction
                </span>

                <h2>
                  Ranked condition patterns
                </h2>

                <p>
                  These prediction results were
                  stored with this patient session.
                </p>
              </div>
            </div>

            {predictions.length > 0 ? (
              <div className="admin-prediction-list">
                {predictions.map(
                  (prediction) => (
                    <article
                      className="admin-prediction-card"
                      key={
                        prediction.condition
                      }
                    >
                      <div className="admin-rank">
                        <span>
                          Rank
                        </span>

                        <strong>
                          {
                            prediction.rank
                          }
                        </strong>
                      </div>

                      <div className="admin-prediction-content">
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
              <div className="admin-empty-state">
                <p>
                  No ranked predictions were stored
                  for this session.
                </p>
              </div>
            )}
          </section>
        )}

        <div className="admin-session-reference">
          <span>
            Prediction session reference
          </span>

          <code>
            {session.prediction_id}
          </code>
        </div>
      </div>
    </section>
  )
}

export default AdminHistoryDetailPage