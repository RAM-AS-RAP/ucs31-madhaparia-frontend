
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAdminHistoryItem } from '../services/admin'
import { getApiErrorMessage } from '../services/api'

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

function AdminHistoryDetailPage() {
  const { predictionId } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function loadSession() {
      try {
        const data = await getAdminHistoryItem(predictionId)
        if (active) setSession(data)
      } catch (requestError) {
        if (!active) return
        const status = requestError.response?.status
        if (status === 404 || status === 422) {
          setError('This prediction session could not be found.')
        } else if (status === 403) {
          setError('Administrator access is required.')
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
      <section className="adm36-page">
        <div className="rc-container adm36-container">
          <div className="adm36-state" role={error ? 'alert' : 'status'}>
            <h1>{loading ? 'Loading prediction session...' : 'Prediction unavailable'}</h1>
            {!loading && <p>{error || 'This session could not be found.'}</p>}
            {!loading && <Link to="/admin" className="button button-secondary adm36-button">Back to admin</Link>}
          </div>
        </div>
      </section>
    )
  }

  const urgent = session.status === 'urgent_review' || session.has_red_flag === true
  // Historical records may include extra predictions; display only the first.
  const prediction = !urgent && Array.isArray(session.predictions)
    ? session.predictions[0] || null : null
  const rawConfidence = prediction?.model_confidence_percent
  const hasConfidence = rawConfidence != null && Number.isFinite(Number(rawConfidence))
  const confidenceWidth = hasConfidence
    ? Math.max(0, Math.min(100, Number(rawConfidence))) : 0
  const codes = Array.isArray(session.confirmed_codes) ? session.confirmed_codes : []

  return (
    <section className="adm36-page" aria-labelledby="adm36-detail-title">
      <div className="rc-container adm36-container">
        <header className="adm36-detail-intro">
          <div>
            <Link className="adm36-back" to="/admin">← Back to administrator dashboard</Link>
            <p className="adm36-eyebrow">Administrator history</p>
            <h1 id="adm36-detail-title">Prediction session</h1>
            <p>{formatDate(session.created_at)}</p>
          </div>
          <span className={`adm36-status${urgent ? ' is-urgent' : ''}`}>
            {urgent ? 'Urgent review' : session.status === 'prediction_complete'
              ? 'Prediction complete' : session.status?.replaceAll('_', ' ') || 'Status unavailable'}
          </span>
        </header>

        <section className="adm36-detail-panel" aria-labelledby="adm36-submitted-heading">
          <p className="adm36-kicker">Original assessment</p>
          <h2 id="adm36-submitted-heading">What the patient submitted</h2>
          <div className="adm36-owner"><span>Patient user ID</span><code>{session.user_id || 'Legacy / unassigned session'}</code></div>
          <div className="adm36-description"><strong>Original symptom description</strong><p>“{session.input_text || 'No description saved'}”</p></div>
          <div className="adm36-details"><div><span>Age</span><strong>{session.age ?? '—'}</strong></div><div><span>Sex</span><strong>{sexLabel(session.sex)}</strong></div><div><span>Date</span><strong>{formatDate(session.created_at)}</strong></div></div>
          <div className="adm36-codes"><strong>Confirmed symptom codes</strong><div>{codes.length ? codes.map((code) => <span key={code}>{String(code).replaceAll('_', ' ')}</span>) : <p>No confirmed symptoms were stored.</p>}</div></div>
        </section>

        {urgent ? (
          <section className="adm36-urgent-detail" role="alert">
            <p className="adm36-kicker">Urgent-review session</p>
            <h2>Safety-sensitive symptom confirmed</h2>
            <p>The prediction model was bypassed because a safety-sensitive symptom was confirmed.</p>
            {session.health_guidance && <p>{session.health_guidance}</p>}
            <p>No automated disease prediction is displayed for this session.</p>
          </section>
        ) : (
          <section className="adm36-detail-panel adm36-result-panel" aria-labelledby="adm36-result-heading">
            <p className="adm36-kicker">Stored prediction</p>
            <h2 id="adm36-result-heading">Saved condition pattern</h2>
            <p className="adm36-detail-description">Only one saved condition is displayed. This is a model result, not a medical diagnosis.</p>
            {prediction ? (
              <div className="adm36-condition">
                <div className="adm36-condition-top">
                  <div><p className="adm36-kicker">Condition pattern</p><h3>{prediction.display_name}</h3></div>
                  {hasConfidence && <div className="adm36-confidence"><strong>{rawConfidence}%</strong><span>model confidence</span></div>}
                </div>
                {prediction.description && <p className="adm36-condition-description">{prediction.description}</p>}
                {hasConfidence && <div className="adm36-confidence-track" aria-hidden="true"><span style={{ width: `${confidenceWidth}%` }} /></div>}
                <p className="adm36-score-note">Model confidence is not the probability that the patient has this condition.</p>
              </div>
            ) : <div className="adm36-empty"><p>No condition prediction was stored for this session.</p></div>}
            {(session.confidence_explanation || session.score_note) && <div className="adm36-info-note"><strong>About model confidence</strong>{session.confidence_explanation && <p>{session.confidence_explanation}</p>}{session.score_note && <p>{session.score_note}</p>}</div>}
            {session.uncertain === true && session.uncertainty_message && <div className="adm36-safety-note" role="status"><strong>Uncertainty information</strong><p>{session.uncertainty_message}</p></div>}
            {Array.isArray(session.unsupported_model_features) && session.unsupported_model_features.length > 0 && <div className="adm36-safety-note" role="note"><strong>Unsupported model features</strong><p>{session.unsupported_model_features.length} confirmed symptom detail(s) were excluded from the model calculation.</p></div>}
            {session.health_guidance && <div className="adm36-info-note"><strong>Health guidance</strong><p>{session.health_guidance}</p></div>}
          </section>
        )}

        <div className="adm36-session-reference"><span>Session reference</span><code>{session.prediction_id}</code></div>
        <div className="adm36-bottom-note"><strong>Administrator access only</strong><p>{session.disclaimer || 'These historical results are for health awareness and are not medical diagnoses.'}</p></div>
      </div>
    </section>
  )
}

export default AdminHistoryDetailPage
