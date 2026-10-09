import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import SymptomInputPage from '../SymptomInputPage'

vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    default: {
      post: vi.fn(),
    },
  }
})

import api from '../../services/api'

function renderSymptomInputPage() {
  return render(
    <MemoryRouter>
      <SymptomInputPage />
    </MemoryRouter>,
  )
}

function analyse(text) {
  renderSymptomInputPage()

  fireEvent.change(
    screen.getByLabelText('Symptom description'),
    {
      target: {
        value: text,
      },
    },
  )

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Analyse symptoms',
    }),
  )
}

describe('SymptomInputPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it(
    'clears an older prediction result when new symptoms are analysed',
    async () => {
      sessionStorage.setItem(
        'respiracare_prediction_result',
        JSON.stringify({
          prediction_id: 'old-id',
        }),
      )

      api.post.mockResolvedValue({
        data: {
          input_text: 'nina homa',
          recognised_symptoms: [
            {
              code: 'fever',
              display_name: 'Fever',
              matched_text: 'homa',
              language: 'sw',
              match_type: 'exact',
              match_score: 100,
              is_red_flag: false,
            },
          ],
          unmatched_wording: [],
          has_red_flag: false,
        },
      })

      analyse('nina homa')

      await screen.findByText('Fever')

      expect(
        sessionStorage.getItem(
          'respiracare_prediction_result',
        ),
      ).toBeNull()
    },
  )

  it(
    'does not offer confirmation when nothing was recognised',
    async () => {
      api.post.mockResolvedValue({
        data: {
          input_text: 'my knee itches',
          recognised_symptoms: [],
          unmatched_wording: [],
          has_red_flag: false,
        },
      })

      analyse('my knee itches')

      await screen.findByText(
        'No supported symptoms were recognised',
      )

      expect(
        screen.queryByText(
          'Continue to confirmation',
        ),
      ).not.toBeInTheDocument()
    },
  )
})
