import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import PredictionPage from '../PredictionPage'
import LanguageContext from '../../context/LanguageContextBase'
import {
  confirmSymptoms,
  getSavedSymptomConfirmation,
  mapSymptoms,
} from '../../services/symptoms'
import {
  createPrediction,
  getSavedPredictionResult,
} from '../../services/predictions'
import { getCandidateFollowUp } from '../../services/candidateFollowUp'
import {
  insufficientCandidate,
  urgentCandidate,
} from '../../test/fixtures/candidateResponses'

vi.mock('../../services/symptoms', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    mapSymptoms: vi.fn(),
    confirmSymptoms: vi.fn(),
  }
})

vi.mock('../../services/predictions', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, createPrediction: vi.fn() }
})

vi.mock('../../components/PredictionFeedback', () => ({
  default: () => null,
}))

const originalText = 'headache and tiredness and skin rash'
const revisedText = 'headache and tiredness and sore throat'

const previousSymptoms = [
  {
    code: 'headache',
    display_name: 'Headache',
    matched_text: 'headache',
    is_red_flag: false,
  },
  {
    code: 'tiredness',
    display_name: 'Constant tiredness',
    matched_text: 'tiredness',
    is_red_flag: false,
  },
]

const revisedSymptoms = [
  ...previousSymptoms,
  {
    code: 'sore_throat',
    display_name: 'Sore throat',
    matched_text: 'sore throat',
    is_red_flag: false,
  },
]

function saveStartingAssessment({
  text = originalText,
  symptoms = previousSymptoms,
  response = insufficientCandidate,
} = {}) {
  sessionStorage.setItem(
    'respiracare_symptom_mapping',
    JSON.stringify({
      input_text: text,
      recognised_symptoms: symptoms,
      unmatched_wording:
        text === originalText
          ? [{ unmatched_text: 'skin rash' }]
          : [],
    }),
  )

  sessionStorage.setItem(
    'respiracare_symptom_confirmation',
    JSON.stringify({
      input_text: text,
      confirmed_codes: symptoms.map((symptom) => symptom.code),
      confirmed_symptoms: symptoms,
      rejected_symptoms: [],
      safety_status: 'continue',
    }),
  )

  sessionStorage.setItem(
    'respiracare_prediction_result',
    JSON.stringify({ ...response, input_text: text }),
  )
}

function showPredictionPage() {
  return render(
    <LanguageContext.Provider value={{ language: 'en' }}>
      <MemoryRouter initialEntries={['/prediction']}>
        <Routes>
          <Route path="/prediction" element={<PredictionPage />} />
        </Routes>
      </MemoryRouter>
    </LanguageContext.Provider>,
  )
}

describe('optional candidate symptom follow-up', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('updates in place using saved age, sex and confirmed symptoms', async () => {
    saveStartingAssessment()

    mapSymptoms.mockResolvedValueOnce({
      input_text: revisedText,
      recognised_symptoms: revisedSymptoms,
      unmatched_wording: [],
      has_red_flag: false,
    })

    confirmSymptoms.mockResolvedValueOnce({
      input_text: revisedText,
      confirmed_codes: ['headache', 'tiredness', 'sore_throat'],
      confirmed_symptoms: revisedSymptoms,
      rejected_symptoms: [],
      safety_status: 'continue',
      has_red_flag: false,
    })

    // A follow-up may still be withheld; it must not promise a disease.
    createPrediction.mockResolvedValueOnce({
      ...insufficientCandidate,
      prediction_id: 'candidate-follow-up',
      confirmed_codes: ['headache', 'tiredness', 'sore_throat'],
    })

    showPredictionPage()

    fireEvent.click(screen.getByLabelText('Sore throat'))
    fireEvent.click(
      screen.getByRole('button', { name: 'Update result' }),
    )

    await waitFor(() => {
      expect(createPrediction).toHaveBeenCalledOnce()
    })

    expect(mapSymptoms).toHaveBeenCalledWith(revisedText)
    expect(confirmSymptoms).toHaveBeenCalledWith(
      revisedText,
      ['headache', 'tiredness', 'sore_throat'],
    )
    expect(createPrediction).toHaveBeenCalledWith({
      age: 22,
      sex: 'F',
      text: revisedText,
      confirmedCodes: ['headache', 'tiredness', 'sore_throat'],
    })

    expect(screen.queryByLabelText('Age')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sex')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: 'Do any of these apply to you?',
      }),
    ).not.toBeInTheDocument()

    expect(getSavedSymptomConfirmation().confirmed_codes).toEqual([
      'headache',
      'tiredness',
      'sore_throat',
    ])
    expect(getSavedPredictionResult().input_text).toBe(revisedText)
    expect(getCandidateFollowUp().attempted).toBe(true)
  })

  it('keeps the previous result if updating fails', async () => {
    saveStartingAssessment()
    mapSymptoms.mockRejectedValueOnce(new Error('Request failed'))

    showPredictionPage()

    fireEvent.click(screen.getByLabelText('Sore throat'))
    fireEvent.click(
      screen.getByRole('button', { name: 'Update result' }),
    )

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(createPrediction).not.toHaveBeenCalled()
    expect(getSavedPredictionResult().prediction_id).toBe(
      'candidate-insufficient',
    )
    expect(getCandidateFollowUp()).toBeNull()
    expect(
      screen.getByRole('heading', {
        name: 'More information is needed',
      }),
    ).toBeInTheDocument()
  })

  it('preserves urgent handling for a confirmed breathing symptom', async () => {
    const symptoms = [
      {
        code: 'cough',
        display_name: 'Cough',
        matched_text: 'cough',
        is_red_flag: false,
      },
      {
        code: 'fever',
        display_name: 'Fever',
        matched_text: 'fever',
        is_red_flag: false,
      },
    ]
    const text = 'cough and fever'
    const updatedText = 'cough and fever and shortness of breath'
    const updatedCodes = [
      'cough',
      'fever',
      'shortness_of_breath',
    ]
    const breathingSymptom = {
      code: 'shortness_of_breath',
      display_name: 'Significant shortness of breath',
      matched_text: 'shortness of breath',
      is_red_flag: true,
    }

    saveStartingAssessment({
      text,
      symptoms,
      response: {
        ...insufficientCandidate,
        confirmed_codes: ['cough', 'fever'],
      },
    })

    mapSymptoms.mockResolvedValueOnce({
      input_text: updatedText,
      recognised_symptoms: [...symptoms, breathingSymptom],
      unmatched_wording: [],
      has_red_flag: true,
    })
    confirmSymptoms.mockResolvedValueOnce({
      input_text: updatedText,
      confirmed_codes: updatedCodes,
      confirmed_symptoms: [...symptoms, breathingSymptom],
      rejected_symptoms: [],
      safety_status: 'urgent_review',
      has_red_flag: true,
    })
    createPrediction.mockResolvedValueOnce({
      ...urgentCandidate,
      confirmed_codes: updatedCodes,
      red_flag_symptoms: [breathingSymptom],
    })

    showPredictionPage()

    fireEvent.click(
      screen.getByLabelText('Significant shortness of breath'),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Update result' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Seek prompt medical assessment',
      }),
    ).toBeInTheDocument()
    expect(createPrediction).toHaveBeenCalledWith({
      age: 22,
      sex: 'F',
      text: updatedText,
      confirmedCodes: updatedCodes,
    })
    expect(getSavedPredictionResult().status).toBe('urgent_review')
    expect(screen.queryByText(/Model score:/)).not.toBeInTheDocument()
  })
})