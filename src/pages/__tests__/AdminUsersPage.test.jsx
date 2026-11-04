import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import AdminUsersPage from '../AdminUsersPage'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { useAuth } from '../../context/useAuth'
import { addAdminUser, changeAdminUserStatus, deleteAdminUser, getAdminUsers } from '../../services/adminUsers'

vi.mock('../../context/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../../services/adminUsers', async (original) => ({
  ...await original(), getAdminUsers: vi.fn(), addAdminUser: vi.fn(), changeAdminUserStatus: vi.fn(), deleteAdminUser: vi.fn(),
}))

const owner = { id: 'admin-test', email: 'admin@example.test', role: 'admin', full_name: 'Admin User', is_active: true, is_blocked: false, revision: 0, created_at: '2026-11-01T12:00:00Z' }
const patient = { ...owner, id: 'patient-test', email: 'patient@example.test', full_name: 'Example Patient', role: 'patient', revision: 2 }
const blocked = { ...patient, id: 'blocked-test', email: 'blocked@example.test', full_name: 'Blocked Patient', is_blocked: true }
const snapshot = (params = {}) => ({ users: [owner, patient, blocked], total: 3, page: params.page || 1, page_size: 12 })
const deferred = () => { let resolve; let reject; const promise = new Promise((ok, fail) => { resolve = ok; reject = fail }); return { promise, resolve, reject } }
function show({ route = false, language = 'en' } = {}) {
  return render(<LanguageContext.Provider value={{ language, t: (key, values) => translate(language, key, values) }}>
    <MemoryRouter initialEntries={['/admin/users']}>{route ? <App /> : <AdminUsersPage />}</MemoryRouter>
  </LanguageContext.Provider>)
}
const ready = () => screen.findByRole('heading', { name: 'Example Patient' }, { timeout: 10000 })
const manage = async () => { await ready(); fireEvent.click(screen.getByRole('button', { name: 'Manage account: patient@example.test' })); return screen.getByRole('dialog') }
const toDelete = async () => { const dialog = await manage(); fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account', exact: true })); return screen.getByRole('dialog') }
function fillDelete() {
  fireEvent.change(screen.getByLabelText('Type the account email'), { target: { value: patient.email } })
  fireEvent.change(screen.getByLabelText('Your administrator password'), { target: { value: 'SyntheticAdminPassword!' } })
}

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; this.querySelector('[autofocus]')?.focus() } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false } })
})

