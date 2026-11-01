
import {
  render,
  screen,
} from '@testing-library/react'

import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import PatientRoute from '../PatientRoute'
import { useAuth } from '../../context/useAuth'

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderPatientRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <PatientRoute>
              <div>Patient dashboard content</div>
            </PatientRoute>
          }
        />

        <Route
          path="/login"
          element={<div>Login page</div>}
        />

        <Route
          path="/admin"
          element={<div>Admin dashboard</div>}
        />

        <Route
          path="/access-denied"
          element={<div>Access denied</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PatientRoute role-based access', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows a patient to access patient pages', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'patient' },
    })

    renderPatientRoute()

    expect(
      screen.getByText('Patient dashboard content'),
    ).toBeInTheDocument()
  })

  it('redirects an administrator to the admin dashboard', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'admin' },
    })

    renderPatientRoute()

    expect(
      screen.getByText('Admin dashboard'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Patient dashboard content'),
    ).not.toBeInTheDocument()
  })

  it('redirects guests to login', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    })

    renderPatientRoute()

    expect(
      screen.getByText('Login page'),
    ).toBeInTheDocument()
  })

  it('blocks unknown roles from patient pages', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { role: 'unknown' },
    })

    renderPatientRoute()

    expect(
      screen.getByText('Access denied'),
    ).toBeInTheDocument()
  })

  it('waits for authentication to finish', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
    })

    renderPatientRoute()

    expect(
      screen.getByText(
        'Checking your RespiraCare session...',
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Patient dashboard content'),
    ).not.toBeInTheDocument()
  })
})
