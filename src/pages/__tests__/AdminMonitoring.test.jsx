import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboardPage from '../AdminDashboardPage'
import LanguageContext from '../../context/LanguageContextBase'
import { useAuth } from '../../context/useAuth'
import { getAdminHistory, getAdminFeedback } from '../../services/admin'

vi.mock('../../context/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../../services/admin', () => ({ getAdminHistory: vi.fn(), getAdminFeedback: vi.fn() }))
vi.mock('@highcharts/react', () => ({ Chart: ({ options, children }) => <div data-testid="chart-config" data-title={options.lang.accessibility.chartContainerLabel} data-options={JSON.stringify(options)}>{children}</div> }))
vi.mock('@highcharts/react/modules/Accessibility', () => ({ Accessibility: () => null }))

const legacy = (id, day, score = 80) => ({ prediction_id: id, user_id: 'patient-test', created_at: `${day}T12:00:00Z`,
  status: 'prediction_complete', input_text: 'Synthetic symptoms', confirmed_codes: ['cough'],
  predictions: [{ condition: 'asthma', display_name: 'Asthma', model_confidence_percent: score }] })
const history = [legacy('first', '2026-11-01', 20), legacy('latest', '2026-11-03'),
  { ...legacy('candidate', '2026-11-03'), assessment: { contract_version: 1, status: 'prediction_available',
    predicted_condition: 'asthma', model_score: 0.6, unmatched_wording: ['word'], unsupported_symptoms: [], clarification_required: [] } },
  { ...legacy('urgent', '2026-11-03'), status: 'urgent_review', has_red_flag: true,
    predictions: [{ condition: 'hidden', display_name: 'Must never chart', model_confidence_percent: 99 }] }]
const feedback = [
  { feedback_id: 'f1', prediction_id: 'first', created_at: '2026-11-01T12:00:00Z', was_helpful: true },
  { feedback_id: 'f2', prediction_id: 'latest', created_at: '2026-11-03T12:00:00Z', was_helpful: false },
  { feedback_id: 'f3', prediction_id: 'latest', created_at: '2026-11-03T12:00:00Z', was_helpful: null },
]
const chart = (title) => JSON.parse(screen.getAllByTestId('chart-config').find((el) => el.dataset.title === title).dataset.options)
const values = (title) => chart(title).series[0].data.map((point) => point.y)
const dashboard = (language = 'en') => <LanguageContext.Provider value={{ language, t: (key) => key }}><MemoryRouter><AdminDashboardPage /></MemoryRouter></LanguageContext.Provider>
const ready = () => screen.findByRole('heading', { name: 'System activity overview.' })
function dateRange(from, to) {
  fireEvent.change(screen.getByLabelText('From date'), { target: { value: from } })
  fireEvent.change(screen.getByLabelText('To date'), { target: { value: to } })
  fireEvent.click(screen.getByRole('button', { name: 'Apply dates' }))
}

