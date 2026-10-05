import { useAuth } from '../context/useAuth'
import { Link } from 'react-router-dom'

function PatientDashboardPage() {
  const { user } = useAuth()

  return (
    <section className="dashboard-page">
      <div className="container">
        <div className="dashboard-welcome">
          <span>
            Patient dashboard
          </span>

          <h1>
            Welcome to your RespiraCare account.
          </h1>

          <p>
            Signed in as
            <strong> {user?.email}</strong>.
            Your symptom tools and prediction workflow
            will be added in the next development stage.
          </p>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              01
            </div>

            <h2>
              Check symptoms
            </h2>

            <p>
              Enter respiratory symptoms in English,
              Kiswahili or mixed-language text.
            </p>

           <Link
            to="/symptoms"
            className="dashboard-card-link"
           >
            Check symptoms
           </Link>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              02
            </div>

            <h2>
              Prediction history
            </h2>

            <p>
              Review your previous RespiraCare
              health-awareness sessions.
            </p>

            <Link
              to="/history"
              className="dashboard-card-link"
            >
              View prediction history
            </Link>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-icon">
              ✓
            </div>

            <h2>
              Account protected
            </h2>

            <p>
              This page requires a valid authenticated
              patient session.
            </p>

            <span className="account-role">
              Role: {user?.role}
            </span>
          </article>
        </div>
      </div>
    </section>
  )
}

export default PatientDashboardPage