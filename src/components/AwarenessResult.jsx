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
  // Older saved results have observations but no testing-advice flag.
  const suggestCovidTest = !urgent && (a.covid_testing_recommended ?? (a.observations || []).some((s) =>
    ['taste_change', 'loss_of_smell'].includes(s.code) && s.status === 'present' && s.confirmed === true && s.reported_subject !== 'other_person'))
  const state = (s) => ({ present: sw ? 'Ipo' : 'Present', absent: sw ? 'Haipo' : 'Denied', unknown: sw ? 'Haijulikani' : 'Uncertain' }[s] || s)
  return (
    <section className={urgent ? 'pred34-urgent-result' : undefined} role={urgent ? 'alert' : 'status'} aria-labelledby="awareness-result-title">
      <div className={urgent ? undefined : 'pred34-result-intro'}>
        <p className="pred34-kicker">{t(urgent ? 'urgent' : 'analysisComplete')}</p>
        <h2 id="awareness-result-title">{urgent ? (sw ? 'Tafuta huduma haraka' : 'Urgent medical assessment') : t('resultTitle')}</h2>
        <p>{a.summary}</p>
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <section className="pred34-condition-panel" aria-labelledby="awareness-condition-title">
            {pattern ? <>
              <div className="pred34-condition-top"><div>
                <p className="pred34-kicker">{sw ? 'Mfumo wa utafiti unaowezekana — si utambuzi' : 'Tentative research pattern — not a diagnosis'}</p>
                <h3 id="awareness-condition-title">{pattern.display_name}</h3>
              </div></div>
              <p className="pred34-condition-description">{pattern.description}</p>
              <p className="pred34-condition-description">{sw ? 'Ulinganisho huu umetathminiwa kwa data za kutengenezwa, si uthibitisho wa ugonjwa wako.' : 'This comparison was evaluated on simulated source data. It does not establish that you have this illness.'}</p>
            </> : <div className="pred34-no-condition">
              <h3 id="awareness-condition-title">{urgent ? t('urgent') : (sw ? 'Tathmini ya dalili — sababu haijathibitishwa' : 'Symptom assessment — cause not established')}</h3>
              <p>{t(urgent ? 'urgentNote' : 'noConditionNote')}</p>
            </div>}
      {suggestCovidTest && (
        <section className="pred34-warning" aria-labelledby="covid-testing-title">
          <h3 id="covid-testing-title">{sw ? 'COVID-19 inawezekana — pima' : 'COVID-19 is possible — take a test'}</h3>
          <p>{a.covid_testing_advice || (sw
            ? 'COVID-19 ni mojawapo ya sababu zinazowezekana za mabadiliko ya ladha au harufu uliyoripoti. Pima COVID-19 na utafute ushauri wa kitabibu ikiwa dalili zinaendelea au zinazidi. Hali nyingine pia zinaweza kusababisha mabadiliko haya; huu ni ushauri wa kupima, si utambuzi wa COVID-19.'
            : 'COVID-19 is one possible cause of your reported taste or smell change. Take a COVID-19 test and seek medical advice if symptoms persist or worsen. Other conditions can cause these changes too; this is a testing recommendation, not a COVID-19 diagnosis.')}</p>
        </section>
      )}
      <details className="mt-4" open>
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
            {s.context_only && (sw ? ' — muktadha tu' : ' — context only')}
          </li>
        ))}
      </ul>
      </details>
      {a.covid_test_context && !urgent && <p role="note"><strong>{sw ? 'Kipimo cha COVID kilichoripotiwa' : 'Reported COVID test'}:</strong>{' '}
        {(sw ? { positive: 'Chanya', negative: 'Hasi', unknown: 'Sina uhakika', not_tested: 'Sijapima' } : { positive: 'Positive', negative: 'Negative', unknown: 'Not sure', not_tested: 'Not tested' })[a.covid_test_context.result]}
        {a.covid_test_context.test_type && a.covid_test_context.test_type !== 'unknown' && ` (${a.covid_test_context.test_type})`}
        {' — '}{sw ? 'taarifa uliyoripoti tu, si utabiri wa modeli.' : 'reported context only, not a model prediction.'}
      </p>}
      {pattern?.condition === 'Influenza' && a.flu_scope && <details><summary>{sw ? 'Kuhusu influenza na mafua' : 'What does FLU(influenza) mean?'}</summary><p>{a.flu_scope}</p><p>{sw ? 'Aina maalumu za virusi huhitaji vipimo vinavyofaa; dalili pekee hazizithibitishi.' : 'Seasonal influenza is not a separate model class. Types such as influenza A/B and subtypes require appropriate testing; symptoms alone do not identify them.'}</p></details>}
          </section>
        </div>
        <div className="col-12 col-lg-4">
          <aside className="pred34-confidence-note" aria-labelledby="awareness-reading-title">
            <p className="pred34-kicker">{t('readingResult')}</p>
            <h3 id="awareness-reading-title">{sw ? 'Kuhusu tathmini hii' : 'About this assessment'}</h3>
            <p>{a.limitations}</p>
      <p><small>{sw ? 'Modeli ya utafiti' : 'Research model'}: {a.model_version || 'bypassed'} · {a.policy_id}</small></p>
      {a.provenance && <details><summary>{sw ? 'Ufuatiliaji na mipaka ya tathmini' : 'Assessment provenance and limitations'}</summary><p>{sw ? 'Muda na ladha hazikutumika katika alama za modeli hii. Uhakiki wa kitabibu na wa lugha bado unasubiriwa.' : 'Duration and taste were not disease-score inputs. Clinical and language review remain pending.'}</p><dl style={{ overflowWrap: 'anywhere' }}><dt>Model SHA-256</dt><dd>{a.provenance.model_sha256 || 'bypassed'}</dd><dt>Schema</dt><dd>{a.provenance.schema_id} · {a.provenance.schema_sha256}</dd><dt>Mapping</dt><dd>{a.provenance.mapping?.mapping_id} · {a.provenance.mapping?.catalogue_sha256}</dd><dt>Policy SHA-256</dt><dd>{a.provenance.policy_sha256 || 'withheld'}</dd><dt>Guidance</dt><dd>{a.provenance.guidance_version} · {a.provenance.guidance_sha256}</dd></dl></details>}
      {admin && Array.isArray(a.research_rankings) && a.research_rankings.length > 0 && (
        <details>
          <summary>Research-only ranking — not patient diagnoses or disease probabilities</summary>
          <ol>{a.research_rankings.map((r) => <li key={r.condition}>{r.condition === 'Influenza' ? 'FLU(influenza)' : r.condition}: dataset-relative score {Number(r.raw_relative_score).toFixed(4)}</li>)}</ol>
          <p>Scores are from simulated data; not local population prevalence. Duration and taste were not model inputs.</p>
        </details>
      )}
          </aside>
        </div>
      </div>
      <section className="pred34-guidance" aria-labelledby="awareness-guidance-title">
        <p className="pred34-kicker">{t('guidance')}</p>
        <h3 id="awareness-guidance-title">{t('nextSteps')}</h3>
        <ul>{(a.next_steps || []).filter((step) => urgent || !step.includes('COVID')).map((step) => <li key={step}>{step}</li>)}</ul>
      </section>
    </section>
  )
}
