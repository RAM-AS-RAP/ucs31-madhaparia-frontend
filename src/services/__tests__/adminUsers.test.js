import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../api'
import { addAdminUser, changeAdminUserStatus, deleteAdminUser, getAdminUsers } from '../adminUsers'

vi.mock('../api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }))
const user = { id: 'patient-test', email: 'patient@example.test', role: 'patient', is_active: true, is_blocked: false, revision: 3 }

describe('user-management API contract', () => {
  beforeEach(() => vi.resetAllMocks())
  it('uses authenticated server-side search and pagination with abort/timeout controls', async () => {
    const signal = new AbortController().signal
    api.get.mockResolvedValue({ data: { users: [user], total: 13, page: 2, page_size: 12 } })
    await getAdminUsers({ q: 'Name', role: 'patient', status: 'blocked', page: 2 }, { signal })
    expect(api.get).toHaveBeenCalledWith('/admin/users', { params: { q: 'Name', role: 'patient', status: 'blocked', page: 2, page_size: 12 }, signal, timeout: 15000 })
  })
  it.each([
    { users: null, total: 0, page: 1, page_size: 12 },
    { users: [{ ...user, is_active: 'true' }], total: 1, page: 1, page_size: 12 },
    { users: [user], total: 0, page: 1, page_size: 12 },
    { users: [user], total: 1, page: 2, page_size: 12 },
  ])('rejects malformed list responses instead of inventing valid empty data', async (data) => {
    api.get.mockResolvedValue({ data })
    await expect(getAdminUsers()).rejects.toThrow('Invalid user-management response')
  })
  it('posts account credentials only in the body and does not disable authentication', async () => {
    const payload = { email: user.email, full_name: 'Test Patient', password: 'SyntheticPassword!' }
    api.post.mockResolvedValue({ data: user })
    expect(await addAdminUser(payload)).toEqual(user)
    expect(api.post).toHaveBeenCalledWith('/admin/users', payload, { signal: undefined, timeout: 15000 })
  })
  it('binds status changes and deletion to the reviewed revision and target', async () => {
    api.patch.mockResolvedValue({ data: user })
    await changeAdminUserStatus(user, 'block')
    expect(api.patch).toHaveBeenCalledWith('/admin/users/patient-test/status', { action: 'block', expected_revision: 3 }, { signal: undefined, timeout: 15000 })
    api.delete.mockResolvedValue({ data: { status: 'deleted', user_id: user.id } })
    await deleteAdminUser(user, ` ${user.email} `, 'SyntheticAdminPassword!')
    expect(api.delete).toHaveBeenCalledWith('/admin/users/patient-test', { data: { confirmation_email: user.email, admin_password: 'SyntheticAdminPassword!', expected_revision: 3 }, signal: undefined, timeout: 15000 })
    api.delete.mockResolvedValue({ data: { status: 'deleted', user_id: 'other' } })
    await expect(deleteAdminUser(user, user.email, 'SyntheticAdminPassword!')).rejects.toThrow()
  })
})
