
import { useContext } from 'react'
import LanguageContext from './LanguageContextBase'

export function useLanguage() {
  return useContext(LanguageContext)
}
