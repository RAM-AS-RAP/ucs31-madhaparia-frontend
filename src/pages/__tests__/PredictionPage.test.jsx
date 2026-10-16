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
    'shows the saved result again for the same symptoms',
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
    },
  )
})
