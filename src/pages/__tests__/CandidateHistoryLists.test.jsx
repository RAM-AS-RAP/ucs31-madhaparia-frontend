import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import PatientHistoryPage from '../PatientHistoryPage'
import AdminDashboardPage from '../AdminDashboardPage'
import LanguageContext from '../../context/LanguageContextBase'
import AuthContext from '../../context/AuthContextBase'
import { getPatientHistory } from '../../services/history'
import { getAdminHistory, getAdminFeedback } from '../../services/admin'
import {
  acceptedCandidate,
  insufficientCandidate,
  unsupportedCandidate,
  urgentCandidate,
  legacyHistory,
} from '../../test/fixtures/candidateResponses'

vi.mock('../../services/history', () => ({
  getPatientHistory: vi.fn(),
}))

vi.mock('../../services/admin', () => ({
  getAdminHistory: vi.fn(),
  getAdminFeedback: vi.fn(),
}))

vi.mock('@highcharts/react', () => ({
  Chart: ({ children }) => <div>{children}</div>,
}))
vi.mock('@highcharts/react/series/Pie', () => ({
  PieSeries: () => null,
}))
vi.mock('@highcharts/react/series/Column', () => ({
  ColumnSeries: () => null,
}))
vi.mock('@highcharts/react/modules/Accessibility', () => ({
  Accessibility: () => null,
}))

const hiddenCondition = {
  rank: 1,
  condition: 'Pulmonary neoplasm',
  display_name: 'Hidden tumor result',
  model_confidence_percent: 88,
}

const records = [
  acceptedCandidate,
  {
    ...insufficientCandidate,
    predictions: [hiddenCondition],
  },
  unsupportedCandidate,
  urgentCandidate,
  legacyHistory,
].map((item, index) => ({
  ...item,
  user_id: 'example-patient',
  created_at: `2026-11-03T10:0${index}:00Z`,
  input_text: 'Example symptom description',
}))

const pages = [
  {
    name: 'patient',
    Page: PatientHistoryPage,
    searchLabel: 'Search history',
    load: getPatientHistory,
  },
  {
    name: 'administrator',
    Page: AdminDashboardPage,
    searchLabel: 'Search sessions',
    load: getAdminHistory,
  },
]

describe.each(pages)(
  '$name candidate history list',
  ({ Page, searchLabel, load }) => {
    beforeEach(() => {
      vi.clearAllMocks()
      getPatientHistory.mockResolvedValue({ history: records })
      getAdminHistory.mockResolvedValue({ history: records })
      getAdminFeedback.mockResolvedValue({ feedback: [] })
    })

    function showPage(language = 'en') {
      return render(
        <LanguageContext.Provider value={{ language }}>
          <MemoryRouter>
            <AuthContext.Provider value={{ user: { id: 'test-admin', role: 'admin' } }}>
              <Page />
            </AuthContext.Provider>
          </MemoryRouter>
        </LanguageContext.Provider>,
      )
    }

    it('shows accepted, withheld, urgent and older records', async () => {
      showPage()

      expect(
        await screen.findByRole('heading', {
          name: 'Upper respiratory tract infection',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: 'Tuberculosis (TB)' }),
        ).toBeInTheDocument()
      expect(
        screen.getAllByText('More information needed').length,
      ).toBeGreaterThan(0)
      expect(
        screen.getAllByText('Symptoms need clarification').length,
      ).toBeGreaterThan(0)
      expect(
        screen.queryByText('Hidden tumor result'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('88%'),
      ).not.toBeInTheDocument()

      expect(load).toHaveBeenCalled()
    })

    it('does not reveal a withheld condition through search', async () => {
      showPage()
      await screen.findByRole('heading', {
        name: 'Upper respiratory tract infection',
      })

      fireEvent.change(screen.getByLabelText(searchLabel), {
        target: { value: 'Hidden tumor result' },
      })

      expect(
        screen.getByText('No matching sessions'),
      ).toBeInTheDocument()
    })

    it('shows a Kiswahili withheld status', async () => {
      showPage('sw')
      await screen.findByRole('heading', {
        name: 'Upper respiratory tract infection',
      })

      expect(
        screen.getAllByText('Taarifa zaidi zinahitajika').length,
      ).toBeGreaterThan(0)
      expect(
        screen.queryByText('Hidden tumor result'),
      ).not.toBeInTheDocument()
    })
  },
)
