
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePatientText } from '../i18n/patientTranslations'

function ArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  )
}

function PatientDashboardPage() {
  const { user } = useAuth()
  const t = usePatientText()

  const role =
    user?.role === 'admin'
      ? t('dashboard.admin')
      : user?.role === 'patient'
        ? t('dashboard.patient')
        : user?.role || t('common.unavailable')

  return (
    <section
      className="patient32-page"
      aria-labelledby="patient32-title"
    >
      <div className="rc-container">

        <div className="row align-items-end g-4 patient32-header">
          <div className="col-12 col-lg-8">
            <p className="patient32-eyebrow">
              {t('dashboard.eyebrow')}
            </p>

            <h1 id="patient32-title">
              {t('dashboard.welcome')}
              <span>{t('dashboard.question')}</span>
            </h1>

            <p className="patient32-intro">
              {t('dashboard.intro')}
            </p>
          </div>

          <div className="col-12 col-lg-4">
            <div className="patient32-account">
              <span className="patient32-account-label">
                {t('dashboard.signedIn')}
              </span>

              <strong>
                {user?.email || t('dashboard.emailUnavailable')}
              </strong>

              <span className="patient32-account-role">
                {t('dashboard.accountRole', { role })}
              </span>
            </div>
          </div>
        </div>

        <div className="row g-4 patient32-actions">
          <div className="col-12 col-lg-7">
            <article className="patient32-primary-panel">
              <div className="patient32-panel-top">
                <span>{t('dashboard.startLabel')}</span>
              </div>

              <div className="patient32-panel-content">
                <h2>{t('dashboard.checkTitle')}</h2>
                <p>{t('dashboard.checkDescription')}</p>

                <Link
                  to="/symptoms"
                  className="patient32-primary-button"
                >
                  {t('dashboard.checkButton')}
                  <ArrowIcon />
                </Link>
              </div>

              <div className="patient32-panel-footer">
                <span>{t('common.both')}</span>
                <span>{t('dashboard.reviewFirst')}</span>
              </div>
            </article>
          </div>

          <div className="col-12 col-lg-5">
            <article className="patient32-history-panel">
              <div className="patient32-panel-top">
                <span>{t('dashboard.historyLabel')}</span>
              </div>

              <div className="patient32-history-content">
                <h2>{t('dashboard.historyTitle')}</h2>
                <p>{t('dashboard.historyDescription')}</p>
              </div>

              <Link
                to="/history"
                className="patient32-history-link"
              >
                {t('dashboard.historyButton')}
                <ArrowIcon />
              </Link>
            </article>
          </div>
        </div>

        <section
          className="patient32-guide"
          aria-labelledby="patient32-guide-title"
        >
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <p className="patient32-eyebrow">
                {t('dashboard.how')}
              </p>

              <h2 id="patient32-guide-title">
                {t('dashboard.stepsTitle')}
              </h2>

              <p className="patient32-guide-intro">
                {t('dashboard.stepsIntro')}
              </p>
            </div>

            <div className="col-12 col-lg-8">
              <ol className="patient32-steps">
                {[
                  ['dashboard.step1Title', 'dashboard.step1Description'],
                  ['dashboard.step2Title', 'dashboard.step2Description'],
                  ['dashboard.step3Title', 'dashboard.step3Description'],
                ].map(([title, description], index) => (
                  <li key={title}>
                    <span className="patient32-step-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div>
                      <strong>{t(title)}</strong>
                      <p>{t(description)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <aside
          className="patient32-safety"
          aria-label={t('dashboard.safetyLabel')}
        >
          <strong>{t('dashboard.safetyTitle')}</strong>
          <p>{t('dashboard.safetyDescription')}</p>
        </aside>

      </div>
    </section>
  )
}

export default PatientDashboardPage
