// Capture the real frontend in Chromium. Protected screens use a local-only,
// deterministic API fixture; this script never authenticates with production.
// Usage: set PLAYWRIGHT_CORE_PATH to an installed playwright-core directory,
// start the frontend at 127.0.0.1:5183, then run this script with Node.
const path = require('node:path')
const fs = require('node:fs')
const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || 'playwright-core')

const output = path.join(__dirname, 'screens')
fs.mkdirSync(output, { recursive: true })
const deployed = 'https://krishna-respira-care.onrender.com'
const local = 'http://127.0.0.1:5183'
const text = 'I have a cough, fever and a blocked nose.'
const symptoms = [
  { code: 'cough', display_name: 'Cough', matched_text: 'cough', status: 'present', is_red_flag: false },
  { code: 'fever', display_name: 'Fever', matched_text: 'fever', status: 'present', is_red_flag: false },
  { code: 'nasal_congestion', display_name: 'Runny or blocked nose', matched_text: 'blocked nose', status: 'present', is_red_flag: false },
]
const mapping = { input_text: text, recognised_symptoms: symptoms, unmatched_wording: [], has_red_flag: false, mapping_version: 'synthetic-preview' }
const confirmation = { input_text: text, confirmed_codes: symptoms.map(s => s.code), confirmed_symptoms: symptoms, rejected_symptoms: [], safety_status: 'continue', mapping_version: 'synthetic-preview' }
const assessment = {
  contract_version: 2, status: 'research_pattern', model_version: 'v3_partial_evidence',
  policy_id: 'selective_research_preview_fixture',
  research_pattern: {
    condition: 'URTI', display_name: 'Upper respiratory tract infection',
    description: 'A respiratory symptom pattern that may include cough and nasal congestion.',
    // No score: this deterministic fixture must not suggest a measured probability.
  },
  observations: symptoms.map(s => ({ code: s.code, display_name: s.display_name, status: 'present', confirmed: true, reported_subject: 'patient_or_unspecified' })),
  next_steps: ['If symptoms persist or worsen, consult a qualified healthcare professional.'],
  limitations: 'This is an illustrative local fixture, not a clinical diagnosis or a live model output.',
  covid_testing_recommended: false,
}
const result = {
  prediction_id: 'preview-normal-001', status: 'research_pattern',
  model_version: 'v3_partial_evidence', age: 27, sex: 'F', confirmed_codes: confirmation.confirmed_codes,
  predictions: [], assessment, input_text: text, has_red_flag: false,
  disclaimer: 'Health awareness only; not a medical diagnosis.',
}
const urgentText = 'I am coughing blood.'
const urgentSymptom = { code: 'coughing_blood', display_name: 'Coughing blood', matched_text: 'coughing blood', status: 'present', is_red_flag: true }
const urgentMapping = { input_text: urgentText, recognised_symptoms: [urgentSymptom], unmatched_wording: [], has_red_flag: true, mapping_version: 'synthetic-preview' }
const urgentConfirmation = { input_text: urgentText, confirmed_codes: [urgentSymptom.code], confirmed_symptoms: [urgentSymptom], rejected_symptoms: [], safety_status: 'urgent_review', mapping_version: 'synthetic-preview' }
const urgentResult = {
  prediction_id: 'preview-urgent-002', status: 'urgent_review', age: 27, sex: 'F',
  confirmed_codes: [urgentSymptom.code], predictions: [], has_red_flag: true,
  red_flag_symptoms: [urgentSymptom], input_text: urgentText,
  assessment: {
    contract_version: 2, status: 'urgent_review', model_version: null, policy_id: null,
    research_pattern: null, observations: [{ code: urgentSymptom.code, display_name: urgentSymptom.display_name, status: 'present', confirmed: true }],
    next_steps: ['Seek urgent medical assessment now.'], limitations: 'No routine condition comparison is shown for a safety warning.',
  },
}
const records = [result, urgentResult].map((item, i) => ({
  ...item, user_id: 'synthetic-preview-patient',
  created_at: `2026-11-15T10:0${i}:00Z`,
}))

function send(route, data) {
  route.fulfill({ status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' },
    body: JSON.stringify(data) })
}

