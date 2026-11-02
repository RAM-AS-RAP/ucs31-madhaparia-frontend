import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SymptomInputPage from '../SymptomInputPage'
import api from '../../services/api'

vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    default: {
      post: vi.fn(),
    },
  }
})

const MAPPING_KEY = 'respiracare_symptom_mapping'
const CONFIRMATION_KEY = 'respiracare_symptom_confirmation'
const PREDICTION_KEY = 'respiracare_prediction_result'
const TOKEN_KEY = 'respiracare_access_token'

const OLD_TEXT = 'I have a cough'
const NEW_TEXT = 'I have a fever'

function deferred() {
  let resolve
  let reject

  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

function mappingFor(text, code, displayName) {
  return {
    input_text: text,
    recognised_symptoms: [{
      code,
      display_name: displayName,
      matched_text: text,
      language: 'en',
      match_type: 'exact',
      match_score: 100,
      is_red_flag: false,
    }],
    unmatched_wording: [],
    has_red_flag: false,
  }
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SymptomInputPage />
    </MemoryRouter>,
  )
}

function changeDescription(text) {
  fireEvent.change(screen.getByLabelText('Symptom description'), {
    target: { value: text },
  })
}

function submitDescription(text) {
  changeDescription(text)

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Analyse symptoms',
      exact: true,
    }),
  )
}

function savedMapping() {
  const value = sessionStorage.getItem(MAPPING_KEY)
  return value ? JSON.parse(value) : null
}

describe('symptom recognition request isolation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
    sessionStorage.setItem(TOKEN_KEY, 'synthetic-token-A')
  })

  it('ignores an older response after the description changes', async () => {
    const oldRequest = deferred()
    api.post.mockReturnValueOnce(oldRequest.promise)

    renderPage()
    submitDescription(OLD_TEXT)

    expect(
      screen.getByRole('button', { name: 'Analysing symptoms...' }),
    ).toBeDisabled()

    changeDescription(NEW_TEXT)

    expect(
      screen.getByRole('button', {
        name: 'Analyse symptoms',
        exact: true,
      }),
    ).toBeEnabled()

    await act(async () => {
      oldRequest.resolve({
        data: mappingFor(OLD_TEXT, 'cough', 'Cough'),
      })
    })

    expect(screen.getByLabelText('Symptom description'))
      .toHaveValue(NEW_TEXT)

    expect(
      screen.queryByRole('heading', { name: 'Cough', exact: true }),
    ).not.toBeInTheDocument()

    expect(savedMapping()).toBeNull()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps the newest result when responses finish in reverse order', async () => {
    const oldRequest = deferred()
    const newRequest = deferred()

    api.post
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise)

    renderPage()
    submitDescription(OLD_TEXT)
    submitDescription(NEW_TEXT)

    expect(api.post).toHaveBeenCalledTimes(2)

    await act(async () => {
      newRequest.resolve({
        data: mappingFor(NEW_TEXT, 'fever', 'Fever'),
      })
    })

    expect(
      screen.getByRole('heading', { name: 'Fever', exact: true }),
    ).toBeInTheDocument()

    await act(async () => {
      oldRequest.resolve({
        data: mappingFor(OLD_TEXT, 'cough', 'Cough'),
      })
    })

    expect(
      screen.getByRole('heading', { name: 'Fever', exact: true }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('heading', { name: 'Cough', exact: true }),
    ).not.toBeInTheDocument()

    expect(savedMapping().input_text).toBe(NEW_TEXT)
    expect(savedMapping().recognised_symptoms[0].code).toBe('fever')
  })

  it('ignores an older failure without stopping the newer loading state', async () => {
    const oldRequest = deferred()
    const newRequest = deferred()

    api.post
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise)

    renderPage()
    submitDescription(OLD_TEXT)
    submitDescription(NEW_TEXT)

    await act(async () => {
      oldRequest.reject({
        response: {
          status: 422,
          data: { detail: 'Synthetic old request failure' },
        },
      })
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: 'Analysing symptoms...' }),
    ).toBeDisabled()

    await act(async () => {
      newRequest.resolve({
        data: mappingFor(NEW_TEXT, 'fever', 'Fever'),
      })
    })

    expect(
      screen.getByRole('heading', { name: 'Fever', exact: true }),
    ).toBeInTheDocument()

    expect(savedMapping().input_text).toBe(NEW_TEXT)
  })

  it('does not restore cached mapping after the page is unmounted', async () => {
    const oldRequest = deferred()
    api.post.mockReturnValueOnce(oldRequest.promise)

    const view = renderPage()
    submitDescription(OLD_TEXT)

    view.unmount()

    await act(async () => {
      oldRequest.resolve({
        data: mappingFor(OLD_TEXT, 'cough', 'Cough'),
      })
    })

    expect(savedMapping()).toBeNull()
  })

  it('ignores a response belonging to a previous authentication token', async () => {
    const oldRequest = deferred()
    api.post.mockReturnValueOnce(oldRequest.promise)

    renderPage()
    submitDescription(OLD_TEXT)

    sessionStorage.setItem(TOKEN_KEY, 'synthetic-token-B')

    await act(async () => {
      oldRequest.resolve({
        data: mappingFor(OLD_TEXT, 'cough', 'Cough'),
      })
    })

    expect(savedMapping()).toBeNull()
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe('synthetic-token-B')

    expect(
      screen.queryByRole('heading', { name: 'Cough', exact: true }),
    ).not.toBeInTheDocument()
  })

  it('clears all previous assessment data immediately when text is edited', async () => {
    api.post.mockResolvedValueOnce({
      data: mappingFor(OLD_TEXT, 'cough', 'Cough'),
    })

    renderPage()
    submitDescription(OLD_TEXT)

    await screen.findByRole('heading', {
      name: 'Cough',
      exact: true,
    })

    sessionStorage.setItem(
      CONFIRMATION_KEY,
      JSON.stringify({ confirmed_codes: ['cough'] }),
    )
    sessionStorage.setItem(
      PREDICTION_KEY,
      JSON.stringify({ prediction_id: 'synthetic-old-result' }),
    )

    changeDescription(NEW_TEXT)

    expect(sessionStorage.getItem(MAPPING_KEY)).toBeNull()
    expect(sessionStorage.getItem(CONFIRMATION_KEY)).toBeNull()
    expect(sessionStorage.getItem(PREDICTION_KEY)).toBeNull()

    expect(
      screen.queryByRole('heading', { name: 'Cough', exact: true }),
    ).not.toBeInTheDocument()
  })
})