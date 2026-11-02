
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  clearSymptomConfirmation,
  clearSymptomMapping,
  mapSymptoms,
  saveSymptomMapping,
} from '../services/symptoms'

import { clearPredictionResult } from '../services/predictions'
import { getApiErrorMessage } from '../services/api'
import { usePatientText } from '../i18n/patientTranslations'
import { getAuthToken } from '../services/authToken'

function languageLabel(language, t) {
  if (language === 'en') return t('common.english')
  if (language === 'sw') return t('common.swahili')
  return language || t('common.unspecified')
}

const examples = [
  {
    labelKey: 'input.mixedExample',
    text: 'I have fever na kikohozi',
  },
  {
    labelKey: 'input.misspelled',
    text: 'I have a couhg and feaver',
  },
  {
    labelKey: 'input.unmatchedExample',
    text: 'I have fever and a skin rash',
  },
]

function SymptomInputPage() {
  const t = usePatientText()

  const [text, setText] = useState('')
  const [mapping, setMapping] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const requestVersion = useRef(0)

  useEffect(() => {
    return () => {
      // Responses from a page that has been left must not restore data.
      requestVersion.current += 1
    }
  }, [])

  const recognised = mapping?.recognised_symptoms || []
  const unmatched = mapping?.unmatched_wording || []

  function invalidatePreviousResults() {
    requestVersion.current += 1
    setLoading(false)
    setMapping(null)
    clearSymptomMapping()
    clearSymptomConfirmation()
    clearPredictionResult()
  }

  function handleTextChange(event) {
    setText(event.target.value)
    setError('')
    invalidatePreviousResults()
  }

  function loadExample(exampleText) {
    setText(exampleText)
    setError('')
    invalidatePreviousResults()
  }

  function handleReset() {
    setText('')
    setError('')
    invalidatePreviousResults()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const cleanedText = text.trim()

    if (!cleanedText) {
      setError(t('input.errorEmpty'))
      return
    }

    invalidatePreviousResults()

    const submittedVersion = requestVersion.current
    const submittedToken = getAuthToken()

    setLoading(true)

    function isCurrentRequest() {
      return (
        requestVersion.current === submittedVersion &&
        getAuthToken() === submittedToken
      )
    }

    try {
      const result = await mapSymptoms(cleanedText)

      if (!isCurrentRequest()) return

      setMapping(result)
      saveSymptomMapping(result)
    } catch (requestError) {
      if (!isCurrentRequest()) return

      if (requestError.response?.status === 422) {
        setError(t('input.errorValidation'))
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            t('input.errorGeneric'),
          ),
        )
      }
    } finally {
      if (isCurrentRequest()) {
        setLoading(false)
      }
    }
  }

  return (
    <section
      className="sym33-page"
      aria-labelledby="sym33-input-title"
    >
      <div className="rc-container sym33-container">

        {/* Page heading */}
        <div className="row g-4 align-items-end sym33-intro-row">
          <div className="col-12 col-lg-8">
            <p className="sym33-eyebrow">
              {t('input.eyebrow')}
            </p>

            <h1 id="sym33-input-title">
              {t('input.title1')}
              <span> {t('input.title2')}</span>
            </h1>

            <p className="sym33-lead">
              {t('input.intro')}
            </p>
          </div>

          <div className="col-12 col-lg-4">
            <div className="sym33-progress">
              <div className="sym33-progress-top">
                <strong>{t('input.step')}</strong>
                <span>{t('input.stepLabel')}</span>
              </div>

              <div
                className="sym33-progress-track"
                role="progressbar"
                aria-label={t('input.progress')}
                aria-valuemin={0}
                aria-valuemax={3}
                aria-valuenow={1}
              >
                <span style={{ width: '33.33%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Input and guidance */}
        <div className="row g-4 sym33-workspace">
          <div className="col-12 col-lg-8">
            <div className="sym33-form-panel">
              <div className="sym33-section-heading">
                <div>
                  <p className="sym33-section-kicker">
                    {t('input.yourDescription')}
                  </p>

                  <h2>{t('input.describe')}</h2>
                </div>

                <span className="sym33-language-label">
                  {t('common.both')}
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <label
                  className="sym33-field-label"
                  htmlFor="symptom-text"
                >
                  {t('input.fieldLabel')}
                </label>

                <p
                  className="sym33-field-help"
                  id="sym33-text-help"
                >
                  {t('input.fieldHelp')}
                </p>

                <textarea
                  id="symptom-text"
                  className="form-control sym33-textarea"
                  value={text}
                  onChange={handleTextChange}
                  placeholder={t('input.placeholder')}
                  rows={6}
                  maxLength={1000}
                  aria-describedby="sym33-text-help sym33-character-count"
                  aria-invalid={Boolean(error && !text.trim())}
                />

                <div className="sym33-input-meta">
                  <span id="sym33-character-count">
                    {t('input.characters', { count: text.length })}
                  </span>

                  <span>{t('input.writeNaturally')}</span>
                </div>

                {error && (
                  <div
                    className="form-message error-message sym33-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div className="sym33-form-actions">
                  {(text || mapping) && (
                    <button
                      type="button"
                      className="button button-secondary sym33-secondary-button"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      {t('input.clear')}
                    </button>
                  )}

                  <button
                    type="submit"
                    className="button button-primary sym33-primary-button"
                    disabled={loading}
                  >
                    {loading
                      ? t('input.loading')
                      : mapping
                        ? t('input.analyseAgain')
                        : t('input.analyse')}

                    {!loading && (
                      <span aria-hidden="true">→</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Example symptom descriptions */}
              <div className="sym33-examples">
                <p className="sym33-section-kicker">
                  {t('input.examples')}
                </p>

                <p>{t('input.exampleHelp')}</p>

                <div className="sym33-example-actions">
                  {examples.map((example) => (
                    <button
                      type="button"
                      key={example.labelKey}
                      onClick={() => loadExample(example.text)}
                      disabled={loading}
                    >
                      {t(example.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Writing guidance */}
          <div className="col-12 col-lg-4">
            <aside className="sym33-help-panel">
              <p className="sym33-section-kicker">
                {t('input.writingGuidance')}
              </p>

              <h2>{t('input.speakNaturally')}</h2>

              <p className="sym33-help-intro">
                {t('input.helpIntro')}
              </p>

              <div className="sym33-language-examples">
                <div>
                  <strong>{t('common.english')}</strong>
                  <p>“I have a cough and fever.”</p>
                </div>

                <div>
                  <strong>{t('common.swahili')}</strong>
                  <p>“Nina kikohozi na homa.”</p>
                </div>

                <div>
                  <strong>{t('input.mixedLanguage')}</strong>
                  <p>“I have fever na kikohozi.”</p>
                </div>
              </div>

              <p className="sym33-help-note">
                {t('input.fuzzyNote')}
              </p>
            </aside>
          </div>
        </div>

        {/* NLP mapping results */}
        {mapping && (
          <section
            className="sym33-results"
            aria-labelledby="sym33-results-title"
          >
            <div className="sym33-results-heading">
              <div>
                <p className="sym33-section-kicker">
                  {t('input.complete')}
                </p>

                <h2 id="sym33-results-title">
                  {t('input.recognisedTitle')}
                </h2>

                <p>{t('input.recognisedDescription')}</p>
              </div>

              <div className="sym33-total">
                <strong>{recognised.length}</strong>
                <span>{t('input.recognised')}</span>
              </div>
            </div>

            {mapping.has_red_flag && (
              <div
                className="sym33-alert sym33-alert-warning"
                role="alert"
              >
                <strong>{t('input.warningTitle')}</strong>
                <p>{t('input.warningDescription')}</p>
              </div>
            )}

            {recognised.length > 0 ? (
              <div className="sym33-recognised-list">
                {recognised.map((symptom) => (
                  <article
                    key={symptom.code}
                    className={`sym33-recognised-row${
                      symptom.is_red_flag
                        ? ' is-warning'
                        : ''
                    }`}
                  >
                    <div className="sym33-recognised-main">
                      <div className="sym33-recognised-heading">
                        <h3>{symptom.display_name}</h3>

                        {symptom.is_red_flag && (
                          <span className="sym33-warning-tag">
                            {t('input.sensitive')}
                          </span>
                        )}
                      </div>

                      <p>
                        {t('input.recognisedFrom')}{' '}
                        <strong>
                          “{symptom.matched_text}”
                        </strong>
                      </p>
                    </div>

                    <div className="sym33-recognised-meta">
                      <span>
                        {symptom.match_type === 'fuzzy'
                          ? t('input.fuzzyMatch')
                          : t('input.exactMatch')}
                      </span>

                      <span>
                        {languageLabel(symptom.language, t)}
                      </span>

                      <span>
                        {t('input.matchScore', {
                          score: symptom.match_score,
                        })}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="sym33-empty-state">
                <h3>{t('input.emptyTitle')}</h3>
                <p>{t('input.emptyDescription')}</p>
              </div>
            )}

            {unmatched.length > 0 && (
              <section className="sym33-unmatched">
                <p className="sym33-section-kicker">
                  {t('input.needsReview')}
                </p>

                <h3>{t('input.unmatchedTitle')}</h3>
                <p>{t('input.unmatchedDescription')}</p>

                {unmatched.map((item, index) => (
                  <div
                    className="sym33-unmatched-row"
                    key={`${item.unmatched_text}-${index}`}
                  >
                    <strong>
                      “{item.unmatched_text}”
                    </strong>

                    {(item.suggestions || []).length > 0 ? (
                      <div className="sym33-suggestions">
                        {item.suggestions.map((suggestion, i) => (
                          <span
                            key={`${suggestion.code}-${i}`}
                          >
                            {suggestion.suggested_alias}
                            {' · '}
                            {languageLabel(suggestion.language, t)}
                            {' · '}
                            {suggestion.score}%
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>{t('input.noSuggestion')}</p>
                    )}
                  </div>
                ))}
              </section>
            )}

            {recognised.length > 0 && (
              <div className="sym33-next">
                <div>
                  <p className="sym33-section-kicker">
                    {t('input.next')}
                  </p>

                  <h3>{t('input.confirmTitle')}</h3>
                  <p>{t('input.confirmDescription')}</p>
                </div>

                <Link
                  to="/symptoms/confirm"
                  className="button button-primary sym33-primary-button"
                >
                  {t('input.continue')}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </section>
        )}

        <div className="sym33-bottom-note">
          <div>
            <strong>{t('common.safetyTitle')}</strong>
            <p>{t('input.safetyDescription')}</p>
          </div>

          <Link to="/dashboard">
            {t('common.returnDashboard')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SymptomInputPage
