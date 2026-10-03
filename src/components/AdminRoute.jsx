import {
  Navigate,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../context/useAuth'

function AdminRoute({ children }) {
  const location = useLocation()

  const {
    isAuthenticated,
    isAdmin,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="auth-loading-page">
        <div className="auth-loading-spinner" />

        <p>
          Checking administrator access...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          authenticationRequired: true,
        }}
      />
    )
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/access-denied"
        replace
      />
    )
  }

  return children
}

export default AdminRoute