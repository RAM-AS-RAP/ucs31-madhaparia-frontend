const KEY = 'respiracare_candidate_followup_v1'

const symptoms = {
  fever: { phrase: 'fever', en: 'Fever', sw: 'Homa' },
  cough: { phrase: 'cough', en: 'Cough', sw: 'Kikohozi' },
  chills: {
    phrase: 'chills',
    en: 'Chills or shivering',
    sw: 'Baridi au kutetemeka',
  },
  sore_throat: {
    phrase: 'sore throat',
    en: 'Sore throat',
    sw: 'Maumivu ya koo',
  },
  wheezing: {
    phrase: 'wheezing',
    en: 'Wheezing when breathing out',
    sw: 'Kupumua kwa mlio wa mluzi',
  },
  shortness_of_breath: {
    phrase: 'shortness of breath',
    en: 'Significant shortness of breath',
    sw: 'Kupumua kwa shida sana',
  },
}

export function getCandidateFollowUpChoices(confirmedCodes) {
  const confirmed = new Set(
    Array.isArray(confirmedCodes) ? confirmedCodes : [],
  )

  const priority = confirmed.has('cough')
    ? ['shortness_of_breath', 'wheezing', 'sore_throat']
    : confirmed.has('fever')
      ? ['cough', 'sore_throat', 'chills']
      : ['fever', 'cough', 'sore_throat']

  return priority
    .filter((code) => !confirmed.has(code))
    .slice(0, 3)
    .map((code) => ({ code, ...symptoms[code] }))
}

export function saveCandidateFollowUp(selectedCodes) {
  const codes = Array.isArray(selectedCodes)
    ? [...new Set(selectedCodes.filter((code) => symptoms[code]))]
    : []

  sessionStorage.setItem(
    KEY,
    JSON.stringify({ attempted: true, selectedCodes: codes }),
  )
}

export function getCandidateFollowUp() {
  const stored = sessionStorage.getItem(KEY)
  if (!stored) return null

  try {
    const value = JSON.parse(stored)
    if (
      value?.attempted !== true ||
      !Array.isArray(value.selectedCodes) ||
      !value.selectedCodes.every((code) => symptoms[code])
    ) {
      return null
    }
    return value
  } catch {
    sessionStorage.removeItem(KEY)
    return null
  }
}

export function getCandidateFollowUpPhrase(code) {
  return symptoms[code]?.phrase || null
}

export function clearCandidateFollowUp() {
  sessionStorage.removeItem(KEY)
}