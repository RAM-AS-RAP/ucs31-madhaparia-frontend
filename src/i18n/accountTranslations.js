import { useLanguage } from '../context/useLanguage'

const messages = {
  en: {
    fullName: 'Full name',
    nameHelp: 'Enter your name as you would like it displayed.',
    phoneNumber: 'Phone number',
    phoneHelp:
      'Optional. Include the country code, for example +254712345678.',
    nameError:
      'Enter a name containing letters, between 2 and 100 characters.',
    phoneError:
      'Use an international phone number with + and 8 to 15 digits.',
    emailError: 'Enter a valid email address.',
    passwordError:
      'Use 8 to 128 characters. A password cannot contain only spaces.',
    passwordHelp:
      'Use 8 to 128 characters. A longer, unique passphrase is recommended.',
    confirmError: 'The passwords do not match.',
    showPasswords: 'Show passwords',
    hidePasswords: 'Hide passwords',
    strength0: 'Not entered',
    strength1: 'Needs improvement',
    strength2: 'Minimum length met',
    strength3: 'Longer password',
    strengthNote:
      'This feedback is a simple estimate, not a security guarantee.',
    exists: 'An account with this email already exists.',
    invalidRegistration:
      'Please check your name, phone number, email and password.',
    registrationFailed:
      'Your account could not be created. Please try again.',
    nav: 'My profile',
    profileTitle: 'My profile',
    profileIntro: 'View your account and update your personal details.',
    accountDetails: 'Account details',
    personalDetails: 'Personal details',
    email: 'Email address',
    emailReadOnly: 'Your login email is shown here for reference.',
    role: 'Account role',
    patient: 'Patient',
    admin: 'Administrator',
    save: 'Save changes',
    saving: 'Saving changes...',
    saved: 'Your profile has been updated.',
    cancel: 'Reset changes',
    profileFailed:
      'Your profile could not be updated. Please try again.',
    invalidProfile: 'Please check your name and phone number.',
    sessionExpired: 'Your session has expired. Please log in again.',
  },
  sw: {
    fullName: 'Jina kamili',
    nameHelp: 'Weka jina unalotaka lionyeshwe.',
    phoneNumber: 'Nambari ya simu',
    phoneHelp:
      'Si lazima. Jumuisha msimbo wa nchi, kwa mfano +254712345678.',
    nameError:
      'Weka jina lenye herufi na urefu wa kati ya vibambo 2 na 100.',
    phoneError:
      'Tumia nambari ya kimataifa yenye + na tarakimu 8 hadi 15.',
    emailError: 'Weka anwani sahihi ya barua pepe.',
    passwordError:
      'Tumia vibambo 8 hadi 128. Nenosiri haliwezi kuwa nafasi tupu pekee.',
    passwordHelp:
      'Tumia vibambo 8 hadi 128. Nenosiri refu na la kipekee linapendekezwa.',
    confirmError: 'Manenosiri hayafanani.',
    showPasswords: 'Onyesha manenosiri',
    hidePasswords: 'Ficha manenosiri',
    strength0: 'Halijawekwa',
    strength1: 'Linahitaji kuboreshwa',
    strength2: 'Limefikia urefu wa chini',
    strength3: 'Nenosiri refu zaidi',
    strengthNote:
      'Maoni haya ni makadirio rahisi, si hakikisho la usalama.',
    exists: 'Akaunti yenye barua pepe hii tayari ipo.',
    invalidRegistration:
      'Tafadhali hakiki jina, nambari ya simu, barua pepe na nenosiri.',
    registrationFailed:
      'Akaunti yako haikuweza kufunguliwa. Tafadhali jaribu tena.',
    nav: 'Wasifu wangu',
    profileTitle: 'Wasifu wangu',
    profileIntro: 'Angalia akaunti yako na usasishe taarifa zako.',
    accountDetails: 'Taarifa za akaunti',
    personalDetails: 'Taarifa binafsi',
    email: 'Anwani ya barua pepe',
    emailReadOnly: 'Barua pepe unayotumia kuingia inaonyeshwa hapa.',
    role: 'Aina ya akaunti',
    patient: 'Mgonjwa',
    admin: 'Msimamizi',
    save: 'Hifadhi mabadiliko',
    saving: 'Inahifadhi mabadiliko...',
    saved: 'Wasifu wako umesasishwa.',
    cancel: 'Rudisha taarifa',
    profileFailed:
      'Wasifu wako haukuweza kusasishwa. Tafadhali jaribu tena.',
    invalidProfile: 'Tafadhali hakiki jina na nambari ya simu.',
    sessionExpired: 'Kipindi chako kimeisha. Tafadhali ingia tena.',
  },
}

export function useAccountText() {
  const { language } = useLanguage()
  const selected = messages[language === 'sw' ? 'sw' : 'en']

  return (key) => selected[key] ?? messages.en[key] ?? key
}
