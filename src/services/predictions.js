import api from './api'

const PREDICTION_KEY =
  'respiracare_prediction_result'

export async function createPrediction({
  age,
  sex,
  text,
  confirmedCodes,
}) {
  const response = await api.post(
    '/predict',
    {
      age,
      sex,
      text,
      confirmed_codes: confirmedCodes,
    },
  )

  return response.data
}

export function savePredictionResult(
  prediction,
) {
  sessionStorage.setItem(
    PREDICTION_KEY,
    JSON.stringify(prediction),
  )
}

export function getSavedPredictionResult() {
  const stored =
    sessionStorage.getItem(
      PREDICTION_KEY,
    )

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    sessionStorage.removeItem(
      PREDICTION_KEY,
    )

    return null
  }
}

export function clearPredictionResult() {
  sessionStorage.removeItem(
    PREDICTION_KEY,
  )
}