describe('administrator model monitoring', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
    useAuth.mockReturnValue({ user: { id: 'admin-test' } })
    getAdminHistory.mockResolvedValue({ history })
    getAdminFeedback.mockResolvedValue({ feedback })
  })

  it('renders six charts with API-backed values, correct score bins and explicit dataset scope', async () => {
    render(dashboard())
    await ready()
    expect(getAdminHistory).toHaveBeenCalledWith(500, { signal: expect.any(AbortSignal) })
    expect(screen.getAllByTestId('chart-config')).toHaveLength(6)
    expect(values('Assessment routes')).toEqual([3, 1])
    expect(values('Feedback overview')).toEqual([1, 1, 1])
    expect(values('Prediction sessions over time')).toEqual([1, 0, 3])
    expect(values('Most frequently predicted conditions')).toEqual([3])
    expect(values('Model confidence distribution')).toEqual([0, 1, 0, 1, 1])
    expect(values('Symptom-matching context')).toEqual([1, 1, 0, 0])
    expect(screen.getByText('Latest 500 per list')).toBeVisible()
    expect(screen.getByText(/Older dates may be incomplete/)).not.toBeVisible()
    fireEvent.click(screen.getByText('How filters work'))
    expect(screen.getByText(/Older dates may be incomplete/)).toBeVisible()
    expect(screen.queryByText('Must never chart')).not.toBeInTheDocument()
  })

  it('applies inclusive dates to every chart, statistics and both record lists, then clears them', async () => {
    render(dashboard())
    await ready()
    dateRange('2026-11-03', '2026-11-03')
    expect(values('Assessment routes')).toEqual([2, 1])
    expect(values('Feedback overview')).toEqual([0, 1, 1])
    expect(values('Prediction sessions over time')).toEqual([3])
    expect(values('Most frequently predicted conditions')).toEqual([2])
    expect(values('Model confidence distribution')).toEqual([0, 0, 0, 1, 1])
    expect(screen.getByText('3 sessions and 2 feedback records in the applied range.')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /View session/ })).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: /^Feedback / }))
    expect(screen.getByText('Showing 2 of 2 responses')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear dates' }))
    expect(values('Assessment routes')).toEqual([3, 1])
    expect(screen.getByLabelText('From date')).toHaveValue('')
    expect(screen.getByText('Showing 3 of 3 responses')).toBeInTheDocument()
  })

  it('retains applied data for a reversed range and explains the validation error', async () => {
    render(dashboard())
    await ready()
    dateRange('2026-11-01', '2026-11-01')
    dateRange('2026-11-04', '2026-11-01')
    expect(screen.getByRole('alert')).toHaveTextContent('previous range is still applied')
    expect(values('Assessment routes')).toEqual([1, 0])
    expect(screen.getByLabelText('From date')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows truthful empty states for a range without records', async () => {
    render(dashboard())
    await ready()
    dateRange('2030-01-01', '2030-01-02')
    expect(screen.queryByTestId('chart-config')).not.toBeInTheDocument()
    expect(screen.getByText('No published condition results in this range.')).toBeInTheDocument()
    expect(screen.getByText(/Older records are not treated as zero matches/)).toBeInTheDocument()
  })

  it('leaves charts scoped to dates when list-only search and urgency filters change', async () => {
    render(dashboard())
    await ready()
    fireEvent.change(screen.getByLabelText('Search sessions'), { target: { value: 'no match' } })
    fireEvent.click(screen.getByRole('button', { name: 'Urgent review', exact: true }))
    expect(screen.getByText('No matching sessions')).toBeInTheDocument()
    expect(values('Assessment routes')).toEqual([3, 1])
  })

  it('exposes exact chart values in a keyboard-operable table and enables chart keyboard access', async () => {
    render(dashboard())
    await ready()
    const panel = screen.getByRole('heading', { name: 'Assessment routes' }).closest('section')
    const details = panel.querySelector('.adm71-data')
    fireEvent.click(within(panel).getByText('View chart data'))
    expect(details).toHaveAttribute('open')
    const table = within(panel).getByRole('table')
    expect(within(table).getByRole('cell', { name: '3' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: '1' })).toBeInTheDocument()
    expect(chart('Assessment routes').accessibility.keyboardNavigation.enabled).toBe(true)
  })

  it('refreshes real source data while keeping the selected dates', async () => {
    render(dashboard())
    await ready()
    dateRange('2026-11-03', '2026-11-03')
    getAdminHistory.mockResolvedValue({ history: [legacy('new', '2026-11-03')] })
    getAdminFeedback.mockResolvedValue({ feedback: [] })
    fireEvent.click(screen.getByRole('button', { name: 'Refresh data' }))
    await waitFor(() => expect(screen.getByText('1 sessions and 0 feedback records in the applied range.')).toBeInTheDocument())
    expect(values('Assessment routes')).toEqual([1, 0])
    expect(screen.getByLabelText('From date')).toHaveValue('2026-11-03')
  })

  it('does not present partial or malformed API data as valid zero statistics, and supports retry', async () => {
    getAdminFeedback.mockResolvedValue({ feedback: null })
    render(dashboard())
    expect(await screen.findByRole('alert')).toHaveTextContent('could not load')
    expect(screen.queryByTestId('chart-config')).not.toBeInTheDocument()
    getAdminFeedback.mockResolvedValue({ feedback })
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await ready()
    expect(values('Assessment routes')).toEqual([3, 1])
  })

  it('keeps administrator permission failures visible without offering ordinary retry', async () => {
    getAdminHistory.mockRejectedValue({ response: { status: 403 } })
    render(dashboard())
    expect(await screen.findByRole('alert')).toHaveTextContent('Administrator access is required')
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('aborts requests on unmount and ignores their late results', async () => {
    let finish
    getAdminHistory.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    const { unmount } = render(dashboard())
    const signal = getAdminHistory.mock.calls[0][1].signal
    unmount()
    expect(signal.aborted).toBe(true)
    await act(async () => finish({ history }))
    expect(screen.queryByTestId('chart-config')).not.toBeInTheDocument()
  })

  it('does not accept a result after the authentication token changes', async () => {
    let finish
    getAdminHistory.mockReturnValue(new Promise((resolve) => { finish = resolve }))
    render(dashboard())
    sessionStorage.setItem('respiracare_access_token', 'different-session')
    await act(async () => finish({ history }))
    expect(screen.queryByTestId('chart-config')).not.toBeInTheDocument()
  })

  it('translates the new filters, chart titles, table labels and notices into Kiswahili', async () => {
    render(dashboard('sw'))
    await screen.findByRole('heading', { name: /Shughuli za mfumo/ })
    expect(screen.getByLabelText('Tarehe ya kuanzia')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mgawanyo wa alama za modeli' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sasisha taarifa' })).toBeInTheDocument()
    expect(screen.getAllByText('Angalia data ya chati')).toHaveLength(6)
  })
})
