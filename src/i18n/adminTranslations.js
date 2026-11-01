
import { useLanguage } from '../context/useLanguage'

// English and Kiswahili interface translations.
const messages = {
  loading: [
    'Loading administrator dashboard...',
    'Inapakia dashibodi ya msimamizi...',
  ],
  loadingDescription: [
    'Retrieving prediction and feedback records.',
    'Inapokea rekodi za utabiri na maoni.',
  ],
  dataUnavailable: [
    'Administrator data unavailable',
    'Taarifa za msimamizi hazipatikani',
  ],
  accessRequired: [
    'Administrator access is required to view this information.',
    'Unahitaji ruhusa ya msimamizi kuona taarifa hizi.',
  ],
  sessionExpired: [
    'Your login session is no longer valid.',
    'Kipindi chako cha kuingia kimeisha.',
  ],
  loadingError: [
    'RespiraCare could not load the administrator dashboard.',
    'RespiraCare haikuweza kupakia dashibodi ya msimamizi.',
  ],
  eyebrow: [
    'RespiraCare administration',
    'Usimamizi wa RespiraCare',
  ],
  title: ['System activity', 'Shughuli za mfumo'],
  overview: ['overview.', 'kwa muhtasari.'],
  intro: [
    'Review saved assessments, safety-sensitive sessions and patient feedback in one place.',
    'Kagua tathmini zilizohifadhiwa, hali zinazoweza kuashiria hatari na maoni ya wagonjwa sehemu moja.',
  ],
  statistics: [
    'Administrator statistics',
    'Takwimu za msimamizi',
  ],
  savedSessions: [
    'Saved sessions',
    'Tathmini zilizohifadhiwa',
  ],
  savedSessionsNote: [
    'Records returned by the history API',
    'Rekodi zilizopokelewa kutoka kwenye API ya historia',
  ],
  nonUrgent: [
    'Non-urgent sessions',
    'Tathmini zisizo za dharura',
  ],
  nonUrgentNote: [
    'No urgent flag in these records',
    'Hakuna alama ya dharura katika rekodi hizi',
  ],
  urgentReviews: [
    'Urgent reviews',
    'Tathmini za uhakiki wa haraka',
  ],
  urgentReviewsNote: [
    'Safety-sensitive session records',
    'Rekodi za tathmini zinazoweza kuashiria hatari',
  ],
  feedbackResponses: [
    'Feedback responses',
    'Maoni yaliyopokelewa',
  ],
  noRatedFeedback: [
    'No rated feedback yet',
    'Bado hakuna maoni yenye tathmini',
  ],
  helpfulPercent: [
    '{percent}% of rated responses marked helpful',
    'Asilimia {percent} ya maoni yaliyotathminiwa yameonesha kuwa matokeo yalisaidia',
  ],
  sessionOutcomes: [
    'Session outcomes',
    'Matokeo ya tathmini',
  ],
  assessmentRoutes: [
    'Assessment routes',
    'Aina za tathmini',
  ],
  basedOnRecords: [
    'Based on the available administrator history records.',
    'Kulingana na rekodi za historia zinazopatikana kwa msimamizi.',
  ],
  noChartSessions: [
    'No sessions available to chart yet.',
    'Bado hakuna tathmini za kuonyesha kwenye chati.',
  ],
  sessionChartLabel: [
    'Chart of non-urgent and urgent-review session counts',
    'Chati ya idadi ya tathmini zisizo za dharura na za uhakiki wa haraka',
  ],
  sessions: ['sessions', 'tathmini'],
  urgent: ['Urgent', 'Dharura'],
  urgentReview: ['Urgent review', 'Uhakiki wa haraka'],
  patientResponses: [
    'Patient responses',
    'Maoni ya wagonjwa',
  ],
  feedbackOverview: [
    'Feedback overview',
    'Muhtasari wa maoni',
  ],
  feedbackChartDescription: [
    'Helpful versus not-helpful ratings in received feedback.',
    'Ulinganisho wa maoni yaliyoonyesha matokeo yalisaidia na yale ambayo hayakusaidia.',
  ],
  noChartFeedback: [
    'No rated feedback available to chart yet.',
    'Bado hakuna maoni yenye tathmini ya kuonyesha kwenye chati.',
  ],
  feedbackChartLabel: [
    'Chart of helpful and not-helpful feedback counts',
    'Chati ya maoni yaliyosaidia na ambayo hayakusaidia',
  ],
  helpful: ['Helpful', 'Yamesaidia'],
  notHelpful: ['Not helpful', 'Hayajasaidia'],
  noRating: ['No rating', 'Hakuna tathmini'],
  responses: ['Responses', 'Majibu'],
  responseCount: [
    '{helpful} helpful · {notHelpful} not helpful',
    '{helpful} yamesaidia · {notHelpful} hayajasaidia',
  ],
  recordView: [
    'Administrator record view',
    'Mwonekano wa rekodi za msimamizi',
  ],
  predictionHistory: [
    'Prediction history',
    'Historia ya utabiri',
  ],
  feedback: ['Feedback', 'Maoni'],
  allPatientSessions: [
    'All patient sessions',
    'Tathmini zote za wagonjwa',
  ],
  searchSessions: [
    'Search sessions',
    'Tafuta tathmini',
  ],
  searchSessionsPlaceholder: [
    'Symptoms, user or condition',
    'Dalili, mtumiaji au hali ya ugonjwa',
  ],
  filterSessions: [
    'Filter sessions',
    'Chuja tathmini',
  ],
  all: ['All', 'Zote'],
  nonUrgentShort: ['Non-urgent', 'Si dharura'],
  showingSessions: [
    'Showing {visible} of {total} sessions',
    'Inaonyesha tathmini {visible} kati ya {total}',
  ],
  noMatchingSessions: [
    'No matching sessions',
    'Hakuna tathmini zinazolingana',
  ],
  changeFilter: [
    'Change the filter or search to view other records.',
    'Badilisha kichujio au utafutaji kuona rekodi nyingine.',
  ],
  dateUnavailable: [
    'Date unavailable',
    'Tarehe haipatikani',
  ],
  urgentSession: [
    'Urgent-review session',
    'Tathmini ya uhakiki wa haraka',
  ],
  predictionSession: [
    'Prediction session',
    'Tathmini ya utabiri',
  ],
  predictionComplete: [
    'Prediction complete',
    'Utabiri umekamilika',
  ],
  statusUnavailable: [
    'Status unavailable',
    'Hali haipatikani',
  ],
  patientUserId: [
    'Patient user ID',
    'Nambari ya mtumiaji wa mgonjwa',
  ],
  legacySession: [
    'Legacy / unassigned session',
    'Tathmini ya zamani / haijahusishwa na mtumiaji',
  ],
  originalDescription: [
    'Original description',
    'Maelezo ya awali',
  ],
  originalSymptomDescription: [
    'Original symptom description',
    'Maelezo ya awali ya dalili',
  ],
  noDescription: [
    'No description saved',
    'Hakuna maelezo yaliyohifadhiwa',
  ],
  age: ['Age', 'Umri'],
  sex: ['Sex', 'Jinsi'],
  male: ['Male', 'Mwanaume'],
  female: ['Female', 'Mwanamke'],
  notRecorded: [
    'Not recorded',
    'Haijarekodiwa',
  ],
  confirmedSymptoms: [
    'Confirmed symptoms',
    'Dalili zilizothibitishwa',
  ],
  viewSession: [
    'View session',
    'Angalia tathmini',
  ],
  feedbackTitle: [
    'Prediction feedback',
    'Maoni kuhusu utabiri',
  ],
  searchFeedback: [
    'Search feedback',
    'Tafuta maoni',
  ],
  feedbackPlaceholder: [
    'Comment or session ID',
    'Maoni au nambari ya tathmini',
  ],
  showingFeedback: [
    'Showing {visible} of {total} responses',
    'Inaonyesha maoni {visible} kati ya {total}',
  ],
  noMatchingFeedback: [
    'No matching feedback',
    'Hakuna maoni yanayolingana',
  ],
  noFeedbackDescription: [
    'Feedback will appear here when patients submit a response.',
    'Maoni yataonekana hapa wagonjwa watakapoyawasilisha.',
  ],
  patientFeedback: [
    'Patient feedback',
    'Maoni ya mgonjwa',
  ],
  unavailable: [
    'Unavailable',
    'Haipatikani',
  ],
  comment: ['Comment', 'Maoni'],
  noComment: [
    'No additional comment was provided.',
    'Hakuna maoni ya ziada yaliyotolewa.',
  ],
  feedbackId: [
    'Feedback ID',
    'Nambari ya maoni',
  ],
  openPrediction: [
    'Open prediction',
    'Fungua utabiri',
  ],
  adminOnly: [
    'Administrator access only',
    'Kwa wasimamizi walioidhinishwa pekee',
  ],
  privacyNote: [
    'These records contain patient assessment information and must remain accessible only to authorised administrators. Dashboard counts reflect records returned by the current endpoints.',
    'Rekodi hizi zina taarifa za tathmini za wagonjwa na zinapaswa kupatikana kwa wasimamizi walioidhinishwa pekee. Takwimu za dashibodi zinatokana na rekodi zilizopokelewa kupitia API.',
  ],

  // Administrator history details
  loadingDetail: [
    'Loading prediction session...',
    'Inapakia tathmini ya utabiri...',
  ],
  predictionUnavailable: [
    'Prediction unavailable',
    'Utabiri haupatikani',
  ],
  notFound: [
    'This prediction session could not be found.',
    'Tathmini hii ya utabiri haikupatikana.',
  ],
  detailAccessRequired: [
    'Administrator access is required.',
    'Ruhusa ya msimamizi inahitajika.',
  ],
  detailError: [
    'RespiraCare could not load this prediction session.',
    'RespiraCare haikuweza kupakia tathmini hii ya utabiri.',
  ],
  backToAdmin: [
    'Back to administrator dashboard',
    'Rudi kwenye dashibodi ya msimamizi',
  ],
  backToAdminShort: [
    'Back to admin',
    'Rudi kwa msimamizi',
  ],
  adminHistory: [
    'Administrator history',
    'Historia ya msimamizi',
  ],
  originalAssessment: [
    'Original assessment',
    'Tathmini ya awali',
  ],
  submittedInformation: [
    'What the patient submitted',
    'Taarifa alizowasilisha mgonjwa',
  ],
  date: ['Date', 'Tarehe'],
  confirmedCodes: [
    'Confirmed symptom codes',
    'Misimbo ya dalili zilizothibitishwa',
  ],
  noStoredCodes: [
    'No confirmed symptoms were stored.',
    'Hakuna dalili zilizothibitishwa zilizohifadhiwa.',
  ],
  urgentConfirmed: [
    'Safety-sensitive symptom confirmed',
    'Dalili inayoweza kuashiria hatari imethibitishwa',
  ],
  modelBypassed: [
    'The prediction model was bypassed because a safety-sensitive symptom was confirmed.',
    'Modeli ya utabiri haikutumika kwa sababu dalili inayoweza kuashiria hatari ilithibitishwa.',
  ],
  noUrgentPrediction: [
    'No automated disease prediction is displayed for this session.',
    'Hakuna utabiri wa ugonjwa wa kiotomatiki unaoonyeshwa kwa tathmini hii.',
  ],
  storedPrediction: [
    'Stored prediction',
    'Utabiri uliohifadhiwa',
  ],
  savedCondition: [
    'Saved condition pattern',
    'Muundo wa ugonjwa uliohifadhiwa',
  ],
  oneConditionNote: [
    'Only one saved condition is displayed. This is a model result, not a medical diagnosis.',
    'Hali moja tu ya ugonjwa iliyohifadhiwa inaonyeshwa. Haya ni matokeo ya modeli, si utambuzi wa kitabibu.',
  ],
  conditionPattern: [
    'Condition pattern',
    'Muundo wa ugonjwa',
  ],
  modelConfidence: [
    'model confidence',
    'alama ya uhakika wa modeli',
  ],
  confidenceWarning: [
    'Model confidence is not the probability that the patient has this condition.',
    'Alama ya uhakika wa modeli si uwezekano wa kitabibu kwamba mgonjwa ana ugonjwa huu.',
  ],
  noStoredPrediction: [
    'No condition prediction was stored for this session.',
    'Hakuna utabiri wa ugonjwa uliohifadhiwa kwa tathmini hii.',
  ],
  aboutConfidence: [
    'About model confidence',
    'Kuhusu alama ya uhakika wa modeli',
  ],
  uncertainty: [
    'Uncertainty information',
    'Taarifa kuhusu kutokuwa na uhakika',
  ],
  unsupportedFeatures: [
    'Unsupported model features',
    'Vipengele visivyotumika kwenye modeli',
  ],
  excludedFeatures: [
    '{count} confirmed symptom detail(s) were excluded from the model calculation.',
    'Taarifa {count} za dalili zilizothibitishwa hazikutumika katika hesabu za modeli.',
  ],
  healthGuidance: [
    'Health guidance',
    'Mwongozo wa afya',
  ],
  sessionReference: [
    'Session reference',
    'Kumbukumbu ya tathmini',
  ],
  historicalDisclaimer: [
    'These historical results are for health awareness and are not medical diagnoses.',
    'Matokeo haya ya awali ni kwa ajili ya uelewa wa afya na si utambuzi wa kitabibu.',
  ],
}

export function useAdminText() {
  const { language } = useLanguage()

  return (key, values = {}) => {
    const pair = messages[key]
    const template = pair?.[language === 'sw' ? 1 : 0] ?? key

    return template.replace(/\{(\w+)\}/g, (_, name) =>
      String(values[name] ?? `{${name}}`)
    )
  }
}
