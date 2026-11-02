import { Link } from 'react-router-dom'

import { useLanguage } from '../context/useLanguage'

const messages = {
  en: {
    saving: 'Saving this safety review to your history...',
    saved: 'This safety review has been saved to your history.',
    error:
      'Your safety guidance is still valid, but this review could not be saved to your history.',
    retry: 'Retry saving review',
    view: 'View saved review',
  },
  sw: {
    saving: 'Inahifadhi tathmini hii ya usalama katika historia yako...',
    saved: 'Tathmini hii ya usalama imehifadhiwa katika historia yako.',
    error:
      'Mwongozo wa usalama bado unatumika, lakini tathmini hii haikuweza kuhifadhiwa katika historia yako.',
    retry: 'Jaribu kuhifadhi tena',
    view: 'Angalia tathmini iliyohifadhiwa',
  },
}

function UrgentReviewSaveStatus({ state, onRetry }) {
  const { language } = useLanguage()
  const text = messages[language] || messages.en

  if (state.status === 'idle') return null

  return (
    <div
      className={`sym33-alert${
        state.status === 'error' ? ' sym33-alert-warning' : ''
      }`}
      role={state.status === 'error' ? 'alert' : 'status'}
    >
      <p>{text[state.status]}</p>

      {state.status === 'error' && (
        <button
          type="button"
          className="button button-secondary"
          onClick={onRetry}
        >
          {text.retry}
        </button>
      )}

      {state.status === 'saved' && (
        <Link
          className="button button-secondary"
          to={`/history/${encodeURIComponent(state.predictionId)}`}
        >
          {text.view}
        </Link>
      )}
    </div>
  )
}

export default UrgentReviewSaveStatus