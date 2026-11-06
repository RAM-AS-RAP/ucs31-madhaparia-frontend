# Merged frontend release

Her updated pages, routes, styles, account/profile/password-reset features, Highcharts configuration and admin management are retained. The assessment flow now reads the merged V3 backend contract without replacing the overall UI.

## Run locally

On this machine use `partner-merged/Start-Merged.ps1`; open **http://127.0.0.1:5180**. It uses the merged API on port 8010 and a separate local DB. Register a new account. Your original app on port 5173 is not this copy.

For an independent installation, from this frontend root:

```powershell
npm ci
$env:VITE_API_BASE_URL='http://127.0.0.1:8010'
npm run dev -- --host 127.0.0.1 --port 5180 --strictPort
```

Set the real target API URL, not the local demo URL, before a deployment build. Her Vite build guard and Highcharts ESM ordering are preserved. The `node_modules` directory here is a local junction for reuse on this machine, **not** something to transfer/ZIP. Use the lockfile on her machine.

Use a compatible Node release, for example Node 24.15+ within the 24.x line. The lockfile updates only two transitive packages (`follow-redirects` 1.16.2 and development-only `undici` 8.12.4) to clear the inherited npm audit findings. A clean install and production build were tested independently without modifying the original project's shared dependencies; run `npm ci` on the target machine to install these patched versions.

## Contract/behaviour notes

- Safety preflight calls `/safety/check` before ordinary SQL mapping. Keep the endpoint with the client change.
- Explicit states and subjects are reviewed separately from checkbox selection. Correction payloads travel to confirmation, prediction, independent urgent save and retry.
- Optional symptom durations are context, not fabricated numeric model boosts. Missing/uncertain duration is not zero or a diagnosis.
- V3 `predictions` is deliberately empty. Render `assessment.research_pattern` only for `research_pattern` status; do not reuse an old probability card.
- The response reuses the partner's original result introduction, condition-card/sidebar columns and separate guidance section, with unchanged CSS. Essential observation/COVID context is added within that layout; the patient percentage/meter stays absent because these scores are not patient probabilities.
- Urgent results bypass ordinary inference. Legacy contract-v1 urgent/history rendering stays intact alongside contract v2.
- Automatic COVID advice is conditional on confirmed current patient taste/smell changes. No always-visible panel, test-result questionnaire or save-test button was added.
- `FLU(influenza)` retains canonical key `Influenza`. Clinical/research limitations stay visible.
- History uses saved snapshots, not fresh inference. Transient assessment cache invalidation does not clear authentication or SQL history.
- Patient/admin history pages reset loading, error and previous-record state when the record ID changes; eight regression tests cover recovery, stale responses and hiding an old record during the next load.
- Admin charts count V3 published patterns without converting raw research rankings into confidence percentages. Admin model wording is “Active research model”, with scoped frozen-policy evidence available.

## Verification

```powershell
npm test -- --maxWorkers=2
$env:VITE_API_BASE_URL='http://127.0.0.1:8010'
npm run build
npm run lint
```

Current result: **337 frontend tests pass**, build and lint pass on Node 24.15.0 after a clean install. npm audit reports zero findings for the patched lockfile. Production-browser checks also cover mobile layouts, administrative account actions, revoked sessions, escaped feedback, a failed-request retry, all 21 PDF prompts and the bilingual/core journeys. Latest evidence is under `../../release/pushcheck-20261106/` in this extracted layout; earlier failing/passing runs are retained rather than overwritten.

This is a review branch (`integration/nlp-v3-frontend`), not a deployment or an automatic merge. Use it with the companion `integration/nlp-v3-backend` branch and its V3 contract; the ML branch alone does not update the running webapp. Open a PR into the owner's intended working branch, review its diff and resolve any conflicts before merging.

Actual SMTP email delivery and clinical correctness are not established. Preserve the known model limitations rather than treating a matching label as a medical diagnosis. Private configuration, user data, dependencies and build output are not part of this branch. ZIP packaging and target-host deployment remain separate actions.
