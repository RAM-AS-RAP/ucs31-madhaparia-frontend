import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { AuthProvider } from '../AuthContext'
import { useAuth } from '../useAuth'
import PatientRoute from '../../components/PatientRoute'
import PredictionPage from '../../pages/PredictionPage'
import api from '../../services/api'
import { getAuthToken, saveAuthToken } from '../../services/authToken'

const originalAdapter = api.defaults.adapter

const ASSESSMENT_KEYS = [
  'respiracare_symptom_mapping',
  'respiracare_symptom_confirmation',
  'respiracare_prediction_result',
]

function seedAssessment() {
  sessionStorage.setItem(
    ASSESSMENT_KEYS[0],
    JSON.stringify({
      input_text: 'Synthetic patient A symptoms',
      recognised_symptoms: [],
    }),
  )

  sessionStorage.setItem(
    ASSESSMENT_KEYS[1],
    JSON.stringify({
      confirmed_codes: ['cough'],
      confirmed_symptoms: [],
      safety_status: 'normal',
    }),
  )

  sessionStorage.setItem(
    ASSESSMENT_KEYS[2],
    JSON.stringify({
      prediction_id: 'synthetic-patient-A-session',
      input_text: 'Synthetic patient A symptoms',
      confirmed_codes: ['cough'],
      status: 'prediction_complete',
      predictions: [{
        display_name: 'Synthetic patient A condition',
        model_confidence_percent: 60,
      }],
      health_guidance: 'Synthetic guidance.',
      disclaimer: 'Synthetic test data only.',
    }),
  )
}

function expectAssessmentCleared() {
  ASSESSMENT_KEYS.forEach((key) => {
    expect(sessionStorage.getItem(key)).toBeNull()
  })
}

function rejectUnauthorized(config) {
  return Promise.reject(
    new AxiosError(
      'Authentication required.',
      'ERR_BAD_REQUEST',
      config,
      null,
      {
        status: 401,
        data: { detail: 'Authentication required.' },
        headers: {},
        config,
      },
    ),
  )
}

