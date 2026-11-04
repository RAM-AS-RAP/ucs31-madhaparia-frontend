import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AccountManagementDialog from '../components/AccountManagementDialog'
import { useAuth } from '../context/useAuth'
import { useLanguage } from '../context/useLanguage'
import { useAccountText } from '../i18n/accountTranslations'
import { useAdminUsersText } from '../i18n/adminUsersTranslations'
import { getAuthToken } from '../services/authToken'
import { addAdminUser, adminUserError, changeAdminUserStatus, deleteAdminUser, getAdminUsers } from '../services/adminUsers'
import { profilePayload, validateRegistration } from '../utils/accountValidation'
import './AdminUsersPage.css'

function CreateAccount({ busy, error, onClose, onCreate }) {
  const t = useAdminUsersText()
  const a = useAccountText()
  const [values, setValues] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [attempted, setAttempted] = useState(false)
  const errors = validateRegistration(values)
  function submit(event) {
    event.preventDefault()
    if (busy) return
    setAttempted(true)
    const invalid = Object.keys(errors)[0]
    if (invalid) {
      event.currentTarget.querySelector(`#u72-${invalid}`)?.focus()
      return
    }
    onCreate({ email: values.email.trim().toLowerCase(), password: values.password, ...profilePayload(values.fullName, values.phoneNumber) })
  }
  const fields = [
    ['fullName', a('fullName'), 'text', 'name', 200],
    ['email', a('email'), 'email', 'email', 254],
    ['phoneNumber', a('phoneNumber'), 'tel', 'tel', 64],
    ['password', t('password'), 'password', 'new-password', 128],
    ['confirmPassword', t('confirmPassword'), 'password', 'new-password', 128],
  ]
  return <AccountManagementDialog title={t('create')} busy={busy} onClose={onClose}>
    <p className="u72-dialog-intro">{t('createHelp')}</p>
    {error && <p className="u72-error" role="alert">{t(error)}</p>}
    <form onSubmit={submit} noValidate>
      <fieldset disabled={busy}>
        {fields.map(([key, label, type, autoComplete, maxLength]) => <div className="u72-field" key={key}>
          <label htmlFor={`u72-${key}`}>{label}</label>
          <input id={`u72-${key}`} type={type} autoComplete={autoComplete} maxLength={maxLength}
            required={key !== 'phoneNumber'} value={values[key]} autoFocus={key === 'fullName'}
            aria-invalid={attempted && Boolean(errors[key]) || undefined}
            aria-describedby={attempted && errors[key] ? `u72-${key}-error` : undefined}
            onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />
          {attempted && errors[key] && <p className="u72-field-error" id={`u72-${key}-error`}>{a(errors[key])}</p>}
        </div>)}
      </fieldset>
      <div className="u72-dialog-actions">
        <button type="button" className="button button-secondary" disabled={busy} onClick={onClose}>{t('cancel')}</button>
        <button type="submit" className="button button-primary" disabled={busy}>{t(busy ? 'working' : 'create')}</button>
      </div>
    </form>
  </AccountManagementDialog>
}

function ManageAccount({ account, busy, error, onClose, onStatus, onDelete }) {
  const t = useAdminUsersText()
  return <AccountManagementDialog title={t('manage')} busy={busy} onClose={onClose} focusTitle>
    <p className="u72-target"><strong>{account.full_name || t('unnamed')}</strong><span>{account.email}</span></p>
    {error && <p className="u72-error" role="alert">{t(error)}</p>}
    <div className="u72-access-row">
      <div><h3>{t(account.is_active ? 'active' : 'inactive')}</h3><p>{t('activationHelp')}</p></div>
      <button type="button" className="button button-secondary" disabled={busy} onClick={() => onStatus(account.is_active ? 'deactivate' : 'activate')}>{t(account.is_active ? 'deactivate' : 'activate')}</button>
    </div>
    <div className="u72-access-row">
      <div><h3>{t(account.is_blocked ? 'blocked' : 'unblocked')}</h3><p>{t('blockHelp')}</p></div>
      <button type="button" className="button button-secondary" disabled={busy} onClick={() => onStatus(account.is_blocked ? 'unblock' : 'block')}>{t(account.is_blocked ? 'unblock' : 'block')}</button>
    </div>
    <p className="u72-dialog-note">{t('sessionsHelp')}</p>
    <div className="u72-dialog-actions">
      <button type="button" className="u72-danger-link" disabled={busy} onClick={onDelete}>{t('delete')}</button>
      <button type="button" className="button button-secondary" disabled={busy} onClick={onClose}>{t(busy ? 'working' : 'close')}</button>
    </div>
  </AccountManagementDialog>
}

