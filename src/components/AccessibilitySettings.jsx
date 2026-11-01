
import { useAccessibility } from '../context/useAccessibility'

const textSizes = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'extra-large', label: 'Extra Large' },
  { value: 'huge', label: 'Huge' },
]

const toggles = [
  {
    id: 'highContrast',
    title: 'High Contrast Mode',
    description: 'Use stronger colours and clearer borders.',
  },
  {
    id: 'boldText',
    title: 'Bold Text',
    description: 'Make interface text thicker and easier to read.',
  },
  {
    id: 'reduceMotion',
    title: 'Reduce Motion',
    description: 'Minimise animations and visual transitions.',
  },
]

function AccessibilitySettings() {
  const {
    preferences,
    setPreference,
    resetAccessibility,
  } = useAccessibility()

  return (
    <section
      className="settings-panel accessibility-panel"
      aria-labelledby="accessibility-title"
    >
      <div className="accessibility-heading">
        <h2 id="accessibility-title">Accessibility</h2>
        <p className="settings-help">
          Adjust text, contrast and motion to suit your needs.
        </p>
      </div>

      <fieldset className="accessibility-fieldset">
        <legend>Text Size</legend>
        <p className="settings-help">
          Choose a comfortable reading size.
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
              <span>{option.label}</span>
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
              <strong>{option.title}</strong>
              <small>{option.description}</small>
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
          Reset accessibility settings
        </button>
      </div>
    </section>
  )
}

export default AccessibilitySettings
