const labels = {
  en: {
    accepted: 'Prediction complete',
    insufficient: 'More information needed',
    unsupported: 'Symptoms need clarification',
    urgent: 'Urgent review',
    unavailable: 'Result unavailable',
  },
  sw: {
    accepted: 'Utabiri umekamilika',
    insufficient: 'Taarifa zaidi zinahitajika',
    unsupported: 'Dalili zinahitaji ufafanuzi',
    urgent: 'Uhakiki wa haraka',
    unavailable: 'Matokeo hayapatikani',
  },
}

export function getCandidateHistoryDisplay(item, language = 'en') {
  const assessment = item?.assessment
  if (assessment?.contract_version === 2) {
    const text = labels[language === 'sw' ? 'sw' : 'en']
    const urgent = item.status === 'urgent_review'
    const pattern = !urgent && item.status === 'research_pattern' ? assessment.research_pattern : null
    return { label: urgent ? text.urgent : pattern ? (language === 'sw' ? 'Ulinganisho wa utafiti' : 'Research comparison') : text.insufficient,
      prediction: pattern ? { condition: pattern.condition, display_name: `${language === 'sw' ? 'Mfumo wa utafiti' : 'Research pattern'}: ${pattern.display_name}` } : null, urgent }
  }

  // Older V1/V2 records keep their existing presentation.
  if (assessment?.contract_version !== 1) return null

  const text = labels[language === 'sw' ? 'sw' : 'en']
  const urgent =
    item.status === 'urgent_review' ||
    item.has_red_flag === true ||
    assessment.status === 'safety_review_required'

  if (urgent) {
    return {
      label: text.urgent,
      prediction: null,
      urgent: true,
    }
  }

  const predictions = Array.isArray(item.predictions)
    ? item.predictions
    : []
  const saved = predictions[0]

  const accepted =
    item.status === 'prediction_complete' &&
    assessment.status === 'prediction_available' &&
    predictions.length === 1 &&
    saved?.condition === assessment.predicted_condition &&
    typeof assessment.model_score === 'number' &&
    Number.isFinite(assessment.model_score)

  if (accepted) {
    return {
      label: text.accepted,
      prediction: saved,
      urgent: false,
    }
  }

  const label =
    item.status === 'insufficient_information'
      ? text.insufficient
      : item.status === 'unsupported_input'
        ? text.unsupported
        : text.unavailable

  return {
    label,
    prediction: null,
    urgent: false,
  }
}
