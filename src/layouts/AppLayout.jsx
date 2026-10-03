import { Link, Outlet } from 'react-router-dom'

function AppLayout() {
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

            <span className="nav-placeholder">
              Health Awareness
            </span>

            <span className="nav-placeholder">
              About
            </span>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="button button-ghost"
              disabled
            >
              Log in
            </button>

            <button
              type="button"
              className="button button-primary"
              disabled
            >
              Get started
            </button>
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