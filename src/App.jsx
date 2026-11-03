
import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import AdminRoute from './components/AdminRoute'
import PatientRoute from './components/PatientRoute'
import ProtectedRoute from './components/ProtectedRoute'

import AppLayout from './layouts/AppLayout'

import AccessDeniedPage from './pages/AccessDeniedPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
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

// Load administrator pages only when needed.
const AdminDashboardPage = lazy(
  () => import('./pages/AdminDashboardPage'),
)

const AdminHistoryDetailPage = lazy(
  () => import('./pages/AdminHistoryDetailPage'),
)

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

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
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
