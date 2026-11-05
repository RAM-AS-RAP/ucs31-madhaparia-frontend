import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AccountManagementDialog from '../components/AccountManagementDialog'
import { useAuth } from '../context/useAuth'
import { useLanguage } from '../context/useLanguage'
import { useAdminSystemText } from '../i18n/adminSystemTranslations'
import { getAuthToken } from '../services/authToken'
import { addSymptomAlias, getSystemSection, removeSymptomAlias, saveSystemRecord, systemError } from '../services/adminSystem'
import { recordedMetrics } from '../utils/modelMetrics'
import './AdminUsersPage.css'
import './AdminSystemPage.css'

const sections = ['model', 'symptoms', 'diseases', 'feedback', 'nlp', 'activity']

function MetricTable({ values }) {
  const t = useAdminSystemText()
  const rows = recordedMetrics(values)
  return rows.length ? <div className="s73-table-scroll" tabIndex={0} role="region" aria-label={t('metrics')}>
    <table><thead><tr><th scope="col">{t('metric')}</th><th scope="col">{t('value')}</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>)}</tbody></table>
  </div> : <p>{t('noMetrics')}</p>
}

function ModelPanel({ data }) {
  const t = useAdminSystemText()
  const model = data.model
  return <div className="s73-model">
    <article className="s73-model-hero">
      <span className={`s73-badge ${data.state === 'ready' ? 'is-good' : 'is-warning'}`}>{t(data.state)}</span>
      <p className="s73-kicker">{t('activeModel')}</p>
      <h2>{model?.name || t(data.state)}</h2>
      {model && <><p className="s73-version">{t('version')} {model.version}</p>
        <div className="s73-stats">{[['features', model.feature_count], ['conditions', model.class_count], ['training', model.training_samples], ['validation', model.validation_samples], ['test', model.test_samples]].map(([key, value]) =>
          <div key={key}><strong>{Number(value).toLocaleString()}</strong><span>{t(key)}</span></div>)}</div></>}
    </article>
    {model && <>
      <p className="s73-note">{t('metricHelp')}</p>
      <div className="s73-evaluations">{['validation', 'test'].map((split) => <article className="s73-panel" key={split}>
        <h2>{t(split)}</h2><MetricPreview values={model[`${split}_metrics`]} />
      </article>)}</div>
      {Object.keys(model.sample_count_definitions || {}).length > 0 && <details className="s73-help"><summary>{t('sampleScope')}</summary>
        <dl>{Object.entries(model.sample_count_definitions).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{value}</dd></div>)}</dl>
      </details>}
    </>}
  </div>
}

