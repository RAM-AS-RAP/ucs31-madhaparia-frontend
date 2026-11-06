
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getAdminHistoryItem } from '../services/admin'
import { getApiErrorMessage } from '../services/api'
import { useLanguage } from '../context/useLanguage'
import { useAdminText } from '../i18n/adminTranslations'
import CandidateAssessmentResult from '../components/CandidateAssessmentResult'
import AwarenessResult from '../components/AwarenessResult'

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

function AdminHistoryDetailPage() {
  const { predictionId } = useParams()
  const { language } = useLanguage()
  const t = useAdminText()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadSession() {
      setLoading(true)
      setError(null)
      setSession(null)
      try {
        const data = await getAdminHistoryItem(predictionId)

        if (active) setSession(data)
      } catch (requestError) {
        if (!active) return

        const status = requestError.response?.status

        if (status === 404 || status === 422) {
          setError({ kind: 'notFound' })
        } else if (status === 403) {
          setError({ kind: 'access' })
        } else if (status === 401) {
          setError({ kind: 'session' })
        } else {
          setError({
            kind: 'api',
            message: getApiErrorMessage(requestError, ''),
          })
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSession()

    return () => {
      active = false
    }
  }, [predictionId])

  const errorMessage =
    error?.kind === 'notFound'
      ? t('notFound')
      : error?.kind === 'access'
        ? t('detailAccessRequired')
        : error?.kind === 'session'
          ? t('sessionExpired')
          : error?.message || t('detailError')

  if (loading || error || !session) {
    return (
      <section className="adm36-page">
        <div className="rc-container adm36-container">
          <div
            className="adm36-state"
            role={error ? 'alert' : 'status'}
          >
            <h1>
              {loading
                ? t('loadingDetail')
                : t('predictionUnavailable')}
            </h1>

            {!loading && (
              <>
                <p>{errorMessage}</p>

                <Link
                  to="/admin"
                  className="button button-secondary adm36-button"
                >
                  {t('backToAdminShort')}
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
    session.has_red_flag === true ||
    session.assessment?.status === 'safety_review_required'

  // Older records may contain several predictions.
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
    ? Math.max(
        0,
        Math.min(100, Number(rawConfidence))
      )
    : 0

  const codes = Array.isArray(session.confirmed_codes)
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
      className="adm36-page"
      aria-labelledby="adm36-detail-title"
    >
      <div className="rc-container adm36-container">

        {/* Session heading */}
        <header className="adm36-detail-intro">
          <div>
            <Link
              className="adm36-back"
              to="/admin"
            >
              <span aria-hidden="true">←</span>{' '}
              {t('backToAdmin')}
            </Link>

            <p className="adm36-eyebrow">
              {t('adminHistory')}
            </p>

            <h1 id="adm36-detail-title">
              {t('predictionSession')}
            </h1>

            <p>
              {formatDate(
                session.created_at,
                language,
                t
              )}
            </p>
          </div>

          <span
            className={`adm36-status${
              urgent ? ' is-urgent' : ''
            }`}
          >
            {status}
          </span>
        </header>

        {/* Original assessment */}
        <section
          className="adm36-detail-panel"
          aria-labelledby="adm36-submitted-heading"
        >
          <p className="adm36-kicker">
            {t('originalAssessment')}
          </p>

          <h2 id="adm36-submitted-heading">
            {t('submittedInformation')}
          </h2>

          <div className="adm36-owner">
            <span>{t('patientUserId')}</span>

            <code>
              {session.user_id ||
                t('legacySession')}
            </code>
          </div>

          <div className="adm36-description">
            <strong>
              {t('originalSymptomDescription')}
            </strong>

            <p>
              “{session.input_text ||
                t('noDescription')}”
            </p>
          </div>

          <div className="adm36-details">
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

          {/* Confirmed symptom codes */}
          <div className="adm36-codes">
            <strong>
              {t('confirmedCodes')}
            </strong>

            <div>
              {codes.length > 0 ? (
                codes.map((code) => (
                  <span key={code}>
                    {String(code).replaceAll('_', ' ')}
                  </span>
                ))
              ) : (
                <p>{t('noStoredCodes')}</p>
              )}
            </div>
          </div>
        </section>

        {/* Saved candidate assessment, with fallback for older records */}
        {session.assessment?.contract_version === 2 ? (
          <AwarenessResult result={session} admin />
        ) : session.assessment != null ? (
          <CandidateAssessmentResult
            result={
              urgent
                ? { ...session, status: 'urgent_review' }
                : session
            }
            confirmedSymptoms={codes.map((code) => ({
              code,
              display_name: String(code).replaceAll('_', ' '),
            }))}
          />
        ) : urgent ? (
          <section
            className="adm36-urgent-detail"
            role="alert"
          >
            <p className="adm36-kicker">
              {t('urgentSession')}
            </p>

            <h2>{t('urgentConfirmed')}</h2>

            <p>{t('modelBypassed')}</p>

            {session.health_guidance && (
              <p>{session.health_guidance}</p>
            )}

            <p>{t('noUrgentPrediction')}</p>
          </section>
        ) : (
          <section
            className="adm36-detail-panel adm36-result-panel"
            aria-labelledby="adm36-result-heading"
          >
            <p className="adm36-kicker">
              {t('storedPrediction')}
            </p>

            <h2 id="adm36-result-heading">
              {t('savedCondition')}
            </h2>

            <p className="adm36-detail-description">
              {t('oneConditionNote')}
            </p>

            {/* Single condition */}
            {prediction ? (
              <div className="adm36-condition">
                <div className="adm36-condition-top">
                  <div>
                    <p className="adm36-kicker">
                      {t('conditionPattern')}
                    </p>

                    <h3>{prediction.display_name}</h3>
                  </div>

                  {hasConfidence && (
                    <div className="adm36-confidence">
                      <strong>
                        {rawConfidence}%
                      </strong>

                      <span>
                        {t('modelConfidence')}
                      </span>
                    </div>
                  )}
                </div>

                {prediction.description && (
                  <p className="adm36-condition-description">
                    {prediction.description}
                  </p>
                )}

                {hasConfidence && (
                  <div
                    className="adm36-confidence-track"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width: `${confidenceWidth}%`,
                      }}
                    />
                  </div>
                )}

                <p className="adm36-score-note">
                  {t('confidenceWarning')}
                </p>
              </div>
            ) : (
              <div className="adm36-empty">
                <p>{t('noStoredPrediction')}</p>
              </div>
            )}

            {/* Model confidence */}
            {(session.confidence_explanation ||
              session.score_note) && (
              <div className="adm36-info-note">
                <strong>
                  {t('aboutConfidence')}
                </strong>

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

            {/* Uncertainty */}
            {session.uncertain === true &&
              session.uncertainty_message && (
                <div
                  className="adm36-safety-note"
                  role="status"
                >
                  <strong>
                    {t('uncertainty')}
                  </strong>

                  <p>
                    {session.uncertainty_message}
                  </p>
                </div>
              )}

            {/* Unsupported symptoms */}
            {Array.isArray(
              session.unsupported_model_features
            ) &&
              session.unsupported_model_features.length > 0 && (
                <div
                  className="adm36-safety-note"
                  role="note"
                >
                  <strong>
                    {t('unsupportedFeatures')}
                  </strong>

                  <p>
                    {t('excludedFeatures', {
                      count:
                        session.unsupported_model_features.length,
                    })}
                  </p>
                </div>
              )}

            {/* Health guidance */}
            {session.health_guidance && (
              <div className="adm36-info-note">
                <strong>
                  {t('healthGuidance')}
                </strong>

                <p>
                  {session.health_guidance}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Session reference */}
        <div className="adm36-session-reference">
          <span>{t('sessionReference')}</span>

          <code>
            {session.prediction_id}
          </code>
        </div>

        {/* Administrator privacy notice */}
        <div className="adm36-bottom-note">
          <strong>{t('adminOnly')}</strong>

          <p>
            {session.disclaimer ||
              t('historicalDisclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default AdminHistoryDetailPage
