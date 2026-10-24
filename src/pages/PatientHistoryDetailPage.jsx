
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../services/api'
import { getPatientHistoryItem } from '../services/history'
import PredictionFeedback from '../components/PredictionFeedback'

function formatDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function sexLabel(value) {
  if (value === 'M') return 'Male'
  if (value === 'F') return 'Female'
  return value || 'Not recorded'
}

function readableCode(code) {
  return String(code).replaceAll('_', ' ')
}

function PatientHistoryDetailPage() {
  const { predictionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const data = await getPatientHistoryItem(predictionId)
        if (active) setSession(data)
      } catch (requestError) {
        if (!active) return
        const status = requestError.response?.status
        if (status === 404 || status === 422) {
          setError('This prediction session could not be found.')
        } else if (status === 401) {
          setError('Your login session is no longer valid.')
        } else {
          setError(getApiErrorMessage(
            requestError,
            'RespiraCare could not load this prediction session.',
          ))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSession()
    return () => { active = false }
  }, [predictionId])

  if (loading || error || !session) {
    return (
      <section className="hist35-page" aria-label="Patient history details">
        <div className="rc-container hist35-container">
          <div className={`hist35-state${error ? ' hist35-state-error' : ''}`}
            role={error ? 'alert' : 'status'}>
            {loading ? (
              <>
                <div className="auth-spinner" aria-hidden="true" />
                <h2>Loading prediction details...</h2>
                <p>Retrieving the saved assessment session.</p>
              </>
            ) : (
              <>
                <h2>Prediction unavailable</h2>
                <p>{error || 'This prediction session could not be found.'}</p>
                <Link to="/history" className="button button-secondary hist35-button">
                  Back to history
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    )
  }

  const urgent = session.status === 'urgent_review' || session.has_red_flag === true
  // Older sessions may contain multiple predictions. The patient sees one.
  const prediction = !urgent && Array.isArray(session.predictions)
    ? session.predictions[0] || null : null
  const rawConfidence = prediction?.model_confidence_percent
  const hasConfidence = rawConfidence != null && Number.isFinite(Number(rawConfidence))
  const confidenceWidth = hasConfidence
    ? Math.max(0, Math.min(100, Number(rawConfidence))) : 0
  const confirmedCodes = Array.isArray(session.confirmed_codes)
    ? session.confirmed_codes : []

  return (
    <section className="hist35-page" aria-labelledby="hist35-detail-title">
      <div className="rc-container hist35-container">
        <div className="hist35-detail-heading">
          <div>
            <Link className="hist35-breadcrumb" to="/history">
              <span aria-hidden="true">←</span> Back to patient history
            </Link>
            <p className="hist35-eyebrow">Saved assessment</p>
            <h1 id="hist35-detail-title">Session details</h1>
            <p className="hist35-lead">{formatDate(session.created_at)}</p>
          </div>
          <span className={`hist35-status${urgent ? ' is-urgent' : ''}`}>
            {urgent ? 'Urgent review' :
              session.status === 'prediction_complete' ? 'Prediction complete' :
              (session.status?.replaceAll('_', ' ') || 'Status unavailable')}
          </span>
        </div>

        <section className="hist35-info-card" aria-labelledby="hist35-info-title">
          <div className="hist35-section-title">
            <p className="hist35-kicker">Original assessment</p>
            <h2 id="hist35-info-title">What you submitted</h2>
          </div>
          <div className="hist35-quote">
            <strong>Original symptom description</strong>
            <p>“{session.input_text || 'No description saved'}”</p>
          </div>
          <div className="hist35-detail-meta">
            <div><span>Age</span><strong>{session.age ?? '—'}</strong></div>
            <div><span>Sex</span><strong>{sexLabel(session.sex)}</strong></div>
            <div><span>Date</span><strong>{formatDate(session.created_at)}</strong></div>
          </div>
          <div className="hist35-confirmed-codes">
            <div className="hist35-confirmed-heading">
              <strong>Confirmed symptom codes</strong>
              <span>{confirmedCodes.length} recorded</span>
            </div>
            {confirmedCodes.length > 0 ? (
              <div className="hist35-code-list">
                {confirmedCodes.map((code) => (
                  <span key={code} title={code}>{readableCode(code)}</span>
                ))}
              </div>
            ) : (
              <p className="hist35-muted">No confirmed symptom codes were saved.</p>
            )}
          </div>
        </section>

        {urgent ? (
          <section className="hist35-urgent-detail" role="alert">
            <p className="hist35-kicker">Urgent-review session</p>
            <h2>A safety-sensitive symptom was confirmed.</h2>
            <p>
              This session followed the urgent-review route because a
              safety-sensitive symptom was confirmed. The prediction model was bypassed.
            </p>
            {session.health_guidance && <p>{session.health_guidance}</p>}
            <p>Seek prompt professional medical assessment if you are experiencing severe or worsening symptoms.</p>
          </section>
        ) : (
          <section className="hist35-result-section" aria-labelledby="hist35-result-title">
            <div className="hist35-section-title">
              <p className="hist35-kicker">Saved result</p>
              <h2 id="hist35-result-title">Saved condition pattern</h2>
              <p>The condition shown is the saved model result, not a diagnosis.</p>
            </div>

            {prediction ? (
              <div className="hist35-condition">
                <div className="hist35-condition-header">
                  <div>
                    <p className="hist35-kicker">Condition pattern</p>
                    <h3>{prediction.display_name}</h3>
                  </div>
                  {hasConfidence && (
                    <div className="hist35-confidence-value">
                      <strong>{rawConfidence}%</strong>
                      <span>model confidence</span>
                    </div>
                  )}
                </div>
                {prediction.description && (
                  <p className="hist35-condition-description">{prediction.description}</p>
                )}
                {hasConfidence && (
                  <div className="hist35-confidence-visual">
                    <div className="hist35-confidence-track" aria-hidden="true">
                      <span style={{ width: `${confidenceWidth}%` }} />
                    </div>
                    <p>A model score, not the probability that you have this condition.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="hist35-no-result">
                <p>No condition prediction was stored for this session.</p>
              </div>
            )}

            {(session.confidence_explanation || session.score_note) && (
              <div className="hist35-explanation">
                <h3>About model confidence</h3>
                {session.confidence_explanation && <p>{session.confidence_explanation}</p>}
                {session.score_note && <p>{session.score_note}</p>}
              </div>
            )}

            {session.uncertain === true && session.uncertainty_message && (
              <div className="hist35-uncertainty" role="status">
                <strong>Important information about this result</strong>
                <p>{session.uncertainty_message}</p>
              </div>
            )}

            {Array.isArray(session.unsupported_model_features) &&
              session.unsupported_model_features.length > 0 && (
                <div className="hist35-uncertainty" role="note"
                  aria-label="Unsupported symptom information">
                  <strong>Some symptom details were not used</strong>
                  <p>{session.unsupported_model_features.length} confirmed symptom
                    detail(s) were excluded from the model calculation. This does
                    not mean those symptoms were absent.</p>
                </div>
              )}

            {session.health_guidance && (
              <div className="hist35-guidance">
                <p className="hist35-kicker">Health guidance</p>
                <h3>What to do next</h3>
                <p>{session.health_guidance}</p>
              </div>
            )}
          </section>
        )}

        <div className="hist35-reference-detail">
          <span>Session reference</span>
          <code>{session.prediction_id}</code>
        </div>

        <div className="hist35-feedback">
          <PredictionFeedback key={session.prediction_id}
            predictionId={session.prediction_id} />
        </div>

        <div className="hist35-bottom-note">
          <div>
            <strong>Important: health-awareness information only</strong>
            <p>{session.disclaimer ||
              'Historical results are not medical diagnoses and should not replace professional medical assessment.'}</p>
          </div>
          <Link to="/dashboard">Return to dashboard</Link>
        </div>
      </div>
    </section>
  )
}

export default PatientHistoryDetailPage
