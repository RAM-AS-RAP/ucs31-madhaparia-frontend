
import { createContext } from 'react'
import { translate } from '../i18n/translations'

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, values) => translate('en', key, values),
})

export default LanguageContext
