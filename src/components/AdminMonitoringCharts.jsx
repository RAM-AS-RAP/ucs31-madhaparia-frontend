import { useEffect, useId, useState } from 'react'
import { Chart } from '@highcharts/react'
import { Accessibility } from '@highcharts/react/modules/Accessibility'
import { useLanguage } from '../context/useLanguage'
import { useAdminText } from '../i18n/adminTranslations'
import { useAdminMonitoringText } from '../i18n/adminMonitoringTranslations'
import './AdminMonitoringCharts.css'

function useChartPalette() {
  const [palette, setPalette] = useState({ text: '#2d2933', muted: '#62596b', border: '#ded6e8', surface: '#ffffff', primary: '#70549a', secondary: '#a78bc7', urgent: '#b36b13' })
  useEffect(() => {
    function update() {
      const style = getComputedStyle(document.documentElement)
      const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback
      setPalette({
        text: read('--text', '#2d2933'), muted: read('--text-soft', '#62596b'),
        border: read('--border', '#ded6e8'), surface: read('--surface', '#ffffff'),
        primary: read('--rc-primary-hover', '#70549a'), secondary: read('--rc-lilac', '#a78bc7'),
        urgent: '#b36b13',
      })
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])
  return palette
}

function ChartCard({ title, description, subtitle, caution, empty, rows, columns, type = 'column', seriesName, palette, rowHeading = false }) {
  const id = useId()
  const m = useAdminMonitoringText()
  const pie = type === 'pie'
  const options = {
    chart: { type, backgroundColor: 'transparent', height: 300, animation: false,
      style: { fontFamily: 'inherit', fontSize: '1rem', color: palette.text },
      zooming: { type: type === 'line' ? 'x' : undefined } },
    title: { text: undefined }, credits: { enabled: false },
    colors: [palette.primary, palette.urgent, palette.secondary],
    legend: { enabled: pie || type === 'line', itemStyle: { color: palette.text, fontSize: '0.9rem' }, itemHiddenStyle: { color: palette.muted } },
    accessibility: { enabled: true, description, keyboardNavigation: { enabled: true } },
    xAxis: { categories: rows.map(([name]) => name), labels: { style: { color: palette.text, fontSize: '0.85rem' } }, lineColor: palette.border, tickColor: palette.border },
    yAxis: { min: 0, allowDecimals: false, title: { text: seriesName, style: { color: palette.text, fontSize: '0.85rem' } }, labels: { style: { color: palette.text } }, gridLineColor: palette.border },
    tooltip: { backgroundColor: palette.surface, borderColor: palette.border, style: { color: palette.text }, pointFormat: pie ? '<b>{point.y}</b> ({point.percentage:.1f}%)' : '<b>{point.y}</b>' },
    plotOptions: {
      series: { animation: false, dataLabels: { enabled: type !== 'line', color: palette.text, style: { textOutline: 'none', fontSize: '0.85rem' } } },
      pie: { innerSize: '66%', showInLegend: true, borderWidth: 2, borderColor: palette.surface, dataLabels: { enabled: false } },
      column: { borderWidth: 0, borderRadius: 3 }, bar: { borderWidth: 0, borderRadius: 3 },
      line: { lineWidth: 3, marker: { enabled: rows.length <= 35, radius: 4 } },
    },
    series: [{ type, name: seriesName, color: palette.primary, data: rows.map(([name, y], index) => ({ name, y, ...(pie ? { color: [palette.primary, palette.urgent, palette.secondary][index % 3] } : {}) })) }],
    responsive: { rules: [{ condition: { maxWidth: 450 }, chartOptions: { chart: { height: 280 }, legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' } } }] },
    lang: { accessibility: { chartContainerLabel: title, svgContainerLabel: title, defaultChartTitle: title } },
  }
  return (
    <section className="adm36-chart-panel adm71-card" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {subtitle && <p className="adm71-chart-subtitle">{subtitle}</p>}
      {caution && <p className="adm71-chart-caution">{caution}</p>}
      {rows.length === 0 ? <p className="adm36-chart-empty">{empty}</p> : <>
        <div className="adm36-chart" aria-label={title}>
          <Chart options={options}><Accessibility /></Chart>
        </div>
      </>}
      <div className="adm71-chart-footer">
        <details className="adm71-chart-info">
          <summary>{m('chartInfo')}<span className="visually-hidden">: {title}</span></summary>
          <p id={`${id}-description`}>{description}</p>
        </details>
        {rows.length > 0 && <details className="adm71-data">
          <summary>{m('viewData')}<span className="visually-hidden">: {title}</span></summary>
          <div className="adm71-table-scroll" tabIndex={0} role="region" aria-label={title}>
            <table>
              <caption>{title}</caption>
              <thead><tr><th scope="col">{columns[0]}</th><th scope="col">{columns[1]}</th></tr></thead>
              <tbody>{rows.map(([label, count], index) => <tr key={index}>
                {rowHeading ? <th scope="row">{label}</th> : <td>{label}</td>}<td>{count}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </details>}
      </div>
    </section>
  )
}

export default function AdminMonitoringCharts({ analytics: a, sessionCount, feedbackCount }) {
  const t = useAdminText()
  const m = useAdminMonitoringText()
  const { language } = useLanguage()
  const palette = useChartPalette()
  const locale = language === 'sw' ? 'sw-KE' : 'en-KE'
  const timelineRows = a.timeline.rows.map(([key, count]) => {
    const date = new Date(`${key.length === 4 ? `${key}-01-01` : key.length === 7 ? `${key}-01` : key}T12:00:00`)
    return [date.toLocaleDateString(locale, a.timeline.granularity === 'day'
      ? { year: 'numeric', month: 'short', day: 'numeric' }
      : a.timeline.granularity === 'month' ? { year: 'numeric', month: 'short' } : { year: 'numeric' }), count]
  })
  return <>
    <div className="adm71-chart-toolbar">
      <h2>{m('charts')}</h2>
      <details className="adm71-chart-guide"><summary>{m('chartControls')}</summary><p>{m('keyboard')}</p></details>
    </div>
    <div className="adm71-grid">
      <ChartCard title={t('assessmentRoutes')} description={t('basedOnRecords')} empty={t('noChartSessions')}
        subtitle={`${sessionCount} ${m('count')}`}
        type="pie" rows={sessionCount ? [[t('nonUrgentShort'), a.nonUrgent], [t('urgentReview'), a.urgent]] : []}
        columns={[m('category'), m('count')]} seriesName={m('count')} palette={palette} />
      <ChartCard title={t('feedbackOverview')} description={m('feedbackNote')} empty={m('noFeedback')}
        subtitle={`${feedbackCount} ${m('feedbackCount')}`}
        rows={feedbackCount ? [[t('helpful'), a.helpful], [t('notHelpful'), a.notHelpful], [t('noRating'), a.unrated]] : []}
        columns={[m('category'), m('feedbackCount')]} seriesName={m('feedbackCount')} palette={palette} />
      <ChartCard title={m('timeline')} description={`${m('timelineNote')} ${m(a.timeline.granularity)}. ${m('undated', { count: a.undated })}`}
        subtitle={m(a.timeline.granularity)}
        empty={m('noTimeline')} type="line" rows={timelineRows}
        columns={[m('period'), m('count')]} seriesName={m('count')} palette={palette} />
      <ChartCard title={m('conditions')} description={m('conditionNote', { count: a.published })} empty={m('noConditions')}
        subtitle={m('resultCount', { count: a.published })}
        type="bar" rows={a.conditions.slice(0, 10).map((item) => [item.name, item.count])}
        columns={[m('condition'), m('count')]} seriesName={m('count')} palette={palette} rowHeading />
      <ChartCard title={m('confidence')} description={m('confidenceNote', { scored: a.scored, published: a.published })} empty={m('noScores')}
        subtitle={m('scoreCoverage', { scored: a.scored, published: a.published })} caution={m('scoreCaution')}
        rows={a.scored ? a.confidence.map((count, index) => [m(`bins${index}`), count]) : []}
        columns={[m('score'), m('count')]} seriesName={m('count')} palette={palette} />
      <ChartCard title={m('nlp')} description={m('nlpNote', { available: a.nlpAvailable, total: sessionCount })} empty={m('noNlp')}
        subtitle={m('nlpCoverage', { available: a.nlpAvailable, total: sessionCount })} caution={m('nlpCaution')}
        type="bar" rows={a.nlpAvailable ? a.nlp.map((count, index) => [m(['confirmed', 'unmatched', 'unsupported', 'clarification'][index]), count]) : []}
        columns={[m('category'), m('count')]} seriesName={m('count')} palette={palette} />
    </div>
  </>
}
