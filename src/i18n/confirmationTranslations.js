
import { useLanguage } from '../context/useLanguage'

const messages = {
  en: {
    eyebrow: 'Symptom review',
    title1: 'Check what we recognised.',
    title2: "You decide what's correct.",
    intro:
      'Review the symptoms identified from your description. Keep the ones that match how you feel and remove any that do not.',
    step: 'Step 2 of 3',
    stepLabel: 'Confirm symptoms',
    progress: 'Assessment progress',
    recognised: 'Recognised symptoms',
    review: 'Review your selections',
    recognisedCount: '{count} symptom(s) recognised from your description.',
    selectedCount: 'selected',
    original: 'Your original description',
    warning: 'Safety-sensitive wording detected',
    warningMessage:
      'One or more recognised symptoms may need urgent attention. If your symptoms are severe, rapidly worsening, or involve breathing difficulty, seek medical attention promptly.',
    selectSymptoms: 'Select your symptoms',
    safetySensitive: 'Safety-sensitive',
    recognisedFrom: 'Recognised from',
    selected: 'Selected',
    notSelected: 'Not selected',
    selectionHelp:
      'Review what is present, denied, uncertain or about another person. Removing a selection is not the same as explicitly denying a symptom. Safety warnings are assessed separately.',
    noSelection:
      'Please confirm at least one symptom or return to the previous step and revise your description.',
    confirmError:
      'Your symptoms could not be confirmed. Please try again.',
    back: 'Back to symptom input',
    confirming: 'Confirming...',
    confirm: 'Confirm selected symptoms',
    urgentLabel: 'Urgent review recommended',
    urgentTitle: 'A confirmed symptom needs prompt attention.',
    urgentMessage:
      'RespiraCare detected a safety-sensitive confirmed symptom. Seek prompt professional medical assessment, particularly if you have severe or worsening symptoms or difficulty breathing.',
    urgentStop:
      'This assessment will not continue to automated disease prediction.',
    complete: 'Confirmation complete',
    completeTitle: 'Your symptoms have been confirmed.',
    completeMessage:
      'Your selections and explicit corrections have been recorded. Denied, uncertain and other-person reports remain distinct; safety warnings are checked separately.',
    yourSelection: 'Your selection',
    confirmedTitle: 'Confirmed symptoms',
    confirmedCount: 'confirmed',
    excludedTitle: 'Not confirmed',
    excludedMessage:
      'These symptoms were excluded from your confirmed selection.',
    next: 'Next step',
    predictionTitle: 'Generate your health-awareness result',
    predictionMessage:
      'Provide your age and sex in the next step for a research symptom assessment. You may also supply duration. A specific disease may not be identifiable.',
    continue: 'Continue to prediction',
    reviewAgain: 'Review selections again',
    dashboard: 'Return to dashboard',
    disclaimerTitle: 'Health-awareness information only',
    disclaimer:
      'RespiraCare provides preliminary health-awareness support and is not a medical diagnosis.',
  },

  sw: {
    eyebrow: 'Uhakiki wa dalili',
    title1: 'Hakiki dalili tulizotambua.',
    title2: 'Wewe unaamua zilizo sahihi.',
    intro:
      'Hakiki dalili zilizotambuliwa kutokana na maelezo yako. Acha zile zinazoeleza jinsi unavyojisikia na uondoe zisizo sahihi.',
    step: 'Hatua ya 2 kati ya 3',
    stepLabel: 'Thibitisha dalili',
    progress: 'Maendeleo ya tathmini',
    recognised: 'Dalili zilizotambuliwa',
    review: 'Hakiki dalili ulizochagua',
    recognisedCount:
      'Dalili zilizotambuliwa kutoka kwenye maelezo yako: {count}.',
    selectedCount: 'zimechaguliwa',
    original: 'Maelezo yako ya awali',
    warning: 'Dalili zinazoweza kuashiria hatari zimetambuliwa',
    warningMessage:
      'Dalili moja au zaidi zilizotambuliwa zinaweza kuhitaji huduma ya haraka. Ikiwa dalili zako ni kali, zinazidi kuwa mbaya au unapata shida ya kupumua, tafuta matibabu haraka.',
    selectSymptoms: 'Chagua dalili zako',
    safetySensitive: 'Inaweza kuashiria hatari',
    recognisedFrom: 'Imetambuliwa kutoka',
    selected: 'Imechaguliwa',
    notSelected: 'Haijachaguliwa',
    selectionHelp:
      'Hakiki dalili zilizopo, zilizokanushwa, zisizo na uhakika au za mtu mwingine. Kuondoa chaguo si kukataa dalili moja kwa moja. Dalili za hatari hukaguliwa kando.',
    noSelection:
      'Tafadhali thibitisha angalau dalili moja au rudi kwenye hatua iliyotangulia kurekebisha maelezo yako.',
    confirmError:
      'Dalili zako hazikuweza kuthibitishwa. Tafadhali jaribu tena.',
    back: 'Rudi kwenye maelezo ya dalili',
    confirming: 'Inathibitisha...',
    confirm: 'Thibitisha dalili ulizochagua',
    urgentLabel: 'Uhakiki wa haraka unapendekezwa',
    urgentTitle: 'Dalili iliyothibitishwa inahitaji uangalizi wa haraka.',
    urgentMessage:
      'RespiraCare imetambua dalili iliyothibitishwa inayoweza kuashiria hatari. Tafuta huduma ya kitaalamu ya afya haraka, hasa ikiwa dalili ni kali, zinazidi kuwa mbaya au unapata shida ya kupumua.',
    urgentStop:
      'Tathmini hii haitaendelea kwenye utabiri wa ugonjwa wa kiotomatiki.',
    complete: 'Uthibitisho umekamilika',
    completeTitle: 'Dalili zako zimethibitishwa.',
    completeMessage:
      'Chaguo na marekebisho yako yamehifadhiwa. Taarifa zilizokanushwa, zisizo na uhakika na za mtu mwingine hubaki tofauti; hatari hukaguliwa kando.',
    yourSelection: 'Ulichochagua',
    confirmedTitle: 'Dalili zilizothibitishwa',
    confirmedCount: 'zimethibitishwa',
    excludedTitle: 'Hazijathibitishwa',
    excludedMessage:
      'Dalili hizi zimeondolewa kwenye orodha ya dalili ulizothibitisha.',
    next: 'Hatua inayofuata',
    predictionTitle: 'Pata matokeo ya uelewa wa afya',
    predictionMessage:
      'Weka umri na jinsi yako kwa tathmini ya utafiti ya dalili. Unaweza kuongeza muda wa dalili. Huenda ugonjwa maalumu usitambuliwe.',
    continue: 'Endelea kwenye utabiri',
    reviewAgain: 'Hakiki uchaguzi wako tena',
    dashboard: 'Rudi kwenye dashibodi',
    disclaimerTitle: 'Taarifa za uelewa wa afya pekee',
    disclaimer:
      'RespiraCare hutoa taarifa za awali za uelewa wa afya na haitoi utambuzi wa kitabibu.',
  },
}

export function useConfirmationText() {
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
