
import {
  fireEvent,
  render,
  screen,
  within,
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

import AppLayout from '../AppLayout'
import { useAuth } from '../../context/useAuth'

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

function renderLayout(role = null) {
  useAuth.mockReturnValue({
    isAuthenticated: Boolean(role),
    isAdmin: role === 'admin',
    loading: false,
    user: role
      ? {
          role,
          email: 'user@example.com',
        }
      : null,
    logout: vi.fn(),
  })

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<div>Home content</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('role-based application navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows patient navigation to patients', () => {
    renderLayout('patient')

    const nav = screen.getByRole('navigation', {
      name: 'Main navigation',
    })

    expect(
      within(nav).getByRole('link', {
        name: 'Dashboard',
      }),
    ).toHaveAttribute('href', '/dashboard')

    expect(
      within(nav).queryByRole('link', {
        name: 'Admin',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows administrator navigation to administrators', () => {
    renderLayout('admin')

    const nav = screen.getByRole('navigation', {
      name: 'Main navigation',
    })

    expect(
      within(nav).getByRole('link', {
        name: 'Admin',
      }),
    ).toHaveAttribute('href', '/admin')

    expect(
      within(nav).queryByRole('link', {
        name: 'Dashboard',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows no patient or admin navigation to guests', () => {
    renderLayout()

    const nav = screen.getByRole('navigation', {
      name: 'Main navigation',
    })

    expect(
      within(nav).queryByRole('link', {
        name: 'Dashboard',
      }),
    ).not.toBeInTheDocument()

    expect(
      within(nav).queryByRole('link', {
        name: 'Admin',
      }),
    ).not.toBeInTheDocument()
  })

  it('uses the patient dashboard in the footer', () => {
    renderLayout('patient')

    const footer = screen.getByRole('navigation', {
      name: 'Footer navigation',
    })

    expect(
      within(footer).getByRole('link', {
        name: 'Account overview',
      }),
    ).toHaveAttribute('href', '/dashboard')
  })

  it('uses the admin dashboard in the footer', () => {
    renderLayout('admin')

    const footer = screen.getByRole('navigation', {
      name: 'Footer navigation',
    })

    expect(
      within(footer).getByRole('link', {
        name: 'Account overview',
      }),
    ).toHaveAttribute('href', '/admin')
  })

  it('shows only patient links in the patient mobile menu', () => {
    renderLayout('patient')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const nav = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    expect(
      within(nav).getByRole('link', {
        name: 'Dashboard',
      }),
    ).toBeInTheDocument()

    expect(
      within(nav).queryByRole('link', {
        name: 'Admin',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows only admin links in the admin mobile menu', () => {
    renderLayout('admin')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const nav = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    })

    expect(
      within(nav).getByRole('link', {
        name: 'Admin',
      }),
    ).toBeInTheDocument()

    expect(
      within(nav).queryByRole('link', {
        name: 'Dashboard',
      }),
    ).not.toBeInTheDocument()
  })
})