function fakeAdapter(config) {
  if (config.url === '/audit/expired') {
    return rejectUnauthorized(config)
  }

  if (config.url === '/audit/network') {
    return Promise.reject(
      new AxiosError('Network unavailable.', 'ERR_NETWORK', config, {}),
    )
  }

  if (config.url === '/auth/login') {
    const body = JSON.parse(config.data)

    if (body.password === 'wrong-password') {
      return rejectUnauthorized(config)
    }

    return Promise.resolve({
      data: { access_token: 'synthetic-token-B' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
  }

  if (config.url === '/auth/me') {
    const isPatientB =
      config.headers.get('Authorization') === 'Bearer synthetic-token-B'

    return Promise.resolve({
      data: {
        id: isPatientB ? 'B' : 'A',
        email: isPatientB ? 'b@example.test' : 'a@example.test',
        role: 'patient',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
  }

  return Promise.reject(
    new Error(`Unexpected test request: ${config.url}`),
  )
}

function SessionControls() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')

  async function loginPatientB() {
    await login('b@example.test', 'synthetic-password')
    navigate('/prediction')
  }

  async function tryWrongPassword() {
    try {
      await login('b@example.test', 'wrong-password')
    } catch {
      setNotice('Login rejected')
    }
  }

  return (
    <div>
      <p>{`Current user: ${user?.id || 'guest'}`}</p>
      <p>{notice}</p>

      <button
        type="button"
        onClick={() => {
          api.get('/audit/expired').catch(() => {})
        }}
      >
        Expire session
      </button>

      <button type="button" onClick={loginPatientB}>
        Log in as patient B
      </button>

      <button type="button" onClick={tryWrongPassword}>
        Try wrong password
      </button>

      <button type="button" onClick={logout}>
        End session
      </button>
    </div>
  )
}

function renderSession() {
  return render(
    <MemoryRouter initialEntries={['/prediction']}>
      <AuthProvider>
        <SessionControls />

        <Routes>
          <Route
            path="/prediction"
            element={
              <PatientRoute>
                <PredictionPage />
              </PatientRoute>
            }
          />
          <Route path="/login" element={<p>Login required</p>} />
          <Route
            path="/symptoms"
            element={<p>New symptom assessment</p>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('assessment isolation between authenticated sessions', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()

    api.defaults.adapter = fakeAdapter

    saveAuthToken('synthetic-token-A')
    seedAssessment()

    localStorage.setItem('rc-theme:guest', 'dark')
    sessionStorage.setItem('unrelated-session-data', 'keep')
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
  })

  it('clears expired patient A data before patient B logs in', async () => {
    renderSession()

    expect(
      await screen.findByText('Synthetic patient A condition'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', {
      name: 'Expire session',
    }))

    expect(await screen.findByText('Login required')).toBeInTheDocument()
    expect(getAuthToken()).toBeNull()
    expectAssessmentCleared()

    fireEvent.click(screen.getByRole('button', {
      name: 'Log in as patient B',
    }))

    expect(
      await screen.findByText('New symptom assessment'),
    ).toBeInTheDocument()

    expect(screen.getByText('Current user: B')).toBeInTheDocument()
    expect(
      screen.queryByText('Synthetic patient A condition'),
    ).not.toBeInTheDocument()

    expect(getAuthToken()).toBe('synthetic-token-B')
    expectAssessmentCleared()
  })

  it('clears assessment data when AuthProvider logs out directly', async () => {
    renderSession()
    await screen.findByText('Synthetic patient A condition')

    fireEvent.click(screen.getByRole('button', {
      name: 'End session',
    }))

    expect(await screen.findByText('Login required')).toBeInTheDocument()
    expect(getAuthToken()).toBeNull()
    expectAssessmentCleared()

    expect(localStorage.getItem('rc-theme:guest')).toBe('dark')
    expect(sessionStorage.getItem('unrelated-session-data')).toBe('keep')
  })

  it('preserves an assessment when restoring the same valid session', async () => {
    renderSession()

    expect(
      await screen.findByText('Synthetic patient A condition'),
    ).toBeInTheDocument()

    expect(getAuthToken()).toBe('synthetic-token-A')

    ASSESSMENT_KEYS.forEach((key) => {
      expect(sessionStorage.getItem(key)).not.toBeNull()
    })
  })

  it('does not clear the session or assessment for a network error', async () => {
    renderSession()
    await screen.findByText('Synthetic patient A condition')

    await expect(api.get('/audit/network')).rejects.toBeTruthy()

    expect(getAuthToken()).toBe('synthetic-token-A')
    expect(screen.getByText('Current user: A')).toBeInTheDocument()
    expect(
      screen.getByText('Synthetic patient A condition'),
    ).toBeInTheDocument()
  })

  it('does not clear patient A data for an unsuccessful login attempt', async () => {
    renderSession()
    await screen.findByText('Synthetic patient A condition')

    fireEvent.click(screen.getByRole('button', {
      name: 'Try wrong password',
    }))

    expect(await screen.findByText('Login rejected')).toBeInTheDocument()
    expect(getAuthToken()).toBe('synthetic-token-A')
    expect(screen.getByText('Current user: A')).toBeInTheDocument()

    expect(
      screen.getByText('Synthetic patient A condition'),
    ).toBeInTheDocument()
  })

  it('clears orphaned assessment data when a new login succeeds', async () => {
    // Simulate leftover assessment data without an authentication token.
    sessionStorage.removeItem('respiracare_access_token')

    renderSession()
    await screen.findByText('Login required')

    fireEvent.click(screen.getByRole('button', {
      name: 'Log in as patient B',
    }))

    expect(
      await screen.findByText('New symptom assessment'),
    ).toBeInTheDocument()

    expect(screen.getByText('Current user: B')).toBeInTheDocument()
    expectAssessmentCleared()
  })
})