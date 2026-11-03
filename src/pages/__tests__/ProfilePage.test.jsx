import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import App from '../../App'
import { AuthProvider } from '../../context/AuthContext'
import { useAuth } from '../../context/useAuth'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { getCurrentUser, updateCurrentUser } from '../../services/auth'
import { saveAuthToken } from '../../services/authToken'
import { resolvePostLoginPath } from '../../utils/roleRouting'

vi.mock('../../services/auth', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    getCurrentUser: vi.fn(),
    updateCurrentUser: vi.fn(),
  }
})

const USER = {
  id: 'profile-patient',
  email: 'patient@example.com',
  full_name: 'Example Patient',
  phone_number: '+254712345678',
  role: 'patient',
}

function SessionProbe() {
  const { user, logout } = useAuth()

  return (
    <div>
      <p data-testid="session-name">
        {user ? user.full_name || user.email : 'Signed out'}
      </p>
      <button type="button" onClick={logout}>Test sign out</button>
    </div>
  )
}

function showProfile({
  signedIn = true,
  role = 'patient',
  language = 'en',
  user = USER,
} = {}) {
  if (signedIn) saveAuthToken('profile-test-token')

  getCurrentUser.mockResolvedValue({ ...user, role })

  return render(
    <LanguageContext.Provider
      value={{
        language,
        t: (key, values) => translate(language, key, values),
      }}
    >
      <AuthProvider>
        <MemoryRouter initialEntries={['/profile']}>
          <SessionProbe />
          <App />
        </MemoryRouter>
      </AuthProvider>
    </LanguageContext.Provider>,
  )
}

function waitForProfile() {
  return screen.findByLabelText('Full name')
}

function changeName(value = 'Updated Patient') {
  fireEvent.change(screen.getByLabelText('Full name'), {
    target: { value },
  })
}

function saveChanges() {
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
}

