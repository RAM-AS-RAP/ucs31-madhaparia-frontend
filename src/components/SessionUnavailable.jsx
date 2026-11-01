
import { useSharedText } from '../i18n/sharedTranslations'

function SessionUnavailable({ message, onRetry }) {
  const t = useSharedText()

  return (
    <div className="auth-loading-page">
      <p role="alert">{message}</p>

      <button
        type="button"
        className="button button-primary"
        onClick={onRetry}
      >
        {t('route.retry')}
      </button>
    </div>
  )
}

export default SessionUnavailable