async function fixturePage(browser, role = 'patient', urgent = false) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  await context.addInitScript(({ mapping, confirmation, result }) => {
    sessionStorage.setItem('respiracare_access_token', 'local-preview-fixture')
    sessionStorage.setItem('respiracare_assessment_release', 'awareness-2')
    sessionStorage.setItem('respiracare_symptom_mapping', JSON.stringify(mapping))
    sessionStorage.setItem('respiracare_symptom_confirmation', JSON.stringify(confirmation))
    sessionStorage.setItem('respiracare_prediction_result', JSON.stringify(result))
  }, urgent ? { mapping: urgentMapping, confirmation: urgentConfirmation, result: urgentResult } : { mapping, confirmation, result })
  await context.route('http://127.0.0.1:8000/**', route => {
    const u = new URL(route.request().url())
    if (u.pathname === '/auth/me') return send(route, { id: role === 'admin' ? 'preview-admin' : 'preview-patient', email: role === 'admin' ? 'admin@demo.invalid' : 'patient@demo.invalid', role, full_name: 'Demonstration Account' })
    if (u.pathname === '/history') return send(route, { history: records })
    if (u.pathname.startsWith('/history/')) return send(route, records[0])
    if (u.pathname === '/admin/history') return send(route, { history: records })
    if (u.pathname === '/admin/feedback') return send(route, { feedback: [{ feedback_id: 'preview-feedback', prediction_id: result.prediction_id, created_at: '2026-11-15T10:15:00Z', was_helpful: true, comment: 'Synthetic feedback for the preview.' }] })
    if (u.pathname === '/admin/users') return send(route, { users: [], total: 0, page: 1, page_size: 12 })
    return send(route, {})
  })
  return { context, page: await context.newPage() }
}

async function waitAndCapture(page, url, file, readyText) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  if (readyText) {
    try { await page.getByText(readyText, { exact: false }).first().waitFor({ timeout: 15000 }) }
    catch (error) {
      console.log('CAPTURE DEBUG', file, page.url(), (await page.locator('body').innerText()).slice(0, 700))
      await page.screenshot({ path: path.join(output, 'debug-' + file) })
      throw error
    }
  }
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(output, file), animations: 'disabled' })
  console.log(file, page.url(), await page.title())
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  try {
    const publicPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
    await waitAndCapture(publicPage, deployed + '/', '01-home-desktop.png', 'Describe how you feel')
    await waitAndCapture(publicPage, deployed + '/about', '09-about.png', 'About')
    await publicPage.close()
    for (const [name, viewport] of [
      ['10-responsive-desktop.png', { width: 1440, height: 900 }],
      ['11-responsive-tablet.png', { width: 768, height: 1024 }],
      ['12-responsive-mobile.png', { width: 390, height: 844 }],
    ]) {
      const p = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
      await waitAndCapture(p, deployed + '/', name, 'Describe how you feel')
      await p.close()
    }
    const patient = await fixturePage(browser, 'patient')
    await waitAndCapture(patient.page, local + '/dashboard', '02-patient-dashboard.png', 'Check your symptoms')
    await waitAndCapture(patient.page, local + '/symptoms', '03-symptom-input.png', 'Symptom description')
    const field = patient.page.getByLabel('Symptom description')
    await field.fill(text)
    await patient.page.getByRole('button', { name: 'Analyse symptoms' }).scrollIntoViewIfNeeded()
    await patient.page.screenshot({ path: path.join(output, '03-symptom-input.png'), animations: 'disabled' })
    await waitAndCapture(patient.page, local + '/symptoms/confirm', '04-symptom-confirmation.png', 'Review your selections')
    await patient.page.getByRole('button', { name: 'Confirm selected symptoms' }).scrollIntoViewIfNeeded()
    await patient.page.screenshot({ path: path.join(output, '04b-confirmation-action.png'), animations: 'disabled' })
    await waitAndCapture(patient.page, local + '/prediction', '05-assessment-result.png', 'Upper respiratory tract infection')
    await patient.page.locator('.pred34-guidance').scrollIntoViewIfNeeded()
    await patient.page.screenshot({ path: path.join(output, '05b-assessment-guidance.png'), animations: 'disabled' })
    await waitAndCapture(patient.page, local + '/history', '07-assessment-history.png', 'saved sessions')
    await waitAndCapture(patient.page, local + '/history/preview-normal-001', '07b-assessment-detail.png', 'Upper respiratory tract infection')
    await patient.context.close()
    const safety = await fixturePage(browser, 'patient', true)
    await waitAndCapture(safety.page, local + '/prediction', '06-urgent-review.png', 'Urgent medical assessment')
    await safety.context.close()
    const admin = await fixturePage(browser, 'admin')
    await waitAndCapture(admin.page, local + '/admin', '08-admin-dashboard.png', 'Administrator')
    await admin.page.locator('.adm36-chart-panel').first().scrollIntoViewIfNeeded()
    await admin.page.screenshot({ path: path.join(output, '08b-admin-monitoring.png'), animations: 'disabled' })
    await admin.context.close()
    const mark = await browser.newPage({ viewport: { width: 128, height: 128 }, deviceScaleFactor: 1 })
    const svg = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'favicon.svg'), 'utf8')
    await mark.setContent(`<body style="margin:0;background:transparent"><div style="width:128px;height:128px">${svg.replace('<svg ', '<svg width="128" height="128" ')}</div></body>`)
    await mark.screenshot({ path: path.join(__dirname, 'respiracare-mark.png'), omitBackground: true })
    await mark.close()
  } finally { await browser.close() }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
