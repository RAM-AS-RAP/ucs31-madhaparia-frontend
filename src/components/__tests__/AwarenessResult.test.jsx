import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AwarenessResult from '../AwarenessResult'
import { getCandidateHistoryDisplay } from '../../utils/candidateHistory'

const result = {
  status: 'insufficient_information',
  predictions: [],
  assessment: {
    contract_version: 2,
    status: 'insufficient_information',
    summary: 'The cause cannot be established from this report.',
    model_version: 'v3_partial_evidence',
    policy_id: 'awareness_no_unvalidated_names_v1',
    observations: [{ code: 'taste_change', display_name: 'Change of taste', status: 'present', confirmed: true, reported_subject: 'patient_or_unspecified', context_only: true, taste_detail: 'reduced', duration_text: 'a few days' }],
    next_steps: ['Flu and COVID-19 can share symptoms; testing may be needed.'],
    limitations: 'Duration and taste are not trained model inputs.',
    research_rankings: [{ condition: 'Tuberculosis', raw_relative_score: 0.9 }],
  },
}

describe('Awareness release results', () => {
  it('shows context and guidance, never research disease scores for patients', () => {
    render(<AwarenessResult result={result} />)
    expect(screen.getByRole('heading', { name: /cause not established/i })).toBeInTheDocument()
    expect(screen.getByText(/Change of taste/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'COVID-19 is possible — take a test' })).toBeInTheDocument()
    expect(screen.getByText(/Take a COVID-19 test/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Your test result')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Save reported test/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Tuberculosis/)).not.toBeInTheDocument()
    expect(screen.queryByText(/90%/)).not.toBeInTheDocument()
  })

  it('labels authorised research detail explicitly, without a diagnosis claim', () => {
    render(<AwarenessResult result={result} admin />)
    expect(screen.getByText(/Research-only ranking/)).toBeInTheDocument()
    expect(screen.getByText(/Tuberculosis: dataset-relative score/)).toBeInTheDocument()
  })

  it('preserves urgent outcome priority', () => {
    render(<AwarenessResult result={{ ...result, status: 'urgent_review' }} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Urgent medical assessment/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'COVID-19 is possible — take a test' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Your test result')).not.toBeInTheDocument()
  })

  it('lists new history without accidentally selecting a disease', () => {
    const display = getCandidateHistoryDisplay(result)
    expect(display.prediction).toBeNull()
    expect(display.label).toBe('More information needed')
  })

  it('records a reported COVID test as context, never a prediction', () => {
    const withTest = { ...result, assessment: { ...result.assessment,
      covid_test_context: { result: 'positive', test_type: 'pcr', used_by_model: false } } }
    render(<AwarenessResult result={withTest} />)
    expect(screen.getByText(/Reported COVID test/)).toBeInTheDocument()
    expect(screen.getByText(/Positive \(pcr\)/)).toBeInTheDocument()
    expect(screen.getByText(/information you provided/)).toBeInTheDocument()
    expect(screen.queryByText(/90%/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Your test result')).not.toBeInTheDocument()
  })

  it.each([
    { status: 'absent' }, { status: 'unknown' }, { reported_subject: 'other_person' }, { confirmed: false },
  ])('does not recommend a COVID test for denied/uncertain/other-person/unselected context: %j', (change) => {
    render(<AwarenessResult result={{ ...result, assessment: { ...result.assessment,
      observations: [{ ...result.assessment.observations[0], ...change }] } }} />)
    expect(screen.queryByRole('heading', { name: 'COVID-19 is possible — take a test' })).not.toBeInTheDocument()
  })

  it('does not show a COVID panel for ordinary fever/cough or irrelevant flu details', () => {
    render(<AwarenessResult result={{ ...result, assessment: { ...result.assessment,
      covid_testing_recommended: false, observations: [], flu_scope: 'Influenza scope' } }} />)
    expect(screen.queryByRole('heading', { name: /COVID/ })).not.toBeInTheDocument()
    expect(screen.queryByText('What does FLU(influenza) mean?')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows an eligible research pattern as FLU(influenza), without a personal probability', () => {
    const eligible = { ...result, status: 'research_pattern', assessment: { ...result.assessment,
      covid_testing_recommended: false, flu_scope: 'Influenza scope',
      research_pattern: { condition: 'Influenza', display_name: 'FLU(influenza)', description: 'A research-pattern comparison.', comparison_score_percent: 83.21 } } }
    render(<AwarenessResult result={eligible} />)
    expect(screen.getByRole('heading', { name: 'FLU(influenza)', exact: true })).toBeInTheDocument()
    expect(screen.getByText('Possible symptom pattern')).toBeInTheDocument()
    expect(screen.getByText('83.21%')).toBeInTheDocument()
    expect(screen.getByText('Symptom comparison score')).toBeInTheDocument()
    expect(screen.getByText(/not your chance of having this illness/)).toBeInTheDocument()
    expect(screen.queryByText('v3_partial_evidence')).not.toBeInTheDocument()
    expect(getCandidateHistoryDisplay(eligible).label).toBe('Research comparison')
    expect(screen.getByText('What does FLU(influenza) mean?')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /COVID/ })).not.toBeInTheDocument()
  })

  it('keeps the patient result concise and reserves technical details for administrators', () => {
    const eligible = { ...result, status: 'research_pattern', assessment: { ...result.assessment,
      research_pattern: { condition: 'Influenza', display_name: 'FLU(influenza)', description: 'Research comparison.', comparison_score_percent: 83.21 } } }
    const { container } = render(<AwarenessResult result={eligible} />)
    expect(container.querySelector('.pred34-result-intro h2')).toHaveTextContent('Your health-awareness result')
    expect(container.querySelector('.pred34-condition-top h3')).toHaveTextContent('FLU(influenza)')
    expect(container.querySelector('.pred34-confidence-note')).not.toBeInTheDocument()
    expect(container.querySelector('.pred34-guidance h3')).toHaveTextContent('What to do next')
    expect(container.querySelector('.pred34-confidence-value')).toHaveTextContent('83.21%')
    expect(container.querySelector('.pred34-confidence-track')).not.toBeInTheDocument()
  })

  it('never shows a score for a withheld or urgent outcome', () => {
    const withPattern = { ...result, assessment: { ...result.assessment,
      research_pattern: { condition: 'Influenza', display_name: 'FLU(influenza)', comparison_score_percent: 83.21 } } }
    const { rerender } = render(<AwarenessResult result={withPattern} />)
    expect(screen.queryByText('83.21%')).not.toBeInTheDocument()
    rerender(<AwarenessResult result={{ ...withPattern, status: 'urgent_review' }} />)
    expect(screen.queryByText('83.21%')).not.toBeInTheDocument()
  })
})
