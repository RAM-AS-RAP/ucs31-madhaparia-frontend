import { describe, expect, it } from 'vitest'
import { buildAdminAnalytics, filterByDate, isCalendarDate, localDateKey, publishedPrediction } from '../adminAnalytics'
import { acceptedCandidate, legacyHistory, insufficientCandidate, urgentCandidate } from '../../test/fixtures/candidateResponses'

const session = (overrides = {}) => ({
  status: 'prediction_complete', created_at: '2026-11-01T12:00:00Z',
  confirmed_codes: ['cough'],
  predictions: [{ condition: 'asthma', display_name: 'Asthma', model_confidence_percent: 80 }],
  ...overrides,
})
const candidate = (overrides = {}) => session({ assessment: {
  contract_version: 1, status: 'prediction_available', predicted_condition: 'asthma', model_score: 0.61,
  unmatched_wording: [], unsupported_symptoms: [], clarification_required: [],
  ...overrides,
} })

describe('administrator monitoring aggregation', () => {
  it('counts published V3 patterns without converting research scores to confidence percentages', () => {
    const pattern = { condition: 'Influenza', display_name: 'FLU(influenza)' }
    const result = session({ status: 'research_pattern', predictions: [], assessment: {
      contract_version: 2, research_pattern: pattern,
      research_rankings: [{ condition: 'Influenza', raw_relative_score: 0.95 }],
      unmatched_wording: [], unsupported_symptoms: [],
    } })
    expect(publishedPrediction(result)).toEqual({ ...pattern, score: null })
    const withheld = { ...result, status: 'insufficient_information' }
    const urgent = { ...result, status: 'urgent_review' }
    const a = buildAdminAnalytics([result, withheld, urgent], [])
    expect(a.published).toBe(1)
    expect(a.scored).toBe(0)
    expect(a.confidence).toEqual([0, 0, 0, 0, 0])
    expect(a.conditions).toEqual([{ name: 'FLU(influenza)', count: 1 }])
    expect(a.nlpAvailable).toBe(3)
  })
  it('reads the existing backend contract fixtures for legacy and candidate scores', () => {
    const a = buildAdminAnalytics([acceptedCandidate, legacyHistory, insufficientCandidate, urgentCandidate], [])
    expect(a.published).toBe(2)
    expect(a.scored).toBe(2)
    expect(a.confidence).toEqual([1, 0, 0, 0, 1])
    expect(a.urgent).toBe(1)
  })
  it('counts each published session once and ignores lower-ranked legacy predictions', () => {
    const a = buildAdminAnalytics([session({ predictions: [
      { condition: 'asthma', display_name: 'Asthma', model_confidence_percent: 80 },
      { condition: 'hidden', display_name: 'Hidden', model_confidence_percent: 20 },
    ] }), session(), session({ predictions: [{ condition: 'cold', display_name: 'Cold', model_confidence_percent: 60 }] })], [])
    expect(a.conditions).toEqual([{ name: 'Asthma', count: 2 }, { name: 'Cold', count: 1 }])
    expect(a.published).toBe(3)
  })

  it('prioritises all safety indicators and excludes withheld or inconsistent candidate results', () => {
    const records = [
      session({ status: 'urgent_review' }), session({ has_red_flag: true }),
      candidate({ safety_review_required: true }), candidate({ safety_flags: ['blue_lips'] }),
      candidate({ status: 'safety_review_required' }),
      session({ status: 'insufficient_information' }), session({ status: 'unsupported_input' }),
      candidate({ predicted_condition: 'different' }), candidate({ model_score: 2 }),
    ]
    const a = buildAdminAnalytics(records, [])
    expect(a.urgent).toBe(5)
    expect(a.nonUrgent).toBe(4)
    expect(a.conditions).toEqual([])
    expect(a.scored).toBe(0)
  })

  it('uses the candidate model score rather than a conflicting legacy percentage', () => {
    expect(publishedPrediction(candidate()).score).toBe(61)
    expect(buildAdminAnalytics([candidate()], []).confidence).toEqual([0, 0, 0, 1, 0])
  })

  it('bins every boundary including 0 and 100 without coercing missing or malformed scores', () => {
    const scores = [0, 19.99, 20, 39.99, 40, 59.99, 60, 79.99, 80, 100, null, '90', -1, 101, NaN, Infinity]
    const a = buildAdminAnalytics(scores.map((score) => session({ predictions: [{ condition: 'asthma', model_confidence_percent: score }] })), [])
    expect(a.confidence).toEqual([2, 2, 2, 2, 2])
    expect(a.scored).toBe(10)
    expect(a.published).toBe(scores.length)
  })

  it('counts unrated feedback separately and never treats it as negative', () => {
    const a = buildAdminAnalytics([], [true, false, null, undefined, 'true'].map((was_helpful) => ({ was_helpful })))
    expect([a.helpful, a.notHelpful, a.unrated]).toEqual([1, 1, 3])
  })

  it('filters inclusive local calendar dates and excludes undated records only when filtering', () => {
    const records = ['2026-11-01T00:00:00', '2026-11-02T23:59:59', '2026-11-03T00:00:00', null, 'bad'].map((created_at) => session({ created_at }))
    expect(filterByDate(records)).toHaveLength(5)
    expect(filterByDate(records, { from: '2026-11-01', to: '2026-11-02' })).toEqual(records.slice(0, 2))
    expect(filterByDate(records, { from: '2026-11-03' })).toEqual([records[2]])
    expect(filterByDate(records, { to: '2026-11-01' })).toEqual([records[0]])
    expect(localDateKey('2026-11-01T23:30:00-12:00')).toBe(localDateKey(new Date('2026-11-01T23:30:00-12:00').toISOString()))
    expect(isCalendarDate('2026-02-30')).toBe(false)
    expect(isCalendarDate('2028-02-29')).toBe(true)
  })

  it('orders time buckets and fills days with no records; malformed dates are counted separately', () => {
    const records = ['2026-11-03T12:00:00', '2026-11-01T12:00:00', 'bad', null].map((created_at) => session({ created_at }))
    const a = buildAdminAnalytics(records, [])
    expect(a.timeline).toEqual({ granularity: 'day', rows: [['2026-11-01', 1], ['2026-11-02', 0], ['2026-11-03', 1]] })
    expect(a.undated).toBe(2)
  })

  it('uses bounded monthly and yearly buckets for long histories', () => {
    const make = (dates) => buildAdminAnalytics(dates.map((created_at) => session({ created_at: `${created_at}T12:00:00` })), []).timeline
    expect(make(['2026-01-31', '2026-05-02'])).toEqual({ granularity: 'month', rows: [['2026-01', 1], ['2026-02', 0], ['2026-03', 0], ['2026-04', 0], ['2026-05', 1]] })
    const years = make(['2010-12-31', '2026-01-01'])
    expect(years.granularity).toBe('year')
    expect(years.rows).toHaveLength(17)
    expect(years.rows[0]).toEqual(['2010', 1])
    expect(years.rows.at(-1)).toEqual(['2026', 1])
  })

  it('reports NLP coverage and overlapping context, without inventing data for legacy records', () => {
    const a = buildAdminAnalytics([
      candidate({ unmatched_wording: ['word'], unsupported_symptoms: ['x'] }),
      candidate({ clarification_required: ['x'] }), session(),
    ], [])
    expect(a.nlpAvailable).toBe(2)
    expect(a.nlp).toEqual([2, 1, 1, 1])
    expect(buildAdminAnalytics([session()], []).nlpAvailable).toBe(0)
  })

  it('returns empty chart data without fabricating sessions', () => {
    const a = buildAdminAnalytics([], [])
    expect(a.timeline.rows).toEqual([])
    expect(a.conditions).toEqual([])
    expect(a.confidence).toEqual([0, 0, 0, 0, 0])
    expect(a.urgent + a.nonUrgent).toBe(0)
  })
})