function DeleteAccount({ account, busy, error, onClose, onDelete }) {
  const t = useAdminUsersText()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const matches = email.trim().toLowerCase() === account.email.toLowerCase()
  async function submit(event) {
    event.preventDefault()
    if (busy || !matches || !password) return
    try { await onDelete(email, password) } finally { setPassword('') }
  }
  return <AccountManagementDialog title={t('deleteTitle')} busy={busy} onClose={onClose}>
    <p className="u72-target"><strong>{account.full_name || t('unnamed')}</strong><span>{account.email}</span></p>
    <p className="u72-delete-warning">{t('deleteHelp')}</p>
    {error && <p className="u72-error" role="alert">{t(error)}</p>}
    <form onSubmit={submit} noValidate>
      <fieldset disabled={busy}>
        <div className="u72-field"><label htmlFor="u72-confirmation-email">{t('confirmationEmail')}</label>
          <input id="u72-confirmation-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" required autoFocus />
        </div>
        <div className="u72-field"><label htmlFor="u72-admin-password">{t('adminPassword')}</label>
          <input id="u72-admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" maxLength={128} required />
        </div>
      </fieldset>
      <div className="u72-dialog-actions">
        <button type="button" className="button button-secondary" disabled={busy} onClick={onClose}>{t('cancel')}</button>
        <button type="submit" className="button u72-danger-button" disabled={busy || !matches || !password}>{t(busy ? 'deleting' : 'deleteConfirm')}</button>
      </div>
    </form>
  </AccountManagementDialog>
}

