import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import AdminSystemPage from '../AdminSystemPage'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { useAuth } from '../../context/useAuth'
import { addSymptomAlias, getSystemSection, removeSymptomAlias, saveSystemRecord } from '../../services/adminSystem'

vi.mock('../../context/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../../services/adminSystem', async (original) => ({ ...await original(), getSystemSection: vi.fn(), addSymptomAlias: vi.fn(), removeSymptomAlias: vi.fn(), saveSystemRecord: vi.fn() }))

const admin = { id: 'admin-fixture', role: 'admin' }
const symptom = { id: 'symptom-1', display_name: 'Fever', code: 'fever', is_red_flag: false, features: ['E_91'], review_note: '', revision: 2, aliases: [
  { id: 'base', alias: 'fever', language: 'en', protected: true }, { id: 'custom', alias: 'feeling very warm', language: 'en', protected: false },
] }
const disease = { condition: 'URTI', display_name: 'Upper respiratory infection', short_description: 'Original awareness description.', revision: 4 }
const feedback = { id: 'feedback-1', prediction_id: 'session-1', was_helpful: false, comment: 'Unclear wording', review_status: 'pending', review_note: '', revision: 1, created_at: '2026-11-04T12:00:00Z' }
const model = { state: 'ready', model: { name: 'Respiratory Random Forest Candidate', version: 'candidate_v1_research', feature_count: 70, class_count: 21, training_samples: 1000, validation_samples: 500, test_samples: 300, validation_metrics: { macro_f1: .72, scope_note: 'Simulated validation groups' }, test_metrics: { evaluated: false }, sample_count_definitions: {} } }
const snapshot = (section, params) => section === 'model' ? model : ({ items: section === 'symptoms' ? [symptom] : section === 'diseases' ? [disease] : section === 'feedback' ? [feedback] : [], total: ['symptoms', 'diseases', 'feedback'].includes(section) ? 1 : 0, page: params.page || 1 })
const deferred = () => { let resolve; let reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
function show(section = 'model', { route = false, language = 'en' } = {}) {
  return render(<LanguageContext.Provider value={{ language, t: (key, values) => translate(language, key, values) }}>
    <MemoryRouter initialEntries={[`/admin/system?section=${section}`]}>{route ? <App /> : <AdminSystemPage />}</MemoryRouter>
  </LanguageContext.Provider>)
}
const ready = () => screen.findByText('Matching records: 1')

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false } })
})
beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear(); localStorage.clear()
  useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false, user: admin, logout: vi.fn() })
  getSystemSection.mockImplementation(async (section, params) => snapshot(section, params))
  saveSystemRecord.mockResolvedValue({})
  addSymptomAlias.mockResolvedValue({})
  removeSymptomAlias.mockResolvedValue({})
})

