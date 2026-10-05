import api from './api'
import { getAuthToken } from './auth'

function getAdminHeaders() {
  const token = getAuthToken()

  if (!token) {
    throw new Error(
      'Authentication token is unavailable.',
    )
  }

  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function getAdminHistory(
  limit = 500,
) {
  const response = await api.get(
    '/admin/history',
    {
      params: {
        limit,
      },
      headers: getAdminHeaders(),
    },
  )

  return response.data
}

export async function getAdminHistoryItem(
  predictionId,
) {
  const response = await api.get(
    `/admin/history/${predictionId}`,
    {
      headers: getAdminHeaders(),
    },
  )

  return response.data
}

export async function getAdminFeedback(
  limit = 500,
) {
  const response = await api.get(
    '/admin/feedback',
    {
      params: {
        limit,
      },
      headers: getAdminHeaders(),
    },
  )

  return response.data
}