function UserManagement({ user }) {
  const t = useAdminUsersText()
  const { language } = useLanguage()
  const [draft, setDraft] = useState('')
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [fetchState, setFetchState] = useState({ key: '', data: { users: [], total: 0 }, error: '' })
  const requestKey = JSON.stringify([q, role, status, page, reload, user?.id])
  const data = fetchState.data
  const loading = fetchState.key !== requestKey
  const error = loading ? '' : fetchState.error
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [modalError, setModalError] = useState('')
  const [busy, setBusy] = useState(false)
  const mounted = useRef(true)
  const pending = useRef(false)
  const mutationController = useRef(null)

  useEffect(() => {
    if (draft.trim() === q) return undefined
    const timeout = setTimeout(() => { setQ(draft.trim()); setPage(1) }, 300)
    return () => clearTimeout(timeout)
  }, [draft, q])

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; mutationController.current?.abort() }
  }, [user?.id])

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const token = getAuthToken()
    const current = () => active && token === getAuthToken()
    getAdminUsers({ q, role, status, page }, { signal: controller.signal }).then((result) => {
      if (!current()) return
      if (!result.users.length && page > 1) setPage(Math.max(1, Math.ceil(result.total / 12)))
      setFetchState({ key: requestKey, data: result, error: '' })
    }).catch((requestError) => { if (current()) setFetchState({ key: requestKey, data: { users: [], total: 0 }, error: adminUserError(requestError) }) })
    return () => { active = false; controller.abort() }
  }, [q, role, status, page, reload, user?.id, requestKey])

  function openModal(value) { if (!pending.current) { setModalError(''); setNotice(''); setModal(value) } }
  function closeModal() { if (!pending.current) { setModal(null); setModalError('') } }
  function clearFilters() { setDraft(''); setQ(''); setRole(''); setStatus(''); setPage(1) }

  async function mutate(kind, callback) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setModalError('')
    const token = getAuthToken()
    const controller = new AbortController()
    mutationController.current = controller
    const current = () => mounted.current && token === getAuthToken() && !controller.signal.aborted
    try {
      await callback(controller.signal)
      if (!current()) return
      setModal(null)
      setNotice(kind)
      if (kind === 'created') clearFilters()
      setReload((value) => value + 1)
    } catch (requestError) {
      if (!current()) return
      const key = adminUserError(requestError)
      if (['account_changed', 'account_not_found'].includes(key)) {
        setModal(null); setReload((value) => value + 1)
        setNotice(key)
      } else setModalError(key)
    } finally {
      pending.current = false
      if (mounted.current) setBusy(false)
    }
  }

  function date(value) {
    const parsed = new Date(value)
    return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString(language === 'sw' ? 'sw-KE' : 'en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : t('dateUnavailable')
  }
  const pages = Math.max(1, Math.ceil(data.total / 12))
  return <section className="u72-page" aria-labelledby="u72-title">
    <div className="rc-container">
      <header className="u72-heading">
        <div><p className="u72-eyebrow">{t('eyebrow')}</p><h1 id="u72-title">{t('title')}</h1><p>{t('intro')}</p></div>
        <div className="u72-heading-actions">
          <Link to="/admin" className="button button-secondary">{t('back')}</Link>
          <button type="button" className="button button-primary" disabled={busy || Boolean(error)} onClick={() => openModal({ type: 'create' })}>＋ {t('add')}</button>
        </div>
      </header>
      <div className="u72-filter-panel">
        <div className="u72-field u72-search"><label htmlFor="u72-search">{t('search')}</label>
          <input id="u72-search" type="search" maxLength={100} placeholder={t('searchPlaceholder')} value={draft} onChange={(event) => setDraft(event.target.value)} />
        </div>
        <div className="u72-field"><label htmlFor="u72-role">{t('role')}</label>
          <select id="u72-role" value={role} onChange={(event) => { setRole(event.target.value); setPage(1) }}>
            <option value="">{t('allRoles')}</option><option value="patient">{t('patient')}</option><option value="admin">{t('admin')}</option>
          </select>
        </div>
        <div className="u72-field"><label htmlFor="u72-status">{t('status')}</label>
          <select id="u72-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}>
            <option value="">{t('allStatuses')}</option><option value="active">{t('canLogin')}</option><option value="inactive">{t('inactive')}</option><option value="blocked">{t('blocked')}</option>
          </select>
        </div>
        <button type="button" className="button button-secondary" disabled={loading || busy} onClick={() => { setNotice(''); setReload((value) => value + 1) }}>{t('refresh')}</button>
      </div>
      {notice && <p className={`u72-notice${notice.startsWith('account_') ? ' is-warning' : ''}`} role="status">{t(notice)}</p>}
      {error ? <div className="u72-state" role="alert"><p>{t(error)}</p>
        {!['sessionExpired', 'accessRequired'].includes(error) && <button type="button" className="button button-secondary" onClick={() => setReload((value) => value + 1)}>{t('retry')}</button>}
      </div> : loading ? <p className="u72-state" role="status">{t('loading')}</p> : <>
        <div className="u72-results"><p role="status">{t('results', { count: data.total })}</p><button type="button" className="u72-text-button" onClick={clearFilters}>{t('clear')}</button></div>
        {data.users.length === 0 ? <div className="u72-state"><h2>{t('empty')}</h2><p>{t('emptyHelp')}</p></div> : <div className="u72-grid">
          {data.users.map((account) => <article className="u72-card" key={account.id} aria-label={account.email}>
            <div className="u72-card-top"><span className="u72-avatar" aria-hidden="true">{(account.full_name || account.email).trim().slice(0, 1).toUpperCase()}</span>
              <span className={`u72-badge${account.role === 'admin' ? ' is-admin' : ''}`}>{t(account.role)}</span></div>
            <h2>{account.full_name || t('unnamed')}</h2><p className="u72-email">{account.email}</p>
            {account.phone_number && <p className="u72-phone">{account.phone_number}</p>}
            <div className="u72-statuses"><span className={`u72-badge ${account.is_blocked ? 'is-blocked' : account.is_active ? 'is-active' : 'is-inactive'}`}>{t(account.is_blocked ? 'blocked' : account.is_active ? 'active' : 'inactive')}</span>
              {account.is_blocked && !account.is_active && <span className="u72-badge is-inactive">{t('inactive')}</span>}
              {account.role === 'admin' && <span className="u72-protected">{t('protected')}</span>}
            </div>
            <div className="u72-card-footer"><span>{t('joined', { date: date(account.created_at) })}</span>
              <button type="button" className="button button-secondary" disabled={account.role !== 'patient' || account.id === user?.id || busy}
                aria-label={`${t('manage')}: ${account.email}`} onClick={() => openModal({ type: 'manage', account })}>{t('manage')}</button>
            </div>
          </article>)}
        </div>}
        <nav className="u72-pagination" aria-label={t('page', { page, pages })}>
          <button type="button" className="button button-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t('previous')}</button>
          <span>{t('page', { page, pages })}</span>
          <button type="button" className="button button-secondary" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>{t('next')}</button>
        </nav>
      </>}
      <p className="u72-protection-note">{t('protectedHelp')}</p>
    </div>
    {modal?.type === 'create' && <CreateAccount busy={busy} error={modalError} onClose={closeModal} onCreate={(payload) => mutate('created', (signal) => addAdminUser(payload, { signal }))} />}
    {modal?.type === 'manage' && <ManageAccount account={modal.account} busy={busy} error={modalError} onClose={closeModal}
      onStatus={(action) => mutate('changed', (signal) => changeAdminUserStatus(modal.account, action, { signal }))}
      onDelete={() => openModal({ type: 'delete', account: modal.account })} />}
    {modal?.type === 'delete' && <DeleteAccount account={modal.account} busy={busy} error={modalError} onClose={closeModal}
      onDelete={(email, password) => mutate('deleted', (signal) => deleteAdminUser(modal.account, email, password, { signal }))} />}
  </section>
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  return <UserManagement key={user?.id || 'pending'} user={user} />
}
