# Issue 71: administrator charts and model monitoring

The administrator dashboard now shows six interactive Highcharts panels:

- Non-urgent versus urgent-review sessions, with counts and percentages.
- Helpful, not-helpful and unrated feedback.
- Saved sessions over time, including urgent and withheld sessions.
- The ten most frequent published condition patterns.
- Valid saved model scores in five percentage bands.
- Saved symptom-matching context, where available.

Date filtering applies to the statistics, all charts and both record lists.
The filter bar shows the applied range and counts as compact badges. Longer
filter explanations are available under **How filters work**. Chart cards
show short summaries, with full definitions under **About this chart** and
exact values under **View chart data**. The recent-record limit and the
score/NLP interpretation notes remain visible.
Both endpoints are inclusive and follow the browser's timezone. A session
uses its creation date; feedback uses its own creation date. Applying a
reversed or invalid range preserves the previous applied range and reports
an error. Clearing the range restores the loaded records. The existing
text and urgent/non-urgent filters affect record lists only, as labelled.

## Data definitions and limits

No new backend endpoints or database migration are required. The dashboard
requests `/admin/history?limit=500` and `/admin/feedback?limit=500`.
These endpoints currently return the latest records rather than complete
system-wide aggregates. The dashboard explicitly states this scope. A
date range cannot retrieve records older than the loaded window. Complete
historical reporting would require a backend aggregate or pagination API.

Each session contributes at most one published condition. Urgent status,
red flags and assessment safety indicators take precedence over any saved
prediction. Withheld candidate results never contribute a condition or
score. Candidate results must match the saved candidate assessment.

Candidate scores come from `assessment.model_score` on the 0–1 scale.
Legacy scores come from `predictions[0].model_confidence_percent` on the
0–100 scale. Missing, non-numeric, infinite and out-of-range scores are
excluded, with score coverage displayed. Model scores are not presented
as clinical accuracy or disease probability.

Time buckets use days for spans up to 90 days, months for spans up to 60
months, and years thereafter. Empty buckets between the first and last
loaded dates show zero loaded sessions. Undated sessions are counted
separately, omitted from the time chart, and excluded by date filters.

NLP context is available only for contract-version-1 assessments that
contain the saved confirmed codes, unmatched wording, unsupported symptoms
and clarification lists. The chart counts sessions with these attributes.
Categories can overlap. Older records without this context are unavailable,
not zero matches. These statistics do not measure NLP accuracy or infer an
automatic matching rate from patient-confirmed symptoms.

Every chart includes keyboard access, point descriptions and an expandable
table containing exactly the chart's values. Colours follow the active
theme. Essential new labels and explanatory text support English and
Kiswahili. Animation is disabled. Refresh and retry reload both sources;
failed or malformed responses do not become fabricated zero statistics.
Requests are aborted on unmount and late results after authentication
changes are ignored.

## Files

| File | Change |
| --- | --- |
| `src/pages/AdminDashboardPage.jsx` | Date controls, filtered statistics and records, refresh/retry, request lifecycle |
| `src/components/AdminMonitoringCharts.jsx` | Six charts, accessibility and exact-value tables |
| `src/components/AdminMonitoringCharts.css` | Responsive layout and themed tables/controls |
| `src/i18n/adminMonitoringTranslations.js` | English/Kiswahili monitoring labels |
| `src/utils/adminAnalytics.js` | Date filtering and aggregation of authoritative saved fields |
| `src/services/admin.js` | Abort signals for admin requests |
| `vite.config.js` | Preserve Highcharts module initialization order in development and production |
| `src/utils/__tests__/adminAnalytics.test.js` | Aggregation, safety, backend-contract fixtures, boundaries and missing data |
| `src/pages/__tests__/AdminMonitoring.test.jsx` | Filtering, chart configuration, tables, refresh, failure and session checks |
| `src/pages/__tests__/AdminDashboardPage.test.jsx` | Updated dashboard regression expectations |
| `src/pages/__tests__/CandidateHistoryLists.test.jsx` | Supply the dashboard's authentication context |

The development workaround follows the [Highcharts Vite guidance](https://www.highcharts.com/docs/react/v5-migration-guide#vite-users).
Production uses Rolldown's [strictExecutionOrder](https://rolldown.rs/reference/OutputOptions.strictExecutionOrder)
to preserve source initialization order across chunks. This adds initialization
helpers but keeps administrator charts lazy-loaded.

## Verification

- 258 tests passed across 39 files.
- Lint and production build passed.
- Development and built production pages both rendered all six real Highcharts
  panels with synthetic API fixtures isolated from actual patient accounts.
- Desktop and 390-pixel mobile checks passed without horizontal page overflow.
- Mobile dark mode, huge text, Kiswahili and keyboard-operated data tables checked.

Run these in the frontend project root if further changes are made:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

## Manual acceptance with your backend

1. Restart the frontend development server because Vite configuration changed.
   Keep the backend running, then sign in as an administrator and open `/admin`.
2. Confirm the route doughnut totals equal the saved-session count. Use
   **View chart data** to compare the displayed values to the saved records.
3. Check that the feedback chart includes unrated responses separately.
4. Apply a range covering known sessions. Verify that every chart, statistic
   and record list updates. Clear it, then try a range with no records.
5. Try a start date after the end date. Confirm the error and that the previous
   results remain applied.
6. Confirm urgent and withheld sessions never appear in the conditions or
   confidence charts. Scores and matching context may legitimately be unavailable
   for older records.
7. Refresh after a new assessment or feedback response. Counts should update.
8. Use Tab/Enter for data tables and Highcharts keyboard navigation. Try a
   mobile viewport, dark/light themes, enlarged text and Kiswahili.
9. Stop the backend and refresh the dashboard. Confirm a readable error, then
   restart the backend and use **Try again**.
10. Sign in as a patient and verify `/admin` remains blocked.

Git operations and issue closure are performed by the repository owner.
Keep issue 71 open until the real-backend acceptance checks pass and its PR
is merged. Do not stage unrelated `public/images/` assets.
