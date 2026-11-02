import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from '../api'
import {
  createPrediction,
  getSavedPredictionResult,
  savePredictionResult,
} from '../predictions'
import {
  getPatientHistory,
  getPatientHistoryItem,
} from '../history'
import {
  acceptedCandidate,
  insufficientCandidate,
  unsupportedCandidate,
  urgentCandidate,
  legacyHistory,
} from '../../test/fixtures/candidateResponses'

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const request = {
  age: 22,
  sex: 'F',
  text: 'I have tiredness and headache',
  confirmedCodes: ['tiredness', 'headache'],
}

describe('candidate frontend response contract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it.each([
    ['accepted', acceptedCandidate],
    ['insufficient', insufficientCandidate],
    ['unsupported', unsupportedCandidate],
    ['urgent', urgentCandidate],
  ])('preserves an HTTP 200 %s response', async (_, response) => {
    api.post.mockResolvedValueOnce({ data: response })

    const result = await createPrediction(request)

    expect(result).toEqual(response)
    expect(api.post).toHaveBeenCalledWith('/predict', {
      age: 22,
      sex: 'F',
      text: request.text,
      confirmed_codes: request.confirmedCodes,
    })
  })

  it.each([
    insufficientCandidate,
    unsupportedCandidate,
    urgentCandidate,
  ])('keeps a withheld result free of a public disease and score', (response) => {
    expect(response.predictions).toEqual([])
    expect(response.assessment.predicted_condition).toBeNull()
    expect(response.assessment.model_score).toBeNull()
    expect(response.assessment.uncertainty_reasons.length).toBeGreaterThan(0)
  })

  it('preserves the complete assessment in session storage', () => {
    savePredictionResult(insufficientCandidate, request.text)

    expect(getSavedPredictionResult()).toEqual({
      ...insufficientCandidate,
      input_text: request.text,
    })
  })

  it('preserves candidate and older records in history lists', async () => {
    const response = {
      count: 2,
      history: [insufficientCandidate, legacyHistory],
    }
    api.get.mockResolvedValueOnce({ data: response })

    expect(await getPatientHistory()).toEqual(response)
    expect(response.history[0].assessment.status).toBe(
      'insufficient_information',
    )
    expect(response.history[1].assessment).toBeNull()
  })

  it('preserves the saved assessment in a history detail', async () => {
    api.get.mockResolvedValueOnce({ data: unsupportedCandidate })

    expect(
      await getPatientHistoryItem('candidate-unsupported'),
    ).toEqual(unsupportedCandidate)
    expect(api.get).toHaveBeenCalledWith(
      '/history/candidate-unsupported',
    )
  })
})