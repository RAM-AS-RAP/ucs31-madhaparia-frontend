
import { useAccessibility } from '../context/useAccessibility'
import { useLanguage } from '../context/useLanguage'

const textSizes = [
  { value: 'normal', labelKey: 'a11y.normal' },
  { value: 'large', labelKey: 'a11y.large' },
  { value: 'extra-large', labelKey: 'a11y.extraLarge' },
  { value: 'huge', labelKey: 'a11y.huge' },
]

const toggles = [
  {
    id: 'highContrast',
    titleKey: 'a11y.highContrast',
    descriptionKey: 'a11y.highContrastDescription',
  },
  {
    id: 'boldText',
    titleKey: 'a11y.boldText',
    descriptionKey: 'a11y.boldTextDescription',
  },
  {
    id: 'reduceMotion',
    titleKey: 'a11y.reduceMotion',
    descriptionKey: 'a11y.reduceMotionDescription',
  },
]

function AccessibilitySettings() {
  const {
    preferences,
    setPreference,
    resetAccessibility,
  } = useAccessibility()

  const { t } = useLanguage()

  return (
    <section
      className="settings-panel accessibility-panel"
      aria-labelledby="accessibility-title"
    >
      <div className="accessibility-heading">
        <h2 id="accessibility-title">{t('a11y.title')}</h2>
        <p className="settings-help">
          {t('a11y.intro')}
        </p>
      </div>

      <fieldset className="accessibility-fieldset">
        <legend>{t('a11y.textSize')}</legend>
        <p className="settings-help">
          {t('a11y.sizeHelp')}
        </p>

        <div className="accessibility-size-options">
          {textSizes.map((option) => (
            <label
              key={option.value}
              className={`accessibility-size-option${
                preferences.textSize === option.value
                  ? ' is-selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="accessibility-text-size"
                value={option.value}
                checked={preferences.textSize === option.value}
                onChange={() =>
                  setPreference('textSize', option.value)
                }
              />
              <span>{t(option.labelKey)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="accessibility-toggles">
        {toggles.map((option) => (
          <label
            key={option.id}
            className="accessibility-toggle-row"
          >
            <span className="accessibility-toggle-copy">
              <strong>{t(option.titleKey)}</strong>
              <small>{t(option.descriptionKey)}</small>
            </span>

            <input
              className="accessibility-switch"
              type="checkbox"
              checked={preferences[option.id]}
              onChange={(event) =>
                setPreference(option.id, event.target.checked)
              }
            />
          </label>
        ))}
      </div>

      <div className="accessibility-actions">
        <button
          type="button"
          className="accessibility-reset"
          onClick={resetAccessibility}
        >
          {t('a11y.reset')}
        </button>
      </div>
    </section>
  )
}

export default AccessibilitySettings
