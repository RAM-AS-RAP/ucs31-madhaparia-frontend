import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import RegisterPage from '../RegisterPage'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { registerPatient } from '../../services/auth'

vi.mock('../../services/auth', () => ({
  registerPatient: vi.fn(),
}))

const PASSWORD = 'SyntheticPassword123!'

function showRegistration(language = 'en') {
  return render(
    <LanguageContext.Provider
      value={{
        language,
        t: (key, values) => translate(language, key, values),
      }}
    >
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/login"
            element={<p>Registration complete</p>}
          />
        </Routes>
      </MemoryRouter>
    </LanguageContext.Provider>,
  )
}

function fillRegistration(changes = {}) {
  const values = {
    'Full name': '  Zoë   Njeri  ',
    'Phone number': '+254 712-345-678',
    'Email address': '  PERSON@EXAMPLE.COM  ',
    Password: PASSWORD,
    'Confirm password': PASSWORD,
    ...changes,
  }

  for (const [label, value] of Object.entries(values)) {
    fireEvent.change(screen.getByLabelText(label), {
      target: { value },
    })
  }
}

function submit() {
  fireEvent.click(
    screen.getByRole('button', { name: 'Create account' }),
  )
}

describe('registration with profile details', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('submits normalised profile details and opens login', async () => {
    registerPatient.mockResolvedValueOnce({ id: 'new-patient' })

    showRegistration()
    fillRegistration()
    submit()

    expect(
      await screen.findByText('Registration complete'),
    ).toBeInTheDocument()

    expect(registerPatient).toHaveBeenCalledWith(
      'person@example.com',
      PASSWORD,
      {
        full_name: 'Zoë Njeri',
        phone_number: '+254712345678',
      },
    )
  })

  it('allows registration without a phone number', async () => {
    registerPatient.mockResolvedValueOnce({ id: 'new-patient' })

    showRegistration()
    fillRegistration({ 'Phone number': '' })
    submit()

    await screen.findByText('Registration complete')

    expect(registerPatient).toHaveBeenCalledWith(
      'person@example.com',
      PASSWORD,
      {
        full_name: 'Zoë Njeri',
        phone_number: null,
      },
    )
  })

  it.each([
    ['Full name', '12345'],
    ['Phone number', '0712345678'],
    ['Email address', 'invalid-email'],
    ['Password', 'short'],
    ['Confirm password', 'DifferentPassword123!'],
  ])(
    'rejects an invalid %s before calling the API',
    (label, value) => {
      showRegistration()
      fillRegistration({ [label]: value })
      submit()

      expect(registerPatient).not.toHaveBeenCalled()

      expect(screen.getByLabelText(label))
        .toHaveAttribute('aria-invalid', 'true')
    },
  )

  it('shows a duplicate-email error and retains the entered name', async () => {
    registerPatient.mockRejectedValueOnce({
      response: { status: 409 },
    })

    showRegistration()
    fillRegistration()
    submit()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists.',
    )

    expect(screen.getByLabelText('Full name'))
      .toHaveValue('  Zoë   Njeri  ')
  })

  it('prevents duplicate submissions while registration is pending', () => {
    registerPatient.mockReturnValueOnce(new Promise(() => {}))

    showRegistration()
    fillRegistration()
    submit()

    fireEvent.submit(
      screen.getByLabelText('Full name').closest('form'),
    )

    expect(registerPatient).toHaveBeenCalledTimes(1)
  })

  it('shows profile labels and validation in Kiswahili', () => {
    showRegistration('sw')

    fireEvent.click(
      screen.getByRole('button', { name: 'Fungua akaunti' }),
    )

    expect(screen.getByLabelText('Jina kamili'))
      .toHaveAttribute('aria-invalid', 'true')

    expect(
      screen.getByText(
        'Weka jina lenye herufi na urefu wa kati ya vibambo 2 na 100.',
      ),
    ).toBeInTheDocument()
  })
})