function MetricPreview({ values }) {
  const t = useAdminSystemText()
  const highlights = recordedMetrics(values).filter((row) => /accuracy|macro f1|weighted f1|research target assessment|evaluated|verification status/.test(row.label)).slice(0, 3)
  return <><dl className="s73-metric-preview">{highlights.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
    <details className="s73-help"><summary>{t('metrics')}</summary><MetricTable values={values} /></details></>
}

function RecordEditor({ section, record, busy, error, onClose, onSave }) {
  const t = useAdminSystemText()
  const [values, setValues] = useState({ display_name: record.display_name || '', short_description: record.short_description || '', review_note: record.review_note || '', review_status: record.review_status || 'pending' })
  const field = (key, label, maxLength, minLength = 0, multiline = false) => <div className="u72-field">
    <label htmlFor={`s73-${key}`}>{t(label)}</label>
    {multiline ? <textarea id={`s73-${key}`} maxLength={maxLength} minLength={minLength} required={minLength > 0} rows={5} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /> :
      <input id={`s73-${key}`} maxLength={maxLength} minLength={minLength} required={minLength > 0} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />}
  </div>
  function submit(event) {
    event.preventDefault()
    if (busy) return
    const payload = section === 'diseases' ? { display_name: values.display_name.trim(), short_description: values.short_description.trim() } :
      { review_note: values.review_note.trim(), ...(section === 'feedback' ? { review_status: values.review_status } : {}) }
    onSave(payload)
  }
  return <AccountManagementDialog title={t(section === 'feedback' ? 'review' : 'edit')} busy={busy} onClose={onClose}>
    <p className="u72-target">{record.display_name || record.comment || t('noComment')}</p>
    {error && <p role="alert" className="u72-error">{t(error)}</p>}
    <form onSubmit={submit}><fieldset disabled={busy}>
      {section === 'diseases' ? <>{field('display_name', 'name', 255, 2)}{field('short_description', 'description', 2000, 10, true)}<p className="s73-note">{t('contentHelp')}</p></> :
        <>{section === 'feedback' && <div className="u72-field"><label htmlFor="s73-review-status">{t('status')}</label><select id="s73-review-status" value={values.review_status} onChange={(event) => setValues({ ...values, review_status: event.target.value })}>
          {['pending', 'reviewed', 'resolved'].map((status) => <option key={status} value={status}>{t(status)}</option>)}
        </select></div>}{field('review_note', 'note', 1000, 0, true)}</>}
    </fieldset><div className="u72-dialog-actions"><button type="button" className="button button-secondary" disabled={busy} onClick={onClose}>{t('cancel')}</button>
      <button className="button button-primary" disabled={busy}>{t(busy ? 'working' : 'save')}</button></div></form>
  </AccountManagementDialog>
}

function AliasEditor({ record, busy, error, onClose, onAdd, onRemove }) {
  const t = useAdminSystemText()
  const [alias, setAlias] = useState('')
  const [language, setLanguage] = useState('en')
  const [confirmed, setConfirmed] = useState(false)
  const [removing, setRemoving] = useState(null)
  return <AccountManagementDialog title={`${t('aliases')}: ${record.display_name}`} busy={busy} onClose={onClose} focusTitle>
    <p className="s73-note">{t('aliasHelp')}</p>
    {error && <p role="alert" className="u72-error">{t(error)}</p>}
    <ul className="s73-alias-list">{record.aliases.map((item) => <li key={item.id}><div><strong>{item.alias}</strong><span>{item.language === 'sw' ? 'Kiswahili' : 'English'} · {t(item.protected ? 'baseline' : 'custom')}</span></div>
      {!item.protected && <button type="button" className="u72-text-button" disabled={busy} onClick={() => setRemoving(item)} aria-label={`${t('remove')}: ${item.alias}`}>{t('remove')}</button>}
    </li>)}</ul>
    {removing && <div className="s73-remove-confirm"><p>{t('confirmRemove')} <strong>{removing.alias}</strong></p>
      <button className="button button-secondary" disabled={busy} onClick={() => setRemoving(null)}>{t('cancel')}</button>{' '}
      <button className="button u72-danger-button" disabled={busy} onClick={() => onRemove(removing)}>{t('remove')}</button></div>}
    <form onSubmit={(event) => { event.preventDefault(); if (!busy && confirmed && alias.trim().length >= 2) onAdd(alias.trim(), language) }}>
      <fieldset disabled={busy}><div className="u72-field"><label htmlFor="s73-alias">{t('alias')}</label><input id="s73-alias" value={alias} minLength={2} maxLength={100} required onChange={(event) => { setAlias(event.target.value); setConfirmed(false) }} /></div>
        <div className="u72-field"><label htmlFor="s73-language">{t('language')}</label><select id="s73-language" value={language} onChange={(event) => setLanguage(event.target.value)}><option value="en">English</option><option value="sw">Kiswahili</option></select></div>
        <label className="s73-checkbox"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />{t('confirmMeaning')}</label>
      </fieldset><div className="u72-dialog-actions"><button type="button" className="button button-secondary" disabled={busy} onClick={onClose}>{t('cancel')}</button><button className="button button-primary" disabled={busy || !confirmed || alias.trim().length < 2}>{t(busy ? 'working' : 'addAlias')}</button></div>
    </form>
  </AccountManagementDialog>
}

function SystemSection({ section }) {
  const t = useAdminSystemText()
  const { language } = useLanguage()
  const [params, setParams] = useState({ page: 1, ...(section === 'nlp' ? { source: 'events' } : {}) })
  const [search, setSearch] = useState('')
  const [reload, setReload] = useState(0)
  const [snapshot, setSnapshot] = useState(null)
  const [editor, setEditor] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mutation = useRef(null)
  const noticeRef = useRef(null)
  const queryKey = JSON.stringify([section, params, reload])
  const ready = snapshot?.key === queryKey
  const data = ready ? snapshot.data : null
  const loadError = ready ? snapshot.error : ''
  useEffect(() => {
    const controller = new AbortController()
    const token = getAuthToken()
    let active = true
    const current = () => active && !controller.signal.aborted && getAuthToken() === token
    getSystemSection(section, params, { signal: controller.signal }).then((result) => {
      if (!current()) return
      const pages = Math.max(1, Math.ceil((result.total || 0) / 12))
      if (params.page > pages) { setParams((value) => ({ ...value, page: pages })); return }
      setSnapshot({ key: queryKey, data: result, error: '' })
    }).catch((requestError) => { if (current()) setSnapshot({ key: queryKey, data: null, error: systemError(requestError) }) })
    return () => { active = false; controller.abort() }
  }, [section, params, queryKey])
  useEffect(() => () => mutation.current?.abort(), [])
  useEffect(() => { if (notice) noticeRef.current?.focus() }, [notice])

  async function mutate(operation) {
    if (mutation.current) return
    const controller = new AbortController()
    const token = getAuthToken()
    mutation.current = controller
    setBusy(true); setError(''); setNotice('')
    try {
      await operation(controller.signal)
      if (controller.signal.aborted || getAuthToken() !== token) return
      setEditor(null); setNotice('saved'); setReload((value) => value + 1)
    } catch (requestError) {
      if (controller.signal.aborted || getAuthToken() !== token) return
      const key = systemError(requestError)
      setError(key)
      if (key === 'record_changed' || key === 'record_not_found') {
        setEditor(null); setNotice(key); setReload((value) => value + 1)
      }
    } finally {
      if (!controller.signal.aborted && getAuthToken() === token) { setBusy(false); mutation.current = null }
    }
  }
  function filter(key, value) {
    setParams((previous) => { const next = { ...previous, [key]: value, page: 1 }; if (value === '') delete next[key]; return next })
  }
  const date = (value) => value ? new Date(value).toLocaleString(language === 'sw' ? 'sw-KE' : 'en-KE') : '—'
  const open = (record, mode = 'edit') => { setError(''); setEditor({ record, mode }) }
  const resultCard = (row) => {
    if (section === 'symptoms') return <article className="s73-card" key={row.id}>
      <div className="s73-card-top"><span className="s73-code">{row.code}</span>{row.is_red_flag && <span className="s73-badge is-warning">{t('safety')}</span>}</div>
      <h2>{row.display_name}</h2><p className="s73-note">{row.aliases.length} {t('aliases').toLowerCase()}</p>
      {row.review_note && <p className="s73-excerpt">{row.review_note}</p>}
      <div className="s73-actions"><button className="button button-secondary" onClick={() => open(row, 'aliases')}>{t('manage')}</button><button className="u72-text-button" onClick={() => open(row)}>{t('note')}</button></div>
    </article>
    if (section === 'diseases') return <article className="s73-card" key={row.condition}><h2>{row.display_name}</h2><p className="s73-code">{row.condition}</p><p className="s73-excerpt">{row.short_description}</p><div className="s73-actions"><button className="button button-secondary" onClick={() => open(row)}>{t('edit')}</button></div></article>
    if (section === 'feedback') return <article className="s73-card" key={row.id}>
      <div className="s73-card-top"><span className={`s73-badge ${row.was_helpful ? 'is-good' : 'is-warning'}`}>{t(row.was_helpful ? 'helpful' : 'unhelpful')}</span><span className="s73-badge">{t(row.review_status)}</span></div>
      <h2 className="s73-visually-hidden">{t('patientComment')}</h2><p className="s73-excerpt">{row.comment || t('noComment')}</p><time>{date(row.created_at)}</time>
      {row.review_note && <details><summary>{t('note')}</summary><p>{row.review_note}</p><small>{date(row.reviewed_at)}</small></details>}
      <div className="s73-actions"><button className="button button-secondary" onClick={() => open(row)}>{t('review')}</button><Link to={`/admin/history/${row.prediction_id}`}>{t('viewSession')}</Link></div>
    </article>
    if (section === 'nlp') return <article className="s73-card" key={row.id}><span className="s73-badge is-warning">{t(row.kind)}</span><time>{date(row.created_at)}</time>
      {row.prediction_id ? <><div className="s73-tags">{(row.unsupported_symptoms || []).map((code) => <span className="s73-badge" key={code}>{code}</span>)}</div>
        {(row.unmatched_wording || []).length > 0 && <details><summary>{t('unmatched_wording')}</summary><ul>{row.unmatched_wording.map((item, index) => <li key={index}>{typeof item === 'string' ? item : item.unmatched_text || '—'}</li>)}</ul></details>}
        <Link className="s73-actions" to={`/admin/history/${row.prediction_id}`}>{t('viewSession')}</Link></> :
        row.kind === 'mapping_error' ? <p className="s73-note">{t('mappingFailedHelp')}</p> : <div className="s73-counts"><span>{t('recognised')}: <strong>{row.recognised_count}</strong></span><span>{t('unmatched')}: <strong>{row.unmatched_count}</strong></span></div>}
    </article>
    return <article className="s73-activity" key={row.id}><div className="s73-activity-dot" aria-hidden="true" /><div><h2>{t(row.action)}</h2><p>{t(row.target_type)} · <span>{row.target_id}</span></p>
      <details><summary>{t('actor')}</summary><p>{row.actor_user_id || '—'}</p></details></div><time>{date(row.created_at)}</time></article>
  }
  const pages = Math.max(1, Math.ceil((data?.total || 0) / 12))
  return <>
    <div className="s73-section-heading"><h2>{t(section)}</h2><button className="button button-secondary" disabled={!ready || busy} onClick={() => { setNotice(''); setReload((value) => value + 1) }}>{t('refresh')}</button></div>
    {['symptoms', 'diseases', 'feedback'].includes(section) && <form className="s73-filters" onSubmit={(event) => { event.preventDefault(); filter('q', search.trim()) }}>
      <div className="u72-field"><label htmlFor="s73-search">{t('searchLabel')}</label><input id="s73-search" maxLength={100} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      {section === 'feedback' && <><div className="u72-field"><label htmlFor="s73-status">{t('status')}</label><select id="s73-status" value={params.status || ''} onChange={(event) => filter('status', event.target.value)}><option value="">{t('all')}</option>{['pending', 'reviewed', 'resolved'].map((status) => <option value={status} key={status}>{t(status)}</option>)}</select></div>
        <div className="u72-field"><label htmlFor="s73-rating">{t('rating')}</label><select id="s73-rating" value={params.helpful ?? ''} onChange={(event) => filter('helpful', event.target.value)}><option value="">{t('all')}</option><option value="true">{t('helpful')}</option><option value="false">{t('unhelpful')}</option></select></div></>}
      <button className="button button-primary">{t('search')}</button>
    </form>}
    {section === 'nlp' && <div className="s73-filters"><div className="u72-field"><label htmlFor="s73-source">{t('source')}</label><select id="s73-source" value={params.source} onChange={(event) => setParams({ source: event.target.value, page: 1 })}><option value="events">{t('events')}</option><option value="assessments">{t('assessments')}</option></select></div>
      {params.source === 'events' && <div className="u72-field"><label htmlFor="s73-kind">{t('kind')}</label><select id="s73-kind" value={params.kind || ''} onChange={(event) => filter('kind', event.target.value)}><option value="">{t('all')}</option>{['mapping_error', 'no_match', 'unmatched_wording'].map((kind) => <option value={kind} key={kind}>{t(kind)}</option>)}</select></div>}
    </div>}
    {section === 'symptoms' && <details className="s73-help"><summary>{t('frozen')}</summary><p>{t('frozenHelp')}</p></details>}
    {section === 'nlp' && <details className="s73-help"><summary>{t('details')}</summary><p>{t('nlpHelp')}</p></details>}
    {section === 'activity' && <p className="s73-note">{t('auditHelp')}</p>}
    {notice && <p className="u72-notice" role="status" tabIndex={-1} ref={noticeRef}>{t(notice)}</p>}
    {!ready ? <p className="u72-state" role="status">{t('loading')}</p> : loadError ? <div className="u72-state" role="alert"><p>{t(loadError)}</p><button className="button button-secondary" onClick={() => setReload((value) => value + 1)}>{t('retry')}</button></div> : section === 'model' ? <ModelPanel data={data} /> : <>
      <p className="s73-results" role="status">{t('total', { count: data.total })}</p>
      {data.items.length ? <div className={section === 'activity' ? 's73-timeline' : 's73-grid'}>{data.items.map(resultCard)}</div> : <div className="u72-state"><h3>{t('empty')}</h3><p>{t('emptyHelp')}</p></div>}
      <nav className="u72-pagination" aria-label={t('page', { page: params.page, pages })}><button className="button button-secondary" disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}>{t('previous')}</button><span>{t('page', { page: params.page, pages })}</span><button className="button button-secondary" disabled={params.page >= pages} onClick={() => setParams({ ...params, page: params.page + 1 })}>{t('next')}</button></nav>
    </>}
    {editor && (editor.mode === 'aliases' ? <AliasEditor record={editor.record} busy={busy} error={error} onClose={() => setEditor(null)}
      onAdd={(alias, lang) => mutate((signal) => addSymptomAlias(editor.record, alias, lang, { signal }))}
      onRemove={(alias) => mutate((signal) => removeSymptomAlias(editor.record, alias, { signal }))} /> :
      <RecordEditor section={section} record={editor.record} busy={busy} error={error} onClose={() => setEditor(null)} onSave={(payload) => mutate((signal) => saveSystemRecord(section, editor.record, payload, { signal }))} />)}
  </>
}

export default function AdminSystemPage() {
  const t = useAdminSystemText()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const section = sections.includes(searchParams.get('section')) ? searchParams.get('section') : 'model'
  return <section className="rc-container u72-page s73-page"><header className="u72-heading"><div><p className="u72-eyebrow">RespiraCare</p><h1>{t('title')}</h1><p>{t('intro')}</p></div><Link className="button button-secondary" to="/admin">{t('dashboard')}</Link></header>
    <nav className="s73-sections" aria-label={t('title')}>{sections.map((key) => <button key={key} className={key === section ? 'is-active' : ''} aria-current={key === section ? 'page' : undefined} onClick={() => setSearchParams({ section: key })}>{t(key)}</button>)}</nav>
    <SystemSection key={`${user?.id}:${section}`} section={section} />
  </section>
}
