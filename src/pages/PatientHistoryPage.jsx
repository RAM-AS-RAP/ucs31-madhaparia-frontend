
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getApiErrorMessage } from '../services/api'
import { getPatientHistory } from '../services/history'
import { useLanguage } from '../context/useLanguage'
import { useHistoryText } from '../i18n/historyTranslations'
import { getCandidateHistoryDisplay } from '../utils/candidateHistory'

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

function isUrgentSession(item) {
  return (
    item.status === 'urgent_review' ||
    item.has_red_flag === true ||
    item.assessment?.status === 'safety_review_required'
  )
}

function statusLabel(item, t, language) {
  const candidate = getCandidateHistoryDisplay(item, language)
  if (candidate) return candidate.label

  if (isUrgentSession(item)) {
    return t('urgentReview')
  }

  if (item.status === 'prediction_complete') {
    return t('predictionComplete')
  }

  return item.status
    ? item.status.replaceAll('_', ' ')
    : t('statusUnavailable')
}

function PatientHistoryPage() {
  const { language } = useLanguage()
  const t = useHistoryText()

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    async function loadHistory() {
      try {
        const data = await getPatientHistory()

        if (active) {
          setHistory(
            Array.isArray(data?.history)
              ? data.history
              : []
          )
        }
      } catch (requestError) {
        if (!active) return

        if (requestError.response?.status === 401) {
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

    loadHistory()

    return () => {
      active = false
    }
  }, [])

  const urgentCount = history.filter(isUrgentSession).length
  const searchTerm = search.trim().toLowerCase()

  const visibleHistory = history
    .filter((item) => {
      const urgent = isUrgentSession(item)

      if (filter === 'urgent' && !urgent) return false
      if (filter === 'complete' && urgent) return false

      if (!searchTerm) return true

      const candidate = getCandidateHistoryDisplay(item, language)
      const searchable = [
        item.input_text,
        candidate
          ? candidate.prediction?.display_name
          : !urgent
            ? item.predictions?.[0]?.display_name
            : null,
        item.prediction_id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(searchTerm)
    })
    .sort((a, b) => {
      const first = new Date(a.created_at).getTime()
      const second = new Date(b.created_at).getTime()

      return (
        (Number.isFinite(second) ? second : 0) -
        (Number.isFinite(first) ? first : 0)
      )
    })

  const errorMessage =
    error?.kind === 'session'
      ? t('sessionExpired')
      : error?.message || t('genericError')

  return (
    <section
      className="hist35-page"
      aria-labelledby="hist35-title"
    >
      <div className="rc-container hist35-container">

        {/* Page heading */}
        <div className="hist35-intro">
          <div>
            <p className="hist35-eyebrow">
              {t('historyEyebrow')}
            </p>

            <h1 id="hist35-title">
              {t('historyTitle1')}{' '}
              <span>{t('historyTitle2')}</span>
            </h1>

            <p className="hist35-lead">
              {t('historyIntro')}
            </p>
          </div>

          <Link
            to="/symptoms"
            className="button button-primary hist35-button"
          >
            {t('newCheck')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="hist35-state" role="status">
            <div
              className="auth-spinner"
              aria-hidden="true"
            />

            <h2>{t('loading')}</h2>
            <p>{t('loadingDescription')}</p>
          </div>
        )}

        {/* API errors */}
        {!loading && error && (
          <div
            className="hist35-state hist35-state-error"
            role="alert"
          >
            <h2>{t('loadingError')}</h2>
            <p>{errorMessage}</p>

            <Link
              className="button button-secondary hist35-button"
              to="/dashboard"
            >
              {t('returnDashboard')}
            </Link>
          </div>
        )}

        {/* No saved history */}
        {!loading && !error && history.length === 0 && (
          <div className="hist35-state">
            <p className="hist35-empty-number">
              {t('zeroSessions')}
            </p>

            <h2>{t('emptyTitle')}</h2>
            <p>{t('emptyDescription')}</p>

            <Link
              className="button button-primary hist35-button"
              to="/symptoms"
            >
              {t('checkSymptoms')}
            </Link>
          </div>
        )}

        {/* History list */}
        {!loading && !error && history.length > 0 && (
          <>
            <div
              className="hist35-overview"
              aria-label={t('overview')}
            >
              <div>
                <span>{t('savedSessions')}</span>
                <strong>{history.length}</strong>
              </div>

              <div>
                <span>{t('urgentReviews')}</span>
                <strong>{urgentCount}</strong>
              </div>

              <p>{t('newestFirst')}</p>
            </div>

            {/* Search and filters */}
            <div className="hist35-toolbar">
              <div
                className="hist35-filters"
                role="group"
                aria-label={t('filterHistory')}
              >
                <button
                  type="button"
                  className={
                    filter === 'all' ? 'is-active' : ''
                  }
                  aria-pressed={filter === 'all'}
                  onClick={() => setFilter('all')}
                >
                  {t('allSessions')}
                </button>

                <button
                  type="button"
                  className={
                    filter === 'complete' ? 'is-active' : ''
                  }
                  aria-pressed={filter === 'complete'}
                  onClick={() => setFilter('complete')}
                >
                  {t('predictions')}
                </button>

                <button
                  type="button"
                  className={
                    filter === 'urgent' ? 'is-active' : ''
                  }
                  aria-pressed={filter === 'urgent'}
                  onClick={() => setFilter('urgent')}
                >
                  {t('urgentReview')}
                </button>
              </div>

              <div className="hist35-search">
                <label htmlFor="hist35-search-input">
                  {t('searchHistory')}
                </label>

                <input
                  id="hist35-search-input"
                  className="form-control"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={t('searchPlaceholder')}
                />
              </div>
            </div>

            <p
              className="hist35-showing"
              role="status"
            >
              {t('showing', {
                visible: visibleHistory.length,
                total: history.length,
              })}
            </p>

            {/* No search matches */}
            {visibleHistory.length === 0 ? (
              <div className="hist35-state">
                <h2>{t('noMatches')}</h2>
                <p>{t('noMatchesDescription')}</p>

                <button
                  type="button"
                  className="button button-secondary hist35-button"
                  onClick={() => {
                    setFilter('all')
                    setSearch('')
                  }}
                >
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div className="hist35-list">
                {visibleHistory.map((item) => {
                  const urgent = isUrgentSession(item)

                  const candidate = getCandidateHistoryDisplay(item, language)

                  // Display a candidate condition only when it was accepted.
                  const topPrediction = candidate
                    ? candidate.prediction
                    : !urgent && Array.isArray(item.predictions)
                      ? item.predictions[0]
                      : null

                  const rawConfidence =
                    topPrediction?.model_confidence_percent

                  const hasConfidence =
                    rawConfidence != null &&
                    Number.isFinite(Number(rawConfidence))

                  return (
                    <article
                      className={`hist35-session${
                        urgent ? ' is-urgent' : ''
                      }`}
                      key={item.prediction_id}
                    >
                      <div className="hist35-session-top">
                        <div>
                          <p className="hist35-date">
                            {formatDate(
                              item.created_at,
                              language,
                              t
                            )}
                          </p>

                          <h2>
                            {urgent
                              ? t('urgentSession')
                              : topPrediction?.display_name ||
                                candidate?.label ||
                                t('predictionSession')}
                          </h2>
                        </div>

                        <span
                          className={`hist35-status${
                            urgent ? ' is-urgent' : ''
                          }`}
                        >
                          {statusLabel(item, t, language)}
                        </span>
                      </div>

                      {/* Original symptoms */}
                      <div className="hist35-quote">
                        <strong>
                          {t('originalDescription')}
                        </strong>

                        <p>
                          “{item.input_text ||
                            t('noDescription')}”
                        </p>
                      </div>

                      {/* Session metadata */}
                      <div className="hist35-metadata">
                        <div>
                          <span>{t('age')}</span>
                          <strong>
                            {item.age ?? '—'}
                          </strong>
                        </div>

                        <div>
                          <span>{t('sex')}</span>
                          <strong>
                            {sexLabel(item.sex, t)}
                          </strong>
                        </div>

                        <div>
                          <span>
                            {t('confirmedSymptoms')}
                          </span>
                          <strong>
                            {item.confirmed_codes?.length ?? 0}
                          </strong>
                        </div>
                      </div>

                      {/* Urgent session */}
                      {urgent ? (
                        <div className="hist35-urgent-note">
                          <strong>
                            {t('safetyAssessment')}
                          </strong>

                          <p>
                            {t('safetyDescription')}
                          </p>
                        </div>
                      ) : (
                        topPrediction && (
                          <div className="hist35-result-preview">
                            <div>
                              <span>
                                {t('savedCondition')}
                              </span>

                              <strong>
                                {topPrediction.display_name}
                              </strong>
                            </div>

                            {hasConfidence && (
                              <div className="hist35-preview-confidence">
                                <strong>
                                  {rawConfidence}%
                                </strong>

                                <span>
                                  {t('confidence')}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Session link */}
                      <div className="hist35-session-bottom">
                        <div className="hist35-reference">
                          <span>
                            {t('sessionReference')}
                          </span>

                          <code>
                            {item.prediction_id}
                          </code>
                        </div>

                        <Link
                          className="button button-secondary hist35-button"
                          to={`/history/${encodeURIComponent(
                            item.prediction_id
                          )}`}
                        >
                          {t('viewDetails')}
                          <span aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Medical disclaimer */}
        <div className="hist35-bottom-note">
          <div>
            <strong>
              {t('awarenessOnly')}
            </strong>

            <p>{t('bottomDescription')}</p>
          </div>

          <Link to="/dashboard">
            {t('returnDashboard')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PatientHistoryPage
