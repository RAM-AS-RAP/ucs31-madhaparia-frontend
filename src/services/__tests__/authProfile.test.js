import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../api'
import { registerPatient, updateCurrentUser } from '../auth'

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('account profile API requests', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('sends profile fields during public registration', async () => {
    const user = { id: 'patient', full_name: 'Example Patient' }
    api.post.mockResolvedValueOnce({ data: user })

    const result = await registerPatient(
      'patient@example.com',
      'SyntheticPassword123!',
      {
        full_name: 'Example Patient',
        phone_number: '+254712345678',
        role: 'admin',
      },
    )

    expect(result).toEqual(user)

    expect(api.post).toHaveBeenCalledWith(
      '/auth/register',
      {
        email: 'patient@example.com',
        password: 'SyntheticPassword123!',
        full_name: 'Example Patient',
        phone_number: '+254712345678',
      },
      { skipAuth: true },
    )
  })

  it('preserves calls without profile fields', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 'patient' } })

    await registerPatient(
      'patient@example.com',
      'SyntheticPassword123!',
    )

    expect(api.post).toHaveBeenCalledWith(
      '/auth/register',
      {
        email: 'patient@example.com',
        password: 'SyntheticPassword123!',
      },
      { skipAuth: true },
    )
  })

  it('updates the authenticated account through auth/me', async () => {
    const changes = {
      full_name: 'Updated Patient',
      phone_number: null,
    }
    const user = { id: 'patient', ...changes }

    api.patch.mockResolvedValueOnce({ data: user })

    expect(await updateCurrentUser(changes)).toEqual(user)
    expect(api.patch).toHaveBeenCalledWith('/auth/me', changes)
  })
})