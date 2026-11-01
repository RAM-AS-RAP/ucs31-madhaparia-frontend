
import { Link } from 'react-router-dom'
import { useSharedText } from '../i18n/sharedTranslations'

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <path
        d="M7 8.5h18a2.5 2.5 0 0 1 2.5 2.5v11a2.5 2.5 0 0 1-2.5 2.5H14l-7 4v-4A2.5 2.5 0 0 1 4.5 22V11A2.5 2.5 0 0 1 7 8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 15h12M10 19h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <rect
        x="5"
        y="5"
        width="22"
        height="22"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m10.5 16 4 4 7-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
      <circle
        cx="16"
        cy="16"
        r="11"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m20.8 11.2-3 6.6-6.6 3 3-6.6 6.6-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SymptomIllustration() {
  const t = useSharedText()

  return (
    <figure className="hp-visual m-0">
      <div className="hp-visual-frame">
        <svg
          className="hp-illustration"
          viewBox="0 0 580 490"
          fill="none"
          role="img"
          aria-labelledby="hp-illustration-title hp-illustration-description"
        >
          <title id="hp-illustration-title">
            {t('home.visualTitle')}
          </title>

          <desc id="hp-illustration-description">
            {t('home.visualDescription')}
          </desc>

          <circle cx="476" cy="77" r="48" fill="#EDE3F5" />
          <circle cx="70" cy="414" r="35" fill="#F4EDF8" />

          <path
            d="M448 40v24M436 52h24"
            stroke="#70549A"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          <path
            d="M85 395l7 7 12-15"
            stroke="#70549A"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <rect
            x="43"
            y="89"
            width="494"
            height="322"
            rx="22"
            fill="white"
            stroke="#DED6E8"
            strokeWidth="2"
          />

          <path
            d="M43 149h494"
            stroke="#DED6E8"
            strokeWidth="2"
          />

          <rect
            x="69"
            y="111"
            width="22"
            height="22"
            rx="6"
            fill="#70549A"
          />

          <path
            d="M80 116v12M74 122h12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <text
            x="102"
            y="127"
            fill="#2D2933"
            fontSize="18"
            fontWeight="700"
          >
            {t('home.symptomUnderstanding')}
          </text>

          <circle cx="498" cy="120" r="4" fill="#A78BC7" />
          <circle cx="514" cy="120" r="4" fill="#DED6E8" />

          <text
            x="75"
            y="183"
            fill="#70549A"
            fontSize="13"
            fontWeight="700"
            letterSpacing="1.2"
          >
            {t('home.yourWords')}
          </text>

          <path
            d="M88 204h348a13 13 0 0 1 13 13v68a13 13 0 0 1-13 13H162l-18 17v-17H88a13 13 0 0 1-13-13v-68a13 13 0 0 1 13-13Z"
            fill="#F4EDF8"
            stroke="#DED6E8"
            strokeWidth="1.4"
          />

          <text
            x="96"
            y="242"
            fill="#2D2933"
            fontSize="19"
            fontWeight="600"
          >
            “I have fever na kikohozi
          </text>

          <text
            x="96"
            y="270"
            fill="#2D2933"
            fontSize="19"
            fontWeight="600"
          >
            and I feel tired.”
          </text>

          <path
            d="M461 241h37M486 230l12 11-12 11"
            stroke="#70549A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <text
            x="75"
            y="350"
            fill="#70549A"
            fontSize="13"
            fontWeight="700"
            letterSpacing="1.2"
          >
            {t('home.recognisedReview')}
          </text>

          <rect
            x="75"
            y="361"
            width="105"
            height="32"
            rx="8"
            fill="#EDE3F5"
          />

          <rect
            x="190"
            y="361"
            width="108"
            height="32"
            rx="8"
            fill="#EDE3F5"
          />

          <rect
            x="308"
            y="361"
            width="109"
            height="32"
            rx="8"
            fill="#EDE3F5"
          />

          <text x="106" y="382" fill="#5D427F" fontSize="15" fontWeight="700">
            {t('home.fever')}
          </text>

          <text x="221" y="382" fill="#5D427F" fontSize="15" fontWeight="700">
            {t('home.cough')}
          </text>

          <text x="334" y="382" fill="#5D427F" fontSize="15" fontWeight="700">
            {t('home.fatigue')}
          </text>

          <circle cx="499" cy="376" r="20" fill="#70549A" />

          <path
            d="m490 376 6 6 12-13"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Readable example on smaller screens */}
        <div className="hp-mobile-example">
          <div className="hp-mobile-example-header">
            <span
              className="hp-mobile-example-mark"
              aria-hidden="true"
            >
              +
            </span>

            <strong>
              {t('home.symptomUnderstanding')}
            </strong>
          </div>

          <div className="hp-mobile-example-body">
            <p className="hp-mobile-example-label">
              {t('home.yourWords')}
            </p>

            <p className="hp-mobile-example-words">
              “I have fever na kikohozi and I feel tired.”
            </p>

            <p className="hp-mobile-example-label">
              {t('home.recognisedReview')}
            </p>

            <div className="hp-mobile-example-tags">
              <span>{t('home.fever')}</span>
              <span>{t('home.cough')}</span>
              <span>{t('home.fatigue')}</span>
            </div>

            <p className="hp-mobile-example-note">
              {t('home.mobileReview')}
            </p>
          </div>
        </div>
      </div>

      <figcaption className="hp-visual-caption">
        {t('home.visualCaption')}
      </figcaption>
    </figure>
  )
}

