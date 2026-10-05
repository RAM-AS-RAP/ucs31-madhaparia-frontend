import {
  clearSymptomConfirmation,
  clearSymptomMapping,
} from '../services/symptoms'

import {
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/useAuth'

import {
  clearPredictionResult,
} from '../services/predictions'

function AppLayout() {
  const navigate = useNavigate()

  const {
    isAdmin,
    isAuthenticated,
    logout,
    user,
  } = useAuth()

  function handleLogout() {
    clearSymptomMapping()
    clearSymptomConfirmation()
    clearPredictionResult()

    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="brand">
            <div className="brand-icon">R</div>

            <div>
              <span className="brand-name">
                RespiraCare
              </span>

              <span className="brand-subtitle">
                Respiratory Health Awareness
              </span>
            </div>
          </Link>

          <nav className="nav-links">
            <Link to="/">
              Home
            </Link>

            {isAuthenticated && (
              <Link to="/dashboard">
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin">
                Admin
              </Link>
            )}

            {!isAuthenticated && (
              <>
                <span className="nav-placeholder">
                  Health Awareness
                </span>

                <span className="nav-placeholder">
                  About
                </span>
              </>
            )}
          </nav>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="nav-user">
                  <span>
                    {isAdmin
                      ? 'Admin'
                      : 'Patient'}
                  </span>

                  <strong>
                    {user?.email}
                  </strong>
                </div>

                <button
                  type="button"
                  className="button button-ghost"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="button button-ghost"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="button button-primary"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div>
            <strong>RespiraCare</strong>

            <p>
              Respiratory health awareness supported by
              intelligent symptom analysis.
            </p>
          </div>

          <p className="footer-disclaimer">
            For health-awareness and educational purposes only.
            This system does not provide a medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default AppLayout