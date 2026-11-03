# Respiratory candidate frontend readiness

Frontend issue: #82

## Decision

The frontend candidate workflow passes its automated checks and is ready
for a staged integration check. This is not approval to activate the
candidate for application users.

The application backend still selects `v2_23class_prototype`. The
`candidate_v1_research` model remains inactive. The frontend does not
select a model or apply model thresholds.

The frontend tests use representative candidate responses. A live browser
session against a backend selecting the candidate has not yet been
recorded. Production activation remains pending a separate decision.

## Automated evidence

Validation on 2026-11-03:

| Check | Result |
| --- | --- |
| `npm test` | 31 test files passed; 176 tests passed |
| `npm run lint` | 0 warnings; 0 errors |
| `npm run build` | Passed |
| `git diff --check` | No whitespace errors reported |

The production build requires `VITE_API_BASE_URL`. A passing build does
not establish that the configured URL points to the intended backend.

### Workflow coverage

| Behaviour | Evidence |
| --- | --- |
| Symptom input, confirmation, and prediction routes preserve confirmed codes and canonical display labels | `CandidateRouteFlow.test.jsx` |
| Accepted, insufficient-information, and unsupported responses pass from submission to the result screen and saved patient history detail | `CandidateWorkflowReadiness.test.jsx` |
| Urgent guidance shows no condition or model score | `CandidateWorkflowReadiness.test.jsx`; `SymptomConfirmationPage.test.jsx` |
| A backend 503 error is shown as an operational failure and does not save a result | `CandidateWorkflowReadiness.test.jsx` |
| Candidate response fields pass through the frontend services | `candidateContract.test.js` |
| Prediction page shows accepted and withheld states without revealing a withheld condition | `CandidatePredictionPage.test.jsx` |
| Patient and administrator history details show saved candidate assessments | `CandidateHistoryDetail.test.jsx` |
| Patient and administrator history lists show candidate statuses, hide withheld conditions from previews and search, and retain older V1/V2 records | `CandidateHistoryLists.test.jsx` |
| Session changes and stale symptom responses do not restore an earlier user's result | `SessionIsolation.test.jsx`; `SymptomInputRace.test.jsx` |

English and Kiswahili candidate states are covered by the prediction and
history tests. Backend-provided health guidance may still be in English;
the frontend does not translate clinical guidance returned by the API.

## Contract reviewed

The frontend sends `age`, `sex`, `text`, and `confirmed_codes` to
`POST /predict`. The backend repeats confirmation and chooses the active
model.

A successful candidate response may contain:

- `prediction_complete` with one accepted condition.
- `insufficient_information` with no public condition or score.
- `unsupported_input` with no public condition or score.
- `urgent_review` with urgent guidance and no prediction.

These states may all use HTTP 200. Operational HTTP errors are handled
separately. Candidate records carry an `assessment` with
`contract_version=1`; older V1/V2 records may have `assessment=null`.

The frontend shows a candidate condition only when the saved prediction
and assessment agree on an accepted result. It does not display a hidden
research leader for a withheld result. An accepted model score is
explained as a model score, not a diagnosis or individual disease risk.

## Staged browser checks before activation

Use test accounts and an isolated, non-production backend environment
that selects the verified candidate. Record the frontend and backend
revisions and the model version returned by each new assessment.

1. Enter a supported symptom description, confirm the canonical labels,
   and check that the submitted codes match the user's selections.
2. Check an accepted response: one condition, a model-score explanation,
   and the same saved assessment in patient and administrator history.
3. Check insufficient information: no condition or score on the result
   page, history list, history detail, or search.
4. Check an unsupported or clarification-required symptom: the frontend
   names what needs clarification and does not claim unmatched wording was
   understood.
5. Check a confirmed safety flag: urgent guidance appears without a
   disease prediction. Confirm that the safety review is saved.
6. Check an operational backend failure: show an error without treating
   it as an ordinary withheld assessment or saving a result.
7. Check an older V1/V2 history record whose `assessment` is null.
8. Repeat relevant result and history screens in Kiswahili and at a
   narrow mobile viewport.
9. Verify that a patient cannot open another patient's history and that
   administrator views require administrator access.
10. After a staged rollback to V2, confirm that new V2 responses and
    saved candidate history remain readable.

The backend's issue #55 tests rehearsed candidate activation and rollback
inside a dedicated test database. That rehearsal does not replace these
browser checks.

## Remaining limits

The candidate was evaluated on simulated respiratory-condition data.
The recorded results do not establish clinical performance for Kenyan
users. An accepted prediction can still be misleading; the frozen
tiredness and chest-pain example returns Pulmonary neoplasm. Frontend
readiness does not resolve that model limitation.

The frontend now offers one optional follow-up after an insufficient
candidate result, with at most three fixed symptom choices. The backend
reconfirms the combined symptoms and runs a new assessment using the
previous age and sex. Another result may still be withheld. The frontend
does not keep asking questions after that attempt. These fixed choices
have not been evaluated as an optimal diagnostic question sequence.

Do not activate the candidate for application users based only on this
frontend PR. Review the staged browser results, model limitations, and
the separate activation decision first.