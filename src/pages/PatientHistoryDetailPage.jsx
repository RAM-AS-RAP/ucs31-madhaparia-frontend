
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '../services/api'
import { getPatientHistoryItem } from '../services/history'
import PredictionFeedback from '../components/PredictionFeedback'
import { useLanguage } from '../context/useLanguage'
import { useHistoryText } from '../i18n/historyTranslations'

function formatDate(value, language, t) {
  if (!value) return t('dateUnavailable')

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString(
        language === 'sw' ? 'sw-KE' : undefined
      )
}

function sexLabel(value, t) {
  if (value === 'M') return t('male')
  if (value === 'F') return t('female')

  return value || t('notRecorded')
}

function readableCode(code) {
  return String(code).replaceAll('_', ' ')
}

function PatientHistoryDetailPage() {
  const { predictionId } = useParams()
  const { language } = useLanguage()
  const t = useHistoryText()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const data = await getPatientHistoryItem(predictionId)

        if (active) {
          setSession(data)
        }
      } catch (requestError) {
        if (!active) return

        const status = requestError.response?.status

        if (status === 404 || status === 422) {
          setError({ kind: 'not-found' })
        } else if (status === 401) {
          setError({ kind: 'session' })
        } else {
          setError({
            kind: 'api',
            message: getApiErrorMessage(requestError, ''),
          })
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

  const errorMessage =
    error?.kind === 'not-found'
      ? t('notFound')
      : error?.kind === 'session'
        ? t('sessionInvalid')
        : error?.message || t('detailsError')

  // Loading or unavailable session
  if (loading || error || !session) {
    return (
      <section
        className="hist35-page"
        aria-label={t('detailsAria')}
      >
        <div className="rc-container hist35-container">
          <div
            className={`hist35-state${
              error ? ' hist35-state-error' : ''
            }`}
            role={error ? 'alert' : 'status'}
          >
            {loading ? (
              <>
                <div
                  className="auth-spinner"
                  aria-hidden="true"
                />

                <h2>{t('loadingDetails')}</h2>
                <p>{t('retrievingDetails')}</p>
              </>
            ) : (
              <>
                <h2>{t('unavailable')}</h2>

                <p>{errorMessage}</p>

                <Link
                  to="/history"
                  className="button button-secondary hist35-button"
                >
                  {t('backHistory')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    )
  }

  const urgent =
    session.status === 'urgent_review' ||
    session.has_red_flag === true

  // Older sessions may have multiple predictions.
  // Display only the first saved condition.
  const prediction =
    !urgent && Array.isArray(session.predictions)
      ? session.predictions[0] || null
      : null

  const rawConfidence =
    prediction?.model_confidence_percent

  const hasConfidence =
    rawConfidence != null &&
    Number.isFinite(Number(rawConfidence))

  const confidenceWidth = hasConfidence
    ? Math.max(0, Math.min(100, Number(rawConfidence)))
    : 0

  const confirmedCodes =
    Array.isArray(session.confirmed_codes)
      ? session.confirmed_codes
      : []

  const status =
    urgent
      ? t('urgentReview')
      : session.status === 'prediction_complete'
        ? t('predictionComplete')
        : session.status?.replaceAll('_', ' ') ||
          t('statusUnavailable')

  return (
    <section
      className="hist35-page"
      aria-labelledby="hist35-detail-title"
    >
      <div className="rc-container hist35-container">

        {/* Session heading */}
        <div className="hist35-detail-heading">
          <div>
            <Link
              className="hist35-breadcrumb"
              to="/history"
            >
              <span aria-hidden="true">←</span>
              {' '}
              {t('backHistory')}
            </Link>

            <p className="hist35-eyebrow">
              {t('savedAssessment')}
            </p>

            <h1 id="hist35-detail-title">
              {t('sessionDetails')}
            </h1>

            <p className="hist35-lead">
              {formatDate(
                session.created_at,
                language,
                t
              )}
            </p>
          </div>

          <span
            className={`hist35-status${
              urgent ? ' is-urgent' : ''
            }`}
          >
            {status}
          </span>
        </div>

        {/* Original assessment information */}
        <section
          className="hist35-info-card"
          aria-labelledby="hist35-info-title"
        >
          <div className="hist35-section-title">
            <p className="hist35-kicker">
              {t('originalAssessment')}
            </p>

            <h2 id="hist35-info-title">
              {t('whatSubmitted')}
            </h2>
          </div>

          <div className="hist35-quote">
            <strong>
              {t('originalDescription')}
            </strong>

            <p>
              “{session.input_text ||
                t('noDescription')}”
            </p>
          </div>

          <div className="hist35-detail-meta">
            <div>
              <span>{t('age')}</span>
              <strong>
                {session.age ?? '—'}
              </strong>
            </div>

            <div>
              <span>{t('sex')}</span>
              <strong>
                {sexLabel(session.sex, t)}
              </strong>
            </div>

            <div>
              <span>{t('date')}</span>
              <strong>
                {formatDate(
                  session.created_at,
                  language,
                  t
                )}
              </strong>
            </div>
          </div>

          {/* Confirmed codes */}
          <div className="hist35-confirmed-codes">
            <div className="hist35-confirmed-heading">
              <strong>
                {t('confirmedCodes')}
              </strong>

              <span>
                {t('recorded', {
                  count: confirmedCodes.length,
                })}
              </span>
            </div>

            {confirmedCodes.length > 0 ? (
              <div className="hist35-code-list">
                {confirmedCodes.map((code) => (
                  <span
                    key={code}
                    title={code}
                  >
                    {readableCode(code)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="hist35-muted">
                {t('noCodes')}
              </p>
            )}
          </div>
        </section>

        {/* Urgent-review pathway */}
        {urgent ? (
          <section
            className="hist35-urgent-detail"
            role="alert"
          >
            <p className="hist35-kicker">
              {t('urgentSessionLabel')}
            </p>

            <h2>{t('urgentTitle')}</h2>

            <p>{t('urgentExplanation')}</p>

            {session.health_guidance && (
              <p>{session.health_guidance}</p>
            )}

            <p>{t('urgentAdvice')}</p>
          </section>
        ) : (
          <section
            className="hist35-result-section"
            aria-labelledby="hist35-result-title"
          >
            <div className="hist35-section-title">
              <p className="hist35-kicker">
                {t('savedResult')}
              </p>

              <h2 id="hist35-result-title">
                {t('savedCondition')}
              </h2>

              <p>{t('resultNote')}</p>
            </div>

            {/* Single saved prediction */}
            {prediction ? (
              <div className="hist35-condition">
                <div className="hist35-condition-header">
                  <div>
                    <p className="hist35-kicker">
                      {t('conditionPattern')}
                    </p>

                    <h3>
                      {prediction.display_name}
                    </h3>
                  </div>

                  {hasConfidence && (
                    <div className="hist35-confidence-value">
                      <strong>
                        {rawConfidence}%
                      </strong>

                      <span>
                        {t('confidence')}
                      </span>
                    </div>
                  )}
                </div>

                {prediction.description && (
                  <p className="hist35-condition-description">
                    {prediction.description}
                  </p>
                )}

                {hasConfidence && (
                  <div className="hist35-confidence-visual">
                    <div
                      className="hist35-confidence-track"
                      aria-hidden="true"
                    >
                      <span
                        style={{
                          width: `${confidenceWidth}%`,
                        }}
                      />
                    </div>

                    <p>
                      {t('confidenceWarning')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="hist35-no-result">
                <p>
                  {t('noStoredPrediction')}
                </p>
              </div>
            )}

            {/* Model confidence explanation */}
            {(session.confidence_explanation ||
              session.score_note) && (
              <div className="hist35-explanation">
                <h3>
                  {t('aboutConfidence')}
                </h3>

                {session.confidence_explanation && (
                  <p>
                    {session.confidence_explanation}
                  </p>
                )}

                {session.score_note && (
                  <p>
                    {session.score_note}
                  </p>
                )}
              </div>
            )}

            {/* Model uncertainty */}
            {session.uncertain === true &&
              session.uncertainty_message && (
                <div
                  className="hist35-uncertainty"
                  role="status"
                >
                  <strong>
                    {t('uncertaintyTitle')}
                  </strong>

                  <p>
                    {session.uncertainty_message}
                  </p>
                </div>
              )}

            {/* Unsupported model features */}
            {Array.isArray(
              session.unsupported_model_features
            ) &&
              session.unsupported_model_features.length > 0 && (
                <div
                  className="hist35-uncertainty"
                  role="note"
                  aria-label={t('unsupportedLabel')}
                >
                  <strong>
                    {t('unsupportedTitle')}
                  </strong>

                  <p>
                    {t('unsupportedDescription', {
                      count:
                        session.unsupported_model_features.length,
                    })}
                  </p>
                </div>
              )}

            {/* Saved health guidance */}
            {session.health_guidance && (
              <div className="hist35-guidance">
                <p className="hist35-kicker">
                  {t('healthGuidance')}
                </p>

                <h3>{t('nextSteps')}</h3>

                <p>
                  {session.health_guidance}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Session reference */}
        <div className="hist35-reference-detail">
          <span>
            {t('sessionReference')}
          </span>

          <code>
            {session.prediction_id}
          </code>
        </div>

        {/* Existing patient feedback */}
        <div className="hist35-feedback">
          <PredictionFeedback
            key={session.prediction_id}
            predictionId={session.prediction_id}
          />
        </div>

        {/* Medical disclaimer */}
        <div className="hist35-bottom-note">
          <div>
            <strong>
              {t('importantDisclaimer')}
            </strong>

            <p>
              {session.disclaimer ||
                t('historicalDisclaimer')}
            </p>
          </div>

          <Link to="/dashboard">
            {t('returnDashboard')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PatientHistoryDetailPage
