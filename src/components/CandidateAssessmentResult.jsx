import { useLanguage } from '../context/useLanguage'

const words = {
  en: {
    accepted: 'A condition pattern is available',
    insufficient: 'More information is needed',
    unsupported: 'Some symptoms need clarification',
    urgent: 'Seek prompt medical assessment',
    unavailable: 'A condition result is unavailable',
    insufficientText:
      'The available symptoms do not support showing a condition result. Consider discussing persistent or worsening symptoms with a qualified healthcare professional.',
    unsupportedText:
      'Some confirmed symptoms could not be assessed reliably. No condition result is shown.',
    urgentText:
      'A safety-sensitive symptom was confirmed. No automated disease prediction is shown.',
    unavailableText:
      'No condition result can be shown for this assessment.',
    modelScore: 'Model score',
    scoreNote:
      'This model score is not a diagnosis or your individual risk of having this condition.',
    unsupportedSymptoms: 'Symptoms needing clarification',
    unmatchedWording: 'Wording we could not match',
    unmatchedNote:
      'This wording was not understood as a confirmed symptom.',
    guidance: 'What to do next',
  },
  sw: {
    accepted: 'Muundo wa ugonjwa unapatikana',
    insufficient: 'Taarifa zaidi zinahitajika',
    unsupported: 'Baadhi ya dalili zinahitaji ufafanuzi',
    urgent: 'Tafuta tathmini ya matibabu haraka',
    unavailable: 'Matokeo ya ugonjwa hayapatikani',
    insufficientText:
      'Dalili zilizopo hazitoshi kuonyesha matokeo ya ugonjwa. Ongea na mhudumu wa afya mwenye sifa ikiwa dalili zinaendelea au zinazidi.',
    unsupportedText:
      'Baadhi ya dalili ulizothibitisha hazikuweza kutathminiwa kwa uhakika. Hakuna matokeo ya ugonjwa yanayoonyeshwa.',
    urgentText:
      'Dalili inayoweza kuashiria hatari imethibitishwa. Hakuna utabiri wa ugonjwa wa kiotomatiki unaoonyeshwa.',
    unavailableText:
      'Hakuna matokeo ya ugonjwa yanayoweza kuonyeshwa kwa tathmini hii.',
    modelScore: 'Alama ya modeli',
    scoreNote:
      'Alama hii ya modeli si utambuzi wa kitabibu wala uwezekano wako binafsi wa kuwa na ugonjwa huu.',
    unsupportedSymptoms: 'Dalili zinazohitaji ufafanuzi',
    unmatchedWording: 'Maneno ambayo hatukuweza kutambua',
    unmatchedNote:
      'Maneno haya hayakutambuliwa kama dalili zilizothibitishwa.',
    guidance: 'Hatua zinazofuata',
  },
}

function unmatchedText(item) {
  if (typeof item === 'string') return item
  if (typeof item?.unmatched_text === 'string') {
    return item.unmatched_text
  }
  return null
}

export default function CandidateAssessmentResult({
  result,
  confirmedSymptoms = [],
}) {
  const { language } = useLanguage()
  const t = words[language === 'sw' ? 'sw' : 'en']
  const assessment = result?.assessment
  const predictions = Array.isArray(result?.predictions)
    ? result.predictions
    : []

  const urgent =
    result?.status === 'urgent_review' ||
    assessment?.status === 'safety_review_required'

  const accepted =
    !urgent &&
    result?.status === 'prediction_complete' &&
    assessment?.status === 'prediction_available' &&
    predictions.length === 1 &&
    predictions[0]?.condition === assessment?.predicted_condition &&
    typeof assessment?.model_score === 'number'

  const kind = urgent
    ? 'urgent'
    : accepted
      ? 'accepted'
      : result?.status === 'unsupported_input'
        ? 'unsupported'
        : result?.status === 'insufficient_information'
          ? 'insufficient'
          : 'unavailable'

  const prediction = accepted ? predictions[0] : null
  const score = Number(prediction?.model_confidence_percent)
  const showScore =
    accepted &&
    prediction?.model_confidence_percent != null &&
    Number.isFinite(score) &&
    score >= 0 &&
    score <= 100

  const names = new Map(
    confirmedSymptoms.map((symptom) => [
      symptom.code,
      symptom.display_name || symptom.code,
    ]),
  )
  const unsupported = Array.isArray(assessment?.unsupported_symptoms)
    ? assessment.unsupported_symptoms
    : []
  const unmatched = Array.isArray(assessment?.unmatched_wording)
    ? assessment.unmatched_wording.map(unmatchedText).filter(Boolean)
    : []

  return (
    <section
      className={urgent ? 'pred34-urgent-result' : 'pred34-condition-panel'}
      aria-labelledby="candidate-result-title"
      role={urgent ? 'alert' : 'status'}
    >
      <h2 id="candidate-result-title">{t[kind]}</h2>

      {prediction ? (
        <>
          <h3>{prediction.display_name || prediction.condition}</h3>
          {prediction.description && <p>{prediction.description}</p>}
          {showScore && (
            <p>
              <strong>{t.modelScore}: {score}%</strong>
            </p>
          )}
          <p>{t.scoreNote}</p>
        </>
      ) : (
        <p>{t[`${kind}Text`]}</p>
      )}

      {unsupported.length > 0 && !urgent && (
        <div className="pred34-warning" role="note">
          <h3>{t.unsupportedSymptoms}</h3>
          <ul>
            {unsupported.map((code) => (
              <li key={code}>{names.get(code) || code}</li>
            ))}
          </ul>
        </div>
      )}

      {unmatched.length > 0 && !urgent && (
        <div className="pred34-warning" role="note">
          <h3>{t.unmatchedWording}</h3>
          <p>{t.unmatchedNote}</p>
          <ul>
            {unmatched.map((value, index) => (
              <li key={`${index}-${value}`}>{value}</li>
            ))}
          </ul>
        </div>
      )}

      {result?.health_guidance && (
        <div className="pred34-guidance">
          <h3>{t.guidance}</h3>
          <p>{result.health_guidance}</p>
        </div>
      )}
    </section>
  )
}