function HomePage() {
  const t = useSharedText()

  const steps = [
    {
      id: 1,
      title: t('home.step1'),
      description: t('home.step1Text'),
      icon: <MessageIcon />,
    },
    {
      id: 2,
      title: t('home.step2'),
      description: t('home.step2Text'),
      icon: <CheckIcon />,
    },
    {
      id: 3,
      title: t('home.step3'),
      description: t('home.step3Text'),
      icon: <CompassIcon />,
    },
  ]

  return (
    <>
      {/* Hero */}
      <section
        className="hp-hero"
        aria-labelledby="hp-heading"
      >
        <div className="rc-container">
          <div className="row align-items-center gx-xl-5 gy-5">
            <div className="col-12 col-lg-7">
              <div className="hp-hero-copy">
                <p className="hp-kicker">
                  {t('home.eyebrow')}
                </p>

                <h1 id="hp-heading">
                  {t('home.title1')}
                  <span> {t('home.title2')}</span>
                </h1>

                <p className="hp-lead">
                  {t('home.intro')}
                </p>

                <div className="hp-actions d-flex flex-wrap align-items-center gap-3">
                  <Link
                    to="/register"
                    className="btn btn-primary hp-primary-action"
                  >
                    {t('home.start')}
                    <ArrowIcon />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="hp-secondary-action"
                  >
                    {t('home.seeHow')}
                    <span aria-hidden="true">↓</span>
                  </a>
                </div>

                <div
                  className="hp-supporting-points"
                  aria-label={t('home.features')}
                >
                  <span>{t('home.languages')}</span>
                  <span>{t('home.reviewFirst')}</span>
                  <span>{t('home.onePrediction')}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <SymptomIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="hp-process"
        id="how-it-works"
        aria-labelledby="hp-process-heading"
      >
        <div className="rc-container">
          <div className="row align-items-end gy-3 hp-process-intro">
            <div className="col-12 col-lg-7">
              <p className="hp-section-kicker">
                {t('home.how')}
              </p>

              <h2 id="hp-process-heading">
                {t('home.processTitle')}
              </h2>
            </div>

            <div className="col-12 col-lg-5">
              <p className="hp-section-description">
                {t('home.processIntro')}
              </p>
            </div>
          </div>

          <div className="row g-4 hp-process-grid">
            {steps.map((step) => (
              <div
                className="col-12 col-lg-4"
                key={step.id}
              >
                <article className="hp-step h-100">
                  <div className="hp-step-top">
                    <span className="hp-step-icon">
                      {step.icon}
                    </span>

                    <span className="hp-step-number">
                      {String(step.id).padStart(2, '0')} / 03
                    </span>
                  </div>

                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety information */}
      <section
        className="hp-safety"
        aria-labelledby="hp-safety-heading"
      >
        <div className="rc-container">
          <div className="row align-items-start gx-xl-5 gy-4">
            <div className="col-12 col-lg-5">
              <p className="hp-section-kicker">
                {t('home.important')}
              </p>

              <h2 id="hp-safety-heading">
                {t('home.safetyTitle')}
              </h2>
            </div>

            <div className="col-12 col-lg-7">
              <div className="hp-safety-copy">
                <p>{t('home.safety1')}</p>
                <p>{t('home.safety2')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
