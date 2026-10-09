import { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  clearSymptomConfirmation,
  clearSymptomMapping,
  mapSymptoms,
  saveSymptomMapping,
} from '../services/symptoms'

import {
  clearPredictionResult,
} from '../services/predictions'

import { getApiErrorMessage } from '../services/api'

function languageLabel(language) {
  if (language === 'sw') {
    return 'Kiswahili'
  }

  if (language === 'en') {
    return 'English'
  }

  return language
}

function SymptomInputPage() {
  const [text, setText] = useState('')
  const [mapping, setMapping] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const cleanedText = text.trim()

    if (!cleanedText) {
      setError(
        'Please describe at least one symptom before continuing.',
      )

      return
    }

    setLoading(true)

    try {
      const result = await mapSymptoms(cleanedText)

      // A new NLP analysis invalidates any older
      // symptom confirmation and prediction result.
      clearSymptomConfirmation()
      clearPredictionResult()

      setMapping(result)
      saveSymptomMapping(result)
    } catch (requestError) {
      if (
        requestError.response?.status === 422
      ) {
        setError(
          'Please check your symptom description and try again.',
        )
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            'Your symptoms could not be analysed. Please try again.',
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setText('')
    setMapping(null)
    setError('')

    clearSymptomMapping()
    clearSymptomConfirmation()
    clearPredictionResult()
  }

  function handleTextChange(event) {
    setText(event.target.value)
    setError('')

    if (mapping) {
      setMapping(null)
      clearSymptomMapping()
    }

    clearSymptomConfirmation()
    clearPredictionResult()
  }

  function loadExample(exampleText) {
    setText(exampleText)
    setMapping(null)
    setError('')

    clearSymptomMapping()
    clearSymptomConfirmation()
    clearPredictionResult()
  }

  const recognised =
    mapping?.recognised_symptoms || []

  const unmatched =
    mapping?.unmatched_wording || []

  return (
    <section className="symptom-page">
      <div className="container symptom-layout">
        <div className="symptom-heading">
          <span className="symptom-eyebrow">
            Symptom awareness
          </span>

          <h1>
            Tell RespiraCare
            <span> how you are feeling.</span>
          </h1>

          <p>
            Describe your respiratory symptoms naturally.
            You can use English, Kiswahili, or a mixture
            of both languages.
          </p>
        </div>

        <div className="symptom-workspace">
          <div className="symptom-input-card">
            <div className="symptom-card-heading">
              <div>
                <span>
                  Step 1 of 3
                </span>

                <h2>
                  Describe your symptoms
                </h2>
              </div>

              <div className="language-badge">
                EN + SW
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="symptom-form"
            >
              <label htmlFor="symptom-text">
                Symptom description
              </label>

              <textarea
                id="symptom-text"
                value={text}
                onChange={handleTextChange}
                placeholder="For example: I have fever na kikohozi and I feel tired..."
                rows="7"
                maxLength="1000"
              />

              <div className="symptom-form-footer">
                <span>
                  {text.length}/1000 characters
                </span>

                <span>
                  Write naturally — medical terms are
                  not required.
                </span>
              </div>

              {error && (
                <div className="form-message error-message">
                  {error}
                </div>
              )}

              <div className="symptom-actions">
                {mapping && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleReset}
                  >
                    Start over
                  </button>
                )}

                <button
                  type="submit"
                  className="button button-primary symptom-analyse-button"
                  disabled={loading}
                >
                  {loading
                    ? 'Analysing symptoms...'
                    : mapping
                      ? 'Analyse again'
                      : 'Analyse symptoms'}
                </button>
              </div>
            </form>

            <div className="symptom-examples">
              <span>
                Try an example
              </span>

              <div>
                <button
                  type="button"
                  onClick={() =>
                    loadExample(
                      'I have fever na kikohozi',
                    )
                  }
                >
                  English + Kiswahili
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadExample(
                      'I have a couhg and feaver',
                    )
                  }
                >
                  Misspelled symptoms
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadExample(
                      'I have fever and a skin rash',
                    )
                  }
                >
                  Unmatched wording
                </button>
              </div>
            </div>
          </div>

          <aside className="symptom-help-card">
            <div className="help-icon">
              i
            </div>

            <h3>
              How to describe symptoms
            </h3>

            <p>
              Write them the same way you would explain
              them to another person.
            </p>

            <div className="help-example">
              <span>
                English
              </span>

              <p>
                “I have a cough and fever.”
              </p>
            </div>

            <div className="help-example">
              <span>
                Kiswahili
              </span>

              <p>
                “Nina kikohozi na homa.”
              </p>
            </div>

            <div className="help-example">
              <span>
                Mixed
              </span>

              <p>
                “I have fever na kikohozi.”
              </p>
            </div>

            <div className="help-note">
              RespiraCare can also recognise some
              spelling mistakes using fuzzy matching.
            </div>
          </aside>
        </div>

        {mapping && (
          <section className="mapping-results">
            <div className="mapping-results-header">
              <div>
                <span>
                  Analysis complete
                </span>

                <h2>
                  What RespiraCare recognised
                </h2>

                <p>
                  Review the wording below. Confirmation
                  will happen in the next step.
                </p>
              </div>

              <div className="recognised-count">
                <strong>
                  {recognised.length}
                </strong>

                <span>
                  recognised
                </span>
              </div>
            </div>

            {mapping.has_red_flag && (
              <div className="mapping-safety-notice">
                <div>
                  !
                </div>

                <p>
                  A potentially safety-sensitive symptom
                  phrase was recognised. It still needs
                  your confirmation before RespiraCare
                  applies urgent-review handling.
                </p>
              </div>
            )}

            {recognised.length > 0 ? (
              <div className="recognised-grid">
                {recognised.map((symptom) => (
                  <article
                    className={
                      symptom.is_red_flag
                        ? 'recognised-card recognised-card-warning'
                        : 'recognised-card'
                    }
                    key={symptom.code}
                  >
                    <div className="recognised-card-top">
                      <div>
                        <span className="recognised-label">
                          Recognised symptom
                        </span>

                        <h3>
                          {symptom.display_name}
                        </h3>
                      </div>

                      <span
                        className={
                          symptom.match_type === 'fuzzy'
                            ? 'match-badge fuzzy'
                            : 'match-badge exact'
                        }
                      >
                        {symptom.match_type === 'fuzzy'
                          ? 'Fuzzy match'
                          : 'Exact match'}
                      </span>
                    </div>

                    <div className="recognised-details">
                      <div>
                        <span>
                          Matched wording
                        </span>

                        <strong>
                          “{symptom.matched_text}”
                        </strong>
                      </div>

                      <div>
                        <span>
                          Language
                        </span>

                        <strong>
                          {languageLabel(
                            symptom.language,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Match score
                        </span>

                        <strong>
                          {symptom.match_score}%
                        </strong>
                      </div>
                    </div>

                    {symptom.is_red_flag && (
                      <div className="red-flag-label">
                        Safety-sensitive symptom
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-recognised-card">
                <div>
                  ?
                </div>

                <h3>
                  No supported symptoms were recognised
                </h3>

                <p>
                  Try describing your symptoms using
                  different wording or review the unmatched
                  wording below.
                </p>
              </div>
            )}

            {unmatched.length > 0 && (
              <div className="unmatched-section">
                <div className="unmatched-heading">
                  <span>
                    Needs review
                  </span>

                  <h3>
                    Unmatched wording
                  </h3>

                  <p>
                    RespiraCare did not automatically treat
                    these phrases as recognised symptoms.
                  </p>
                </div>

                <div className="unmatched-list">
                  {unmatched.map((item) => (
                    <article
                      className="unmatched-card"
                      key={item.unmatched_text}
                    >
                      <div className="unmatched-wording">
                        <span>
                          Not recognised
                        </span>

                        <strong>
                          “{item.unmatched_text}”
                        </strong>
                      </div>

                      {item.suggestions.length > 0 ? (
                        <div className="suggestion-area">
                          <span>
                            Possible supported wording
                          </span>

                          <div className="suggestion-chips">
                            {item.suggestions.map(
                              (suggestion) => (
                                <div
                                  className="suggestion-chip"
                                  key={
                                    suggestion.code
                                  }
                                >
                                  <strong>
                                    {
                                      suggestion.suggested_alias
                                    }
                                  </strong>

                                  <small>
                                    {languageLabel(
                                      suggestion.language,
                                    )}
                                    {' · '}
                                    {suggestion.score}%
                                  </small>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="no-suggestion">
                          No close supported symptom
                          suggestion was found.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="mapping-next-step">
              <div>
                <span>
                  Next step
                </span>

                <h3>
                  Review and confirm your symptoms
                </h3>

                <p>
                  In the next stage you will choose which
                  recognised symptoms are actually correct
                  before any prediction is made.
                </p>
              </div>

              <Link
                to="/symptoms/confirm"
                className="button button-primary"
              >
                Continue to confirmation
              </Link>
            </div>
          </section>
        )}

        <div className="symptom-safety-footer">
          <strong>
            Important
          </strong>

          <p>
            RespiraCare is a health-awareness system.
            Symptom recognition is not a diagnosis and
            does not replace professional medical care.
          </p>

          <Link to="/dashboard">
            Return to dashboard
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SymptomInputPage