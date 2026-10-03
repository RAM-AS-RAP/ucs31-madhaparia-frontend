import api from './api'

const TOKEN_KEY = 'respiracare_access_token'

export async function registerPatient(email, password) {
  const response = await api.post('/auth/register', {
    email,
    password,
  })

  return response.data
}

export async function loginPatient(email, password) {
  const response = await api.post('/auth/login', {
    email,
    password,
  })

  return response.data
}

export async function getCurrentUser() {
  const token = getAuthToken()

  if (!token) {
    throw new Error(
      'Authentication token is unavailable.',
    )
  }

  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data
}

export function saveAuthToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function hasAuthToken() {
  return Boolean(getAuthToken())
}