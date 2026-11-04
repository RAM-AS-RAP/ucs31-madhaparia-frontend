import { getCandidateHistoryDisplay } from './candidateHistory'

export const ADMIN_RECORD_LIMIT = 500

export function isUrgentSession(item) {
  return item.status === 'urgent_review' || item.has_red_flag === true ||
    item.assessment?.status === 'safety_review_required' ||
    item.assessment?.safety_review_required === true ||
    (Array.isArray(item.assessment?.safety_flags) && item.assessment.safety_flags.length > 0)
}

export function localDateKey(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return localDateKey(`${value}T12:00:00`) === value
}

export function filterByDate(records, { from = '', to = '' } = {}) {
  if (!from && !to) return records
  return records.filter((item) => {
    const day = localDateKey(item.created_at)
    return day && (!from || day >= from) && (!to || day <= to)
  })
}

// A session contributes only its published result, never a withheld ranking.
export function publishedPrediction(item) {
  if (isUrgentSession(item) || item.status !== 'prediction_complete') return null
  const candidate = getCandidateHistoryDisplay(item)
  if (candidate) {
    const score = item.assessment.model_score
    if (!candidate.prediction || score < 0 || score > 1) return null
    return { ...candidate.prediction, score: score * 100 }
  }
  if (item.assessment?.contract_version != null) return null
  const prediction = item.predictions?.[0]
  if (!prediction || !(prediction.condition || prediction.display_name)) return null
  const score = prediction.model_confidence_percent
  return {
    ...prediction,
    score: typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100
      ? score : null,
  }
}

function sessionTimeline(history) {
  const days = history.map((item) => localDateKey(item.created_at)).filter(Boolean).sort()
  if (!days.length) return { granularity: 'day', rows: [] }
  const first = new Date(`${days[0]}T12:00:00`)
  const last = new Date(`${days.at(-1)}T12:00:00`)
  const span = (last - first) / 86400000
  const months = (last.getFullYear() - first.getFullYear()) * 12 + last.getMonth() - first.getMonth()
  const granularity = span <= 90 ? 'day' : months <= 60 ? 'month' : 'year'
  const key = (day) => day.slice(0, granularity === 'day' ? 10 : granularity === 'month' ? 7 : 4)
  const counts = new Map()
  days.forEach((day) => counts.set(key(day), (counts.get(key(day)) || 0) + 1))
  if (granularity !== 'day') first.setDate(1)
  if (granularity === 'year') first.setMonth(0)
  const rows = []
  while (key(localDateKey(first.toISOString())) <= key(days.at(-1))) {
    const period = key(localDateKey(first.toISOString()))
    rows.push([period, counts.get(period) || 0])
    if (granularity === 'day') first.setDate(first.getDate() + 1)
    else if (granularity === 'month') first.setMonth(first.getMonth() + 1)
    else first.setFullYear(first.getFullYear() + 1)
  }
  return { granularity, rows }
}

export function buildAdminAnalytics(history, feedback) {
  const urgent = history.filter(isUrgentSession).length
  const helpful = feedback.filter((item) => item.was_helpful === true).length
  const notHelpful = feedback.filter((item) => item.was_helpful === false).length
  const conditions = new Map()
  const confidence = [0, 0, 0, 0, 0]
  let published = 0
  let scored = 0
  history.forEach((item) => {
    const prediction = publishedPrediction(item)
    if (!prediction) return
    published += 1
    const key = prediction.condition || prediction.display_name
    const existing = conditions.get(key)
    conditions.set(key, { name: prediction.display_name || key, count: (existing?.count || 0) + 1 })
    if (prediction.score != null) {
      confidence[Math.min(4, Math.floor(prediction.score / 20))] += 1
      scored += 1
    }
  })
  const context = history.filter((item) => item.assessment?.contract_version === 1 &&
    Array.isArray(item.confirmed_codes) &&
    ['unmatched_wording', 'unsupported_symptoms', 'clarification_required'].every(
      (field) => Array.isArray(item.assessment[field]),
    ))
  return {
    urgent, nonUrgent: history.length - urgent, helpful, notHelpful,
    unrated: feedback.length - helpful - notHelpful,
    published, scored, confidence,
    conditions: [...conditions.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    timeline: sessionTimeline(history),
    undated: history.filter((item) => !localDateKey(item.created_at)).length,
    nlpAvailable: context.length,
    nlp: [
      context.filter((item) => item.confirmed_codes.length > 0).length,
      ...['unmatched_wording', 'unsupported_symptoms', 'clarification_required'].map(
        (field) => context.filter((item) => item.assessment[field].length > 0).length,
      ),
    ],
  }
}
