
import { useTheme } from '../context/useTheme'
import { useLanguage } from '../context/useLanguage'
import AccessibilitySettings from '../components/AccessibilitySettings'

const choices = [
  {
    id: 'default',
    nameKey: 'theme.default',
    descriptionKey: 'theme.defaultDescription',
  },
  {
    id: 'light',
    nameKey: 'theme.light',
    descriptionKey: 'theme.lightDescription',
  },
  {
    id: 'dark',
    nameKey: 'theme.dark',
    descriptionKey: 'theme.darkDescription',
  },
  {
    id: 'system',
    nameKey: 'theme.system',
    descriptionKey: 'theme.systemDescription',
  },
]

function SettingsPage() {
  const { theme, effectiveTheme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <div className="rc-container settings-container">
        <div className="settings-heading">
          <span className="settings-heading-icon" aria-hidden="true">
            ⚙
          </span>

          <div>
            <p className="settings-eyebrow">
              {t('settings.preferences')}
            </p>

            <h1 id="settings-title">{t('settings.title')}</h1>

            <p>{t('settings.intro')}</p>
          </div>
        </div>

        <div className="settings-panel">
          <fieldset className="settings-theme-fieldset">
            <legend>{t('settings.appearance')}</legend>

            <p className="settings-help">
              {t('settings.appearanceHelp')}
            </p>

            <div className="settings-theme-options">
              {choices.map((choice) => (
                <label
                  key={choice.id}
                  className={`settings-theme-option${
                    theme === choice.id ? ' is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={choice.id}
                    checked={theme === choice.id}
                    onChange={() => setTheme(choice.id)}
                  />

                  <span
                    className={`settings-theme-swatch is-${choice.id}`}
                    aria-hidden="true"
                  />

                  <span className="settings-theme-copy">
                    <strong>{t(choice.nameKey)}</strong>
                    <small>{t(choice.descriptionKey)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="settings-preview" aria-live="polite">
          <span className="settings-preview-mark" aria-hidden="true">
            ✓
          </span>

          <div>
            <strong>
              {t('settings.themeLabel', {
                name: t(
                  choices.find((choice) => choice.id === theme)?.nameKey
                ),
              })}
            </strong>

            <p>
              {theme === 'system'
                ? t('settings.followSystem', {
                    mode: t(
                      effectiveTheme === 'dark'
                        ? 'theme.dark'
                        : 'theme.light'
                    ),
                  })
                : t('settings.themeApplied')}
            </p>
          </div>
        </div>

        <div className="settings-panel settings-language-panel">
          <fieldset className="settings-theme-fieldset">
            <legend>{t('settings.language')}</legend>

            <p className="settings-help">
              {t('settings.languageHelp')}
            </p>

            <div className="settings-theme-options">
              {['en', 'sw'].map((code) => (
                <label
                  key={code}
                  className={`settings-theme-option${
                    language === code ? ' is-selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="interface-language"
                    value={code}
                    checked={language === code}
                    onChange={() => setLanguage(code)}
                  />

                  <span className="settings-theme-copy">
                    <strong>{t(`language.${code}`)}</strong>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <AccessibilitySettings />
      </div>
    </section>
  )
}

export default SettingsPage
