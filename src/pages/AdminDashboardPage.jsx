import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminMonitoringCharts from '../components/AdminMonitoringCharts'
import { useAuth } from '../context/useAuth'
import { getAuthToken } from '../services/authToken'
import { useAdminMonitoringText } from '../i18n/adminMonitoringTranslations'
import { useAdminUsersText } from '../i18n/adminUsersTranslations'
import { ADMIN_RECORD_LIMIT, buildAdminAnalytics, filterByDate, isCalendarDate, isUrgentSession as isUrgent } from '../utils/adminAnalytics'

import { getAdminFeedback, getAdminHistory } from '../services/admin'
import { getApiErrorMessage } from '../services/api'
import { useLanguage } from '../context/useLanguage'
import { useAdminText } from '../i18n/adminTranslations'
import { getCandidateHistoryDisplay } from '../utils/candidateHistory'

function newestFirst(a, b) {
  const first = new Date(a.created_at).getTime()
  const second = new Date(b.created_at).getTime()

  return (
    (Number.isFinite(second) ? second : 0) -
    (Number.isFinite(first) ? first : 0)
  )
}

function AdminDashboardPage() {
  const { language } = useLanguage()
  const t = useAdminText()
  const m = useAdminMonitoringText()
  const usersText = useAdminUsersText()
  const { user } = useAuth()

  const [history, setHistory] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('history')
  const [historyFilter, setHistoryFilter] = useState('all')
  const [historySearch, setHistorySearch] = useState('')
  const [feedbackSearch, setFeedbackSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [rangeError, setRangeError] = useState(false)
  const [reload, setReload] = useState(0)
  const [refreshedAt, setRefreshedAt] = useState(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const token = getAuthToken()
    const current = () => active && token === getAuthToken()

    async function loadAdminData() {
      setLoading(true)
      setError(null)
      try {
        const [historyResponse, feedbackResponse] = await Promise.all([
          getAdminHistory(ADMIN_RECORD_LIMIT, { signal: controller.signal }),
          getAdminFeedback(ADMIN_RECORD_LIMIT, { signal: controller.signal }),
        ])

        if (!current()) return

        if (!Array.isArray(historyResponse?.history) || !Array.isArray(feedbackResponse?.feedback)) {
          throw new Error('Invalid administrator response')
        }
        setHistory(historyResponse.history)
        setFeedback(feedbackResponse.feedback)
        setRefreshedAt(new Date().toISOString())
      } catch (requestError) {
        if (!current()) return

        const status = requestError.response?.status

        setError(
          status === 403
            ? { key: 'accessRequired' }
            : status === 401
              ? { key: 'sessionExpired' }
              : {
                  key: 'loadingError',
                  message: getApiErrorMessage(requestError, ''),
                },
        )
      } finally {
        if (current()) setLoading(false)
      }
    }

    loadAdminData()

    return () => {
      active = false
      controller.abort()
    }
  }, [user?.id, reload])

  function formatDate(value) {
    if (!value) return t('dateUnavailable')

    const date = new Date(value)

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString(language === 'sw' ? 'sw-KE' : 'en-KE')
  }

  function sexLabel(value) {
    if (value === 'M') return t('male')
    if (value === 'F') return t('female')
    return value || t('notRecorded')
  }

  function formatDay(value) {
    return new Date(`${value}T12:00:00`).toLocaleDateString(
      language === 'sw' ? 'sw-KE' : 'en-KE',
      { day: 'numeric', month: 'short', year: 'numeric' },
    )
  }

  function statusLabel(item) {
    if (isUrgent(item)) return t('urgentReview')
    const candidate = getCandidateHistoryDisplay(item, language)
    if (candidate) return candidate.label

    if (item.status === 'prediction_complete') return t('predictionComplete')
    return item.status?.replaceAll('_', ' ') || t('statusUnavailable')
  }

  function applyDates(event) {
    event.preventDefault()
    if ((from && !isCalendarDate(from)) || (to && !isCalendarDate(to)) || (from && to && from > to)) {
      setRangeError(true)
      return
    }
    setRangeError(false)
    setRange({ from, to })
  }

  function clearDates() {
    setFrom('')
    setTo('')
    setRange({ from: '', to: '' })
    setRangeError(false)
  }

  const rangeHistory = filterByDate(history, range)
  const rangeFeedback = filterByDate(feedback, range)
  const analytics = buildAdminAnalytics(rangeHistory, rangeFeedback)
  const { urgent: urgentCount, nonUrgent: nonUrgentCount, helpful: helpfulCount, notHelpful: notHelpfulCount } = analytics
  const ratedCount = helpfulCount + notHelpfulCount
  const helpfulPercent = ratedCount ? Math.round((helpfulCount / ratedCount) * 100) : null

  const sessions = rangeHistory
    .filter((item) => {
      const urgent = isUrgent(item)

      if (historyFilter === 'urgent' && !urgent) return false
      if (historyFilter === 'normal' && urgent) return false

      const candidate = getCandidateHistoryDisplay(item, language)
      const searchable = [
        item.user_id,
        item.prediction_id,
        item.input_text,
        !urgent && candidate
          ? candidate.prediction?.display_name
          : !urgent
            ? item.predictions?.[0]?.display_name
            : null,
      ].filter(Boolean).join(' ').toLowerCase()

      return searchable.includes(historySearch.trim().toLowerCase())
    })
    .sort(newestFirst)

  const visibleFeedback = rangeFeedback
    .filter((item) => (
      [item.comment, item.prediction_id, item.feedback_id]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(feedbackSearch.trim().toLowerCase())
    ))
    .sort(newestFirst)

  const ownerByPrediction = new Map(
    history.map((item) => [item.prediction_id, item.user_id]),
  )

  if (loading || error) {
    return (
      <section className="adm36-page">
        <div className="rc-container adm36-container">
          <div className="adm36-state" role={error ? 'alert' : 'status'}>
            <h1>{t(error ? 'dataUnavailable' : 'loading')}</h1>
            <p>
              {error
                ? error.message || t(error.key)
                : t('loadingDescription')}
            </p>
            {error && !['accessRequired', 'sessionExpired'].includes(error.key) && (
              <button type="button" className="button button-secondary" onClick={() => setReload((value) => value + 1)}>{m('retry')}</button>
            )}
          </div>
        </div>
      </section>
    )
  }

  const statistics = [
    ['savedSessions', rangeHistory.length, 'savedSessionsNote'],
    ['nonUrgent', nonUrgentCount, 'nonUrgentNote'],
    ['urgentReviews', urgentCount, 'urgentReviewsNote'],
    ['feedbackResponses', rangeFeedback.length, null],
  ]

  return (
    <section className="adm36-page" aria-labelledby="adm36-title">
      <div className="rc-container adm36-container">
        <header className="adm36-intro">
          <p className="adm36-eyebrow">{t('eyebrow')}</p>
          <h1 id="adm36-title">
            {t('title')} <span>{t('overview')}</span>
          </h1>
          <p>{m('intro')}</p>
        </header>

        <div className="adm71-toolbar">
          <p className="adm71-updated">{refreshedAt && m('updated', { time: formatDate(refreshedAt) })}</p>
          <div className="adm71-actions">
            <Link to="/admin/users" className="button button-secondary">{usersText('nav')}</Link>
            <button type="button" className="button button-secondary" onClick={() => setReload((value) => value + 1)}>{m('refresh')}</button>
          </div>
        </div>
        <section className="adm71-controls" aria-labelledby="adm71-dates-title">
          <div className="adm71-controls-heading">
            <div className="adm71-controls-title">
              <span className="adm71-calendar-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3" /></svg>
              </span>
              <div>
                <h2 id="adm71-dates-title">{m('dateRange')}</h2>
                <p>{m('filterSubtitle')}</p>
              </div>
            </div>
            <span className="adm71-window-badge">{m('recentWindow')}</span>
          </div>
          <span id="adm71-date-instructions" className="visually-hidden">{m('dateInstructions')}</span>
          <form onSubmit={applyDates} noValidate>
            <div className="adm71-field">
              <label htmlFor="adm71-from">{m('from')}</label>
              <input id="adm71-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} aria-describedby="adm71-date-instructions" aria-invalid={rangeError || undefined} />
            </div>
            <div className="adm71-field">
              <label htmlFor="adm71-to">{m('to')}</label>
              <input id="adm71-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} aria-describedby="adm71-date-instructions" aria-invalid={rangeError || undefined} />
            </div>
            <div className="adm71-actions">
              <button type="submit" className="button button-primary">{m('apply')}</button>
              <button type="button" className="button button-secondary" onClick={clearDates}>{m('clear')}</button>
            </div>
          </form>
          {rangeError && <p role="alert">{m('invalidRange')}</p>}
          <div className="adm71-filter-footer">
            <div className="adm71-filter-status" role="status" aria-live="polite" aria-atomic="true">
              <span className="adm71-range-badge">{range.from || range.to
                ? `${range.from ? formatDay(range.from) : m('earliest')} – ${range.to ? formatDay(range.to) : m('latest')}`
                : m('allDates')}</span>
              <span className="adm71-count-badge"><strong>{rangeHistory.length}</strong> {m('count')}</span>
              <span className="adm71-count-badge"><strong>{rangeFeedback.length}</strong> {t('feedbackResponses')}</span>
              <span className="visually-hidden">{m('filtered', { sessions: rangeHistory.length, feedback: rangeFeedback.length })}</span>
            </div>
            <details className="adm71-filter-help">
              <summary><span aria-hidden="true" className="adm71-info-icon">i</span>{m('filterHelp')}</summary>
              <div className="adm71-help-content">
                <p>{m('rangeHelp')}</p>
                <p>{m('scope')}</p>
              </div>
            </details>
          </div>
        </section>

        <div className="row g-3 adm36-stat-row" aria-label={t('statistics')}>
          {statistics.map(([label, value, note]) => (
            <div className="col-12 col-sm-6 col-xl-3" key={label}>
              <article
                className={`adm36-stat${label === 'urgentReviews' ? ' is-urgent' : ''}`}
              >
                <span>{t(label)}</span>
                <strong>{value}</strong>
                <p>
                  {note
                    ? t(note)
                    : helpfulPercent == null
                      ? t('noRatedFeedback')
                      : t('helpfulPercent', { percent: helpfulPercent })}
                </p>
              </article>
            </div>
          ))}
        </div>

        <AdminMonitoringCharts analytics={analytics} sessionCount={rangeHistory.length} feedbackCount={rangeFeedback.length} />

        <div className="adm36-tabs" role="group" aria-label={t('recordView')}>
          {['history', 'feedback'].map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={activeView === view}
              className={activeView === view ? 'is-active' : ''}
              onClick={() => setActiveView(view)}
            >
              {t(view === 'history' ? 'predictionHistory' : 'feedback')}
              {' '}
              <span>{view === 'history' ? rangeHistory.length : rangeFeedback.length}</span>
            </button>
          ))}
        </div>

        {activeView === 'history' ? (
          <section className="adm36-record-panel" aria-labelledby="adm36-history-heading">
            <div className="adm36-record-heading">
              <div>
                <p className="adm36-kicker">{t('allPatientSessions')}</p>
                <h2 id="adm36-history-heading">{t('predictionHistory')}</h2>
              </div>
              <div className="adm36-search">
                <label htmlFor="adm36-history-search">{t('searchSessions')}</label>
                <input
                  id="adm36-history-search"
                  className="form-control"
                  type="search"
                  placeholder={t('searchSessionsPlaceholder')}
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                />
              </div>
            </div>

            <div className="adm36-filters" role="group" aria-label={t('filterSessions')}>
              {[
                ['all', 'all'],
                ['normal', 'nonUrgentShort'],
                ['urgent', 'urgentReview'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={historyFilter === value}
                  className={historyFilter === value ? 'is-active' : ''}
                  onClick={() => setHistoryFilter(value)}
                >
                  {t(label)}
                </button>
              ))}
            </div>

            <p className="adm36-showing" role="status">
              {t('showingSessions', {
                visible: sessions.length,
                total: rangeHistory.length,
              })}
            </p>

            {sessions.length === 0 ? (
              <div className="adm36-empty">
                <strong>{t('noMatchingSessions')}</strong>
                <p>{t('changeFilter')}</p>
              </div>
            ) : (
              <div className="adm36-record-list">
                {sessions.map((item) => {
                  const urgent = isUrgent(item)
                  const candidate = getCandidateHistoryDisplay(item, language)
                  const prediction = urgent ? null : candidate
                    ? candidate.prediction
                    : item.predictions?.[0]

                  return (
                    <article
                      className={`adm36-record${urgent ? ' is-urgent' : ''}`}
                      key={item.prediction_id}
                    >
                      <div className="adm36-record-top">
                        <div>
                          <span className="adm36-date">{formatDate(item.created_at)}</span>
                          <h3>
                            {urgent
                              ? t('urgentSession')
                              : prediction?.display_name ||
                                candidate?.label ||
                                t('predictionSession')}
                          </h3>
                        </div>
                        <span className={`adm36-status${urgent ? ' is-urgent' : ''}`}>
                          {statusLabel(item)}
                        </span>
                      </div>

                      <div className="adm36-owner">
                        <span>{t('patientUserId')}</span>
                        <code>{item.user_id || t('legacySession')}</code>
                      </div>

                      <div className="adm36-description">
                        <strong>{t('originalDescription')}</strong>
                        <p>{item.input_text || t('noDescription')}</p>
                      </div>

                      <div className="adm36-details">
                        <div><span>{t('age')}</span><strong>{item.age ?? '—'}</strong></div>
                        <div><span>{t('sex')}</span><strong>{sexLabel(item.sex)}</strong></div>
                        <div>
                          <span>{t('confirmedSymptoms')}</span>
                          <strong>{item.confirmed_codes?.length ?? 0}</strong>
                        </div>
                      </div>

                      <div className="adm36-record-footer">
                        <code>{item.prediction_id}</code>
                        <Link
                          className="button button-secondary adm36-button"
                          to={`/admin/history/${encodeURIComponent(item.prediction_id)}`}
                        >
                          {t('viewSession')} →
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        ) : (
          <section className="adm36-record-panel" aria-labelledby="adm36-feedback-heading">
            <div className="adm36-record-heading">
              <div>
                <p className="adm36-kicker">{t('patientResponses')}</p>
                <h2 id="adm36-feedback-heading">{t('feedbackTitle')}</h2>
              </div>
              <div className="adm36-search">
                <label htmlFor="adm36-feedback-search">{t('searchFeedback')}</label>
                <input
                  id="adm36-feedback-search"
                  className="form-control"
                  type="search"
                  placeholder={t('feedbackPlaceholder')}
                  value={feedbackSearch}
                  onChange={(event) => setFeedbackSearch(event.target.value)}
                />
              </div>
            </div>

            <p className="adm36-showing" role="status">
              {t('showingFeedback', {
                visible: visibleFeedback.length,
                total: rangeFeedback.length,
              })}
            </p>

            {visibleFeedback.length === 0 ? (
              <div className="adm36-empty">
                <strong>{t('noMatchingFeedback')}</strong>
                <p>{t('noFeedbackDescription')}</p>
              </div>
            ) : (
              <div className="adm36-record-list">
                {visibleFeedback.map((item) => (
                  <article className="adm36-record" key={item.feedback_id}>
                    <div className="adm36-record-top">
                      <div>
                        <span className="adm36-date">{formatDate(item.created_at)}</span>
                        <h3>{t('patientFeedback')}</h3>
                      </div>
                      <span
                        className={`adm36-status${item.was_helpful === false ? ' is-negative' : ''}`}
                      >
                        {t(
                          item.was_helpful === true
                            ? 'helpful'
                            : item.was_helpful === false
                              ? 'notHelpful'
                              : 'noRating',
                        )}
                      </span>
                    </div>

                    <div className="adm36-owner">
                      <span>{t('patientUserId')}</span>
                      <code>{ownerByPrediction.get(item.prediction_id) || t('unavailable')}</code>
                    </div>

                    <div className="adm36-description">
                      <strong>{t('comment')}</strong>
                      <p>{item.comment || t('noComment')}</p>
                    </div>

                    <div className="adm36-record-footer">
                      <code>{t('feedbackId')}: {item.feedback_id}</code>
                      <Link
                        className="button button-secondary adm36-button"
                        to={`/admin/history/${encodeURIComponent(item.prediction_id)}`}
                      >
                        {t('openPrediction')} →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="adm36-bottom-note">
          <strong>{t('adminOnly')}</strong>
          <p>{t('privacyNote')}</p>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboardPage
