import api from './api'

const MAPPING_KEY = 'respiracare_symptom_mapping'

export async function mapSymptoms(text) {
  const response = await api.post('/nlp/map', {
    text,
  })

  return response.data
}

export function saveSymptomMapping(mapping) {
  sessionStorage.setItem(
    MAPPING_KEY,
    JSON.stringify(mapping),
  )
}

export function getSavedSymptomMapping() {
  const stored = sessionStorage.getItem(MAPPING_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    sessionStorage.removeItem(MAPPING_KEY)
    return null
  }
}

export function clearSymptomMapping() {
  sessionStorage.removeItem(MAPPING_KEY)
}