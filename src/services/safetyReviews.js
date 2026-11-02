import api from './api'

export async function saveUrgentReview(text, confirmedCodes, signal) {
  const response = await api.post(
    '/safety/reviews',
    {
      text,
      confirmed_codes: confirmedCodes,
    },
    { signal },
  )

  const review = response.data

  if (
    typeof review?.prediction_id !== 'string' ||
    !review.prediction_id.trim() ||
    review.status !== 'urgent_review' ||
    review.has_red_flag !== true ||
    !Array.isArray(review.predictions) ||
    review.predictions.length !== 0 ||
    review.assessment?.prediction_performed !== false
  ) {
    throw new Error('The backend did not return a valid safety review.')
  }

  return review
}