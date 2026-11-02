const scoreNote =
  'Model scores are not clinically validated individual disease risks.'

const baseAssessment = {
  contract_version: 1,
  model_version: 'candidate_v1_research',
  policy_id: 'candidate_v1_research_uncertainty_v1',
  reported_unit_count: 2,
  probability_representation: 'temperature_scaled',
  safety_flags: [],
  unsupported_symptoms: [],
  clarification_required: [],
  unmatched_wording: [],
  has_unmatched_wording: false,
  score_note: scoreNote,
}

const baseResponse = {
  age: 22,
  sex: 'F',
  confirmed_codes: ['headache', 'tiredness'],
  model_features: ['E_53', 'E_89', 'head_region_pain'],
  has_red_flag: false,
  feature_count: 70,
  model_version: 'candidate_v1_research',
  health_guidance: 'Seek medical advice if symptoms persist or worsen.',
  disclaimer: 'This result is for health awareness, not diagnosis.',
  confidence_explanation: scoreNote,
}

export const acceptedCandidate = {
  ...baseResponse,
  prediction_id: 'candidate-accepted',
  status: 'prediction_complete',
  predictions: [{
    rank: 1,
    condition: 'URTI',
    display_name: 'Upper respiratory tract infection',
    model_confidence_percent: 81.23,
  }],
  assessment: {
    ...baseAssessment,
    status: 'prediction_available',
    predicted_condition: 'URTI',
    model_score: 0.8123456789,
    uncertain: false,
    uncertainty_reasons: [],
    prediction_performed: true,
    message: 'A candidate result is available.',
  },
}

export const insufficientCandidate = {
  ...baseResponse,
  prediction_id: 'candidate-insufficient',
  status: 'insufficient_information',
  predictions: [],
  assessment: {
    ...baseAssessment,
    status: 'insufficient_information',
    predicted_condition: null,
    model_score: null,
    uncertain: true,
    uncertainty_reasons: ['below_score_threshold'],
    prediction_performed: true,
    message: 'There is not enough information for a reliable result.',
  },
}

export const unsupportedCandidate = {
  ...baseResponse,
  prediction_id: 'candidate-unsupported',
  status: 'unsupported_input',
  confirmed_codes: ['fever', 'itchy_eyes'],
  model_features: ['E_91'],
  predictions: [],
  assessment: {
    ...baseAssessment,
    status: 'unsupported_input',
    predicted_condition: null,
    model_score: null,
    uncertain: true,
    uncertainty_reasons: ['unsupported_symptoms_present'],
    prediction_performed: false,
    unsupported_symptoms: ['itchy_eyes'],
    clarification_required: [{ code: 'itchy_eyes' }],
    message: 'Some confirmed symptoms need clarification.',
  },
}

export const urgentCandidate = {
  prediction_id: 'candidate-urgent',
  status: 'urgent_review',
  age: 22,
  sex: 'F',
  confirmed_codes: ['blue_lips'],
  model_features: [],
  has_red_flag: true,
  red_flag_symptoms: [{ code: 'blue_lips', display_name: 'Blue lips' }],
  predictions: [],
  health_guidance: 'Seek urgent medical assessment.',
  disclaimer: 'This is not a diagnosis.',
  assessment: {
    contract_version: 1,
    status: 'safety_review_required',
    model_version: null,
    policy_id: null,
    predicted_condition: null,
    model_score: null,
    uncertain: true,
    uncertainty_reasons: ['safety_flags_present'],
    reported_unit_count: null,
    probability_representation: null,
    prediction_performed: false,
    safety_flags: ['blue_lips'],
    unsupported_symptoms: [],
    clarification_required: [],
    unmatched_wording: [],
    has_unmatched_wording: false,
    message: 'Confirmed safety flags require review.',
    score_note: 'No model score was calculated for this safety response.',
  },
}

export const legacyHistory = {
  prediction_id: 'older-v2-session',
  status: 'prediction_complete',
  model_version: 'v2_23class_prototype',
  predictions: [{
    rank: 1,
    condition: 'Tuberculosis',
    display_name: 'Tuberculosis (TB)',
    model_confidence_percent: 16.45,
  }],
  assessment: null,
}