describe('editable account profile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()
  })

  it('redirects guests to login and hides the profile link', async () => {
    showProfile({ signedIn: false })

    expect(
      await screen.findByRole('heading', { name: 'Log in' }),
    ).toBeInTheDocument()

    const navigation = screen.getByRole('navigation', {
      name: 'Main navigation',
    })

    expect(
      within(navigation).queryByRole('link', { name: 'My profile' }),
    ).not.toBeInTheDocument()
    expect(updateCurrentUser).not.toHaveBeenCalled()
  })

  it.each(['patient', 'admin'])(
    'shows the profile and navigation links for a %s',
    async (role) => {
      showProfile({ role })

      expect(await waitForProfile()).toHaveValue('Example Patient')
      expect(screen.getByLabelText('Phone number'))
        .toHaveValue('+254712345678')
      expect(screen.getByLabelText('Email address'))
        .toHaveAttribute('readonly')
      expect(screen.getByLabelText('Account role'))
        .toHaveAttribute('readonly')

      const navigation = screen.getByRole('navigation', {
        name: 'Main navigation',
      })
      expect(
        within(navigation).getByRole('link', { name: 'My profile' }),
      ).toHaveAttribute('href', '/profile')

      fireEvent.click(
        screen.getByRole('button', { name: 'Open navigation menu' }),
      )

      const mobile = screen.getByRole('navigation', {
        name: 'Mobile navigation',
      })
      expect(
        within(mobile).getByRole('link', { name: 'My profile' }),
      ).toHaveAttribute('href', '/profile')
    },
  )

  it('saves normalised details and updates the authentication context', async () => {
    updateCurrentUser.mockResolvedValueOnce({
      ...USER,
      full_name: 'Updated Patient',
      phone_number: '+254722345678',
    })

    showProfile()
    await waitForProfile()
    changeName('  Updated   Patient  ')
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '+254 722-345-678' },
    })
    saveChanges()

    expect(
      await screen.findByText('Your profile has been updated.'),
    ).toBeInTheDocument()
    expect(updateCurrentUser).toHaveBeenCalledWith({
      full_name: 'Updated Patient',
      phone_number: '+254722345678',
    })
    expect(screen.getByLabelText('Full name')).toHaveValue('Updated Patient')
    expect(screen.getByLabelText('Phone number')).toHaveValue('+254722345678')
    expect(screen.getByTestId('session-name'))
      .toHaveTextContent('Updated Patient')
  })

  it('restores the saved profile when a new session check loads it', async () => {
    const updatedUser = { ...USER, full_name: 'Updated Patient' }
    updateCurrentUser.mockResolvedValueOnce(updatedUser)
    const view = showProfile()
    await waitForProfile()
    changeName()
    saveChanges()
    await screen.findByText('Your profile has been updated.')
    view.unmount()

    showProfile({ user: updatedUser })

    expect(await waitForProfile()).toHaveValue('Updated Patient')
  })

  it('allows an older account to add its missing profile details', async () => {
    const oldUser = { ...USER, full_name: null, phone_number: null }
    updateCurrentUser.mockResolvedValueOnce({
      ...oldUser,
      full_name: 'Updated Patient',
    })
    showProfile({ user: oldUser })
    expect(await waitForProfile()).toHaveValue('')
    changeName()
    saveChanges()
    await screen.findByText('Your profile has been updated.')
    expect(updateCurrentUser).toHaveBeenCalledWith({
      full_name: 'Updated Patient',
      phone_number: null,
    })
  })

  it('allows the optional phone number to be cleared', async () => {
    updateCurrentUser.mockResolvedValueOnce({ ...USER, phone_number: null })
    showProfile()
    await waitForProfile()
    fireEvent.change(screen.getByLabelText('Phone number'), {
      target: { value: '' },
    })
    saveChanges()
    await screen.findByText('Your profile has been updated.')
    expect(updateCurrentUser).toHaveBeenCalledWith({
      full_name: USER.full_name,
      phone_number: null,
    })
    expect(screen.getByLabelText('Phone number')).toHaveValue('')
  })

  it.each([
    ['Full name', '12345'],
    ['Phone number', 'invalid'],
  ])('rejects an invalid %s before saving', async (label, value) => {
    showProfile()
    await waitForProfile()
    fireEvent.change(screen.getByLabelText(label), { target: { value } })
    saveChanges()
    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true')
    expect(updateCurrentUser).not.toHaveBeenCalled()
  })

  it('keeps entered details when saving fails', async () => {
    updateCurrentUser.mockRejectedValueOnce({ response: { status: 503 } })
    showProfile()
    await waitForProfile()
    changeName()
    saveChanges()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your profile could not be updated. Please try again.',
    )
    expect(screen.getByLabelText('Full name')).toHaveValue('Updated Patient')
    expect(screen.getByTestId('session-name')).toHaveTextContent('Example Patient')
  })

  it('rejects a response for a different account', async () => {
    updateCurrentUser.mockResolvedValueOnce({
      ...USER,
      id: 'another-patient',
      full_name: 'Another Patient',
    })
    showProfile()
    await waitForProfile()
    changeName()
    saveChanges()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your profile could not be updated. Please try again.',
    )
    expect(screen.getByTestId('session-name')).toHaveTextContent('Example Patient')
  })

  it('resets unsaved changes without calling the API', async () => {
    showProfile()
    await waitForProfile()
    changeName()
    fireEvent.click(screen.getByRole('button', { name: 'Reset changes' }))
    expect(screen.getByLabelText('Full name')).toHaveValue('Example Patient')
    expect(updateCurrentUser).not.toHaveBeenCalled()
  })

  it('prevents duplicate saves while a request is pending', async () => {
    let finishSave
    updateCurrentUser.mockReturnValueOnce(new Promise((resolve) => {
      finishSave = resolve
    }))
    showProfile()
    await waitForProfile()
    changeName()
    saveChanges()
    fireEvent.submit(screen.getByLabelText('Full name').closest('form'))
    expect(updateCurrentUser).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Saving changes...' }))
      .toBeDisabled()

    await act(async () => {
      finishSave({ ...USER, full_name: 'Updated Patient' })
    })
    expect(screen.getByText('Your profile has been updated.')).toBeInTheDocument()
  })

  it('does not restore the account if saving finishes after logout', async () => {
    let finishSave
    updateCurrentUser.mockReturnValueOnce(new Promise((resolve) => {
      finishSave = resolve
    }))
    showProfile()
    await waitForProfile()
    changeName()
    saveChanges()
    fireEvent.click(screen.getByRole('button', { name: 'Test sign out' }))
    await screen.findByRole('heading', { name: 'Log in' })

    await act(async () => {
      finishSave({ ...USER, full_name: 'Updated Patient' })
    })
    expect(screen.getByTestId('session-name')).toHaveTextContent('Signed out')
    expect(screen.queryByText('Your profile has been updated.'))
      .not.toBeInTheDocument()
  })

  it('shows profile validation in Kiswahili', async () => {
    showProfile({ language: 'sw' })
    const name = await screen.findByLabelText('Jina kamili')
    fireEvent.change(name, { target: { value: '12345' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hifadhi mabadiliko' }))
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(
      'Weka jina lenye herufi na urefu wa kati ya vibambo 2 na 100.',
    )).toBeInTheDocument()
  })

  it.each(['patient', 'admin'])(
    'allows a %s to return to profile after login',
    (role) => {
      expect(resolvePostLoginPath(role, '/profile')).toBe('/profile')
    },
  )
})
