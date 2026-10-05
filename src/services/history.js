import api from './api'
import { getAuthToken } from './auth'

function authHeaders() {
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

export async function getPatientHistory(
  limit = 20,
) {
  const response = await api.get(
    '/history',
    {
      params: {
        limit,
      },
      headers: authHeaders(),
    },
  )

  return response.data
}

export async function getPatientHistoryItem(
  predictionId,
) {
  const response = await api.get(
    `/history/${predictionId}`,
    {
      headers: authHeaders(),
    },
  )

  return response.data
}