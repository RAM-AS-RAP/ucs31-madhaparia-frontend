import { Link } from 'react-router-dom'
import { useLanguage } from '../context/useLanguage'

const copy = {
  en: {
    eyebrow: 'About RespiraCare',
    title: 'Understand your result',
    intro: 'RespiraCare helps you review respiratory symptoms and decide what to do next. It provides health information, not a medical diagnosis.',
    howTitle: 'How a symptom check works',
    steps: [
      ['Describe', 'Tell us how you feel in English, Kiswahili, or both.'],
      ['Review', 'Check the symptoms we understood. Correct anything that is wrong before continuing.'],
      ['See guidance', 'You may see a possible symptom pattern, or be told that more information is needed. Urgent warning signs take priority.'],
    ],
    scoreTitle: 'What a result means',
    score: 'If a condition and a symptom comparison score appear, the score describes how strongly your reported symptoms matched that research pattern. It is not the chance that you have the condition.',
    withheld: 'A result with no condition does not mean that nothing is wrong. It means the information available did not support showing a condition.',
    limitsTitle: 'Important limits',
    limits: 'RespiraCare covers a limited set of respiratory conditions. Its condition comparisons were evaluated using simulated research records and have not been clinically validated to diagnose people. Symptoms you did not report remain unknown. Symptom duration and changes in taste do not change the comparison score.',
    urgentTitle: 'When to seek care',
    urgent: 'Seek medical help promptly if you cough up blood or have other urgent warning signs. If you have severe breathing difficulty, severe chest pain, or rapidly worsening symptoms, seek emergency care. Do not wait for an online result.',
    help: 'You can stop a symptom check at any time. If symptoms persist, worsen, or concern you, speak with a qualified healthcare professional.',
    start: 'Start a symptom check',
    home: 'Back to home',
  },
  sw: {
    eyebrow: 'Kuhusu RespiraCare',
    title: 'Elewa matokeo yako',
    intro: 'RespiraCare hukusaidia kupitia dalili za mfumo wa upumuaji na kuamua hatua inayofuata. Inatoa taarifa za afya, si utambuzi wa kitabibu.',
    howTitle: 'Jinsi ukaguzi wa dalili unavyofanya kazi',
    steps: [
      ['Eleza', 'Eleza unavyojisikia kwa Kiingereza, Kiswahili, au lugha zote mbili.'],
      ['Pitia', 'Hakikisha dalili tulizoelewa ni sahihi. Sahihisha makosa kabla ya kuendelea.'],
      ['Pata mwongozo', 'Unaweza kuona muundo wa dalili unaowezekana, au kuambiwa kuwa taarifa zaidi zinahitajika. Ishara za hatari hupewa kipaumbele.'],
    ],
    scoreTitle: 'Maana ya matokeo',
    score: 'Ikiwa hali ya afya na alama ya ulinganisho wa dalili zinaonekana, alama hiyo inaonyesha jinsi dalili ulizoripoti zilivyofanana na muundo wa utafiti. Si uwezekano wa kuwa na hali hiyo.',
    withheld: 'Kutokuonyesha hali ya afya hakumaanishi kuwa hakuna tatizo. Inamaanisha taarifa zilizopo hazikutosha kuonyesha hali hiyo.',
    limitsTitle: 'Mipaka muhimu',
    limits: 'RespiraCare inahusu baadhi tu ya hali za mfumo wa upumuaji. Ulinganisho wake ulitathminiwa kwa rekodi za utafiti zilizoigwa na haujathibitishwa kitabibu kutambua magonjwa kwa watu. Dalili ambazo hukutaja zinabaki hazijulikani. Muda wa dalili na mabadiliko ya ladha havibadilishi alama ya ulinganisho.',
    urgentTitle: 'Wakati wa kutafuta huduma',
    urgent: 'Tafuta msaada wa kitabibu haraka ikiwa unakohoa damu au una ishara nyingine za hatari. Ikiwa una shida kubwa ya kupumua, maumivu makali ya kifua, au dalili zinazozidi haraka, tafuta huduma ya dharura. Usisubiri matokeo ya mtandaoni.',
    help: 'Unaweza kusitisha ukaguzi wa dalili wakati wowote. Dalili zikiendelea, zikizidi, au zikikuhangaisha, zungumza na mtaalamu wa afya.',
    start: 'Anza ukaguzi wa dalili',
    home: 'Rudi mwanzo',
  },
}

export default function AboutPage() {
  const { language } = useLanguage()
  const text = copy[language] || copy.en

  return (
    <section className="about-page rc-container" aria-labelledby="about-title">
      <header className="about-page-hero">
        <p className="about-page-eyebrow">{text.eyebrow}</p>
        <h1 id="about-title">{text.title}</h1>
        <p>{text.intro}</p>
      </header>

      <section className="about-page-section" aria-labelledby="about-how">
        <h2 id="about-how">{text.howTitle}</h2>
        <ol className="about-page-steps">
          {text.steps.map(([title, description], index) => (
            <li key={title}>
              <span className="about-page-step-number" aria-hidden="true">{index + 1}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <div className="about-page-grid">
        <section className="about-page-section" aria-labelledby="about-score">
          <h2 id="about-score">{text.scoreTitle}</h2>
          <p>{text.score}</p>
          <p>{text.withheld}</p>
        </section>
        <section className="about-page-section" aria-labelledby="about-limits">
          <h2 id="about-limits">{text.limitsTitle}</h2>
          <p>{text.limits}</p>
        </section>
      </div>

      <section className="about-page-urgent" aria-labelledby="about-urgent">
        <h2 id="about-urgent">{text.urgentTitle}</h2>
        <p>{text.urgent}</p>
        <p>{text.help}</p>
      </section>

      <div className="about-page-actions">
        <Link className="button button-primary" to="/symptoms">{text.start}</Link>
        <Link className="button button-secondary" to="/">{text.home}</Link>
      </div>
    </section>
  )
}
