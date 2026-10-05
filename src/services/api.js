import axios from 'axios'

import {
  clearAuthToken,
  getAuthToken,
  notifyAuthExpired,
} from './authToken'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000',

  headers: {
    'Content-Type': 'application/json',
  },
})

function setAuthorizationHeader(
  config,
  token,
) {
  if (!config.headers) {
    config.headers = {}
  }

  if (
    typeof config.headers.set ===
    'function'
  ) {
    config.headers.set(
      'Authorization',
      `Bearer ${token}`,
    )

    return
  }

  config.headers.Authorization =
    `Bearer ${token}`
}

function hasAuthorizationHeader(
  headers,
) {
  if (!headers) {
    return false
  }

  if (
    typeof headers.get ===
    'function'
  ) {
    return Boolean(
      headers.get('Authorization'),
    )
  }

  return Boolean(
    headers.Authorization ||
      headers.authorization,
  )
}

api.interceptors.request.use(
  (config) => {
    if (config.skipAuth === true) {
      return config
    }

    const token = getAuthToken()

    if (token) {
      setAuthorizationHeader(
        config,
        token,
      )
    }

    return config
  },
)

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status =
      error.response?.status ?? null

    const requestWasAuthenticated =
      hasAuthorizationHeader(
        error.config?.headers,
      )

    if (
      status === 401 &&
      requestWasAuthenticated &&
      error.config?.skipAuth !== true
    ) {
      clearAuthToken()
      notifyAuthExpired()
    }

    error.respiracare = {
      status,
      networkError:
        isNetworkError(error),

      message:
        getApiErrorMessage(error),
    }

    return Promise.reject(error)
  },
)

export function getApiErrorStatus(
  error,
) {
  return error.response?.status ?? null
}

export function isNetworkError(
  error,
) {
  return (
    error.code === 'ERR_NETWORK' ||
    (
      error.request &&
      !error.response
    )
  )
}

export function getApiErrorMessage(
  error,
  fallback = (
    'Something went wrong. Please try again.'
  ),
) {
  if (isNetworkError(error)) {
    return (
      'RespiraCare could not connect to the ' +
      'backend. Please make sure the API is ' +
      'running and try again.'
    )
  }

  const detail =
    error.response?.data?.detail

  if (
    typeof detail === 'string' &&
    detail.trim()
  ) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg)
      .filter(Boolean)

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  return fallback
}

export default api