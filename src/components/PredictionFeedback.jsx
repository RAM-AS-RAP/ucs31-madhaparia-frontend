
import { useState } from 'react'

import { getApiErrorMessage } from '../services/api'
import { submitPredictionFeedback } from '../services/feedback'
import { useSharedText } from '../i18n/sharedTranslations'

function PredictionFeedback({ predictionId }) {
  const t = useSharedText()

  const [wasHelpful, setWasHelpful] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [duplicate, setDuplicate] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (
      wasHelpful !== true &&
      wasHelpful !== false
    ) {
      setError(t('feedback.errorChoice'))
      return
    }

    if (comment.length > 1000) {
      setError(t('feedback.errorLength'))
      return
    }

    setLoading(true)

    try {
      await submitPredictionFeedback({
        predictionId,
        wasHelpful,
        comment,
      })

      setSubmitted(true)
    } catch (requestError) {
      const detail = requestError.response?.data?.detail

      if (
        requestError.response?.status === 400 &&
        typeof detail === 'string' &&
        detail.includes('already been submitted')
      ) {
        setDuplicate(true)
      } else if (requestError.response?.status === 422) {
        setError(t('feedback.errorValidation'))
      } else {
        setError(
          getApiErrorMessage(
            requestError,
            t('feedback.errorGeneric'),
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <section
        className="feedback-card feedback-success"
        role="status"
      >
        <div
          className="feedback-success-icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <div>
          <span>{t('feedback.received')}</span>

          <h3>{t('feedback.thanks')}</h3>

          <p>{t('feedback.saved')}</p>
        </div>
      </section>
    )
  }

  if (duplicate) {
    return (
      <section
        className="feedback-card feedback-existing"
        role="status"
      >
        <div
          className="feedback-existing-icon"
          aria-hidden="true"
        >
          ✓
        </div>

        <div>
          <span>{t('feedback.duplicate')}</span>

          <h3>{t('feedback.duplicateTitle')}</h3>

          <p>{t('feedback.duplicateText')}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="feedback-card">
      <div className="feedback-heading">
        <span>{t('feedback.eyebrow')}</span>

        <h3>{t('feedback.question')}</h3>

        <p>{t('feedback.intro')}</p>
      </div>

      <form
        className="feedback-form"
        onSubmit={handleSubmit}
      >
        <div
          className="feedback-choice-group"
          role="group"
          aria-label={t('feedback.question')}
        >
          <button
            type="button"
            aria-pressed={wasHelpful === true}
            className={
              wasHelpful === true
                ? 'feedback-choice selected'
                : 'feedback-choice'
            }
            onClick={() => {
              setWasHelpful(true)
              setError('')
            }}
          >
            <span
              className="feedback-choice-icon"
              aria-hidden="true"
            >
              ✓
            </span>

            <span>
              <strong>{t('feedback.yes')}</strong>
              <small>{t('feedback.helpful')}</small>
            </span>
          </button>

          <button
            type="button"
            aria-pressed={wasHelpful === false}
            className={
              wasHelpful === false
                ? 'feedback-choice selected'
                : 'feedback-choice'
            }
            onClick={() => {
              setWasHelpful(false)
              setError('')
            }}
          >
            <span
              className="feedback-choice-icon"
              aria-hidden="true"
            >
              ×
            </span>

            <span>
              <strong>{t('feedback.no')}</strong>
              <small>{t('feedback.notHelpful')}</small>
            </span>
          </button>
        </div>

        <div className="feedback-comment-field">
          <div className="feedback-comment-label">
            <label htmlFor={`feedback-${predictionId}`}>
              {t('feedback.comment')}
              <span> {t('feedback.optional')}</span>
            </label>

            <span>{comment.length}/1000</span>
          </div>

          <textarea
            id={`feedback-${predictionId}`}
            value={comment}
            maxLength={1000}
            rows={4}
            placeholder={t('feedback.placeholder')}
            onChange={(event) => {
              setComment(event.target.value)
              setError('')
            }}
          />
        </div>

        {error && (
          <div
            className="form-message error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="feedback-actions">
          <p>{t('feedback.privacy')}</p>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading
              ? t('feedback.submitting')
              : t('feedback.submit')}
          </button>
        </div>
      </form>
    </section>
  )
}

export default PredictionFeedback
