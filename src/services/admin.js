import api from './api'

export async function getAdminHistory(
  limit = 500,
  { signal } = {},
) {
  const response = await api.get(
    '/admin/history',
    {
      signal,
      params: {
        limit,
      },
    },
  )

  return response.data
}

export async function getAdminHistoryItem(
  predictionId,
) {
  const response = await api.get(
    `/admin/history/${predictionId}`,
  )

  return response.data
}

export async function getAdminFeedback(
  limit = 500,
  { signal } = {},
) {
  const response = await api.get(
    '/admin/feedback',
    {
      signal,
      params: {
        limit,
      },
    },
  )

  return response.data
}
