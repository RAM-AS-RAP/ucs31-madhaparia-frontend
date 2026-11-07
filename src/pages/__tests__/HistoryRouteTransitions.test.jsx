import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import PatientHistoryDetailPage from '../PatientHistoryDetailPage'
import AdminHistoryDetailPage from '../AdminHistoryDetailPage'
import { getPatientHistoryItem } from '../../services/history'
import { getAdminHistoryItem } from '../../services/admin'

vi.mock('../../services/history', () => ({ getPatientHistoryItem: vi.fn() }))
vi.mock('../../services/admin', () => ({ getAdminHistoryItem: vi.fn() }))
vi.mock('../../components/PredictionFeedback', () => ({ default: () => null }))

function session(id) {
  return { prediction_id: id, created_at: '2026-11-06T00:00:00Z', age: 22, sex: 'F',
    input_text: 'cough', confirmed_codes: ['cough'], status: 'insufficient_information', predictions: [],
    assessment: { contract_version: 2, status: 'insufficient_information', summary: `Saved assessment ${id}`,
      observations: [], next_steps: [], limitations: 'Research only.' } }
}

function deferred() {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

beforeEach(() => vi.resetAllMocks())

describe.each([
  ['patient', '/history', PatientHistoryDetailPage, getPatientHistoryItem],
  ['admin', '/admin/history', AdminHistoryDetailPage, getAdminHistoryItem],
])('%s history route transitions', (_role, base, Page, load) => {
  function show() {
    const router = createMemoryRouter([{ path: `${base}/:predictionId`, element: <Page /> }],
      { initialEntries: [`${base}/one`] })
    render(<RouterProvider router={router} />)
    return router
  }

  it('recovers from a failed record when opening a valid record without remounting', async () => {
    load.mockRejectedValueOnce({ response: { status: 404 } }).mockResolvedValueOnce(session('two'))
    const router = show()
    await screen.findByRole('alert')
    await act(async () => router.navigate(`${base}/two`))
    expect(await screen.findByText('two', { selector: 'code' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('hides the previous record while a different record is loading', async () => {
    const next = deferred()
    load.mockResolvedValueOnce(session('one')).mockReturnValueOnce(next.promise)
    const router = show()
    await screen.findByText('one', { selector: 'code' })
    await act(async () => router.navigate(`${base}/two`))
    expect(screen.queryByText('one', { selector: 'code' })).not.toBeInTheDocument()
    await act(async () => next.resolve(session('two')))
    expect(await screen.findByText('two', { selector: 'code' })).toBeInTheDocument()
  })

  it('ignores a late response for the previously opened record', async () => {
    const previous = deferred()
    load.mockReturnValueOnce(previous.promise).mockResolvedValueOnce(session('two'))
    const router = show()
    await act(async () => router.navigate(`${base}/two`))
    await screen.findByText('two', { selector: 'code' })
    await act(async () => previous.resolve(session('one')))
    expect(screen.getByText('two', { selector: 'code' })).toBeInTheDocument()
    expect(screen.queryByText('one', { selector: 'code' })).not.toBeInTheDocument()
  })

  it('does not display an old assessment as a missing record', async () => {
    load.mockResolvedValueOnce(session('one')).mockRejectedValueOnce({ response: { status: 404 } })
    const router = show()
    await screen.findByText('one', { selector: 'code' })
    await act(async () => router.navigate(`${base}/missing`))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.queryByText('one', { selector: 'code' })).not.toBeInTheDocument()
  })
})
