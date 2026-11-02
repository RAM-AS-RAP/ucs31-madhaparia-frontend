import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import App from '../../App'
import LanguageContext from '../../context/LanguageContextBase'
import { translate } from '../../i18n/translations'
import { useAuth } from '../../context/useAuth'
import { getAdminFeedback, getAdminHistory } from '../../services/admin'

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/admin', () => ({
  getAdminHistory: vi.fn(),
  getAdminFeedback: vi.fn(),
  getAdminHistoryItem: vi.fn(),
}))

vi.mock('@highcharts/react', () => ({
  Chart: ({ children }) => <div data-testid="chart">{children}</div>,
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

const history = [
  {
    prediction_id: 'normal-session',
    user_id: 'patient-a',
    created_at: '2026-11-01T10:00:00Z',
    status: 'prediction_complete',
    has_red_flag: false,
    input_text: 'Synthetic cough',
    age: 25,
    sex: 'M',
    confirmed_codes: ['cough'],
    predictions: [{ display_name: 'Synthetic condition' }],
  },
  {
    prediction_id: 'urgent-session',
    user_id: 'patient-b',
    created_at: '2026-11-01T11:00:00Z',
    status: 'urgent_review',
    has_red_flag: true,
    input_text: 'Synthetic urgent symptoms',
    confirmed_codes: ['blue_lips'],
    predictions: [{ display_name: 'Must remain hidden' }],
  },
]

const feedback = [
  {
    feedback_id: 'feedback-1',
    prediction_id: 'normal-session',
    created_at: '2026-11-01T12:00:00Z',
    was_helpful: true,
    comment: 'Synthetic helpful feedback',
  },
]

function renderDashboard(language = 'en') {
  return render(
    <LanguageContext.Provider
      value={{
        language,
        t: (key, values) => translate(language, key, values),
      }}
    >
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    </LanguageContext.Provider>,
  )
}

describe('actual administrator dashboard route', () => {
  beforeEach(() => {
    vi.resetAllMocks()

    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
      sessionError: '',
      user: {
        id: 'admin-1',
        email: 'admin@example.test',
        role: 'admin',
      },
      logout: vi.fn(),
    })

    getAdminHistory.mockResolvedValue({ history })
    getAdminFeedback.mockResolvedValue({ feedback })
  })

  it('renders the actual lazy-loaded dashboard and records', async () => {
    renderDashboard()

    expect(
      await screen.findByRole(
        'heading',
        { name: /System activity overview/ },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument()

    expect(getAdminHistory).toHaveBeenCalled()
    expect(getAdminFeedback).toHaveBeenCalled()
    expect(screen.getByText('Synthetic condition')).toBeInTheDocument()
    expect(screen.queryByText('Must remain hidden')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('chart')).toHaveLength(2)

    expect(
      screen.getAllByRole('link', { name: /View session/ }),
    ).toHaveLength(2)
  }, 10000)

  it('renders the dashboard in Kiswahili', async () => {
    renderDashboard('sw')

    expect(
      await screen.findByRole('heading', {
        name: /Shughuli za mfumo/,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Tathmini zilizohifadhiwa'),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Tafuta tathmini')).toBeInTheDocument()
  })

  it('filters urgent sessions and searches patient records', async () => {
    renderDashboard()
    await screen.findByText('Synthetic condition')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Urgent review',
        exact: true,
      }),
    )

    expect(screen.queryByText('Synthetic condition')).not.toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /View session/ }),
    ).toHaveAttribute('href', '/admin/history/urgent-session')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'All',
        exact: true,
      }),
    )

    fireEvent.change(screen.getByLabelText('Search sessions'), {
      target: { value: 'patient-a' },
    })

    expect(screen.getByText('Synthetic condition')).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: /View session/ }),
    ).toHaveAttribute('href', '/admin/history/normal-session')
  })

  it('opens feedback and searches comments', async () => {
    renderDashboard()
    await screen.findByText('Synthetic condition')

    fireEvent.click(
      screen.getByRole('button', {
        name: /^Feedback/,
      }),
    )

    expect(
      screen.getByText('Synthetic helpful feedback'),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search feedback'), {
      target: { value: 'no matching comment' },
    })

    expect(screen.getByText('No matching feedback')).toBeInTheDocument()
  })

  it('handles empty records', async () => {
    getAdminHistory.mockResolvedValue({ history: [] })
    getAdminFeedback.mockResolvedValue({ feedback: [] })

    renderDashboard()

    expect(
      await screen.findByText('No matching sessions'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('No sessions available to chart yet.'),
    ).toBeInTheDocument()

    expect(screen.queryByTestId('chart')).not.toBeInTheDocument()
  })

  it('shows a readable API failure', async () => {
    getAdminHistory.mockRejectedValue(new Error('Synthetic failure'))

    renderDashboard()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'RespiraCare could not load the administrator dashboard.',
    )
  })

  it('denies patients before requesting administrator data', async () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
      user: {
        id: 'patient-1',
        role: 'patient',
      },
    })

    renderDashboard()

    expect(
      await screen.findByRole('heading', {
        name: 'Administrator access required.',
      }),
    ).toBeInTheDocument()

    expect(getAdminHistory).not.toHaveBeenCalled()
    expect(getAdminFeedback).not.toHaveBeenCalled()
  })
})