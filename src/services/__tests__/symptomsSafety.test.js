import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../api'
import { mapSymptoms } from '../symptoms'
import { saveUrgentReview } from '../safetyReviews'

vi.mock('../api', () => ({ default: { post: vi.fn() } }))

describe('Safety before database-backed mapping', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns a warning without waiting for the database mapping route', async () => {
    const warning = { has_red_flag: true, recognised_symptoms: [] }
    api.post.mockResolvedValueOnce({ data: warning })
    expect(await mapSymptoms('I cannot breathe')).toEqual(warning)
    expect(api.post).toHaveBeenCalledExactlyOnceWith('/safety/check', { text: 'I cannot breathe' }, { skipAuth: true })
  })

  it('uses the SQL-backed catalogue for ordinary mapping after the safety check', async () => {
    const actual = { has_red_flag: false, recognised_symptoms: [{ code: 'custom_database_alias' }] }
    api.post.mockResolvedValueOnce({ data: { has_red_flag: false } }).mockResolvedValueOnce({ data: actual })
    expect(await mapSymptoms('my symptoms')).toEqual(actual)
    expect(api.post).toHaveBeenNthCalledWith(2, '/nlp/map', { text: 'my symptoms' })
  })

  it('preserves explicit report corrections when saving a model-independent safety review', async () => {
    const corrections = [{ code: 'blue_lips', status: 'present', subject: 'patient_or_unspecified' }]
    const signal = new AbortController().signal
    const review = { prediction_id: 'synthetic-review', status: 'urgent_review', has_red_flag: true,
      predictions: [], assessment: { prediction_performed: false } }
    api.post.mockResolvedValueOnce({ data: review })
    expect(await saveUrgentReview('I do not have blue lips', ['blue_lips'], signal, corrections)).toEqual(review)
    expect(api.post).toHaveBeenCalledWith('/safety/reviews', {
      text: 'I do not have blue lips', confirmed_codes: ['blue_lips'], corrections,
    }, { signal })
  })
})
