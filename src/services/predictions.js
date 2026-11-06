import api from './api'

const PREDICTION_KEY =
  'respiracare_prediction_result'

export async function createPrediction({
  age,
  sex,
  text,
  confirmedCodes,
  corrections,
  durations,
  language,
  covid_test,
}) {
  const response = await api.post(
    '/predict',
    {
      age,
      sex,
      text,
      confirmed_codes: confirmedCodes,
      ...(corrections ? { corrections } : {}),
      ...(durations ? { durations } : {}),
      ...(language ? { language } : {}),
      ...(covid_test ? { covid_test } : {}),
    },
  )

  return response.data
}

export function savePredictionResult(
  prediction,
  inputText,
) {
  // The backend response does not include the
  // symptom text, so it is stored alongside the
  // result. This lets the prediction page check
  // that a saved result belongs to the current
  // symptoms before showing it.
  sessionStorage.setItem(
    PREDICTION_KEY,
    JSON.stringify({
      ...prediction,
      input_text: inputText,
    }),
  )
}

function sameCodes(first, second) {
  if (
    !Array.isArray(first) ||
    !Array.isArray(second) ||
    first.length !== second.length
  ) {
    return false
  }

  const sortedFirst = [...first].sort()
  const sortedSecond = [...second].sort()

  return sortedFirst.every(
    (code, index) =>
      code === sortedSecond[index],
  )
}

export function isPredictionForConfirmation(
  prediction,
  inputText,
  confirmedCodes,
) {
  if (!prediction) {
    return false
  }

  return (
    prediction.input_text === inputText &&
    sameCodes(
      prediction.confirmed_codes,
      confirmedCodes,
    )
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
