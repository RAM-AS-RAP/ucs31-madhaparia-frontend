import {
  render,
  screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import PredictionPage from '../PredictionPage'
import {
  isPredictionForConfirmation,
} from '../../services/predictions'

const OLD_TEXT = 'I have fever and cough'
const NEW_TEXT = 'I am coughing up blood and I have fever'

const routinePrediction = {
  prediction_id: 'old-routine-id',
  status: 'prediction_complete',
  confirmed_codes: ['cough', 'fever'],
  input_text: OLD_TEXT,
  predictions: [
    {
      rank: 1,
      condition: 'tb',
      display_name: 'Tuberculosis (TB)',
      model_confidence_percent: 96.75,
      description: 'Old routine result',
    },
    {
      rank: 2,
      condition: 'pneumonia',
      display_name: 'Pneumonia',
      model_confidence_percent: 2.1,
      description: 'Second ranked result',
    },
    {
      rank: 3,
      condition: 'bronchitis',
      display_name: 'Bronchitis',
      model_confidence_percent: 1.15,
      description: 'Third ranked result',
    },
  ],
  confidence_explanation: 'Confidence note',
  health_guidance: 'Routine guidance',
  disclaimer: 'Disclaimer text',
}

function saveState({
  text,
  codes,
  safetyStatus,
  prediction,
}) {
  sessionStorage.setItem(
    'respiracare_symptom_mapping',
    JSON.stringify({
      input_text: text,
      recognised_symptoms: [],
      has_red_flag: safetyStatus === 'urgent_review',
    }),
  )

  sessionStorage.setItem(
    'respiracare_symptom_confirmation',
    JSON.stringify({
      input_text: text,
      confirmed_codes: codes,
      confirmed_symptoms: codes.map((code) => ({
        code,
        display_name: code,
      })),
      safety_status: safetyStatus,
    }),
  )

  if (prediction) {
    sessionStorage.setItem(
      'respiracare_prediction_result',
      JSON.stringify(prediction),
    )
  }
}

function renderPredictionPage() {
  return render(
    <MemoryRouter>
      <PredictionPage />
    </MemoryRouter>,
  )
}

describe('isPredictionForConfirmation', () => {
  it('matches the same text and codes in any order', () => {
    expect(
      isPredictionForConfirmation(
        routinePrediction,
        OLD_TEXT,
        ['fever', 'cough'],
      ),
    ).toBe(true)
  })

  it('rejects a result made from different text', () => {
    expect(
      isPredictionForConfirmation(
        routinePrediction,
        NEW_TEXT,
        ['cough', 'fever'],
      ),
    ).toBe(false)
  })

  it('rejects a result made from different codes', () => {
    expect(
      isPredictionForConfirmation(
        routinePrediction,
        OLD_TEXT,
        ['fever'],
      ),
    ).toBe(false)
  })

  it('rejects a missing result', () => {
    expect(
      isPredictionForConfirmation(
        null,
        OLD_TEXT,
        ['fever'],
      ),
    ).toBe(false)
  })
})

describe('PredictionPage saved results', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it(
    'does not show an older result for a new red-flag symptom set',
    () => {
      saveState({
        text: NEW_TEXT,
        codes: ['coughing_blood', 'fever'],
        safetyStatus: 'urgent_review',
        prediction: routinePrediction,
      })

      renderPredictionPage()

      expect(
        screen.queryByText('Tuberculosis (TB)'),
      ).not.toBeInTheDocument()

      expect(
        screen.getByLabelText('Age'),
      ).toBeInTheDocument()

      expect(
        screen.getByText(
          'Safety-sensitive symptom confirmed',
        ),
      ).toBeInTheDocument()
    },
  )

  it(
    'shows only the highest-confidence saved result for the same symptoms',
    () => {
      saveState({
        text: OLD_TEXT,
        codes: ['cough', 'fever'],
        safetyStatus: 'continue',
        prediction: routinePrediction,
      })

      renderPredictionPage()

      expect(
        screen.getByText('Tuberculosis (TB)'),
      ).toBeInTheDocument()

      expect(
        screen.queryByText('Pneumonia'),
      ).not.toBeInTheDocument()

      expect(
        screen.queryByText('Bronchitis'),
      ).not.toBeInTheDocument()

      expect(
        screen.getByText(
          'Your health-awareness result',
        ),
      ).toBeInTheDocument()
    },
  )

  it('displays V2 confidence and uncertainty guidance', () => {
    const v2Prediction = {
      ...routinePrediction,
      model_version: 'v2_23class_prototype',
      predictions: [routinePrediction.predictions[0]],
      uncertain: true,
      uncertainty_message:
        'The model result has limited certainty.',
      score_note:
        'Model confidence is not a clinical probability.',
    }

    saveState({
      text: OLD_TEXT,
      codes: ['fever', 'cough'],
      safetyStatus: 'continue',
      prediction: v2Prediction,
    })

    renderPredictionPage()

    expect(
      screen.getByText(
        'Model confidence is not a clinical probability.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'The model result has limited certainty.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent(
      'The model result has limited certainty.',
    )

    expect(
      screen.getByText('Tuberculosis (TB)'),
    ).toBeInTheDocument()
  })

  it('does not display uncertainty warning when V2 is not flagged', () => {
    const v2Prediction = {
      ...routinePrediction,
      model_version: 'v2_23class_prototype',
      predictions: [routinePrediction.predictions[0]],
      uncertain: false,
      uncertainty_message: '',
      score_note:
        'Model confidence is not a clinical probability.',
    }

    saveState({
      text: OLD_TEXT,
      codes: ['fever', 'cough'],
      safetyStatus: 'continue',
      prediction: v2Prediction,
    })

    renderPredictionPage()

    expect(
      screen.getByText(
        'Model confidence is not a clinical probability.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(
        'Important information about this result',
      ),
    ).not.toBeInTheDocument()
  })

  it('keeps the existing V1 confidence display', () => {
    saveState({
      text: OLD_TEXT,
      codes: ['fever', 'cough'],
      safetyStatus: 'continue',
      prediction: routinePrediction,
    })

    renderPredictionPage()

    expect(
      screen.getByText('About model confidence'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Confidence note'),
    ).toBeInTheDocument()

    expect(
      screen.queryByText(
        'Important information about this result',
      ),
    ).not.toBeInTheDocument()
  })
  it('explains unsupported V2 symptom features', () => {
    const v2Prediction = {
      ...routinePrediction,
      model_version: 'v2_23class_prototype',
      predictions: [routinePrediction.predictions[0]],
      unsupported_model_features: [
        'headache',
        'chest_pain',
      ],
    }

    saveState({
      text: OLD_TEXT,
      codes: ['fever', 'cough'],
      safetyStatus: 'continue',
      prediction: v2Prediction,
    })

    renderPredictionPage()

    expect(
      screen.getByText(
        'Some symptom details were not used',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('note', {
        name: 'Unsupported symptom information',
      }),
    ).toHaveTextContent(
      'This does not mean those symptoms are absent.',
    )

    expect(
      screen.getByText('Tuberculosis (TB)'),
    ).toBeInTheDocument()
  })

  it('shows urgent guidance without displaying a disease prediction', () => {
    const urgentPrediction = {
      ...routinePrediction,
      prediction_id: 'urgent-session',
      input_text: NEW_TEXT,
      confirmed_codes: ['coughing_blood', 'fever'],
      status: 'urgent_review',
      has_red_flag: true,
      predictions: [],
      health_guidance:
        'Seek urgent medical assessment.',
      unsupported_model_features: ['headache'],
    }

    saveState({
      text: NEW_TEXT,
      codes: ['coughing_blood', 'fever'],
      safetyStatus: 'urgent_review',
      prediction: urgentPrediction,
    })

    renderPredictionPage()

    expect(
      screen.getByText(
        'Seek prompt medical assessment.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Seek urgent medical assessment.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.queryByText('Tuberculosis (TB)'),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText(
        'Some symptom details were not used',
      ),
    ).not.toBeInTheDocument()
  })

})
