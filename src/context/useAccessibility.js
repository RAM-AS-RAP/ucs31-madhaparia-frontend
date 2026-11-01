
import { useContext } from 'react'
import AccessibilityContext from './AccessibilityContextBase'

export function useAccessibility() {
  const context = useContext(AccessibilityContext)

  if (!context) {
    throw new Error(
      'useAccessibility must be used inside AccessibilityProvider.'
    )
  }

  return context
}
