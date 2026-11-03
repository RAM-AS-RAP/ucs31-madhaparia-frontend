import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import PatientHistoryDetailPage from '../PatientHistoryDetailPage'
import AdminHistoryDetailPage from '../AdminHistoryDetailPage'
import LanguageContext from '../../context/LanguageContextBase'
import { getPatientHistoryItem } from '../../services/history'
import { getAdminHistoryItem } from '../../services/admin'
import {
  acceptedCandidate,
  insufficientCandidate,
  unsupportedCandidate,
  urgentCandidate,
} from '../../test/fixtures/candidateResponses'

vi.mock('../../services/history', () => ({
  getPatientHistoryItem: vi.fn(),
}))

vi.mock('../../services/admin', () => ({
  getAdminHistoryItem: vi.fn(),
}))

vi.mock('../../components/PredictionFeedback', () => ({
  default: () => null,
}))

const pages = [
  {
    name: 'patient',
    Page: PatientHistoryDetailPage,
    load: getPatientHistoryItem,
    path: '/history',
  },
  {
    name: 'administrator',
    Page: AdminHistoryDetailPage,
    load: getAdminHistoryItem,
    path: '/admin/history',
  },
]

describe.each(pages)(
  '$name saved candidate assessment',
  ({ Page, load, path }) => {
    beforeEach(() => {
      vi.resetAllMocks()
    })

    function showHistory(result, language = 'en') {
      load.mockResolvedValueOnce({
        created_at: '2026-11-03T10:00:00Z',
        user_id: 'example-patient',
        input_text: 'Example symptom description',
        ...result,
      })

      return render(
        <LanguageContext.Provider value={{ language }}>
          <MemoryRouter
            initialEntries={[`${path}/${result.prediction_id}`]}
          >
            <Routes>
              <Route
                path={`${path}/:predictionId`}
                element={<Page />}
              />
            </Routes>
          </MemoryRouter>
        </LanguageContext.Provider>,
      )
    }

    it('shows the saved accepted condition and model score', async () => {
      showHistory(acceptedCandidate)

      expect(
        await screen.findByRole('heading', {
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

      expect(load).toHaveBeenCalledWith(
        acceptedCandidate.prediction_id,
      )
    })

    it.each([
      {
        label: 'insufficient information',
        result: insufficientCandidate,
        heading: 'More information is needed',
      },
      {
        label: 'unsupported input',
        result: unsupportedCandidate,
        heading: 'Some symptoms need clarification',
      },
    ])(
      'withholds a condition for $label even if predictions are present',
      async ({ result, heading }) => {
        showHistory({
          ...result,
          predictions: acceptedCandidate.predictions,
        })

        expect(
          await screen.findByRole('heading', { name: heading }),
        ).toBeInTheDocument()

        expect(
          screen.queryByText('Upper respiratory tract infection'),
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText(/Model score:/),
        ).not.toBeInTheDocument()

        expect(
          screen.getByText(result.health_guidance),
        ).toBeInTheDocument()
      },
    )

    it('shows unsupported symptoms and saved unmatched wording', async () => {
      showHistory({
        ...unsupportedCandidate,
        assessment: {
          ...unsupportedCandidate.assessment,
          has_unmatched_wording: true,
          unmatched_wording: [
            { unmatched_text: 'unrecognised example wording' },
          ],
        },
      })

      expect(
        await screen.findByRole('heading', {
          name: 'Symptoms needing clarification',
        }),
      ).toBeInTheDocument()

      const assessment = screen.getByRole('status', {
        name: 'Some symptoms need clarification',
      })

      expect(
        within(assessment).getByText('itchy eyes'),
      ).toBeInTheDocument()

      expect(
        within(assessment).getByText('unrecognised example wording'),
      ).toBeInTheDocument()

      expect(
        within(assessment).getByText(
          'This wording was not understood as a confirmed symptom.',
        ),
      ).toBeInTheDocument()
    })

    it.each([
      {
        label: 'urgent session status',
        result: {
          ...acceptedCandidate,
          status: 'urgent_review',
        },
      },
      {
        label: 'red-flag indicator',
        result: {
          ...acceptedCandidate,
          has_red_flag: true,
        },
      },
      {
        label: 'saved safety assessment',
        result: {
          ...urgentCandidate,
          status: 'prediction_complete',
          has_red_flag: false,
          predictions: acceptedCandidate.predictions,
        },
      },
    ])(
      'gives urgent guidance priority for $label',
      async ({ result }) => {
        showHistory(result)

        expect(
          await screen.findByRole('heading', {
            name: 'Seek prompt medical assessment',
          }),
        ).toBeInTheDocument()

        expect(
          screen.queryByText('Upper respiratory tract infection'),
        ).not.toBeInTheDocument()

        expect(
          screen.queryByText(/Model score:/),
        ).not.toBeInTheDocument()

        expect(
          screen.getByText(result.health_guidance),
        ).toBeInTheDocument()
      },
    )

    it('shows the saved insufficient-information state in Kiswahili', async () => {
      showHistory(insufficientCandidate, 'sw')

      expect(
        await screen.findByRole('heading', {
          name: 'Taarifa zaidi zinahitajika',
        }),
      ).toBeInTheDocument()

      expect(
        screen.queryByText('Upper respiratory tract infection'),
      ).not.toBeInTheDocument()
    })
  },
)