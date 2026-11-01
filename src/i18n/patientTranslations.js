
import { useLanguage } from '../context/useLanguage'

// Each entry contains [English, Kiswahili].
const patientMessages = {
  // Shared
  'common.english': ['English', 'Kiingereza'],
  'common.swahili': ['Kiswahili', 'Kiswahili'],
  'common.both': ['English + Kiswahili', 'Kiingereza + Kiswahili'],
  'common.unavailable': ['Unavailable', 'Haipatikani'],
  'common.unspecified': ['Unspecified', 'Haijabainishwa'],
  'common.returnDashboard': [
    'Return to dashboard',
    'Rudi kwenye dashibodi',
  ],
  'common.safetyTitle': [
    'Health-awareness information only',
    'Taarifa za uelewa wa afya pekee',
  ],

  // Patient dashboard
  'dashboard.eyebrow': ['Patient dashboard', 'Dashibodi ya mgonjwa'],
  'dashboard.welcome': ['Welcome back.', 'Karibu tena.'],
  'dashboard.question': [
    'What would you like to do today?',
    'Ungependa kufanya nini leo?',
  ],
  'dashboard.intro': [
    'Start a new symptom check or look back at your previous sessions. Everything you need is right here.',
    'Anza tathmini mpya ya dalili au angalia tathmini zako za awali. Kila unachohitaji kipo hapa.',
  ],
  'dashboard.signedIn': ['Signed in as', 'Umeingia kama'],
  'dashboard.emailUnavailable': [
    'Email unavailable',
    'Barua pepe haipatikani',
  ],
  'dashboard.accountRole': ['Account role: {role}', 'Jukumu la akaunti: {role}'],
  'dashboard.patient': ['patient', 'mgonjwa'],
  'dashboard.admin': ['admin', 'msimamizi'],
  'dashboard.startLabel': [
    '01 / START A NEW CHECK',
    '01 / ANZA TATHMINI MPYA',
  ],
  'dashboard.checkTitle': [
    'Check your symptoms',
    'Tathmini dalili zako',
  ],
  'dashboard.checkDescription': [
    "Describe how you're feeling in English, Kiswahili, or a mix of both. Review the symptoms the system recognises before receiving health-awareness guidance and, where appropriate, a preliminary prediction.",
    'Eleza jinsi unavyojisikia kwa Kiingereza, Kiswahili au mchanganyiko wa lugha zote mbili. Hakiki dalili zinazotambuliwa na mfumo kabla ya kupokea mwongozo wa afya na, inapofaa, utabiri wa awali.',
  ],
  'dashboard.checkButton': [
    'Check symptoms',
    'Tathmini dalili',
  ],
  'dashboard.reviewFirst': [
    'Review symptoms before continuing',
    'Hakiki dalili kabla ya kuendelea',
  ],
  'dashboard.historyLabel': [
    '02 / YOUR RECORDS',
    '02 / REKODI ZAKO',
  ],
  'dashboard.historyTitle': [
    'Pick up where you left off.',
    'Endelea ulipoishia.',
  ],
  'dashboard.historyDescription': [
    'Your previous symptom checks are saved to your account. Return to earlier sessions to review the recorded results and health-awareness guidance.',
    'Tathmini zako za awali zimehifadhiwa kwenye akaunti yako. Unaweza kuangalia matokeo na mwongozo wa afya uliopokea hapo awali.',
  ],
  'dashboard.historyButton': [
    'View prediction history',
    'Angalia historia ya utabiri',
  ],
  'dashboard.how': ['How it works', 'Jinsi inavyofanya kazi'],
  'dashboard.stepsTitle': [
    'Three simple steps.',
    'Hatua tatu rahisi.',
  ],
  'dashboard.stepsIntro': [
    "You'll have a chance to review your information before proceeding.",
    'Utapata nafasi ya kuhakiki taarifa zako kabla ya kuendelea.',
  ],
  'dashboard.step1Title': [
    'Describe your symptoms',
    'Eleza dalili zako',
  ],
  'dashboard.step1Description': [
    "Tell the system how you're feeling using supported language input.",
    'Eleza jinsi unavyojisikia kwa lugha zinazotumika kwenye mfumo.',
  ],
  'dashboard.step2Title': [
    'Review what was recognised',
    'Hakiki dalili zilizotambuliwa',
  ],
  'dashboard.step2Description': [
    'Check and confirm the symptoms identified from your description.',
    'Kagua na uthibitishe dalili zilizotambuliwa kutokana na maelezo yako.',
  ],
  'dashboard.step3Title': [
    'Receive health-awareness guidance',
    'Pokea mwongozo wa afya',
  ],
  'dashboard.step3Description': [
    'View appropriate guidance. Cases requiring urgent attention are handled separately from prediction.',
    'Pokea mwongozo unaofaa. Dalili zinazohitaji huduma ya haraka hushughulikiwa bila kufanya utabiri wa ugonjwa.',
  ],
  'dashboard.safetyLabel': [
    'Important health information',
    'Taarifa muhimu za afya',
  ],
  'dashboard.safetyTitle': [
    'Important to know',
    'Muhimu kufahamu',
  ],
  'dashboard.safetyDescription': [
    'RespiraCare is for health awareness, not medical diagnosis. Predictions are preliminary and should not replace professional medical advice. Seek prompt medical attention for severe or rapidly worsening symptoms.',
    'RespiraCare ni kwa ajili ya uelewa wa afya, si utambuzi wa kitabibu. Utabiri wake ni wa awali na haupaswi kuchukua nafasi ya ushauri wa daktari. Tafuta huduma ya matibabu haraka ikiwa una dalili kali au zinazozidi kuwa mbaya.',
  ],

  // Symptom input
  'input.eyebrow': ['Symptom awareness', 'Uelewa wa dalili'],
  'input.title1': [
    "Tell us how you're feeling.",
    'Tuambie jinsi unavyojisikia.',
  ],
  'input.title2': [
    'Use your own words.',
    'Tumia maneno yako mwenyewe.',
  ],
  'input.intro': [
    "Describe your symptoms naturally in English, Kiswahili, or a mix of both. We'll show you what RespiraCare recognises before you confirm anything.",
    'Eleza dalili zako kwa Kiingereza, Kiswahili au mchanganyiko wa lugha zote mbili. Tutakuonyesha dalili zinazotambuliwa na RespiraCare kabla hujazithibitisha.',
  ],
  'input.step': ['Step 1 of 3', 'Hatua ya 1 kati ya 3'],
  'input.stepLabel': ['Describe symptoms', 'Eleza dalili'],
  'input.progress': ['Assessment progress', 'Maendeleo ya tathmini'],
  'input.yourDescription': ['Your description', 'Maelezo yako'],
  'input.describe': ['Describe your symptoms', 'Eleza dalili zako'],
  'input.fieldLabel': ['Symptom description', 'Maelezo ya dalili'],
  'input.fieldHelp': [
    "Include the symptoms you're experiencing. You don't need to use medical terms.",
    'Eleza dalili unazopata. Si lazima kutumia maneno ya kitabibu.',
  ],
  'input.placeholder': [
    'For example: I have fever na kikohozi and I feel tired...',
    'Kwa mfano: Nina homa na kikohozi na ninahisi uchovu...',
  ],
  'input.characters': ['{count} / 1000 characters', 'Herufi {count} / 1000'],
  'input.writeNaturally': [
    'Write naturally, in either language.',
    'Andika kwa lugha yoyote kati ya hizi mbili.',
  ],
  'input.clear': ['Clear description', 'Futa maelezo'],
  'input.loading': [
    'Analysing symptoms...',
    'Inachanganua dalili...',
  ],
  'input.analyse': ['Analyse symptoms', 'Changanua dalili'],
  'input.analyseAgain': ['Analyse again', 'Changanua tena'],
  'input.examples': ['Need an example?', 'Unahitaji mfano?'],
  'input.exampleHelp': [
    'Select an example below to fill in the description. You can edit it before analysing.',
    'Chagua mfano hapa chini ili kujaza maelezo. Unaweza kuubadilisha kabla ya kuchanganua.',
  ],
  'input.mixedExample': [
    'English + Kiswahili',
    'Kiingereza + Kiswahili',
  ],
  'input.misspelled': [
    'Misspelled symptoms',
    'Dalili zenye makosa ya tahajia',
  ],
  'input.unmatchedExample': [
    'Unmatched wording',
    'Maneno yasiyotambuliwa',
  ],
  'input.writingGuidance': [
    'Writing guidance',
    'Mwongozo wa kuandika',
  ],
  'input.speakNaturally': [
    'Speak naturally.',
    'Eleza kwa lugha ya kawaida.',
  ],
  'input.helpIntro': [
    'A short description in everyday language is enough to get started.',
    'Maelezo mafupi kwa lugha ya kawaida yanatosha kuanza.',
  ],
  'input.mixedLanguage': [
    'Mixed language',
    'Lugha mchanganyiko',
  ],
  'input.fuzzyNote': [
    'The NLP system can recognise some spelling mistakes using fuzzy matching. You will still review the recognised symptoms yourself.',
    'Mfumo wa NLP unaweza kutambua baadhi ya makosa ya tahajia kwa kutumia ulinganishaji wa maneno yanayofanana. Bado utahakiki dalili zilizotambuliwa mwenyewe.',
  ],
  'input.complete': [
    'Analysis complete',
    'Uchanganuzi umekamilika',
  ],
  'input.recognisedTitle': [
    "Here's what we recognised.",
    'Hizi ndizo dalili tulizotambua.',
  ],
  'input.recognisedDescription': [
    'Review the results below. You can choose which symptoms are correct in the next step.',
    'Hakiki matokeo hapa chini. Utachagua dalili zilizo sahihi katika hatua inayofuata.',
  ],
  'input.recognised': ['recognised', 'zimetambuliwa'],
  'input.warningTitle': [
    'Safety-sensitive wording detected',
    'Maneno yanayoashiria hatari yametambuliwa',
  ],
  'input.warningDescription': [
    'A recognised phrase may indicate a potentially urgent symptom. If you are experiencing severe symptoms or breathing difficulty, seek medical attention promptly rather than waiting for this assessment.',
    'Maneno yaliyotambuliwa yanaweza kuashiria dalili inayohitaji huduma ya haraka. Ikiwa una dalili kali au shida ya kupumua, tafuta matibabu haraka badala ya kusubiri tathmini hii.',
  ],
  'input.sensitive': [
    'Safety-sensitive',
    'Inaashiria hatari',
  ],
  'input.recognisedFrom': [
    'Recognised from',
    'Imetambuliwa kutoka',
  ],
  'input.fuzzyMatch': [
    'Fuzzy match',
    'Ulinganishaji wa karibu',
  ],
  'input.exactMatch': [
    'Exact match',
    'Ulinganishaji kamili',
  ],
  'input.matchScore': [
    '{score}% match score',
    'Alama ya ulinganishaji: {score}%',
  ],
  'input.emptyTitle': [
    'No supported symptoms were recognised',
    'Hakuna dalili zinazotumika kwenye mfumo zilizotambuliwa',
  ],
  'input.emptyDescription': [
    'Try using different wording or review the unmatched phrases below.',
    'Jaribu kutumia maneno tofauti au kagua maneno ambayo hayakutambuliwa hapa chini.',
  ],
  'input.needsReview': ['Needs review', 'Inahitaji uhakiki'],
  'input.unmatchedTitle': [
    'Unmatched wording',
    'Maneno yasiyotambuliwa',
  ],
  'input.unmatchedDescription': [
    'These phrases were not automatically accepted as recognised symptoms. Suggestions are shown for reference only.',
    'Maneno haya hayakukubaliwa kiotomatiki kama dalili zilizotambuliwa. Mapendekezo yanaonyeshwa kwa marejeleo pekee.',
  ],
  'input.noSuggestion': [
    'No close supported suggestion was found.',
    'Hakuna pendekezo linalofanana kwa karibu lililopatikana.',
  ],
  'input.next': ['Next step', 'Hatua inayofuata'],
  'input.confirmTitle': [
    'Review and confirm your symptoms',
    'Hakiki na uthibitishe dalili zako',
  ],
  'input.confirmDescription': [
    'Select only the recognised symptoms that correctly describe how you feel.',
    'Chagua dalili zilizotambuliwa ambazo zinaeleza kwa usahihi jinsi unavyojisikia.',
  ],
  'input.continue': [
    'Continue to confirmation',
    'Endelea kuthibitisha',
  ],
  'input.safetyDescription': [
    'Symptom recognition is not a medical diagnosis or a substitute for professional medical care.',
    'Utambuzi wa dalili si utambuzi wa ugonjwa wala mbadala wa huduma ya kitaalamu ya afya.',
  ],
  'input.errorEmpty': [
    'Please describe at least one symptom before continuing.',
    'Tafadhali eleza angalau dalili moja kabla ya kuendelea.',
  ],
  'input.errorValidation': [
    'Please check your symptom description and try again.',
    'Tafadhali hakiki maelezo ya dalili zako na ujaribu tena.',
  ],
  'input.errorGeneric': [
    'Your symptoms could not be analysed. Please try again.',
    'Dalili zako hazikuweza kuchanganuliwa. Tafadhali jaribu tena.',
  ],
}

export function usePatientText() {
  const { language } = useLanguage()

  return (key, values = {}) => {
    const pair = patientMessages[key]
    const template = pair?.[language === 'sw' ? 1 : 0] ?? key

    return template.replace(/\{(\w+)\}/g, (_, name) =>
      String(values[name] ?? `{${name}}`)
    )
  }
}