describe('administrator user management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear(); localStorage.clear()
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false, user: owner, logout: vi.fn() })
    getAdminUsers.mockImplementation(async (params) => snapshot(params))
    addAdminUser.mockResolvedValue(patient)
    changeAdminUserStatus.mockResolvedValue({ ...patient, is_blocked: true, revision: 3 })
    deleteAdminUser.mockResolvedValue({ status: 'deleted', user_id: patient.id })
  })

  it('loads the actual protected route, account roles/statuses and admin navigation', async () => {
    show({ route: true })
    await ready()
    expect(screen.getByRole('heading', { name: 'User accounts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Manage account: admin@example.test' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Manage account: patient@example.test' })).toBeEnabled()
    const card = screen.getByRole('article', { name: blocked.email })
    expect(within(card).getByText('Blocked')).toBeInTheDocument()
    expect(screen.getByText('Matching accounts: 3')).toBeInTheDocument()
  }, 15000)

  it.each(['guest', 'patient'])('blocks %s access before requesting the list', async (identity) => {
    useAuth.mockReturnValue({ isAuthenticated: identity !== 'guest', isAdmin: false, loading: false, user: identity === 'guest' ? null : patient })
    show({ route: true })
    await screen.findByRole('heading', { name: identity === 'guest' ? 'Log in' : 'Administrator access required.' })
    expect(getAdminUsers).not.toHaveBeenCalled()
  })

  it('debounces search, sends server-side role/status filters and aborts old reads', async () => {
    show(); await ready()
    const first = getAdminUsers.mock.calls[0][1].signal
    fireEvent.change(screen.getByLabelText('Search users'), { target: { value: '  Example  ' } })
    await waitFor(() => expect(getAdminUsers).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'Example', page: 1 }), expect.anything()))
    expect(first.aborted).toBe(true)
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'patient' } })
    fireEvent.change(screen.getByLabelText('Access status'), { target: { value: 'blocked' } })
    await waitFor(() => expect(getAdminUsers).toHaveBeenLastCalledWith(expect.objectContaining({ role: 'patient', status: 'blocked', q: 'Example' }), expect.anything()))
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    await waitFor(() => expect(getAdminUsers).toHaveBeenLastCalledWith({ q: '', role: '', status: '', page: 1 }, expect.anything()))
  })

  it('paginates through real server totals and clamps an emptied final page', async () => {
    getAdminUsers.mockImplementation(async (params) => ({ ...snapshot(params), total: 13 }))
    show(); await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Next', exact: true }))
    await screen.findByText('Page 2 of 2')
    expect(getAdminUsers).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.anything())
    getAdminUsers.mockImplementation(async (params) => params.page === 2 ? { ...snapshot(params), users: [], total: 12 } : { ...snapshot(params), total: 12 })
    fireEvent.click(screen.getByRole('button', { name: 'Refresh', exact: true }))
    await screen.findByText('Page 1 of 1')
    expect(screen.getByRole('button', { name: 'Next', exact: true })).toBeDisabled()
  })

  it('validates creation, normalises the payload and never persists passwords', async () => {
    show(); await ready()
    fireEvent.click(screen.getByRole('button', { name: /Add patient/ }))
    const dialog = screen.getByRole('dialog')
    fireEvent.submit(within(dialog).getByRole('button', { name: 'Create patient account', exact: true }).closest('form'))
    expect(addAdminUser).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Full name')).toHaveFocus()
    for (const [label, value] of [['Full name', '  New   Patient  '], ['Email address', 'NEW@example.com'], ['Phone number', '+254 712-345-678'], ['Initial password', 'SyntheticPatientPass!'], ['Confirm initial password', 'SyntheticPatientPass!']]) {
      fireEvent.change(within(dialog).getByLabelText(label, { exact: true }), { target: { value } })
    }
    fireEvent.click(within(dialog).getByRole('button', { name: 'Create patient account', exact: true }))
    await screen.findByText('Patient account created.')
    expect(addAdminUser).toHaveBeenCalledWith({ email: 'new@example.com', full_name: 'New Patient', phone_number: '+254712345678', password: 'SyntheticPatientPass!' }, { signal: expect.any(AbortSignal) })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(JSON.stringify({ ...sessionStorage, ...localStorage })).not.toContain('SyntheticPatientPass!')
  })

  it.each([['Block account', 'block'], ['Deactivate account', 'deactivate']])('performs %s for the reviewed patient', async (label, action) => {
    show(); const dialog = await manage()
    fireEvent.click(within(dialog).getByRole('button', { name: label, exact: true }))
    await screen.findByText('Account access updated.')
    expect(changeAdminUserStatus).toHaveBeenCalledWith(patient, action, { signal: expect.any(AbortSignal) })
    await waitFor(() => expect(getAdminUsers.mock.calls.length).toBeGreaterThan(1))
  })

  it('offers activate and unblock independently for an inactive blocked account', async () => {
    getAdminUsers.mockResolvedValue({ ...snapshot(), users: [{ ...patient, is_active: false, is_blocked: true }] })
    show(); const dialog = await manage()
    expect(within(dialog).getByRole('button', { name: 'Activate account', exact: true })).toBeEnabled()
    expect(within(dialog).getByRole('button', { name: 'Unblock account', exact: true })).toBeEnabled()
  })

  it('requires typed target email and administrator password before permanent deletion', async () => {
    show(); const dialog = await toDelete()
    expect(within(dialog).getByText(/all its saved assessments/)).toBeInTheDocument()
    const button = within(dialog).getByRole('button', { name: 'Permanently delete', exact: true })
    expect(button).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Type the account email'), { target: { value: 'wrong@example.test' } })
    fireEvent.change(screen.getByLabelText('Your administrator password'), { target: { value: 'SyntheticAdminPassword!' } })
    expect(button).toBeDisabled()
    fillDelete()
    fireEvent.click(button)
    await screen.findByText('Account and its saved assessments and feedback deleted.')
    expect(deleteAdminUser).toHaveBeenCalledWith(patient, patient.email, 'SyntheticAdminPassword!', { signal: expect.any(AbortSignal) })
    expect(JSON.stringify({ ...sessionStorage, ...localStorage })).not.toContain('SyntheticAdminPassword!')
  })

  it('cancels deletion without sending a request and clears credentials on reopening', async () => {
    show(); await toDelete(); fillDelete()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel', exact: true }))
    expect(deleteAdminUser).not.toHaveBeenCalled()
    await toDelete()
    expect(screen.getByLabelText('Your administrator password')).toHaveValue('')
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows failed password verification and clears the administrator password', async () => {
    deleteAdminUser.mockRejectedValue({ response: { status: 403, data: { detail: { code: 'admin_password_invalid' } } } })
    show(); await toDelete(); fillDelete()
    fireEvent.click(screen.getByRole('button', { name: 'Permanently delete', exact: true }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Your administrator password is incorrect.')
    expect(screen.getByLabelText('Your administrator password')).toHaveValue('')
  })

  it('prevents duplicate submissions and keeps an in-flight dialog open', async () => {
    const request = deferred()
    changeAdminUserStatus.mockReturnValue(request.promise)
    show(); const dialog = await manage()
    const button = within(dialog).getByRole('button', { name: 'Block account', exact: true })
    fireEvent.click(button); fireEvent.click(button)
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(changeAdminUserStatus).toHaveBeenCalledTimes(1)
    expect(dialog).toBeInTheDocument()
    await act(async () => request.resolve({ ...patient, is_blocked: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('refreshes stale account snapshots instead of allowing an overwrite', async () => {
    changeAdminUserStatus.mockRejectedValue({ response: { status: 409, data: { detail: { code: 'account_changed' } } } })
    show(); const dialog = await manage()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Block account', exact: true }))
    await screen.findByText('This account changed. Review its latest status before trying again.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(getAdminUsers.mock.calls.length).toBeGreaterThan(1))
  })

  it('renders empty records, readable failures and retry without fabricated accounts', async () => {
    getAdminUsers.mockRejectedValueOnce(new Error('Unavailable'))
    getAdminUsers.mockResolvedValue({ users: [], total: 0, page: 1, page_size: 12 })
    show()
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be confirmed')
    fireEvent.click(screen.getByRole('button', { name: 'Try again', exact: true }))
    await screen.findByRole('heading', { name: 'No matching accounts' })
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('aborts reads on unmount and ignores late results', async () => {
    const request = deferred(); getAdminUsers.mockReturnValue(request.promise)
    const view = show()
    const signal = getAdminUsers.mock.calls[0][1].signal
    view.unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => request.resolve(snapshot()))
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('clears an open sensitive dialog when the authenticated account changes', async () => {
    const view = show(); await toDelete(); fillDelete()
    useAuth.mockReturnValue({ user: { ...owner, id: 'other-admin' }, isAuthenticated: true, isAdmin: true, loading: false })
    view.rerender(<LanguageContext.Provider value={{ language: 'en' }}><MemoryRouter><AdminUsersPage /></MemoryRouter></LanguageContext.Provider>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(deleteAdminUser).not.toHaveBeenCalled()
  })

  it('supports Kiswahili for filters, statuses and account actions', async () => {
    show({ language: 'sw' })
    await ready()
    expect(screen.getByRole('heading', { name: 'Akaunti za watumiaji' })).toBeInTheDocument()
    expect(screen.getByLabelText('Tafuta watumiaji')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Simamia akaunti: patient@example.test' }))
    expect(screen.getByRole('button', { name: 'Zuia akaunti', exact: true })).toBeInTheDocument()
  })
})