describe('administrator system management', () => {
  it('loads the protected route and active model rather than legacy model status', async () => {
    show('model', { route: true })
    await screen.findByRole('heading', { name: model.model.name }, { timeout: 10000 })
    expect(screen.getByText('Runtime verified')).toBeInTheDocument()
    expect(screen.getByText('Version candidate_v1_research')).toBeInTheDocument()
    expect(screen.getAllByText('0.72').length).toBeGreaterThan(0)
    expect(screen.queryByText('72%')).not.toBeInTheDocument()
    expect(screen.getByText(/Research evaluation on simulated data/)).toBeInTheDocument()
  }, 15000)

  it.each(['guest', 'patient'])('denies %s before reading private management records', async (identity) => {
    useAuth.mockReturnValue({ isAuthenticated: identity !== 'guest', isAdmin: false, loading: false, user: identity === 'guest' ? null : { id: 'patient', role: 'patient' } })
    show('model', { route: true })
    await screen.findByRole('heading', { name: identity === 'guest' ? 'Log in' : 'Administrator access required.' })
    expect(getSystemSection).not.toHaveBeenCalled()
  })

  it('shows unavailable model configuration without inventing metrics', async () => {
    getSystemSection.mockResolvedValue({ state: 'no_active_model', model: null })
    show()
    await screen.findByRole('heading', { name: 'No active model' })
    expect(screen.queryByText('0.72')).not.toBeInTheDocument()
  })

  it('searches and pages using server totals, including going back from page three', async () => {
    getSystemSection.mockImplementation(async (section, params) => ({ ...snapshot(section, params), total: 30 }))
    show('symptoms'); await screen.findByText('Matching records: 30')
    fireEvent.change(screen.getByLabelText('Search records'), { target: { value: ' fever ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search', exact: true }))
    await waitFor(() => expect(getSystemSection).toHaveBeenLastCalledWith('symptoms', { page: 1, q: 'fever' }, expect.anything()))
    await screen.findByText('Page 1 of 3')
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); await screen.findByText('Page 2 of 3')
    fireEvent.click(screen.getByRole('button', { name: 'Next' })); await screen.findByText('Page 3 of 3')
    fireEvent.click(screen.getByRole('button', { name: 'Previous' })); await screen.findByText('Page 2 of 3')
  })

  it('edits symptom notes with a revision while preserving model definitions', async () => {
    show('symptoms'); await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Administrator note' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByLabelText('Display name')).not.toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Administrator note'), { target: { value: ' Reviewed wording ' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Changes saved.')
    expect(saveSystemRecord).toHaveBeenCalledWith('symptoms', symptom, { review_note: 'Reviewed wording' }, expect.anything())
  })

  it('requires meaning confirmation and protects baseline aliases', async () => {
    show('symptoms'); await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Manage aliases' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByRole('button', { name: 'Remove: fever' })).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('New alias'), { target: { value: 'hot feeling' } })
    expect(screen.getByRole('button', { name: 'Add alias' })).toBeDisabled()
    fireEvent.click(screen.getByLabelText('I checked that this wording has the same symptom meaning.'))
    fireEvent.click(screen.getByRole('button', { name: 'Add alias' }))
    await screen.findByText('Changes saved.')
    expect(addSymptomAlias).toHaveBeenCalledWith(symptom, 'hot feeling', 'en', expect.anything())
  })

  it('confirms custom alias removal before making the request', async () => {
    show('symptoms'); await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Manage aliases' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove: feeling very warm' }))
    expect(removeSymptomAlias).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Remove', exact: true }))
    await screen.findByText('Changes saved.')
    expect(removeSymptomAlias).toHaveBeenCalledWith(symptom, symptom.aliases[1], expect.anything())
  })

  it('saves disease descriptions without changing the condition identity', async () => {
    show('diseases'); await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Edit information' }))
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'Updated title' } })
    fireEvent.change(screen.getByLabelText('Short description'), { target: { value: 'Updated awareness information.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Changes saved.')
    expect(saveSystemRecord).toHaveBeenCalledWith('diseases', disease, { display_name: 'Updated title', short_description: 'Updated awareness information.' }, expect.anything())
  })

  it('filters feedback and records the review without changing the patient comment', async () => {
    show('feedback'); await ready()
    fireEvent.change(screen.getByLabelText('Patient rating'), { target: { value: 'false' } })
    await waitFor(() => expect(getSystemSection).toHaveBeenLastCalledWith('feedback', expect.objectContaining({ helpful: 'false' }), expect.anything()))
    await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Review feedback' }))
    fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('Review status'), { target: { value: 'resolved' } })
    fireEvent.change(screen.getByLabelText('Administrator note'), { target: { value: 'Wording checked.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Changes saved.')
    expect(saveSystemRecord).toHaveBeenCalledWith('feedback', feedback, { review_note: 'Wording checked.', review_status: 'resolved' }, expect.anything())
  })

  it('switches diagnostic sources and displays saved unsupported wording', async () => {
    getSystemSection.mockImplementation(async (section, params) => ({ items: params.source === 'assessments' ? [{ id: 'nlp-1', prediction_id: 'session-1', kind: 'unsupported_input', unsupported_symptoms: ['unknown_symptom'], unmatched_wording: [{ unmatched_text: 'fixture wording' }] }] : [], total: params.source === 'assessments' ? 1 : 0, page: 1 }))
    show('nlp'); await screen.findByText('No records to show')
    fireEvent.change(screen.getByLabelText('Show'), { target: { value: 'assessments' } })
    await screen.findByText('unknown_symptom')
    expect(screen.getByText('fixture wording')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View assessment' })).toHaveAttribute('href', '/admin/history/session-1')
  })

  it('shows retry and empty states', async () => {
    getSystemSection.mockRejectedValueOnce(new Error('offline'))
    show('activity'); await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await screen.findByText('No records to show')
  })

  it('shows a conflict then reloads rather than overwriting another administrator', async () => {
    saveSystemRecord.mockRejectedValue({ response: { status: 409, data: { detail: { code: 'record_changed' } } } })
    show('diseases'); await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Edit information' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText('Another administrator changed this record. Refresh and try again.')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(getSystemSection).toHaveBeenCalledTimes(2))
  })

  it('blocks duplicate saves and closing while a save is pending', async () => {
    const request = deferred(); saveSystemRecord.mockReturnValue(request.promise)
    show('diseases'); await ready(); fireEvent.click(screen.getByRole('button', { name: 'Edit information' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'))
    expect(saveSystemRecord).toHaveBeenCalledTimes(1)
    await act(async () => request.resolve({}))
  })

  it('aborts pending reads on leaving and ignores their late results', async () => {
    const request = deferred(); getSystemSection.mockReturnValue(request.promise)
    const view = show('symptoms')
    const signal = getSystemSection.mock.calls[0][2].signal
    view.unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => request.resolve(snapshot('symptoms', {})))
  })

  it('renders Kiswahili controls', async () => {
    show('diseases', { language: 'sw' })
    await screen.findByText('Rekodi zinazolingana: 1')
    expect(screen.getByRole('heading', { name: 'Usimamizi wa mfumo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hariri taarifa' })).toBeInTheDocument()
  })
})
