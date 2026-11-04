import api from './api'

function validUser(user) {
  return user && typeof user.id === 'string' && typeof user.email === 'string' &&
    ['patient', 'admin'].includes(user.role) && typeof user.is_active === 'boolean' &&
    typeof user.is_blocked === 'boolean' && Number.isInteger(user.revision) && user.revision >= 0
}

function checkedUser(user) {
  if (!validUser(user)) throw new Error('Invalid user-management response')
  return user
}

export async function getAdminUsers({ q = '', role = '', status = '', page = 1 } = {}, { signal } = {}) {
  const { data } = await api.get('/admin/users', {
    params: { q, role: role || undefined, status: status || undefined, page, page_size: 12 },
    signal, timeout: 15000,
  })
  if (!Array.isArray(data?.users) || !data.users.every(validUser) ||
      !Number.isInteger(data.total) || data.total < data.users.length ||
      data.page !== page || data.page_size !== 12) throw new Error('Invalid user-management response')
  return data
}

export async function addAdminUser(payload, { signal } = {}) {
  const { data } = await api.post('/admin/users', payload, { signal, timeout: 15000 })
  return checkedUser(data)
}

export async function changeAdminUserStatus(user, action, { signal } = {}) {
  const { data } = await api.patch(`/admin/users/${encodeURIComponent(user.id)}/status`, {
    action, expected_revision: user.revision,
  }, { signal, timeout: 15000 })
  return checkedUser(data)
}

export async function deleteAdminUser(user, confirmationEmail, adminPassword, { signal } = {}) {
  const { data } = await api.delete(`/admin/users/${encodeURIComponent(user.id)}`, {
    data: { confirmation_email: confirmationEmail.trim(), admin_password: adminPassword, expected_revision: user.revision },
    signal, timeout: 15000,
  })
  if (data?.status !== 'deleted' || data.user_id !== user.id) throw new Error('Invalid user-management response')
  return data
}

export function adminUserError(error) {
  const code = error.response?.data?.detail?.code
  if (['email_exists', 'account_changed', 'account_not_found', 'protected_account',
    'admin_password_invalid', 'confirmation_mismatch', 'reauth_limited'].includes(code)) return code
  if (error.response?.status === 401) return 'sessionExpired'
  if (error.response?.status === 403) return 'accessRequired'
  if (error.response?.status === 422) return 'invalidFields'
  return 'requestFailed'
}
