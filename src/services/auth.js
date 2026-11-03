import api from './api'
import { getAuthToken } from './authToken'

export {
  AUTH_EXPIRED_EVENT,
  clearAuthToken,
  getAuthToken,
  hasAuthToken,
  saveAuthToken,
} from './authToken'

export async function registerPatient(
  email,
  password,
  profile = {},
) {
  const body = {
    email,
    password,
  }

  if (profile.full_name !== undefined) {
    body.full_name = profile.full_name
  }

  if (profile.phone_number !== undefined) {
    body.phone_number = profile.phone_number
  }

  const response = await api.post(
    '/auth/register',
    body,
    { skipAuth: true },
  )

  return response.data
}

export async function loginPatient(email, password) {
  const response = await api.post(
    '/auth/login',
    { email, password },
    { skipAuth: true },
  )

  return response.data
}

export async function getCurrentUser() {
  if (!getAuthToken()) {
    throw new Error('Authentication token is unavailable.')
  }

  const response = await api.get('/auth/me')

  return response.data
}

export async function updateCurrentUser(profile) {
  const response = await api.patch('/auth/me', profile)

  return response.data
}