import { useAuth } from '../context/useAuth'

function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <section className="dashboard-page admin-dashboard">
      <div className="container">
        <div className="dashboard-welcome">
          <span>
            Administrator area
          </span>

          <h1>
            RespiraCare administration.
          </h1>

          <p>
            Signed in as
            <strong> {user?.email}</strong>.
            Full administrator history and feedback
            tools will be implemented in Issue #9.
          </p>
        </div>

        <div className="admin-access-card">
          <div className="admin-access-icon">
            A
          </div>

          <div>
            <strong>
              Administrator access verified
            </strong>

            <p>
              This page is available only to accounts
              with the admin role.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboardPage