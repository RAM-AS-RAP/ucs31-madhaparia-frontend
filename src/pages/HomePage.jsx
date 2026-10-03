import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="eyebrow">
              Smart respiratory health awareness
            </div>

            <h1>
              Understand your
              <span> respiratory symptoms </span>
              with greater clarity.
            </h1>

            <p className="hero-description">
              RespiraCare helps you describe your symptoms,
              understand recognised respiratory patterns and
              receive clear health-awareness guidance.
            </p>

            <div className="hero-actions">
              <Link
                to="/register"
                className="button button-primary button-large"
              >
                Check your symptoms
              </Link>

              <a
                href="#how-it-works"
                className="button button-secondary button-large"
              >
                How it works
              </a>
            </div>

            <div className="hero-trust">
              <div>
                <strong>English</strong>
                <span>Supported</span>
              </div>

              <div>
                <strong>Kiswahili</strong>
                <span>Supported</span>
              </div>

              <div>
                <strong>Private</strong>
                <span>Patient history</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="health-card">
              <div className="health-card-header">
                <div>
                  <span className="status-dot" />
                  Health awareness assistant
                </div>

                <span className="status-badge">
                  Ready
                </span>
              </div>

              <div className="mock-input">
                <span>Symptoms</span>

                <p>
                  I have fever na kikohozi and I feel tired...
                </p>
              </div>

              <div className="symptom-tags">
                <span>Fever</span>
                <span>Cough</span>
                <span>Fatigue</span>
              </div>

              <div className="mock-result">
                <div className="mock-result-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Symptoms recognised
                  </strong>

                  <p>
                    Review and confirm your symptoms before
                    continuing.
                  </p>
                </div>
              </div>

              <div className="mock-progress">
                <div className="progress-step active">
                  1
                </div>

                <span />

                <div className="progress-step">
                  2
                </div>

                <span />

                <div className="progress-step">
                  3
                </div>
              </div>

              <div className="progress-labels">
                <span>Describe</span>
                <span>Confirm</span>
                <span>Understand</span>
              </div>
            </div>

            <div className="floating-card floating-card-top">
              <div className="floating-icon">
                24/7
              </div>

              <div>
                <strong>Available anytime</strong>
                <span>Health awareness support</span>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <div className="floating-icon">
                3
              </div>

              <div>
                <strong>Top patterns</strong>
                <span>Clear explanations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="how-it-works"
      >
        <div className="container">
          <div className="section-heading">
            <span>How it works</span>

            <h2>
              A simple path from symptoms to awareness.
            </h2>

            <p>
              RespiraCare guides you through each stage instead
              of overwhelming you with medical information.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">
                01
              </div>

              <h3>
                Describe your symptoms
              </h3>

              <p>
                Enter symptoms naturally in English, Kiswahili
                or a mixture of both.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">
                02
              </div>

              <h3>
                Review and confirm
              </h3>

              <p>
                RespiraCare recognises symptom wording and lets
                you confirm what it understood.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">
                03
              </div>

              <h3>
                Receive awareness guidance
              </h3>

              <p>
                View possible condition patterns, confidence
                information and appropriate health guidance.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="safety-section">
        <div className="container safety-card">
          <div className="safety-icon">
            !
          </div>

          <div>
            <span className="safety-label">
              Designed with safety in mind
            </span>

            <h2>
              Awareness, not diagnosis.
            </h2>

            <p>
              RespiraCare is an educational health-awareness
              system. Results do not replace assessment,
              diagnosis or treatment from a qualified
              healthcare professional.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage