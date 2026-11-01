
import { useLanguage } from '../context/useLanguage'

const messages = {
  en: {
    // Home page
    'home.visualTitle': 'From your words to recognised symptoms',
    'home.visualDescription':
      'An example showing a mixed English and Kiswahili symptom description, followed by Fever, Cough and Fatigue ready for review.',
    'home.symptomUnderstanding': 'Symptom understanding',
    'home.yourWords': 'YOUR WORDS',
    'home.recognisedReview': 'RECOGNISED FOR REVIEW',
    'home.fever': 'Fever',
    'home.cough': 'Cough',
    'home.fatigue': 'Fatigue',
    'home.mobileReview': 'Review these symptoms before continuing.',
    'home.visualCaption':
      'Illustrated example of symptom recognition — not a medical result.',
    'home.eyebrow': 'Clearer health awareness, one step at a time',
    'home.title1': 'Describe how you feel.',
    'home.title2': 'Understand what comes next.',
    'home.intro':
      'Share your respiratory symptoms in English, Kiswahili, or a mix of both. Review what the system understands before receiving health-awareness guidance and, when appropriate, one preliminary condition prediction.',
    'home.start': 'Get started',
    'home.seeHow': 'See how it works',
    'home.features': 'Supported features',
    'home.languages': 'English + Kiswahili',
    'home.reviewFirst': 'Review symptoms first',
    'home.onePrediction': 'One prediction at a time',
    'home.how': 'How it works',
    'home.processTitle':
      'A straightforward process, built around your words.',
    'home.processIntro':
      'You stay involved throughout. The system helps organise your symptoms; it does not replace a healthcare professional.',
    'home.step1': "Tell us what you're feeling",
    'home.step1Text':
      'Describe your symptoms naturally, including English and Kiswahili in the same sentence.',
    'home.step2': 'Check the recognised symptoms',
    'home.step2Text':
      'Review the terms the system recognised and confirm them before continuing.',
    'home.step3': 'Read your awareness guidance',
    'home.step3Text':
      'For non-urgent cases, see one predicted condition and its confidence information. Urgent signs lead to safety guidance instead.',
    'home.important': 'An important note',
    'home.safetyTitle': 'Awareness is not a diagnosis.',
    'home.safety1':
      'RespiraCare is an educational health-awareness tool. A predicted condition is a preliminary indication, not a confirmed diagnosis or a substitute for clinical assessment.',
    'home.safety2':
      'If your symptoms are severe, rapidly worsening, or you need urgent help, seek medical attention promptly rather than relying on a prediction.',

    // Prediction feedback
    'feedback.received': 'Feedback received',
    'feedback.thanks':
      'Thank you for helping us improve RespiraCare.',
    'feedback.saved':
      'Your feedback has been saved for this prediction session.',
    'feedback.duplicate': 'Feedback already received',
    'feedback.duplicateTitle':
      'This session already has feedback.',
    'feedback.duplicateText':
      'RespiraCare only accepts one feedback submission for each prediction session.',
    'feedback.eyebrow': 'Your feedback',
    'feedback.question':
      'Was this health-awareness result helpful?',
    'feedback.intro':
      'Your response helps evaluate and improve the RespiraCare experience.',
    'feedback.yes': 'Yes',
    'feedback.no': 'No',
    'feedback.helpful': 'This was helpful',
    'feedback.notHelpful': 'This was not helpful',
    'feedback.comment': 'Additional comment',
    'feedback.optional': 'Optional',
    'feedback.placeholder':
      'Tell us what was useful or what could be improved...',
    'feedback.privacy':
      'Do not include confidential or sensitive personal information in your comment.',
    'feedback.submitting': 'Submitting feedback...',
    'feedback.submit': 'Submit feedback',
    'feedback.errorChoice':
      'Please tell us whether this result was helpful.',
    'feedback.errorLength':
      'Feedback comments cannot exceed 1000 characters.',
    'feedback.errorValidation':
      'Please check your feedback and try again.',
    'feedback.errorGeneric':
      'Your feedback could not be submitted. Please try again.',

    // Route guards
    'route.checkSession': 'Checking your RespiraCare session...',
    'route.checkAdmin': 'Checking administrator access...',
    'route.retry': 'Try again',

    // Access denied
    'denied.label': 'Access restricted',
    'denied.title': 'Administrator access required.',
    'denied.message':
      'Your RespiraCare account does not have permission to access this area.',
    'denied.dashboard': 'Return to dashboard',

    // 404
    'notFound.title': 'Page not found',
    'notFound.message':
      'The page you are looking for does not exist.',
    'notFound.home': 'Return home',
  },

  sw: {
    // Home page
    'home.visualTitle':
      'Kutoka kwenye maelezo yako hadi dalili zilizotambuliwa',
    'home.visualDescription':
      'Mfano wa maelezo ya dalili kwa Kiingereza na Kiswahili, ukifuatiwa na dalili za homa, kikohozi na uchovu kwa ajili ya uhakiki.',
    'home.symptomUnderstanding': 'Uelewa wa dalili',
    'home.yourWords': 'MANENO YAKO',
    'home.recognisedReview': 'DALILI ZA KUHAKIKI',
    'home.fever': 'Homa',
    'home.cough': 'Kikohozi',
    'home.fatigue': 'Uchovu',
    'home.mobileReview':
      'Hakiki dalili hizi kabla ya kuendelea.',
    'home.visualCaption':
      'Mfano wa utambuzi wa dalili — si matokeo ya kitabibu.',
    'home.eyebrow':
      'Uelewa bora wa afya, hatua kwa hatua',
    'home.title1': 'Eleza jinsi unavyojisikia.',
    'home.title2': 'Elewa hatua zinazofuata.',
    'home.intro':
      'Eleza dalili zako za mfumo wa upumuaji kwa Kiingereza, Kiswahili au mchanganyiko wa lugha zote mbili. Hakiki dalili zinazotambuliwa na mfumo kabla ya kupokea mwongozo wa afya na, inapofaa, utabiri mmoja wa awali wa hali ya ugonjwa.',
    'home.start': 'Anza sasa',
    'home.seeHow': 'Angalia jinsi inavyofanya kazi',
    'home.features': 'Vipengele vinavyopatikana',
    'home.languages': 'Kiingereza + Kiswahili',
    'home.reviewFirst': 'Hakiki dalili kwanza',
    'home.onePrediction': 'Utabiri mmoja kwa kila tathmini',
    'home.how': 'Jinsi inavyofanya kazi',
    'home.processTitle':
      'Utaratibu rahisi unaotegemea maelezo yako.',
    'home.processIntro':
      'Unashiriki katika kila hatua. Mfumo unasaidia kupanga dalili zako, lakini hauchukui nafasi ya mtaalamu wa afya.',
    'home.step1': 'Eleza jinsi unavyojisikia',
    'home.step1Text':
      'Eleza dalili zako kwa lugha ya kawaida, hata kwa kuchanganya Kiingereza na Kiswahili katika sentensi moja.',
    'home.step2': 'Hakiki dalili zilizotambuliwa',
    'home.step2Text':
      'Kagua dalili zilizotambuliwa na mfumo na uzithibitishe kabla ya kuendelea.',
    'home.step3': 'Soma mwongozo wa afya',
    'home.step3Text':
      'Kwa hali zisizo za dharura, utaona hali moja ya ugonjwa iliyotabiriwa na taarifa za uhakika wa modeli. Dalili za dharura husababisha kutolewa kwa mwongozo wa usalama badala ya utabiri.',
    'home.important': 'Taarifa muhimu',
    'home.safetyTitle': 'Uelewa wa afya si utambuzi wa ugonjwa.',
    'home.safety1':
      'RespiraCare ni mfumo wa elimu na uelewa wa afya. Hali ya ugonjwa iliyotabiriwa ni dalili ya awali tu, si utambuzi wa kitabibu wala mbadala wa tathmini ya mtaalamu wa afya.',
    'home.safety2':
      'Ikiwa dalili zako ni kali, zinazidi kuwa mbaya haraka au unahitaji msaada wa dharura, tafuta matibabu haraka badala ya kutegemea utabiri.',

    // Prediction feedback
    'feedback.received': 'Maoni yamepokelewa',
    'feedback.thanks':
      'Asante kwa kutusaidia kuboresha RespiraCare.',
    'feedback.saved':
      'Maoni yako yamehifadhiwa kwa tathmini hii ya utabiri.',
    'feedback.duplicate': 'Maoni tayari yamepokelewa',
    'feedback.duplicateTitle':
      'Tathmini hii tayari ina maoni.',
    'feedback.duplicateText':
      'RespiraCare inapokea maoni mara moja tu kwa kila tathmini ya utabiri.',
    'feedback.eyebrow': 'Maoni yako',
    'feedback.question':
      'Je, matokeo haya ya uelewa wa afya yamekusaidia?',
    'feedback.intro':
      'Maoni yako yanatusaidia kutathmini na kuboresha matumizi ya RespiraCare.',
    'feedback.yes': 'Ndiyo',
    'feedback.no': 'Hapana',
    'feedback.helpful': 'Yamenisaidia',
    'feedback.notHelpful': 'Hayajanisaidia',
    'feedback.comment': 'Maoni ya ziada',
    'feedback.optional': 'Si lazima',
    'feedback.placeholder':
      'Tuambie kilichokusaidia au kinachoweza kuboreshwa...',
    'feedback.privacy':
      'Usiweke taarifa za siri au taarifa nyeti za kibinafsi kwenye maoni yako.',
    'feedback.submitting': 'Inawasilisha maoni...',
    'feedback.submit': 'Wasilisha maoni',
    'feedback.errorChoice':
      'Tafadhali eleza ikiwa matokeo haya yamekusaidia.',
    'feedback.errorLength':
      'Maoni hayawezi kuzidi herufi 1000.',
    'feedback.errorValidation':
      'Tafadhali hakiki maoni yako na ujaribu tena.',
    'feedback.errorGeneric':
      'Maoni yako hayakuweza kuwasilishwa. Tafadhali jaribu tena.',

    // Route guards
    'route.checkSession':
      'Inakagua kipindi chako cha RespiraCare...',
    'route.checkAdmin':
      'Inakagua ruhusa ya msimamizi...',
    'route.retry': 'Jaribu tena',

    // Access denied
    'denied.label': 'Ufikiaji umezuiwa',
    'denied.title': 'Ruhusa ya msimamizi inahitajika.',
    'denied.message':
      'Akaunti yako ya RespiraCare haina ruhusa ya kufikia sehemu hii.',
    'denied.dashboard': 'Rudi kwenye dashibodi',

    // 404
    'notFound.title': 'Ukurasa haujapatikana',
    'notFound.message':
      'Ukurasa unaoutafuta haupo.',
    'notFound.home': 'Rudi mwanzo',
  },
}

export function useSharedText() {
  const { language } = useLanguage()

  return (key) =>
    messages[language]?.[key] ??
    messages.en[key] ??
    key
}
