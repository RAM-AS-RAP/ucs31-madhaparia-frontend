import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import SymptomInputPage from '../SymptomInputPage'
import SymptomConfirmationPage from '../SymptomConfirmationPage'
import PredictionPage from '../PredictionPage'
import LanguageContext from '../../context/LanguageContextBase'
import { mapSymptoms, confirmSymptoms } from '../../services/symptoms'
import { createPrediction } from '../../services/predictions'
import { acceptedCandidate } from '../../test/fixtures/candidateResponses'

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

const inputText = 'I have constant tiredness and headache'

const recognisedSymptoms = [
  {
    code: 'headache',
    display_name: 'Headache',
    matched_text: 'headache',
    is_red_flag: false,
  },
  {
    code: 'tiredness',
    display_name: 'Constant tiredness',
    matched_text: 'constant tiredness',
    is_red_flag: false,
  },
]

describe('candidate symptom-to-result route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('carries confirmed symptoms through input, confirmation and prediction', async () => {
    mapSymptoms.mockResolvedValueOnce({
      input_text: inputText,
      recognised_symptoms: recognisedSymptoms,
      unmatched_wording: [],
      has_red_flag: false,
    })

    confirmSymptoms.mockResolvedValueOnce({
      input_text: inputText,
      confirmed_codes: ['headache', 'tiredness'],
      confirmed_symptoms: recognisedSymptoms,
      rejected_symptoms: [],
      safety_status: 'continue',
      has_red_flag: false,
    })

    createPrediction.mockResolvedValueOnce(acceptedCandidate)

    render(
      <LanguageContext.Provider value={{ language: 'en' }}>
        <MemoryRouter initialEntries={['/symptoms']}>
          <Routes>
            <Route path="/symptoms" element={<SymptomInputPage />} />
            <Route
              path="/symptoms/confirm"
              element={<SymptomConfirmationPage />}
            />
            <Route path="/prediction" element={<PredictionPage />} />
          </Routes>
        </MemoryRouter>
      </LanguageContext.Provider>,
    )

    fireEvent.change(screen.getByLabelText('Symptom description'), {
      target: { value: inputText },
    })
    fireEvent.click(
      screen.getByRole('button', { name: 'Analyse symptoms' }),
    )

    fireEvent.click(
      await screen.findByRole('link', {
        name: /Continue to confirmation/,
      }),
    )

    expect(screen.getByText('Constant tiredness')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm selected symptoms',
      }),
    )

    expect(confirmSymptoms).toHaveBeenCalledWith(
      inputText,
      ['headache', 'tiredness'],
    )

    fireEvent.click(
      await screen.findByRole('link', {
        name: /Continue to prediction/,
      }),
    )

    fireEvent.change(screen.getByLabelText('Age'), {
      target: { value: '22' },
    })
    fireEvent.change(screen.getByLabelText('Sex'), {
      target: { value: 'F' },
    })
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Generate awareness result',
      }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'A condition pattern is available',
      }),
    ).toBeInTheDocument()

    expect(createPrediction).toHaveBeenCalledWith({
      age: 22,
      sex: 'F',
      text: inputText,
      confirmedCodes: ['headache', 'tiredness'],
    })

    const saved = JSON.parse(
      sessionStorage.getItem('respiracare_prediction_result'),
    )
    expect(saved.assessment).toEqual(acceptedCandidate.assessment)
    expect(saved.input_text).toBe(inputText)
  })
})