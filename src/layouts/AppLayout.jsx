
import {
  clearSymptomConfirmation,
  clearSymptomMapping,
} from '../services/symptoms'

import {
  useEffect,
  useRef,
} from 'react'

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../context/useAuth'

import {
  clearPredictionResult,
} from '../services/predictions'

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // Keep existing logout and navigation behaviour.
  const logoutPending = useRef(false)

  const {
    isAdmin,
    isAuthenticated,
    logout,
    user,
  } = useAuth()

  useEffect(() => {
    if (
      logoutPending.current &&
      location.pathname === '/'
    ) {
      logoutPending.current = false
      logout()
    }
  }, [location.pathname, logout])

  function handleLogout() {
    clearSymptomMapping()
    clearSymptomConfirmation()
    clearPredictionResult()

    if (location.pathname === '/') {
      logout()
      return
    }

    logoutPending.current = true
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="rc-navbar">
        <div className="rc-container navbar-content">

          {/* RespiraCare logo and branding */}
          <Link to="/" className="brand">

            <svg
              width="43"
              height="43"
              viewBox="15 7 228 242"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
              style={{ flexShrink: 0 }}
            >
              {/* Left upright of K */}
              <path
                fill="#b99bc9"
                d="
                  M46 15
                  C34 15 24 28 23 40
                  V214
                  C23 230 34 239 52 240
                  C74 241 88 224 88 203
                  V178
                  C88 168 80 166 72 171
                  C52 181 39 194 28 212
                  C29 188 44 161 56 137
                  C76 101 88 74 88 40
                  C88 25 77 15 60 15
                  Z
                "
              />

              {/* Upper leaf */}
              <path
                fill="#d1b7e1"
                d="
                  M231 24
                  C225 22 190 21 172 24
                  C141 28 122 56 105 83
                  C89 107 76 135 66 148
                  C83 136 104 124 125 121
                  C148 117 172 116 194 103
                  C222 85 235 57 233 34
                  Z
                "
              />

              {/* Lower diagonal of K */}
              <path
                fill="#9677ad"
                d="
                  M72 159
                  C97 155 105 162 122 181
                  L154 218
                  C171 238 183 241 205 240
                  C223 239 236 232 236 223
                  C237 214 223 201 210 185
                  L187 153
                  C164 123 140 126 117 134
                  C100 140 84 149 72 159
                  Z
                "
              />

              {/* White medical cross */}
              <path
                d="M181 47 V76 M166.5 61.5 H195.5"
                fill="none"
                stroke="#ffffff"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </svg>

            <div>
              <span className="brand-name">
                RespiraCare
              </span>

              <span className="brand-subtitle">
                Respiratory Health Awareness
              </span>
            </div>
          </Link>

          {/* Navigation links */}
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
          </nav>

          {/* Login and account controls */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <div className="nav-user">
                  <span>
                    {isAdmin ? 'Admin' : 'Patient'}
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

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Existing footer */}
      <footer className="footer">
        <div className="rc-container footer-content">
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
