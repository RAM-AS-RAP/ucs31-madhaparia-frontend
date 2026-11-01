
import {
  fireEvent,
  render,
  screen,
  waitFor,
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

import AppLayout from '../../layouts/AppLayout'
import LoginPage from '../LoginPage'
import { useAuth } from '../../context/useAuth'

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderLogin(role, requestedPath) {
  useAuth.mockReturnValue({
    isAuthenticated: true,
    loading: false,
    isAdmin: role === 'admin',
    user: {
      email: 'user@example.com',
      role,
    },
  })

  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/login',
          state: requestedPath
            ? {
                from: requestedPath,
                authenticationRequired: true,
              }
            : null,
        },
      ]}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={<div>Patient dashboard</div>}
        />

        <Route
          path="/history"
          element={<div>Patient history</div>}
        />

        <Route
          path="/history/:predictionId"
          element={<div>Patient history details</div>}
        />

        <Route
          path="/admin"
          element={<div>Admin dashboard</div>}
        />

        <Route
          path="/admin/history/:predictionId"
          element={<div>Admin history details</div>}
        />

        <Route
          path="/access-denied"
          element={<div>Access denied</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('role-aware redirects after login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a patient to the requested history page', () => {
    renderLogin('patient', '/history')

    expect(
      screen.getByText('Patient history'),
    ).toBeInTheDocument()
  })

  it('returns a patient to the requested history detail', () => {
    renderLogin('patient', '/history/abc-123')

    expect(
      screen.getByText('Patient history details'),
    ).toBeInTheDocument()
  })

  it('sends a patient to the dashboard by default', () => {
    renderLogin('patient')

    expect(
      screen.getByText('Patient dashboard'),
    ).toBeInTheDocument()
  })

  it('does not send a patient to an administrator page', () => {
    renderLogin('patient', '/admin')

    expect(
      screen.getByText('Patient dashboard'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Admin dashboard'),
    ).not.toBeInTheDocument()
  })

  it('sends an administrator to the admin dashboard', () => {
    renderLogin('admin')

    expect(
      screen.getByText('Admin dashboard'),
    ).toBeInTheDocument()
  })

  it('returns an administrator to an allowed admin detail', () => {
    renderLogin('admin', '/admin/history/abc-123')

    expect(
      screen.getByText('Admin history details'),
    ).toBeInTheDocument()
  })

  it('does not send an administrator to patient history', () => {
    renderLogin('admin', '/history')

    expect(
      screen.getByText('Admin dashboard'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Patient history'),
    ).not.toBeInTheDocument()
  })

  it('sends an unsupported role to access denied', () => {
    renderLogin('unknown', '/dashboard')

    expect(
      screen.getByText('Access denied'),
    ).toBeInTheDocument()
  })
})

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('navigates home before signing out', async () => {
    const logout = vi.fn()

    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
      user: {
        email: 'patient@example.com',
        role: 'patient',
      },
      logout,
    })

    render(
      <MemoryRouter initialEntries={['/history']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route
              path="/"
              element={<div>Home page</div>}
            />

            <Route
              path="/history"
              element={<div>History page</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Log out',
      }),
    )

    expect(
      await screen.findByText('Home page'),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1)
    })
  })
})
