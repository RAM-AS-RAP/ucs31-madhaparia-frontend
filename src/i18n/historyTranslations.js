
import { useLanguage } from '../context/useLanguage'

const messages = {
  en: {
    // Shared
    dateUnavailable: 'Date unavailable',
    notRecorded: 'Not recorded',
    male: 'Male',
    female: 'Female',
    statusUnavailable: 'Status unavailable',
    urgentReview: 'Urgent review',
    predictionComplete: 'Prediction complete',
    returnDashboard: 'Return to dashboard',
    sessionReference: 'Session reference',
    originalDescription: 'Original symptom description',
    noDescription: 'No description saved',
    age: 'Age',
    sex: 'Sex',
    confirmedSymptoms: 'Confirmed symptoms',
    confidence: 'model confidence',
    awarenessOnly: 'Health-awareness information only',
    originalText: 'Original symptom descriptions are shown as entered.',

    // History listing
    historyEyebrow: 'Patient history',
    historyTitle1: 'Your previous',
    historyTitle2: 'health-awareness sessions.',
    historyIntro:
      'Review the symptom descriptions, saved results and safety guidance from your previous assessments.',
    newCheck: 'New symptom check',
    loading: 'Loading your history...',
    loadingDescription:
      'Retrieving your saved assessment sessions.',
    loadingError: 'History could not be loaded',
    sessionExpired:
      'Your login session is no longer valid. Please log in again.',
    genericError:
      'RespiraCare could not load your prediction history.',
    zeroSessions: '0 sessions',
    emptyTitle: 'No prediction history yet',
    emptyDescription:
      'Your completed assessments will appear here once saved.',
    checkSymptoms: 'Check symptoms',
    overview: 'History overview',
    savedSessions: 'Saved sessions',
    urgentReviews: 'Urgent reviews',
    newestFirst: 'Most recent sessions first',
    filterHistory: 'Filter history',
    allSessions: 'All sessions',
    predictions: 'Predictions',
    searchHistory: 'Search history',
    searchPlaceholder: 'Search symptoms or conditions',
    showing: 'Showing {visible} of {total} saved sessions',
    noMatches: 'No matching sessions',
    noMatchesDescription:
      'Try a different search or change the selected filter.',
    clearFilters: 'Clear filters',
    urgentSession: 'Urgent-review session',
    predictionSession: 'Prediction session',
    safetyAssessment: 'Safety-sensitive assessment',
    safetyDescription:
      'This session followed the urgent-review route rather than automated disease prediction.',
    savedCondition: 'Saved condition pattern',
    viewDetails: 'View details',
    bottomDescription:
      'Historical model results are not medical diagnoses and cannot confirm or rule out an illness.',

    // History detail
    detailsAria: 'Patient history details',
    loadingDetails: 'Loading prediction details...',
    retrievingDetails: 'Retrieving the saved assessment session.',
    unavailable: 'Prediction unavailable',
    notFound: 'This prediction session could not be found.',
    sessionInvalid: 'Your login session is no longer valid.',
    detailsError:
      'RespiraCare could not load this prediction session.',
    backHistory: 'Back to patient history',
    savedAssessment: 'Saved assessment',
    sessionDetails: 'Session details',
    originalAssessment: 'Original assessment',
    whatSubmitted: 'What you submitted',
    date: 'Date',
    confirmedCodes: 'Confirmed symptom codes',
    recorded: '{count} recorded',
    noCodes: 'No confirmed symptom codes were saved.',
    urgentSessionLabel: 'Urgent-review session',
    urgentTitle: 'A safety-sensitive symptom was confirmed.',
    urgentExplanation:
      'This session followed the urgent-review route because a safety-sensitive symptom was confirmed. The prediction model was bypassed.',
    urgentAdvice:
      'Seek prompt professional medical assessment if you are experiencing severe or worsening symptoms.',
    savedResult: 'Saved result',
    resultNote:
      'The condition shown is the saved model result, not a diagnosis.',
    conditionPattern: 'Condition pattern',
    confidenceWarning:
      'A model score, not the probability that you have this condition.',
    noStoredPrediction:
      'No condition prediction was stored for this session.',
    aboutConfidence: 'About model confidence',
    uncertaintyTitle: 'Important information about this result',
    unsupportedLabel: 'Unsupported symptom information',
    unsupportedTitle: 'Some symptom details were not used',
    unsupportedDescription:
      '{count} confirmed symptom detail(s) were excluded from the model calculation. This does not mean those symptoms were absent.',
    healthGuidance: 'Health guidance',
    nextSteps: 'What to do next',
    importantDisclaimer:
      'Important: health-awareness information only',
    historicalDisclaimer:
      'Historical results are not medical diagnoses and should not replace professional medical assessment.',
  },

  sw: {
    // Shared
    dateUnavailable: 'Tarehe haipatikani',
    notRecorded: 'Haijarekodiwa',
    male: 'Mwanaume',
    female: 'Mwanamke',
    statusUnavailable: 'Hali haipatikani',
    urgentReview: 'Uhakiki wa haraka',
    predictionComplete: 'Utabiri umekamilika',
    returnDashboard: 'Rudi kwenye dashibodi',
    sessionReference: 'Kumbukumbu ya tathmini',
    originalDescription: 'Maelezo ya awali ya dalili',
    noDescription: 'Hakuna maelezo yaliyohifadhiwa',
    age: 'Umri',
    sex: 'Jinsi',
    confirmedSymptoms: 'Dalili zilizothibitishwa',
    confidence: 'alama ya uhakika wa modeli',
    awarenessOnly: 'Taarifa za uelewa wa afya pekee',
    originalText: 'Maelezo ya awali ya dalili yanaonyeshwa kama yalivyoandikwa.',

    // History listing
    historyEyebrow: 'Historia ya mgonjwa',
    historyTitle1: 'Tathmini zako za awali',
    historyTitle2: 'za uelewa wa afya.',
    historyIntro:
      'Angalia maelezo ya dalili, matokeo yaliyohifadhiwa na mwongozo wa usalama kutoka kwenye tathmini zako za awali.',
    newCheck: 'Tathmini mpya ya dalili',
    loading: 'Inapakia historia yako...',
    loadingDescription:
      'Inapokea rekodi za tathmini zako zilizohifadhiwa.',
    loadingError: 'Historia haikuweza kupakiwa',
    sessionExpired:
      'Kipindi chako cha kuingia kimeisha. Tafadhali ingia tena.',
    genericError:
      'RespiraCare haikuweza kupakia historia yako ya utabiri.',
    zeroSessions: 'Tathmini 0',
    emptyTitle: 'Bado hakuna historia ya utabiri',
    emptyDescription:
      'Tathmini zako zilizokamilika zitaonekana hapa baada ya kuhifadhiwa.',
    checkSymptoms: 'Tathmini dalili',
    overview: 'Muhtasari wa historia',
    savedSessions: 'Tathmini zilizohifadhiwa',
    urgentReviews: 'Tathmini za haraka',
    newestFirst: 'Tathmini za hivi karibuni kwanza',
    filterHistory: 'Chuja historia',
    allSessions: 'Tathmini zote',
    predictions: 'Utabiri',
    searchHistory: 'Tafuta katika historia',
    searchPlaceholder: 'Tafuta dalili au hali za ugonjwa',
    showing:
      'Inaonyesha tathmini {visible} kati ya {total} zilizohifadhiwa',
    noMatches: 'Hakuna tathmini zinazolingana',
    noMatchesDescription:
      'Jaribu kutafuta kwa maneno tofauti au ubadilishe kichujio.',
    clearFilters: 'Ondoa vichujio',
    urgentSession: 'Tathmini inayohitaji uhakiki wa haraka',
    predictionSession: 'Tathmini ya utabiri',
    safetyAssessment: 'Tathmini inayoweza kuashiria hatari',
    safetyDescription:
      'Tathmini hii ilifuata utaratibu wa uhakiki wa haraka badala ya utabiri wa ugonjwa wa kiotomatiki.',
    savedCondition: 'Hali ya ugonjwa iliyohifadhiwa',
    viewDetails: 'Angalia maelezo',
    bottomDescription:
      'Matokeo ya awali ya modeli si utambuzi wa kitabibu na hayawezi kuthibitisha au kuondoa uwezekano wa ugonjwa.',

    // History detail
    detailsAria: 'Maelezo ya historia ya mgonjwa',
    loadingDetails: 'Inapakia maelezo ya utabiri...',
    retrievingDetails:
      'Inapokea taarifa za tathmini iliyohifadhiwa.',
    unavailable: 'Utabiri haupatikani',
    notFound: 'Tathmini hii ya utabiri haikupatikana.',
    sessionInvalid: 'Kipindi chako cha kuingia kimeisha.',
    detailsError:
      'RespiraCare haikuweza kupakia tathmini hii.',
    backHistory: 'Rudi kwenye historia ya mgonjwa',
    savedAssessment: 'Tathmini iliyohifadhiwa',
    sessionDetails: 'Maelezo ya tathmini',
    originalAssessment: 'Tathmini ya awali',
    whatSubmitted: 'Taarifa ulizowasilisha',
    date: 'Tarehe',
    confirmedCodes: 'Misimbo ya dalili zilizothibitishwa',
    recorded: '{count} zimerekodiwa',
    noCodes:
      'Hakuna misimbo ya dalili zilizothibitishwa iliyohifadhiwa.',
    urgentSessionLabel: 'Tathmini ya uhakiki wa haraka',
    urgentTitle:
      'Dalili inayoweza kuashiria hatari ilithibitishwa.',
    urgentExplanation:
      'Tathmini hii ilifuata utaratibu wa uhakiki wa haraka kwa sababu dalili inayoweza kuashiria hatari ilithibitishwa. Modeli ya utabiri wa ugonjwa haikutumika.',
    urgentAdvice:
      'Tafuta huduma ya kitaalamu ya afya haraka ikiwa una dalili kali au zinazozidi kuwa mbaya.',
    savedResult: 'Matokeo yaliyohifadhiwa',
    resultNote:
      'Hali inayoonyeshwa ni matokeo yaliyohifadhiwa na modeli, si utambuzi wa kitabibu.',
    conditionPattern: 'Muundo wa ugonjwa',
    confidenceWarning:
      'Hii ni alama ya modeli, si uwezekano wa kitabibu kwamba una ugonjwa huu.',
    noStoredPrediction:
      'Hakuna utabiri wa ugonjwa uliohifadhiwa kwa tathmini hii.',
    aboutConfidence: 'Kuhusu alama ya uhakika wa modeli',
    uncertaintyTitle:
      'Taarifa muhimu kuhusu matokeo haya',
    unsupportedLabel: 'Taarifa za dalili ambazo hazikutumika',
    unsupportedTitle:
      'Baadhi ya taarifa za dalili hazikutumika',
    unsupportedDescription:
      'Taarifa {count} za dalili zilizothibitishwa hazikutumika katika hesabu za modeli. Hii haimaanishi kwamba dalili hizo hazikuwepo.',
    healthGuidance: 'Mwongozo wa afya',
    nextSteps: 'Hatua zinazofuata',
    importantDisclaimer:
      'Muhimu: taarifa za uelewa wa afya pekee',
    historicalDisclaimer:
      'Matokeo ya awali si utambuzi wa kitabibu na hayapaswi kuchukua nafasi ya tathmini ya mtaalamu wa afya.',
  },
}

export function useHistoryText() {
  const { language } = useLanguage()

  return (key, values = {}) => {
    const template =
      messages[language]?.[key] ??
      messages.en[key] ??
      key

    return template.replace(/\{(\w+)\}/g, (_, name) =>
      String(values[name] ?? `{${name}}`)
    )
  }
}
