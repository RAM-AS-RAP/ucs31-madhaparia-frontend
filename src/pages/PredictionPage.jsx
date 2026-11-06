
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
import { usePredictionText } from '../i18n/predictionTranslations'
import CandidateAssessmentResult from '../components/CandidateAssessmentResult'
import AwarenessResult from '../components/AwarenessResult'
import { useLanguage } from '../context/useLanguage'

function PredictionPage() {
  const t = usePredictionText()
  const { language } = useLanguage()

  const mapping = getSavedSymptomMapping()
  const confirmation = getSavedSymptomConfirmation()

  const [age, setAge] = useState('')
  const [sex, setSex] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [durationCode, setDurationCode] = useState('')
  const [durationEntries, setDurationEntries] = useState({})
  const durationDays = durationEntries[durationCode]?.amount ?? ''
  const durationUnit = durationEntries[durationCode]?.unit ?? 'days'
  const durationText = durationEntries[durationCode]?.text ?? ''
  function updateDuration(field, value) {
    setDurationEntries((old) => ({ ...old, [durationCode]: { ...old[durationCode], [field]: value } }))
  }

  // Restore only a result belonging to the current symptoms.
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

    // Never reuse a normal prediction for an urgent case.
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

  const confirmedSymptoms = confirmation.confirmed_symptoms || []
  const confirmedCodes = confirmation.confirmed_codes || []

  const confirmedPhrases = confirmedSymptoms.map(
    (symptom) => symptom.matched_text,
  )
  const followUpText =
    confirmedPhrases.length === confirmedCodes.length &&
    confirmedPhrases.every(
      (phrase) => typeof phrase === 'string' && phrase.trim(),
    )
      ? confirmedPhrases.join(' and ')
      : ''

  // Show only one condition, never a ranked list.
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
      setError(t('errorAge'))
      return
    }

    if (sex !== 'M' && sex !== 'F') {
      setError(t('errorSex'))
      return
    }

    if (confirmedCodes.length === 0 && !confirmation.mapping_version) {
      setError(t('errorSymptoms'))
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
        ...(confirmation.mapping_version || durationCode ? {
          corrections: confirmation.corrections || [],
          durations: Object.entries(durationEntries)
            .filter(([, entry]) => entry.unit === 'unknown' || (entry.amount !== undefined && entry.amount !== '') || entry.text?.trim())
            .map(([code, entry]) => entry.unit === 'unknown'
              ? { code, unknown: true, text: entry.text?.trim() || null }
              : { code, amount: entry.amount === undefined || entry.amount === '' ? null : Number(entry.amount), unit: entry.unit || 'days', text: entry.text?.trim() || null }),
          language,
        } : {}),
      })

      // Red-flag cases must never display disease predictions.
      if (
        isConfirmedUrgent &&
        response.status !== 'urgent_review'
      ) {
        setError(t('errorSafety'))
        return
      }

      setResult(response)
      savePredictionResult(response, mapping.input_text)
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        setError(t('errorSession'))
      } else if (requestError.response?.status === 422) {
        setError(
          getApiErrorMessage(
            requestError,
            t('errorValidation'),
          ),
        )
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            t('errorGeneric'),
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

        {/* Page introduction */}
        <div className="row g-4 align-items-end pred34-intro">
          <div className="col-12 col-lg-8">
            <p className="pred34-eyebrow">
              {t('eyebrow')}
            </p>

            <h1 id="pred34-title">
              {t('title1')}{' '}
              <span>{t('title2')}</span>
            </h1>

            {(!result || result.assessment?.contract_version !== 1) && (
              <p className="pred34-lead">
                {t('intro')}
              </p>
            )}
          </div>

          <div className="col-12 col-lg-4">
            <div className="pred34-progress">
              <div className="pred34-progress-labels">
                <strong>{t('step')}</strong>
                <span>
                  {result ? t('complete') : t('eyebrow')}
                </span>
              </div>

              <div
                className="pred34-progress-track"
                role="progressbar"
                aria-label={t('progress')}
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

        {/* Assessment form */}
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
                      {t('finalStep')}
                    </p>

                    <h2 id="pred34-form-title">
                      {t('formTitle')}
                    </h2>

                    <p>{t('formIntro')}</p>
                  </div>

                  {!isConfirmedUrgent && (
                    <span className="pred34-ready">
                      {t('ready')}
                    </span>
                  )}
                </div>

                {/* Confirmed symptoms */}
                <div className="pred34-confirmed">
                  <div className="pred34-confirmed-heading">
                    <strong>{t('confirmed')}</strong>
                    <span>
                      {t('selected', {
                        count: confirmedCodes.length,
                      })}
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
                      {t('warningTitle')}
                    </strong>
                    <p>{t('warningText')}</p>
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
                          {t('age')}
                        </label>

                        <input
                          id="prediction-age"
                          className="form-control"
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="120"
                          value={age}
                          placeholder={t('agePlaceholder')}
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
                          {t('sex')}
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
                            {t('select')}
                          </option>
                          <option value="M">
                            {t('male')}
                          </option>
                          <option value="F">
                            {t('female')}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <fieldset className="pred34-field" style={{ marginTop: 20 }}>
                    <legend>{language === 'sw' ? 'Muda wa dalili (si lazima)' : 'Symptom duration (optional)'}</legend>
                    <label htmlFor="duration-symptom">{language === 'sw' ? 'Dalili' : 'Symptom'}</label>
                    <select id="duration-symptom" className="form-select" value={durationCode} onChange={(e) => setDurationCode(e.target.value)}>
                      <option value="">{language === 'sw' ? 'Sina uhakika / haijatajwa' : 'Not sure / not supplied'}</option>
                      {confirmedSymptoms.map((s) => <option key={s.code} value={s.code}>{s.display_name}</option>)}
                    </select>
                    <label htmlFor="duration-unit">{language === 'sw' ? 'Kipimo cha muda' : 'Duration unit'}</label>
                    <select id="duration-unit" className="form-select" value={durationUnit} disabled={!durationCode} onChange={(e) => updateDuration('unit', e.target.value)}>
                      <option value="days">{language === 'sw' ? 'Siku' : 'Days'}</option>
                      <option value="weeks">{language === 'sw' ? 'Wiki' : 'Weeks'}</option>
                      <option value="months">{language === 'sw' ? 'Miezi (takriban)' : 'Months (approximate)'}</option>
                      <option value="unknown">{language === 'sw' ? 'Sina uhakika' : 'Not sure'}</option>
                    </select>
                    <label htmlFor="duration-days">{language === 'sw' ? 'Idadi, ikiwa inajulikana' : 'Duration amount, if known'}</label>
                    <input id="duration-days" className="form-control" type="number" min="0" max={durationUnit === 'weeks' ? 521 : durationUnit === 'months' ? 120 : 3650} step="1" value={durationDays} disabled={!durationCode || durationUnit === 'unknown'} onChange={(e) => updateDuration('amount', e.target.value)} />
                    <label htmlFor="duration-text">{language === 'sw' ? 'Au eleza muda kwa maneno' : 'Or describe the duration in words'}</label>
                    <input id="duration-text" className="form-control" maxLength={100} value={durationText} disabled={!durationCode} onChange={(e) => updateDuration('text', e.target.value)} />
                    <p>{language === 'sw' ? 'Unaweza kuchagua dalili nyingine; muda ulioandika unabaki. Muda hutumika kwa ushauri, si kubadilisha alama za modeli hii.' : 'Choose another symptom to record a different duration; previous entries are retained. Duration informs guidance, not this model’s scores. You can leave it unknown.'}</p>
                  </fieldset>

                  <div className="pred34-input-note">
                    <strong>{t('whyRequired')}</strong>
                    <p>{t('requiredExplanation')}</p>
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
                      {t('back')}
                    </Link>

                    <button
                      type="submit"
                      className="button button-primary pred34-primary"
                      disabled={loading}
                    >
                      {loading
                        ? t('generating')
                        : isConfirmedUrgent
                          ? t('safetyReview')
                          : t('generate')}

                      {!loading && (
                        <span aria-hidden="true">→</span>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* What happens next */}
            <div className="col-12 col-lg-4">
              <aside className="pred34-aside">
                <p className="pred34-kicker">
                  {t('before')}
                </p>

                <h2>{t('whatNext')}</h2>

                {[
                  ['step1Title', 'step1Text'],
                  ['step2Title', 'step2Text'],
                  ['step3Title', 'step3Text'],
                ].map(([title, description], index) => (
                  <div
                    className="pred34-aside-step"
                    key={title}
                  >
                    <span>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div>
                      <strong>{t(title)}</strong>
                      <p>{t(description)}</p>
                    </div>
                  </div>
                ))}

                <p className="pred34-aside-footnote">
                  {t('asideNote')}
                </p>
              </aside>
            </div>
          </div>
        )}

        {/* Prediction or urgent safety result */}
        {result && (
          <div className="pred34-results">
            {result.assessment?.contract_version === 2 ? (
              <AwarenessResult result={result} />
            ) : result.assessment?.contract_version === 1 ? (
              <CandidateAssessmentResult
                result={result}
                confirmedSymptoms={confirmedSymptoms}
                confirmedCodes={confirmedCodes}
                followUpText={followUpText}
                onFollowUpResult={setResult}
              />
            ) : isUrgentResult ? (
              <section
                className="pred34-urgent-result"
                aria-labelledby="pred34-urgent-title"
                role="alert"
              >
                <p className="pred34-kicker">
                  {t('urgent')}
                </p>

                <h2 id="pred34-urgent-title">
                  {t('urgentHeading')}
                </h2>

                <p>
                  {result.health_guidance ||
                    t('urgentFallback')}
                </p>

                <p className="pred34-urgent-footnote">
                  {t('urgentNote')}
                </p>
              </section>
            ) : (
              <>
                <div className="pred34-result-intro">
                  <p className="pred34-kicker">
                    {t('analysisComplete')}
                  </p>

                  <h2>{t('resultTitle')}</h2>
                  <p>{t('resultIntro')}</p>
                </div>

                <div className="row g-4">
                  {/* Single predicted condition */}
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
                                {t('condition')}
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
                                  {t('confidence')}
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
                                {t('confidenceWarning')}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="pred34-no-condition">
                          <h3 id="pred34-condition-title">
                            {t('noCondition')}
                          </h3>

                          <p>{t('noConditionNote')}</p>
                        </div>
                      )}
                    </section>
                  </div>

                  {/* Confidence explanation */}
                  <div className="col-12 col-lg-4">
                    <aside className="pred34-confidence-note">
                      <p className="pred34-kicker">
                        {t('readingResult')}
                      </p>

                      <h3>{t('aboutConfidence')}</h3>

                      <p>
                        {result.confidence_explanation ||
                          t('confidenceFallback')}
                      </p>

                      {result.score_note && (
                        <p>{result.score_note}</p>
                      )}
                    </aside>
                  </div>
                </div>

                {/* V2 uncertainty guidance */}
                {result.uncertain === true &&
                  result.uncertainty_message && (
                    <div
                      className="pred34-uncertainty"
                      role="status"
                    >
                      <strong>
                        {t('uncertaintyTitle')}
                      </strong>

                      <p>
                        {result.uncertainty_message}
                      </p>
                    </div>
                  )}

                {/* Unsupported model features */}
                {Array.isArray(
                  result.unsupported_model_features,
                ) &&
                  result.unsupported_model_features.length > 0 && (
                    <div
                      className="pred34-warning"
                      role="note"
                      aria-label={t('unsupportedLabel')}
                    >
                      <strong>
                        {t('unsupportedTitle')}
                      </strong>

                      <p>
                        {t('unsupportedText', {
                          count:
                            result.unsupported_model_features.length,
                        })}
                      </p>
                    </div>
                  )}

                {/* Health-awareness guidance */}
                <section
                  className="pred34-guidance"
                  aria-labelledby="pred34-guidance-title"
                >
                  <p className="pred34-kicker">
                    {t('guidance')}
                  </p>

                  <h3 id="pred34-guidance-title">
                    {t('nextSteps')}
                  </h3>

                  <p>{result.health_guidance}</p>
                </section>
              </>
            )}

            {/* Medical disclaimer */}
            <section
              className="pred34-disclaimer"
              aria-label={t('disclaimerLabel')}
            >
              <strong>{t('important')}</strong>
              <p>{result.disclaimer}</p>
            </section>

            {/* Existing prediction feedback */}
            <div className="pred34-feedback">
              <PredictionFeedback
                key={result.prediction_id}
                predictionId={result.prediction_id}
              />
            </div>

            <div className="pred34-reference">
              <span>{t('reference')}</span>
              <code>{result.prediction_id}</code>
            </div>

            <div className="pred34-result-actions">
              <button
                type="button"
                className="button button-secondary pred34-secondary"
                onClick={handleStartAgain}
              >
                {t('reviewAnother')}
              </button>

              <Link
                to="/dashboard"
                className="button button-primary pred34-primary"
              >
                {t('dashboard')}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        )}

                {/* The result above already includes its disclaimer. */}
        {!result && (
          <div className="pred34-bottom-note">
            <div>
              <strong>{t('awarenessOnly')}</strong>
              <p>{t('bottomNote')}</p>
            </div>

            <Link to="/dashboard">
              {t('dashboard')}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default PredictionPage
