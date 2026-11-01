
import { Link } from 'react-router-dom'
import { useSharedText } from '../i18n/sharedTranslations'

function AccessDeniedPage() {
  const t = useSharedText()

  return (
    <section className="access-denied-page">
      <div className="access-denied-card">
        <div className="access-denied-icon" aria-hidden="true">
          !
        </div>

        <span>{t('denied.label')}</span>

        <h1>{t('denied.title')}</h1>

        <p>{t('denied.message')}</p>

        <Link
          to="/dashboard"
          className="button button-primary"
        >
          {t('denied.dashboard')}
        </Link>
      </div>
    </section>
  )
}

export default AccessDeniedPage
