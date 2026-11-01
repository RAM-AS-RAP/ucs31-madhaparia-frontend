import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import './styles/accessibility.css'
import { LanguageProvider } from './context/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AccessibilityProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)