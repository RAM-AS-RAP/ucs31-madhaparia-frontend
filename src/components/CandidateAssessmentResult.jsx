import { useEffect, useRef, useState } from 'react'

import {
  getCandidateFollowUp,
  getCandidateFollowUpChoices,
  getCandidateFollowUpPhrase,
  saveCandidateFollowUp,
} from '../services/candidateFollowUp'
import {
  confirmSymptoms,
  mapSymptoms,
  saveSymptomConfirmation,
  saveSymptomMapping,
} from '../services/symptoms'
import {
  createPrediction,
  savePredictionResult,
} from '../services/predictions'
import { getApiErrorMessage } from '../services/api'
import { getAuthToken } from '../services/authToken'
import { useLanguage } from '../context/useLanguage'

const words = {
  en: {
    accepted: 'A condition pattern is available',
    insufficient: 'More information is needed',
    unsupported: 'Some symptoms need clarification',
    urgent: 'Seek prompt medical assessment',
    unavailable: 'A condition result is unavailable',
    insufficientText: 'We cannot show a reliable condition from these symptoms.',
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
    followUpTitle: 'Do any of these apply to you?',
    followUpDescription:
      'Choose only symptoms you have now. You can also finish here.',
    alreadyConfirmed: 'Already confirmed',
    followUpAction: 'Update result',
    followUpLoading: 'Updating result…',
    followUpStop: 'None of these / finish',
    followUpError:
      'We could not update the result. Your previous result is still available.',
    guidance: 'What to do next',
  },
  sw: {
    accepted: 'Muundo wa ugonjwa unapatikana',
    insufficient: 'Taarifa zaidi zinahitajika',
    unsupported: 'Baadhi ya dalili zinahitaji ufafanuzi',
    urgent: 'Tafuta tathmini ya matibabu haraka',
    unavailable: 'Matokeo ya ugonjwa hayapatikani',
    insufficientText:
      'Hatuwezi kuonyesha matokeo ya ugonjwa kwa uhakika kutokana na dalili hizi.',
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
    followUpTitle: 'Je, una mojawapo ya dalili hizi?',
    followUpDescription:
      'Chagua dalili ulizo nazo sasa pekee. Unaweza pia kuishia hapa.',
    alreadyConfirmed: 'Dalili ulizothibitisha',
    followUpAction: 'Sasisha matokeo',
    followUpLoading: 'Inasasisha matokeo…',
    followUpStop: 'Hakuna kati ya hizi / maliza',
    followUpError:
      'Hatukuweza kusasisha matokeo. Matokeo yako ya awali bado yanapatikana.',
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

function sameCodes(first, second) {
  if (!Array.isArray(first) || !Array.isArray(second)) return false
  if (first.length !== second.length) return false

  const a = [...first].sort()
  const b = [...second].sort()
  return a.every((code, index) => code === b[index])
}

export default function CandidateAssessmentResult({
  result,
  confirmedSymptoms = [],
  confirmedCodes = [],
  followUpText = '',
  onFollowUpResult,
}) {
  const { language } = useLanguage()
  const t = words[language === 'sw' ? 'sw' : 'en']
  const assessment = result?.assessment

  const [selectedFollowUpCodes, setSelectedFollowUpCodes] = useState([])
  const [followUpUsed, setFollowUpUsed] = useState(
    () => getCandidateFollowUp()?.attempted === true,
  )
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [followUpError, setFollowUpError] = useState('')
  const requestVersion = useRef(0)

  useEffect(() => {
    return () => {
      requestVersion.current += 1
    }
  }, [])

  const followUpChoices = getCandidateFollowUpChoices(confirmedCodes)

  function toggleFollowUp(code) {
    setFollowUpError('')
    setSelectedFollowUpCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    )
  }

  async function reviewFollowUp() {
    if (followUpLoading || selectedFollowUpCodes.length === 0) return

    const offeredCodes = new Set(
      followUpChoices.map((choice) => choice.code),
    )
    const selected = [...new Set(selectedFollowUpCodes)]

    if (!selected.every((code) => offeredCodes.has(code))) {
      setFollowUpError(t.followUpError)
      return
    }

    const phrases = selected.map(getCandidateFollowUpPhrase)
    const text = [followUpText.trim(), ...phrases].join(' and ')
    const codes = [...new Set([...confirmedCodes, ...selected])]

    if (
      phrases.some((phrase) => !phrase) ||
      text.length > 2000 ||
      codes.length > 50 ||
      !Number.isInteger(result?.age) ||
      result.age < 0 ||
      result.age > 120 ||
      !['M', 'F'].includes(result?.sex)
    ) {
      setFollowUpError(t.followUpError)
      return
    }

    const version = ++requestVersion.current
    const token = getAuthToken()
    const isCurrent = () =>
      requestVersion.current === version &&
      getAuthToken() === token

    setFollowUpError('')
    setFollowUpLoading(true)

    try {
      const mapping = await mapSymptoms(text)
      if (!isCurrent()) return

      const confirmation = await confirmSymptoms(text, codes)
      if (!isCurrent()) return

      if (!sameCodes(confirmation.confirmed_codes, codes)) {
        throw new Error('The confirmed symptoms changed unexpectedly.')
      }

      const response = await createPrediction({
        age: result.age,
        sex: result.sex,
        text,
        confirmedCodes: confirmation.confirmed_codes,
      })
      if (!isCurrent()) return

      if (
        !sameCodes(
          response.confirmed_codes,
          confirmation.confirmed_codes,
        ) ||
        response.age !== result.age ||
        response.sex !== result.sex ||
        (confirmation.safety_status === 'urgent_review' &&
          response.status !== 'urgent_review') ||
        (response.status !== 'urgent_review' &&
          response.assessment?.contract_version !== 1)
      ) {
        throw new Error('The updated assessment did not match the request.')
      }

      saveSymptomMapping(mapping)
      saveSymptomConfirmation(confirmation)
      savePredictionResult(response, text)
      saveCandidateFollowUp(selected)

      setFollowUpUsed(true)
      setSelectedFollowUpCodes([])
      onFollowUpResult(response)
    } catch (error) {
      if (isCurrent()) {
        setFollowUpError(
          getApiErrorMessage(error, t.followUpError),
        )
      }
    } finally {
      if (isCurrent()) setFollowUpLoading(false)
    }
  }

  function stopFollowUp() {
    saveCandidateFollowUp([])
    setFollowUpUsed(true)
    setSelectedFollowUpCodes([])
  }

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

  const showFollowUp =
    kind === 'insufficient' &&
    followUpText.trim() &&
    !followUpUsed &&
    followUpChoices.length > 0 &&
    typeof onFollowUpResult === 'function'

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

      {showFollowUp && (
        <div className="pred34-guidance">
          <h3>{t.followUpTitle}</h3>
          <p>{t.followUpDescription}</p>

          {confirmedSymptoms.length > 0 && (
            <p>
              <strong>{t.alreadyConfirmed}:</strong>{' '}
              {confirmedSymptoms
                .map((symptom) => symptom.display_name || symptom.code)
                .join(', ')}
            </p>
          )}

          <fieldset aria-label={t.followUpTitle}>
            {followUpChoices.map((choice) => (
              <label key={choice.code} className="d-block mb-2">
                <input
                  type="checkbox"
                  checked={selectedFollowUpCodes.includes(choice.code)}
                  onChange={() => toggleFollowUp(choice.code)}
                  disabled={followUpLoading}
                />{' '}
                {choice[language === 'sw' ? 'sw' : 'en']}
              </label>
            ))}
          </fieldset>

          {followUpError && (
            <p role="alert">{followUpError}</p>
          )}

          <button
            type="button"
            className="button button-secondary pred34-secondary"
            onClick={reviewFollowUp}
            disabled={
              followUpLoading ||
              selectedFollowUpCodes.length === 0
            }
          >
            {followUpLoading
              ? t.followUpLoading
              : t.followUpAction}
          </button>{' '}

          <button
            type="button"
            className="button button-secondary pred34-secondary"
            onClick={stopFollowUp}
            disabled={followUpLoading}
          >
            {t.followUpStop}
          </button>
        </div>
      )}

      {result?.health_guidance && !showFollowUp && (
        <div className="pred34-guidance">
          <h3>{t.guidance}</h3>
          <p>{result.health_guidance}</p>
        </div>
      )}
    </section>
  )
}