import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { useAuth } from '../../context/useAuth'

vi.mock('../../context/useAuth', () => ({ useAuth: vi.fn() }))

describe('restricted account login messages', () => {
  beforeEach(() => vi.clearAllMocks())

  it.each([
    ['en', 403, 'account_deactivated', 'Your account has been deactivated. Contact an administrator.'],
    ['en', 403, 'account_blocked', 'Your account has been blocked. Contact an administrator.'],
    ['sw', 403, 'account_deactivated', 'Akaunti yako imezimwa. Wasiliana na msimamizi.'],
    ['sw', 403, 'account_blocked', 'Akaunti yako imezuiwa. Wasiliana na msimamizi.'],
    ['en', 401, undefined, 'The email or password you entered is incorrect.'],
  ])('shows the %s message for status %s / %s', async (language, status, code, message) => {
    const login = vi.fn().mockRejectedValue({ response: { status, data: { detail: code ? { code } : 'Invalid email or password.' } } })
    useAuth.mockReturnValue({ isAuthenticated: false, user: null, login })
    render(<LanguageContext.Provider value={{ language, t: (key, values) => translate(language, key, values) }}>
      <MemoryRouter><LoginPage /></MemoryRouter>
    </LanguageContext.Provider>)
    fireEvent.change(screen.getByLabelText(translate(language, 'auth.email')), { target: { value: 'patient@example.test' } })
    fireEvent.change(screen.getByLabelText(translate(language, 'auth.password'), { exact: true }), { target: { value: 'SyntheticPassword!' } })
    fireEvent.click(screen.getByRole('button', { name: translate(language, 'nav.login'), exact: true }))
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(login).toHaveBeenCalledTimes(1)
  })
})
