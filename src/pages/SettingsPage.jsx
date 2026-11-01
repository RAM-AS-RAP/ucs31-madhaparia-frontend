
import { useTheme } from '../context/useTheme'
import AccessibilitySettings from '../components/AccessibilitySettings'

const choices = [
  {
    id: 'default',
    name: 'Default Purple',
    description: 'The original lavender appearance.',
  },
  {
    id: 'light',
    name: 'Light',
    description: 'A bright, cool colour scheme.',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Darker backgrounds for comfortable viewing.',
  },
  {
    id: 'system',
    name: 'System',
    description: 'Automatically match your device settings.',
  },
]

function SettingsPage() {
  const { theme, effectiveTheme, setTheme } = useTheme()

  return (
    <section className="settings-page" aria-labelledby="settings-title">
      <div className="rc-container settings-container">
        <div className="settings-heading">
          <span className="settings-heading-icon" aria-hidden="true">⚙</span>
          <div>
            <p className="settings-eyebrow">Personal preferences</p>
            <h1 id="settings-title">Settings</h1>
            <p>Choose how the application looks to you.</p>
          </div>
        </div>

        <div className="settings-panel">
          <fieldset className="settings-theme-fieldset">
            <legend>Appearance</legend>
            <p className="settings-help">
              Your choice applies throughout the app and is remembered
              on this browser for your account.
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
                    <strong>{choice.name}</strong>
                    <small>{choice.description}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="settings-preview" aria-live="polite">
          <span className="settings-preview-mark" aria-hidden="true">✓</span>
          <div>
            <strong>
              Theme: {choices.find((choice) => choice.id === theme)?.name}
            </strong>
            <p>
              {theme === 'system'
                ? `Following your device (${effectiveTheme} appearance).`
                : 'Your appearance preference is applied.'}
            </p>
          </div>
        </div>
        <AccessibilitySettings />
      </div>
    </section>
  )
}

export default SettingsPage
