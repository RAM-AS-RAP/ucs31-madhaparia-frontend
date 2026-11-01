
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'
import ProtectedRoute from './ProtectedRoute'

function PatientAccess({ children }) {
  const { user } = useAuth()

  if (user?.role === 'patient') {
    return children
  }

  // Administrators use their own dashboard.
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  // Never grant patient access to an unknown role.
  return <Navigate to="/access-denied" replace />
}

function PatientRoute({ children }) {
  return (
    <ProtectedRoute>
      <PatientAccess>
        {children}
      </PatientAccess>
    </ProtectedRoute>
  )
}

export default PatientRoute
