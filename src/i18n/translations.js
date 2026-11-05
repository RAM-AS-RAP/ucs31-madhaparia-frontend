
export const messages = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.settings': 'Settings',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.users': 'Users',
    'nav.system': 'System',
    'nav.login': 'Log in',
    'nav.logout': 'Log out',
    'nav.getStarted': 'Get started',
    'nav.main': 'Main navigation',
    'nav.mobile': 'Mobile navigation',
    'nav.openMenu': 'Open navigation menu',
    'nav.closeMenu': 'Close navigation menu',

    // Account roles and branding
    'role.admin': 'Administrator',
    'role.patient': 'Patient',
    'role.adminAccount': 'Administrator account',
    'role.patientAccount': 'Patient account',
    'brand.subtitle': 'Respiratory Health Awareness',

    // Footer
    'footer.description':
      'Respiratory health awareness supported by intelligent symptom analysis.',
    'footer.explore': 'Explore',
    'footer.exploreApp': 'Explore RespiraCare',
    'footer.account': 'Account overview',
    'footer.signin': 'Sign in',
    'footer.createAccount': 'Create an account',
    'footer.administration': 'Administration',
    'footer.info': 'Important information',
    'footer.disclaimer':
      'For health-awareness and educational purposes only. This system does not provide a medical diagnosis.',
    'footer.note': 'Information for awareness, not diagnosis.',

    // Settings
    'settings.preferences': 'Personal preferences',
    'settings.title': 'Settings',
    'settings.intro': 'Choose how the application looks to you.',
    'settings.appearance': 'Appearance',
    'settings.appearanceHelp':
      'Your choice applies throughout the app and is remembered on this browser for your account.',
    'settings.themeLabel': 'Theme: {name}',
    'settings.themeApplied': 'Your appearance preference is applied.',
    'settings.followSystem': 'Following your device ({mode} appearance).',
    'settings.language': 'Language',
    'settings.languageHelp': 'Choose your preferred interface language.',

    // Themes
    'theme.default': 'Default Purple',
    'theme.defaultDescription': 'The original lavender appearance.',
    'theme.light': 'Light',
    'theme.lightDescription': 'A bright, cool colour scheme.',
    'theme.dark': 'Dark',
    'theme.darkDescription': 'Darker backgrounds for comfortable viewing.',
    'theme.system': 'System',
    'theme.systemDescription': 'Automatically match your device settings.',
    'language.en': 'English',
    'language.sw': 'Kiswahili',

    // Accessibility
    'a11y.title': 'Accessibility',
    'a11y.intro': 'Adjust text, contrast and motion to suit your needs.',
    'a11y.textSize': 'Text Size',
    'a11y.sizeHelp': 'Choose a comfortable reading size.',
    'a11y.normal': 'Normal',
    'a11y.large': 'Large',
    'a11y.extraLarge': 'Extra Large',
    'a11y.huge': 'Huge',
    'a11y.highContrast': 'High Contrast Mode',
    'a11y.highContrastDescription':
      'Use stronger colours and clearer borders.',
    'a11y.boldText': 'Bold Text',
    'a11y.boldTextDescription':
      'Make interface text thicker and easier to read.',
    'a11y.reduceMotion': 'Reduce Motion',
    'a11y.reduceMotionDescription':
      'Minimise animations and visual transitions.',
    'a11y.reset': 'Reset accessibility settings',

    // Shared authentication
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.show': 'Show',
    'auth.hide': 'Hide',
    'auth.showPassword': 'Show password',
    'auth.hidePassword': 'Hide password',
    'auth.confirmPassword': 'Confirm password',
    'auth.showConfirm': 'Show confirmation password',
    'auth.hideConfirm': 'Hide confirmation password',

    // Login
    'login.eyebrow': 'Your RespiraCare account',
    'login.title1': 'Your health awareness,',
    'login.title2': 'right where you left off.',
    'login.intro':
      'Sign in to revisit earlier symptom checks or start a new one. Everything is organised in one place, at your own pace.',
    'login.benefitsLabel': 'What you can do after signing in',
    'login.benefit1': 'Pick up where you left off',
    'login.benefit1Description':
      'Review your previous health-awareness sessions.',
    'login.benefit2': 'Describe symptoms naturally',
    'login.benefit2Description':
      'Use English, Kiswahili, or a mix of both.',
    'login.privacy':
      'Your account history is only accessible through an authorised session.',
    'login.access': 'Account access',
    'login.welcome': 'Welcome back. Enter your details below.',
    'login.created':
      'Your account was created successfully. You can now log in.',
    'login.requiredPage': 'Please log in to access that page.',
    'login.loading': 'Logging in...',
    'login.newUser': 'New to RespiraCare?',
    'login.disclaimer':
      'For health awareness and education only. RespiraCare does not provide a medical diagnosis.',
    'login.errorRequired':
      'Please enter your email address and password.',
    'login.errorInvalid':
      'The email or password you entered is incorrect.',
    'login.errorBlocked':
      'Your account has been blocked. Contact an administrator.',
    'login.errorDeactivated':
      'Your account has been deactivated. Contact an administrator.',
    'login.errorValidation':
      'Please check your email address and password.',
    'login.errorGeneric':
      'Login could not be completed. Please try again.',

    // Registration
    'register.eyebrow': 'Getting started with RespiraCare',
    'register.title1': 'Better understanding begins',
    'register.title2': 'with your words.',
    'register.intro':
      'Create an account to describe your symptoms, confirm what the system recognises and keep your health-awareness history in one place.',
    'register.benefit2': 'Review before continuing',
    'register.benefit2Description':
      'Check recognised symptoms before receiving guidance.',
    'register.note':
      'This tool supports health awareness. It does not provide a medical diagnosis.',
    'register.patient': 'Patient registration',
    'register.title': 'Create your account',
    'register.welcome': "A few details and you're ready to begin.",
    'register.emailHelp': 'You will use this email to log in.',
    'register.emailInvalid': 'Enter a valid email address.',
    'register.passwordPlaceholder': 'At least 8 characters',
    'register.passwordFeedback': 'Password feedback',
    'register.strength0': 'Not entered',
    'register.strength1': 'Below minimum',
    'register.strength2': 'Meets minimum',
    'register.strength3': 'Better length and variety',
    'register.passwordHelp':
      'At least 8 characters required. A longer, less predictable password is recommended. This is only a simple estimate.',
    'register.confirmPlaceholder': 'Enter password again',
    'register.confirmEmpty': 'Re-enter your password to confirm it.',
    'register.confirmMatch': 'Passwords match.',
    'register.confirmMismatch': 'Passwords do not match yet.',
    'register.roleNote':
      'Registration creates a patient account. Administrator accounts cannot be created here.',
    'register.creating': 'Creating account...',
    'register.create': 'Create account',
    'register.existing': 'Already have an account?',
    'register.disclaimer':
      'RespiraCare provides health-awareness information only, not a medical diagnosis.',
    'register.errorEmail': 'Please enter your email address.',
    'register.errorInvalidEmail': 'Please enter a valid email address.',
    'register.errorPassword':
      'Please use a password with at least 8 characters.',
    'register.errorMismatch': 'The passwords do not match.',
    'register.errorExists':
      'An account with this email already exists.',
    'register.errorValidation':
      'Please check your email and password details.',
    'register.errorGeneric':
      'Your account could not be created. Please try again.',
  },

  sw: {
    // Navigation
    'nav.home': 'Mwanzo',
    'nav.settings': 'Mipangilio',
    'nav.dashboard': 'Dashibodi',
    'nav.admin': 'Usimamizi',
    'nav.users': 'Watumiaji',
    'nav.system': 'Mfumo',
    'nav.login': 'Ingia',
    'nav.logout': 'Toka',
    'nav.getStarted': 'Anza sasa',
    'nav.main': 'Menyu kuu',
    'nav.mobile': 'Menyu ya simu',
    'nav.openMenu': 'Fungua menyu',
    'nav.closeMenu': 'Funga menyu',

    // Account roles and branding
    'role.admin': 'Msimamizi',
    'role.patient': 'Mgonjwa',
    'role.adminAccount': 'Akaunti ya msimamizi',
    'role.patientAccount': 'Akaunti ya mgonjwa',
    'brand.subtitle': 'Uelewa wa Afya ya Mfumo wa Upumuaji',

    // Footer
    'footer.description':
      'Uelewa wa afya ya mfumo wa upumuaji kwa msaada wa uchanganuzi wa dalili.',
    'footer.explore': 'Gundua',
    'footer.exploreApp': 'Gundua RespiraCare',
    'footer.account': 'Muhtasari wa akaunti',
    'footer.signin': 'Ingia',
    'footer.createAccount': 'Fungua akaunti',
    'footer.administration': 'Usimamizi',
    'footer.info': 'Taarifa muhimu',
    'footer.disclaimer':
      'Kwa ajili ya uelewa wa afya na elimu pekee. Mfumo huu hautoi utambuzi wa kitabibu.',
    'footer.note': 'Taarifa za uelewa, si utambuzi wa kitabibu.',

    // Settings
    'settings.preferences': 'Mapendeleo yako',
    'settings.title': 'Mipangilio',
    'settings.intro': 'Chagua mwonekano wa programu unaokufaa.',
    'settings.appearance': 'Mwonekano',
    'settings.appearanceHelp':
      'Chaguo lako litatumika katika programu nzima na kuhifadhiwa kwenye kivinjari hiki kwa ajili ya akaunti yako.',
    'settings.themeLabel': 'Mandhari: {name}',
    'settings.themeApplied': 'Mwonekano uliochagua umetumika.',
    'settings.followSystem':
      'Inafuata mpangilio wa kifaa chako ({mode}).',
    'settings.language': 'Lugha',
    'settings.languageHelp':
      'Chagua lugha unayopendelea kutumia kwenye programu.',

    // Themes
    'theme.default': 'Zambarau ya awali',
    'theme.defaultDescription':
      'Mwonekano wa awali wa rangi ya zambarau.',
    'theme.light': 'Angavu',
    'theme.lightDescription':
      'Mwonekano wenye mandharinyuma angavu.',
    'theme.dark': 'Giza',
    'theme.darkDescription':
      'Mandharinyuma meusi kwa usomaji unaokufaa.',
    'theme.system': 'Mpangilio wa kifaa',
    'theme.systemDescription':
      'Fuata kiotomatiki mwonekano wa kifaa chako.',
    'language.en': 'Kiingereza',
    'language.sw': 'Kiswahili',

    // Accessibility
    'a11y.title': 'Ufikivu',
    'a11y.intro':
      'Rekebisha ukubwa wa maandishi, utofautishaji wa rangi na mwendo upendavyo.',
    'a11y.textSize': 'Ukubwa wa maandishi',
    'a11y.sizeHelp':
      'Chagua ukubwa wa maandishi unaosomeka kwa urahisi.',
    'a11y.normal': 'Wa kawaida',
    'a11y.large': 'Makubwa',
    'a11y.extraLarge': 'Makubwa zaidi',
    'a11y.huge': 'Makubwa sana',
    'a11y.highContrast': 'Utofautishaji mkubwa wa rangi',
    'a11y.highContrastDescription':
      'Tumia rangi zinazotofautiana zaidi na mipaka iliyo wazi.',
    'a11y.boldText': 'Maandishi mazito',
    'a11y.boldTextDescription':
      'Ongeza unene wa maandishi ili yasomeke kwa urahisi.',
    'a11y.reduceMotion': 'Punguza mwendo',
    'a11y.reduceMotionDescription':
      'Punguza uhuishaji na mabadiliko ya mwonekano.',
    'a11y.reset': 'Rejesha mipangilio ya ufikivu',

    // Shared authentication
    'auth.email': 'Barua pepe',
    'auth.password': 'Nenosiri',
    'auth.passwordPlaceholder': 'Weka nenosiri lako',
    'auth.show': 'Onyesha',
    'auth.hide': 'Ficha',
    'auth.showPassword': 'Onyesha nenosiri',
    'auth.hidePassword': 'Ficha nenosiri',
    'auth.confirmPassword': 'Thibitisha nenosiri',
    'auth.showConfirm': 'Onyesha nenosiri la uthibitisho',
    'auth.hideConfirm': 'Ficha nenosiri la uthibitisho',

    // Login
    'login.eyebrow': 'Akaunti yako ya RespiraCare',
    'login.title1': 'Uelewa wa afya yako,',
    'login.title2': 'endelea ulipoishia.',
    'login.intro':
      'Ingia ili kuona tathmini zako za awali za dalili au kuanza tathmini mpya. Taarifa zako zimepangwa sehemu moja kwa urahisi.',
    'login.benefitsLabel': 'Unachoweza kufanya baada ya kuingia',
    'login.benefit1': 'Endelea ulipoishia',
    'login.benefit1Description':
      'Angalia tathmini zako za awali za afya.',
    'login.benefit2': 'Eleza dalili kwa lugha ya kawaida',
    'login.benefit2Description':
      'Tumia Kiingereza, Kiswahili au mchanganyiko wa lugha zote mbili.',
    'login.privacy':
      'Historia ya akaunti yako inapatikana tu kupitia kipindi cha kuingia kilichoidhinishwa.',
    'login.access': 'Ufikiaji wa akaunti',
    'login.welcome': 'Karibu tena. Weka taarifa zako hapa chini.',
    'login.created':
      'Akaunti yako imefunguliwa kwa mafanikio. Sasa unaweza kuingia.',
    'login.requiredPage': 'Tafadhali ingia ili kufikia ukurasa huu.',
    'login.loading': 'Inaingia...',
    'login.newUser': 'Je, wewe ni mgeni kwenye RespiraCare?',
    'login.disclaimer':
      'Kwa ajili ya uelewa wa afya na elimu pekee. RespiraCare haitoi utambuzi wa kitabibu.',
    'login.errorRequired':
      'Tafadhali weka barua pepe na nenosiri lako.',
    'login.errorInvalid':
      'Barua pepe au nenosiri uliloweka si sahihi.',
    'login.errorBlocked':
      'Akaunti yako imezuiwa. Wasiliana na msimamizi.',
    'login.errorDeactivated':
      'Akaunti yako imezimwa. Wasiliana na msimamizi.',
    'login.errorValidation':
      'Tafadhali hakiki barua pepe na nenosiri lako.',
    'login.errorGeneric':
      'Imeshindikana kuingia. Tafadhali jaribu tena.',

    // Registration
    'register.eyebrow': 'Anza kutumia RespiraCare',
    'register.title1': 'Uelewa bora huanza',
    'register.title2': 'kwa maneno yako.',
    'register.intro':
      'Fungua akaunti ili kueleza dalili zako, kuthibitisha dalili zilizotambuliwa na kuhifadhi historia ya tathmini zako za afya sehemu moja.',
    'register.benefit2': 'Hakiki kabla ya kuendelea',
    'register.benefit2Description':
      'Kagua dalili zilizotambuliwa kabla ya kupokea mwongozo.',
    'register.note':
      'Mfumo huu unasaidia uelewa wa afya. Hautoi utambuzi wa kitabibu.',
    'register.patient': 'Usajili wa mgonjwa',
    'register.title': 'Fungua akaunti yako',
    'register.welcome': 'Weka taarifa chache ili kuanza.',
    'register.emailHelp': 'Utatumia barua pepe hii kuingia.',
    'register.emailInvalid': 'Weka anwani sahihi ya barua pepe.',
    'register.passwordPlaceholder': 'Angalau herufi 8',
    'register.passwordFeedback': 'Tathmini ya nenosiri',
    'register.strength0': 'Halijawekwa',
    'register.strength1': 'Halijafikia kiwango cha chini',
    'register.strength2': 'Limefikia kiwango cha chini',
    'register.strength3': 'Urefu na mchanganyiko bora zaidi',
    'register.passwordHelp':
      'Angalau herufi 8 zinahitajika. Nenosiri refu na lisilotabirika kwa urahisi linapendekezwa. Hii ni makadirio rahisi pekee.',
    'register.confirmPlaceholder': 'Weka nenosiri tena',
    'register.confirmEmpty':
      'Weka nenosiri lako tena ili kulithibitisha.',
    'register.confirmMatch': 'Manenosiri yanafanana.',
    'register.confirmMismatch': 'Manenosiri bado hayafanani.',
    'register.roleNote':
      'Usajili huu unafungua akaunti ya mgonjwa. Akaunti za wasimamizi haziwezi kufunguliwa hapa.',
    'register.creating': 'Inafungua akaunti...',
    'register.create': 'Fungua akaunti',
    'register.existing': 'Tayari una akaunti?',
    'register.disclaimer':
      'RespiraCare hutoa taarifa za uelewa wa afya pekee, si utambuzi wa kitabibu.',
    'register.errorEmail': 'Tafadhali weka barua pepe yako.',
    'register.errorInvalidEmail':
      'Tafadhali weka anwani sahihi ya barua pepe.',
    'register.errorPassword':
      'Tafadhali tumia nenosiri lenye angalau herufi 8.',
    'register.errorMismatch': 'Manenosiri hayafanani.',
    'register.errorExists':
      'Akaunti yenye barua pepe hii tayari ipo.',
    'register.errorValidation':
      'Tafadhali hakiki taarifa za barua pepe na nenosiri.',
    'register.errorGeneric':
      'Akaunti yako haikuweza kufunguliwa. Tafadhali jaribu tena.',
  },
}

export function translate(language, key, values = {}) {
  const template =
    messages[language]?.[key] ?? messages.en[key] ?? key

  return template.replace(/\{(\w+)\}/g, (_, name) =>
    String(values[name] ?? `{${name}}`)
  )
}
