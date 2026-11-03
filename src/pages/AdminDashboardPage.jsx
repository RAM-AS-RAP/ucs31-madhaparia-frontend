import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chart } from '@highcharts/react'
import { PieSeries } from '@highcharts/react/series/Pie'
import { ColumnSeries } from '@highcharts/react/series/Column'
import { Accessibility } from '@highcharts/react/modules/Accessibility'

import { getAdminFeedback, getAdminHistory } from '../services/admin'
import { getApiErrorMessage } from '../services/api'
import { useLanguage } from '../context/useLanguage'
import { useAdminText } from '../i18n/adminTranslations'
import { getCandidateHistoryDisplay } from '../utils/candidateHistory'

const PURPLE = '#70549a'
const LILAC = '#a78bc7'
const AMBER = '#c18535'

const baseChart = {
  chart: {
    backgroundColor: 'transparent',
    height: 280,
    animation: false,
  },
  title: { text: undefined },
  legend: { enabled: false },
  plotOptions: { series: { animation: false } },
}

function isUrgent(item) {
  return (
    item.status === 'urgent_review' ||
    item.has_red_flag === true ||
    item.assessment?.status === 'safety_review_required'
  )
}

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

  const [history, setHistory] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('history')
  const [historyFilter, setHistoryFilter] = useState('all')
  const [historySearch, setHistorySearch] = useState('')
  const [feedbackSearch, setFeedbackSearch] = useState('')

  useEffect(() => {
    let active = true

    async function loadAdminData() {
      try {
        const [historyResponse, feedbackResponse] = await Promise.all([
          getAdminHistory(),
          getAdminFeedback(),
        ])

        if (!active) return

        setHistory(
          Array.isArray(historyResponse?.history)
            ? historyResponse.history
            : [],
        )
        setFeedback(
          Array.isArray(feedbackResponse?.feedback)
            ? feedbackResponse.feedback
            : [],
        )
      } catch (requestError) {
        if (!active) return

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
        if (active) setLoading(false)
      }
    }

    loadAdminData()

    return () => {
      active = false
    }
  }, [])

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

  function statusLabel(item) {
    const candidate = getCandidateHistoryDisplay(item, language)
    if (candidate) return candidate.label

    if (isUrgent(item)) return t('urgentReview')
    if (item.status === 'prediction_complete') return t('predictionComplete')
    return item.status?.replaceAll('_', ' ') || t('statusUnavailable')
  }

  const urgentCount = history.filter(isUrgent).length
  const nonUrgentCount = history.length - urgentCount
  const helpfulCount = feedback.filter(
    (item) => item.was_helpful === true,
  ).length
  const notHelpfulCount = feedback.filter(
    (item) => item.was_helpful === false,
  ).length
  const ratedCount = helpfulCount + notHelpfulCount
  const helpfulPercent = ratedCount
    ? Math.round((helpfulCount / ratedCount) * 100)
    : null

  const sessions = history
    .filter((item) => {
      const urgent = isUrgent(item)

      if (historyFilter === 'urgent' && !urgent) return false
      if (historyFilter === 'normal' && urgent) return false

      const candidate = getCandidateHistoryDisplay(item, language)
      const searchable = [
        item.user_id,
        item.prediction_id,
        item.input_text,
        candidate
          ? candidate.prediction?.display_name
          : !urgent
            ? item.predictions?.[0]?.display_name
            : null,
      ].filter(Boolean).join(' ').toLowerCase()

      return searchable.includes(historySearch.trim().toLowerCase())
    })
    .sort(newestFirst)

  const visibleFeedback = feedback
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
          </div>
        </div>
      </section>
    )
  }

  const statistics = [
    ['savedSessions', history.length, 'savedSessionsNote'],
    ['nonUrgent', nonUrgentCount, 'nonUrgentNote'],
    ['urgentReviews', urgentCount, 'urgentReviewsNote'],
    ['feedbackResponses', feedback.length, null],
  ]

  return (
    <section className="adm36-page" aria-labelledby="adm36-title">
      <div className="rc-container adm36-container">
        <header className="adm36-intro">
          <p className="adm36-eyebrow">{t('eyebrow')}</p>
          <h1 id="adm36-title">
            {t('title')} <span>{t('overview')}</span>
          </h1>
          <p>{t('intro')}</p>
        </header>

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

        <div className="row g-4 adm36-charts">
          <div className="col-12 col-lg-6">
            <section
              className="adm36-chart-panel"
              aria-labelledby="adm36-outcomes-title"
            >
              <p className="adm36-kicker">{t('sessionOutcomes')}</p>
              <h2 id="adm36-outcomes-title">{t('assessmentRoutes')}</h2>
              <p>{t('basedOnRecords')}</p>

              {history.length === 0 ? (
                <p className="adm36-chart-empty">{t('noChartSessions')}</p>
              ) : (
                <>
                  <div className="adm36-chart" aria-label={t('sessionChartLabel')}>
                    <Chart options={{
                      ...baseChart,
                      tooltip: { pointFormat: `<b>{point.y}</b> ${t('sessions')}` },
                      plotOptions: {
                        series: { animation: false },
                        pie: {
                          innerSize: '65%',
                          dataLabels: { enabled: false },
                          borderWidth: 0,
                        },
                      },
                    }}>
                      <Accessibility />
                      <PieSeries name={t('sessions')} data={[
                        { name: t('nonUrgentShort'), y: nonUrgentCount, color: PURPLE },
                        { name: t('urgentReview'), y: urgentCount, color: AMBER },
                      ]} />
                    </Chart>
                  </div>

                  <div className="adm36-key">
                    <span>
                      <i className="adm36-dot" />
                      {t('nonUrgentShort')}: {nonUrgentCount}
                    </span>
                    <span>
                      <i className="adm36-dot is-amber" />
                      {t('urgent')}: {urgentCount}
                    </span>
                  </div>
                </>
              )}
            </section>
          </div>

          <div className="col-12 col-lg-6">
            <section
              className="adm36-chart-panel"
              aria-labelledby="adm36-feedback-title"
            >
              <p className="adm36-kicker">{t('patientResponses')}</p>
              <h2 id="adm36-feedback-title">{t('feedbackOverview')}</h2>
              <p>{t('feedbackChartDescription')}</p>

              {ratedCount === 0 ? (
                <p className="adm36-chart-empty">{t('noChartFeedback')}</p>
              ) : (
                <>
                  <div className="adm36-chart" aria-label={t('feedbackChartLabel')}>
                    <Chart options={{
                      ...baseChart,
                      chart: { ...baseChart.chart, type: 'column' },
                      xAxis: { categories: [t('helpful'), t('notHelpful')] },
                      yAxis: {
                        min: 0,
                        allowDecimals: false,
                        title: { text: t('responses') },
                      },
                      tooltip: { pointFormat: `<b>{point.y}</b> ${t('responses')}` },
                      plotOptions: {
                        series: { animation: false },
                        column: { borderWidth: 0, borderRadius: 4 },
                      },
                    }}>
                      <Accessibility />
                      <ColumnSeries name={t('feedback')} data={[
                        { y: helpfulCount, color: PURPLE },
                        { y: notHelpfulCount, color: LILAC },
                      ]} />
                    </Chart>
                  </div>

                  <p className="adm36-chart-summary">
                    {t('responseCount', {
                      helpful: helpfulCount,
                      notHelpful: notHelpfulCount,
                    })}
                  </p>
                </>
              )}
            </section>
          </div>
        </div>

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
              <span>{view === 'history' ? history.length : feedback.length}</span>
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
                total: history.length,
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
                  const prediction = candidate
                    ? candidate.prediction
                    : !urgent
                      ? item.predictions?.[0]
                      : null

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
                total: feedback.length,
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