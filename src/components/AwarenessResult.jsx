import { useLanguage } from '../context/useLanguage'
import { usePredictionText } from '../i18n/predictionTranslations'

export default function AwarenessResult({ result, admin = false }) {
  const { language } = useLanguage()
  const t = usePredictionText()
  const sw = language === 'sw'
  const a = result?.assessment
  if (a?.contract_version !== 2) return null
  const urgent = result.status === 'urgent_review' || a.status === 'urgent_review'
  const pattern = !urgent && result.status === 'research_pattern' ? a.research_pattern : null
  const score = pattern?.comparison_score_percent
  const showScore = typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100
  // Older saved results have observations but no testing-advice flag.
  const suggestCovidTest = !urgent && (a.covid_testing_recommended ?? (a.observations || []).some((s) =>
    ['taste_change', 'loss_of_smell'].includes(s.code) && s.status === 'present' && s.confirmed === true && s.reported_subject !== 'other_person'))
  const state = (s) => ({ present: sw ? 'Ipo' : 'Present', absent: sw ? 'Haipo' : 'Denied', unknown: sw ? 'Haijulikani' : 'Uncertain' }[s] || s)
  return (
    <section className={urgent ? 'pred34-urgent-result' : undefined} role={urgent ? 'alert' : 'status'} aria-labelledby="awareness-result-title">
      <div className={urgent ? undefined : 'pred34-result-intro'}>
        <p className="pred34-kicker">{t(urgent ? 'urgent' : 'analysisComplete')}</p>
        <h2 id="awareness-result-title">{urgent ? (sw ? 'Tafuta huduma haraka' : 'Urgent medical assessment') : t('resultTitle')}</h2>
        <p>{urgent
          ? (sw ? 'Dalili ulizoripoti zinahitaji tathmini ya kitabibu haraka.' : 'Your reported symptoms need prompt medical assessment.')
          : pattern
            ? (showScore
              ? (sw ? 'Dalili zako zinafanana na muundo mmoja unaowezekana.' : 'Your symptoms matched one possible pattern.')
              : (sw ? 'Dalili zako zinafanana na muundo mmoja unaowezekana. Huu si utambuzi wa ugonjwa.' : 'Your symptoms matched one possible pattern. This is not a diagnosis.'))
            : (sw ? 'Taarifa zilizopo hazitoshi kuonyesha muundo wa ugonjwa kwa uhakika.' : 'There is not enough reliable information to show a condition pattern.')}</p>
      </div>
      <div className="row g-4">
        <div className={admin ? 'col-12 col-lg-8' : 'col-12'}>
          <section className="pred34-condition-panel" aria-labelledby="awareness-condition-title">
            {pattern ? <>
              <div className="pred34-condition-top"><div>
                <p className="pred34-kicker">{sw ? 'Muundo wa dalili unaowezekana' : 'Possible symptom pattern'}</p>
                <h3 id="awareness-condition-title">{pattern.display_name}</h3>
              </div>
              {showScore && <div className="pred34-confidence-value">
                <strong>{score.toFixed(2)}%</strong>
                <span>{sw ? 'Alama ya ulinganisho wa dalili' : 'Symptom comparison score'}</span>
              </div>}
              </div>
              <p className="pred34-condition-description">{pattern.description}</p>
              {showScore && <p className="pred34-score-explanation">{sw
                ? 'Alama hii husaidia kulinganisha mifumo inayowezekana kwa dalili ulizoripoti. Si uwezekano wa kuwa na ugonjwa huu wala utambuzi.'
                : 'This score helps compare possible patterns for the symptoms you reported. It is not your chance of having this illness or a diagnosis.'}</p>}
            </> : <div className="pred34-no-condition">
              <h3 id="awareness-condition-title">{urgent ? t('urgent') : (sw ? 'Tathmini ya dalili — sababu haijathibitishwa' : 'Symptom assessment — cause not established')}</h3>
              <p>{urgent
                ? (sw ? 'Tafuta ushauri wa kitabibu haraka.' : 'Seek medical care promptly.')
                : (sw ? 'Ikiwa dalili zinaendelea au zinazidi, zungumza na mtaalamu wa afya.' : 'If symptoms continue or worsen, speak with a healthcare professional.')}</p>
            </div>}
      {suggestCovidTest && (
        <section className="pred34-warning" aria-labelledby="covid-testing-title">
          <h3 id="covid-testing-title">{sw ? 'COVID-19 inawezekana — pima' : 'COVID-19 is possible — take a test'}</h3>
          <p>{sw
            ? 'Mabadiliko ya ladha au harufu yanaweza kuwa na sababu nyingi. Pima COVID-19 na utafute ushauri wa kitabibu ikiwa dalili zinaendelea au zinazidi.'
            : 'Taste or smell changes can have several causes. Take a COVID-19 test and seek medical advice if symptoms persist or worsen.'}</p>
        </section>
      )}
      <details className="pred34-optional-detail">
      <summary>{sw ? 'Taarifa zilizohifadhiwa' : 'Your recorded information'}</summary>
      <ul className="mt-3">
        {(a.observations || []).map((s) => (
          <li key={s.code}>
            <strong>{s.display_name}</strong>: {state(s.status)}
            {s.reported_subject === 'other_person' && (sw ? ' — mtu mwingine' : ' — another person')}
            {s.status === 'present' && s.confirmed === false && (sw ? ' — haijathibitishwa' : ' — not confirmed')}
            {s.taste_detail && ` (${s.taste_detail})`}
            {s.duration_text && ` — ${s.duration_text}`}
            {s.duration_min_days != null && ` (${s.duration_min_days} ${sw ? 'siku' : 'days'})`}
            {s.duration_unit === 'unknown' && (sw ? ' — muda hauna uhakika' : ' — duration uncertain')}
            {s.duration_approximate && (sw ? ' — takriban' : ' — approximate duration')}
          </li>
        ))}
      </ul>
      </details>
      {a.covid_test_context && !urgent && <p role="note"><strong>{sw ? 'Kipimo cha COVID kilichoripotiwa' : 'Reported COVID test'}:</strong>{' '}
        {(sw ? { positive: 'Chanya', negative: 'Hasi', unknown: 'Sina uhakika', not_tested: 'Sijapima' } : { positive: 'Positive', negative: 'Negative', unknown: 'Not sure', not_tested: 'Not tested' })[a.covid_test_context.result]}
        {a.covid_test_context.test_type && a.covid_test_context.test_type !== 'unknown' && ` (${a.covid_test_context.test_type})`}
        {' — '}{sw ? 'taarifa ulizotoa.' : 'information you provided.'}
      </p>}
      {pattern?.condition === 'Influenza' && a.flu_scope && <details className="pred34-optional-detail"><summary>{sw ? 'Kuhusu influenza na mafua' : 'What does FLU(influenza) mean?'}</summary><p>{sw ? 'Dalili pekee haziwezi kutambua aina maalumu ya virusi vya influenza. Mafua ya kawaida ni tofauti.' : 'Symptoms alone cannot identify a specific influenza type. The common cold is different.'}</p></details>}
          </section>
        </div>
        {admin && <div className="col-12 col-lg-4">
          <aside className="pred34-confidence-note" aria-labelledby="awareness-reading-title">
            <p className="pred34-kicker">{t('readingResult')}</p>
            <h3 id="awareness-reading-title">{sw ? 'Kuhusu tathmini hii' : 'About this assessment'}</h3>
            <p>{a.limitations}</p>
      <p><small>{sw ? 'Modeli ya utafiti' : 'Research model'}: {a.model_version || 'bypassed'} · {a.policy_id}</small></p>
      {a.provenance && <details><summary>{sw ? 'Ufuatiliaji na mipaka ya tathmini' : 'Assessment provenance and limitations'}</summary><p>{sw ? 'Muda na ladha hazikutumika katika alama za modeli hii. Uhakiki wa kitabibu na wa lugha bado unasubiriwa.' : 'Duration and taste were not disease-score inputs. Clinical and language review remain pending.'}</p><dl style={{ overflowWrap: 'anywhere' }}><dt>Model SHA-256</dt><dd>{a.provenance.model_sha256 || 'bypassed'}</dd><dt>Schema</dt><dd>{a.provenance.schema_id} · {a.provenance.schema_sha256}</dd><dt>Mapping</dt><dd>{a.provenance.mapping?.mapping_id} · {a.provenance.mapping?.catalogue_sha256}</dd><dt>Policy SHA-256</dt><dd>{a.provenance.policy_sha256 || 'withheld'}</dd><dt>Guidance</dt><dd>{a.provenance.guidance_version} · {a.provenance.guidance_sha256}</dd></dl></details>}
      {Array.isArray(a.research_rankings) && a.research_rankings.length > 0 && (
        <details>
          <summary>Research-only ranking — not patient diagnoses or disease probabilities</summary>
          <ol>{a.research_rankings.map((r) => <li key={r.condition}>{r.condition === 'Influenza' ? 'FLU(influenza)' : r.condition}: dataset-relative score {Number(r.raw_relative_score).toFixed(4)}</li>)}</ol>
          <p>Scores are from simulated data; not local population prevalence. Duration and taste were not model inputs.</p>
        </details>
      )}
          </aside>
        </div>}
      </div>
      <section className="pred34-guidance" aria-labelledby="awareness-guidance-title">
        <h3 id="awareness-guidance-title">{t('nextSteps')}</h3>
        <ul>{(a.next_steps || []).filter((step) => (urgent || !step.includes('COVID')) && (admin || !/\bmodel\b|\bmodeli\b/i.test(step))).map((step) => <li key={step}>{step}</li>)}</ul>
      </section>
      {!urgent && !admin && <details className="pred34-optional-detail pred34-about-result">
        <summary>{sw ? 'Kuhusu matokeo haya' : 'About this result'}</summary>
        <p>{sw
          ? 'Ulinganisho huu ulitathminiwa kwa data za utafiti zilizotengenezwa. Haujaridhiwa kuthibitisha ugonjwa wa mtu. Dalili ambazo hukutaja zinabaki hazijulikani. Muda wa dalili na mabadiliko ya ladha havikubadilisha alama.'
          : 'This comparison was evaluated using simulated research data. It has not been validated to confirm illness in patients. Symptoms you did not mention remain unknown. Duration and taste changes did not change the score.'}</p>
      </details>}
    </section>
  )
}
