
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import AdminRoute from './components/AdminRoute'
import PatientRoute from './components/PatientRoute'
import ProtectedRoute from './components/ProtectedRoute'

import AppLayout from './layouts/AppLayout'

import AccessDeniedPage from './pages/AccessDeniedPage'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import NotFoundPage from './pages/NotFoundPage'
import PatientDashboardPage from './pages/PatientDashboardPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SymptomInputPage from './pages/SymptomInputPage'
import SymptomConfirmationPage from './pages/SymptomConfirmationPage'
import PredictionPage from './pages/PredictionPage'
import PatientHistoryPage from './pages/PatientHistoryPage'
import PatientHistoryDetailPage from './pages/PatientHistoryDetailPage'

// Invalidate only transient assessment caches, never authentication or saved history.
if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('respiracare_assessment_release') !== 'awareness-2') {
  for (const key of ['respiracare_symptom_mapping', 'respiracare_symptom_confirmation', 'respiracare_prediction_result', 'respiracare_candidate_followup_v1']) sessionStorage.removeItem(key)
  sessionStorage.setItem('respiracare_assessment_release', 'awareness-2')
}

// Load administrator pages only when needed.
const AdminDashboardPage = lazy(
  () => import('./pages/AdminDashboardPage'),
)

const AdminHistoryDetailPage = lazy(
  () => import('./pages/AdminHistoryDetailPage'),
)

const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'))
const AdminSystemPage = lazy(() => import('./pages/AdminSystemPage'))

function AdminPageLoading() {
  return (
    <section
      className="rc-container"
      role="status"
      aria-live="polite"
      style={{ padding: '48px 0' }}
    >
      <p>Loading administrator page...</p>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>

        {/* Public routes */}
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route path="/about" element={<AboutPage />} />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Patient-only routes */}
        <Route
          path="/dashboard"
          element={
            <PatientRoute>
              <PatientDashboardPage />
            </PatientRoute>
          }
        />

        <Route
          path="/symptoms"
          element={
            <PatientRoute>
              <SymptomInputPage />
            </PatientRoute>
          }
        />

        <Route
          path="/symptoms/confirm"
          element={
            <PatientRoute>
              <SymptomConfirmationPage />
            </PatientRoute>
          }
        />

        <Route
          path="/prediction"
          element={
            <PatientRoute>
              <PredictionPage />
            </PatientRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PatientRoute>
              <PatientHistoryPage />
            </PatientRoute>
          }
        />

        <Route
          path="/history/:predictionId"
          element={
            <PatientRoute>
              <PatientHistoryDetailPage />
            </PatientRoute>
          }
        />

        {/* Administrator-only routes */}
        <Route path="/admin/system" element={<AdminRoute><Suspense fallback={<AdminPageLoading />}><AdminSystemPage /></Suspense></AdminRoute>} />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <Suspense fallback={<AdminPageLoading />}>
                <AdminUsersPage />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Suspense fallback={<AdminPageLoading />}>
                <AdminDashboardPage />
              </Suspense>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/history/:predictionId"
          element={
            <AdminRoute>
              <Suspense fallback={<AdminPageLoading />}>
                <AdminHistoryDetailPage />
              </Suspense>
            </AdminRoute>
          }
        />

        {/* Access denied for signed-in users */}
        <Route
          path="/access-denied"
          element={
            <ProtectedRoute>
              <AccessDeniedPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />

      </Route>
    </Routes>
  )
}

export default App
