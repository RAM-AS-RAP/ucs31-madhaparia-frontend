import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import PredictionPage from '../PredictionPage'
import PatientHistoryDetailPage from '../PatientHistoryDetailPage'
import LanguageContext from '../../context/LanguageContextBase'
import { createPrediction } from '../../services/predictions'
import { getPatientHistoryItem } from '../../services/history'
import {
  acceptedCandidate,
  insufficientCandidate,
  unsupportedCandidate,
  urgentCandidate,
} from '../../test/fixtures/candidateResponses'

vi.mock('../../services/predictions', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, createPrediction: vi.fn() }
})

vi.mock('../../services/history', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getPatientHistoryItem: vi.fn() }
})

vi.mock('../../components/PredictionFeedback', () => ({
  default: () => null,
}))

const inputText = 'Example symptom description'

function prepareConfirmation(response) {
  const confirmedSymptoms = response.confirmed_codes.map((code) => ({
    code,
    display_name:
      code === 'blue_lips'
        ? 'Blue lips'
        : code === 'itchy_eyes'
          ? 'Itchy eyes'
          : code,
  }))

  sessionStorage.setItem(
    'respiracare_symptom_mapping',
    JSON.stringify({
      input_text: inputText,
      recognised_symptoms: confirmedSymptoms,
      has_red_flag: response.status === 'urgent_review',
    }),
  )

  sessionStorage.setItem(
    'respiracare_symptom_confirmation',
    JSON.stringify({
      input_text: inputText,
      confirmed_codes: response.confirmed_codes,
      confirmed_symptoms: confirmedSymptoms,
      safety_status:
        response.status === 'urgent_review'
          ? 'urgent_review'
          : 'continue',
    }),
  )
}

function showPredictionPage() {
  return render(
    <LanguageContext.Provider value={{ language: 'en' }}>
      <MemoryRouter>
        <PredictionPage />
      </MemoryRouter>
    </LanguageContext.Provider>,
  )
}

function submitAssessment(urgent = false) {
  fireEvent.change(screen.getByLabelText('Age'), {
    target: { value: '22' },
  })
  fireEvent.change(screen.getByLabelText('Sex'), {
    target: { value: 'F' },
  })

  fireEvent.click(
    screen.getByRole('button', {
      name: urgent
        ? 'Continue safety review'
        : 'Generate awareness result',
    }),
  )
}

function showSavedHistory(response) {
  getPatientHistoryItem.mockResolvedValueOnce({
    ...response,
    input_text: inputText,
    user_id: 'example-patient',
    created_at: '2026-11-03T10:00:00Z',
  })

  return render(
    <LanguageContext.Provider value={{ language: 'en' }}>
      <MemoryRouter
        initialEntries={[`/history/${response.prediction_id}`]}
      >
        <Routes>
          <Route
            path="/history/:predictionId"
            element={<PatientHistoryDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </LanguageContext.Provider>,
  )
}

describe('candidate workflow readiness', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it.each([
    {
      name: 'accepted',
      response: acceptedCandidate,
      heading: 'A condition pattern is available',
      showsCondition: true,
    },
    {
      name: 'insufficient',
      response: insufficientCandidate,
      heading: 'More information is needed',
      showsCondition: false,
    },
    {
      name: 'unsupported',
      response: unsupportedCandidate,
      heading: 'Some symptoms need clarification',
      showsCondition: false,
    },
  ])(
    'carries a $name assessment from submission to saved history',
    async ({ response, heading, showsCondition }) => {
      prepareConfirmation(response)
      createPrediction.mockResolvedValueOnce(response)

      const page = showPredictionPage()
      submitAssessment()

      expect(
        await screen.findByRole('heading', { name: heading }),
      ).toBeInTheDocument()

      expect(createPrediction).toHaveBeenCalledWith({
        age: 22,
        sex: 'F',
        text: inputText,
        confirmedCodes: response.confirmed_codes,
      })

      const saved = JSON.parse(
        sessionStorage.getItem('respiracare_prediction_result'),
      )
      expect(saved.assessment).toEqual(response.assessment)
      expect(saved.input_text).toBe(inputText)

      page.unmount()
      showSavedHistory(response)

      expect(
        await screen.findByRole('heading', { name: heading }),
      ).toBeInTheDocument()
      expect(getPatientHistoryItem).toHaveBeenCalledWith(
        response.prediction_id,
      )

      if (showsCondition) {
        expect(
          screen.getByText('Upper respiratory tract infection'),
        ).toBeInTheDocument()
        expect(
          screen.getByText('Model score: 81.23%'),
        ).toBeInTheDocument()
      } else {
        expect(
          screen.queryByText('Upper respiratory tract infection'),
        ).not.toBeInTheDocument()
        expect(
          screen.queryByText(/Model score:/),
        ).not.toBeInTheDocument()
      }
    },
  )

  it('preserves urgent guidance without showing a condition', async () => {
    prepareConfirmation(urgentCandidate)
    createPrediction.mockResolvedValueOnce(urgentCandidate)

    showPredictionPage()
    submitAssessment(true)

    expect(
      await screen.findByRole('heading', {
        name: 'Seek prompt medical assessment',
      }),
    ).toBeInTheDocument()
    expect(createPrediction).toHaveBeenCalledWith({
      age: 22,
      sex: 'F',
      text: inputText,
      confirmedCodes: ['blue_lips'],
    })
    expect(
      screen.queryByText(/Model score:/),
    ).not.toBeInTheDocument()
  })

  it('shows an operational failure without saving a result', async () => {
    prepareConfirmation(insufficientCandidate)
    createPrediction.mockRejectedValueOnce({
      response: {
        status: 503,
        data: { detail: 'Candidate temporarily unavailable.' },
      },
    })

    showPredictionPage()
    submitAssessment()

    expect(
      await screen.findByText('Candidate temporarily unavailable.'),
    ).toBeInTheDocument()
    expect(
      sessionStorage.getItem('respiracare_prediction_result'),
    ).toBeNull()
  })
})