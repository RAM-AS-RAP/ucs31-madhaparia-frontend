
import { Link } from 'react-router-dom'
import { useSharedText } from '../i18n/sharedTranslations'

function NotFoundPage() {
  const t = useSharedText()

  return (
    <section className="not-found-page">
      <div className="not-found-content">
        <span>404</span>

        <h1>{t('notFound.title')}</h1>

        <p>{t('notFound.message')}</p>

        <Link
          to="/"
          className="button button-primary"
        >
          {t('notFound.home')}
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
