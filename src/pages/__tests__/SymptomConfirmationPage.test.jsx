import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SymptomConfirmationPage from '../SymptomConfirmationPage'
import api from '../../services/api'

vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    default: {
      post: vi.fn(),
    },
  }
})

const mapping = {
  input_text: 'I have fever and cough',
  recognised_symptoms: [
    {
      code: 'fever',
      display_name: 'Fever',
      matched_text: 'fever',
      is_red_flag: false,
    },
    {
      code: 'cough',
      display_name: 'Cough',
      matched_text: 'cough',
      is_red_flag: false,
    },
  ],
  has_red_flag: false,
}

const redFlag = {
  code: 'blue_lips',
  display_name: 'Blue lips',
  matched_text: 'blue lips',
  is_red_flag: true,
}

const urgentConfirmation = {
  input_text: 'I have blue lips',
  safety_status: 'urgent_review',
  has_red_flag: true,
  confirmed_codes: ['blue_lips'],
  confirmed_symptoms: [redFlag],
  rejected_symptoms: [],
}

const savedReview = {
  prediction_id: 'urgent-review-1',
  status: 'urgent_review',
  has_red_flag: true,
  confirmed_codes: ['blue_lips'],
  predictions: [],
  assessment: {
    prediction_performed: false,
  },
}

const saveFailureMessage =
  'Your safety guidance is still valid, but this review could not be saved to your history.'

function seedUrgentMapping() {
  sessionStorage.setItem(
    'respiracare_symptom_mapping',
    JSON.stringify({
      input_text: 'I have blue lips',
      recognised_symptoms: [redFlag],
      has_red_flag: true,
    }),
  )
}

function confirmationTree() {
  return (
    <MemoryRouter>
      <SymptomConfirmationPage />
    </MemoryRouter>
  )
}

function renderConfirmationPage() {
  return render(confirmationTree())
}

function clickConfirm() {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Confirm selected symptoms',
    }),
  )
}

describe('Symptom confirmation workflow', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sessionStorage.clear()

    sessionStorage.setItem(
      'respiracare_symptom_mapping',
      JSON.stringify(mapping),
    )
  })

  it('sends only selected symptoms and does not save a nonurgent review', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        safety_status: 'continue',
        confirmed_codes: ['fever'],
        confirmed_symptoms: [mapping.recognised_symptoms[0]],
        rejected_symptoms: [mapping.recognised_symptoms[1]],
      },
    })

    renderConfirmationPage()

    fireEvent.click(screen.getByRole('button', { name: /Cough/ }))
    clickConfirm()

    expect(
      await screen.findByText('Confirmation complete'),
    ).toBeInTheDocument()

    expect(api.post).toHaveBeenCalledWith(
      '/symptoms/confirm',
      {
        text: 'I have fever and cough',
        confirmed_codes: ['fever'],
      },
    )

    expect(api.post).toHaveBeenCalledTimes(1)

    expect(
      screen.getByRole('link', { name: /Continue to prediction/ }),
    ).toBeInTheDocument()
  })

  it('prevents confirmation when no symptoms are selected', () => {
    renderConfirmationPage()

    fireEvent.click(screen.getByRole('button', { name: /Fever/ }))
    fireEvent.click(screen.getByRole('button', { name: /Cough/ }))
    clickConfirm()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please confirm at least one symptom',
    )

    expect(api.post).not.toHaveBeenCalled()
  })

  it('shows urgent guidance before saving finishes, then links to the saved review', async () => {
    seedUrgentMapping()

    let finishSaving

    const pendingSave = new Promise((resolve) => {
      finishSaving = resolve
    })

    api.post
      .mockResolvedValueOnce({ data: urgentConfirmation })
      .mockReturnValueOnce(pendingSave)

    renderConfirmationPage()
    clickConfirm()

    expect(
      await screen.findByText('Urgent review recommended'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('A confirmed symptom needs prompt attention.'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Saving this safety review to your history...'),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: /Continue to prediction/ }),
    ).not.toBeInTheDocument()

    expect(api.post).toHaveBeenCalledWith(
      '/safety/reviews',
      {
        text: 'I have blue lips',
        confirmed_codes: ['blue_lips'],
      },
      expect.objectContaining({
        signal: expect.anything(),
      }),
    )

    expect(
      api.post.mock.calls.some(([url]) => url === '/predict'),
    ).toBe(false)

    await act(async () => {
      finishSaving({ data: savedReview })
    })

    expect(
      await screen.findByText(
        'This safety review has been saved to your history.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'View saved review' }),
    ).toHaveAttribute('href', '/history/urgent-review-1')

    expect(api.post).toHaveBeenCalledTimes(2)
  })

  it('keeps urgent guidance visible after a save failure and allows retry', async () => {
    seedUrgentMapping()

    api.post
      .mockResolvedValueOnce({ data: urgentConfirmation })
      .mockRejectedValueOnce(new Error('Synthetic save failure'))
      .mockResolvedValueOnce({ data: savedReview })

    renderConfirmationPage()
    clickConfirm()

    expect(
      await screen.findByText(saveFailureMessage),
    ).toBeInTheDocument()

    expect(
      screen.getByText('A confirmed symptom needs prompt attention.'),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Retry saving review' }),
    )

    expect(
      await screen.findByRole('link', { name: 'View saved review' }),
    ).toHaveAttribute('href', '/history/urgent-review-1')

    expect(
      api.post.mock.calls.filter(([url]) => url === '/symptoms/confirm'),
    ).toHaveLength(1)

    expect(
      api.post.mock.calls.filter(([url]) => url === '/safety/reviews'),
    ).toHaveLength(2)

    expect(
      api.post.mock.calls.some(([url]) => url === '/predict'),
    ).toBe(false)
  })

  it('does not report success for a response containing disease predictions', async () => {
    seedUrgentMapping()

    api.post
      .mockResolvedValueOnce({ data: urgentConfirmation })
      .mockResolvedValueOnce({
        data: {
          ...savedReview,
          predictions: [{ display_name: 'Unexpected condition' }],
        },
      })

    renderConfirmationPage()
    clickConfirm()

    expect(
      await screen.findByText(saveFailureMessage),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: 'View saved review' }),
    ).not.toBeInTheDocument()

    expect(
      screen.queryByText('Unexpected condition'),
    ).not.toBeInTheDocument()
  })

  it('does not save again merely because the page rerenders', async () => {
    seedUrgentMapping()

    api.post
      .mockResolvedValueOnce({ data: urgentConfirmation })
      .mockResolvedValueOnce({ data: savedReview })

    const view = renderConfirmationPage()
    clickConfirm()

    await screen.findByRole('link', { name: 'View saved review' })

    view.rerender(confirmationTree())

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(2)
    })

    expect(
      screen.getByRole('link', { name: 'View saved review' }),
    ).toBeInTheDocument()
  })

  it('does not attempt to save when symptom confirmation fails', async () => {
    api.post.mockRejectedValueOnce(
      new Error('Synthetic confirmation failure'),
    )

    renderConfirmationPage()
    clickConfirm()

    expect(
      await screen.findByText(
        'Your symptoms could not be confirmed. Please try again.',
      ),
    ).toBeInTheDocument()

    expect(api.post).toHaveBeenCalledTimes(1)
    expect(
      api.post.mock.calls.some(([url]) => url === '/safety/reviews'),
    ).toBe(false)
  })
})