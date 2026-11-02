import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import PredictionPage from '../PredictionPage'
import LanguageContext from '../../context/LanguageContextBase'
import {
  acceptedCandidate,
  insufficientCandidate,
  unsupportedCandidate,
  urgentCandidate,
} from '../../test/fixtures/candidateResponses'

vi.mock('../../components/PredictionFeedback', () => ({
  default: () => null,
}))

function showSavedResult(result, language = 'en') {
  const text = 'Example symptom description'

  sessionStorage.setItem(
    'respiracare_symptom_mapping',
    JSON.stringify({
      input_text: text,
      recognised_symptoms: [],
      has_red_flag: result.has_red_flag,
    }),
  )

  sessionStorage.setItem(
    'respiracare_symptom_confirmation',
    JSON.stringify({
      input_text: text,
      confirmed_codes: result.confirmed_codes,
      confirmed_symptoms: result.confirmed_codes.map((code) => ({
        code,
        display_name:
          code === 'itchy_eyes' ? 'Itchy eyes' : code,
      })),
      safety_status:
        result.status === 'urgent_review'
          ? 'urgent_review'
          : 'continue',
    }),
  )

  sessionStorage.setItem(
    'respiracare_prediction_result',
    JSON.stringify({ ...result, input_text: text }),
  )

  return render(
    <LanguageContext.Provider value={{ language }}>
      <MemoryRouter>
        <PredictionPage />
      </MemoryRouter>
    </LanguageContext.Provider>,
  )
}

describe('candidate prediction page', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('shows an accepted condition and explains its model score', () => {
    showSavedResult(acceptedCandidate)

    expect(
      screen.getByRole('heading', {
        name: 'A condition pattern is available',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Upper respiratory tract infection'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Model score: 81.23%'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/not a diagnosis or your individual risk/),
    ).toBeInTheDocument()
  })

  it('withholds a condition when information is insufficient', () => {
    showSavedResult(insufficientCandidate)

    expect(
      screen.getByRole('heading', {
        name: 'More information is needed',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Upper respiratory tract infection'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Model score:/),
    ).not.toBeInTheDocument()
  })

  it('shows unsupported symptoms and unmatched wording', () => {
    showSavedResult({
      ...unsupportedCandidate,
      assessment: {
        ...unsupportedCandidate.assessment,
        unmatched_wording: [
          { unmatched_text: 'sneezing' },
        ],
      },
    })

    expect(
      screen.getByRole('heading', {
        name: 'Some symptoms need clarification',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Itchy eyes')).toBeInTheDocument()
    expect(screen.getByText('sneezing')).toBeInTheDocument()
    expect(
      screen.getByText(
        'This wording was not understood as a confirmed symptom.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Model score:/),
    ).not.toBeInTheDocument()
  })

  it('shows urgent guidance without a disease or score', () => {
    showSavedResult(urgentCandidate)

    expect(
      screen.getByRole('heading', {
        name: 'Seek prompt medical assessment',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Seek urgent medical assessment.'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Model score:/),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Upper respiratory tract infection'),
    ).not.toBeInTheDocument()
  })

  it('uses Kiswahili for the insufficient-information state', () => {
    showSavedResult(insufficientCandidate, 'sw')

    expect(
      screen.getByRole('heading', {
        name: 'Taarifa zaidi zinahitajika',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/Model score:/),
    ).not.toBeInTheDocument()
  })

  it('does not reveal a prediction if the response says to withhold it', () => {
    showSavedResult({
      ...insufficientCandidate,
      predictions: acceptedCandidate.predictions,
    })

    expect(
      screen.queryByText('Upper respiratory tract infection'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Model score:/),
    ).not.toBeInTheDocument()
  })
})