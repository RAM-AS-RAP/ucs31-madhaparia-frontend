# Issue 73 — System and model management

Open **System** in administrator navigation, or `/admin/system`. The screen has
six compact sections, real API data, 12-record pagination, refresh/retry/empty
states, English/Kiswahili controls, themed layouts and accessible native dialogs.
Extra context and recorded metrics are expandable rather than long introductory
text blocks. This feature needs the matching backend migration and routes in
`docs/SYSTEM_MANAGEMENT.md` in the backend repository.

## Scope

| Section | Behaviour |
| --- | --- |
| Model | Active registered Random Forest, runtime state, dimensions, sample counts and recorded validation/test metadata |
| Symptoms | Search symptoms/aliases, review notes, add custom English/Kiswahili aliases, confirmed removal of custom aliases |
| Diseases | Search and edit existing display names/descriptions |
| Feedback | Search comments, filter rating/review status, review notes, resolve/reopen and link to saved assessment |
| NLP issues | Counts-only mapping event history and saved unsupported/unmatched assessment context |
| Activity | Read-only management actions, including previous account actions |

Frozen symptom identities, labels, features and red flags are read-only because
the candidate mapping verifies them against its reviewed catalogue. Baseline
aliases also remain protected. Review notes and custom aliases are the supported
symptom-management actions. Disease class identities, model artifacts,
activation, training and uncertainty thresholds are not modified by this page.
Disease information edits affect new results; saved history is preserved.

All mutations include the displayed revision. Stale edits close the editor,
show an explanation and reload current records. Duplicate saves and the dialog's
Cancel/Escape controls are disabled while saving. Leaving aborts the client
request and ignores late responses; it does not undo a server edit that has
already committed. Responses after authentication changes cannot update the page.
Drafts and responses are not written to browser storage.

## Files and locations

Frontend root:
`C:\Users\krish\OneDrive\Desktop\IS-Project-2\ucs31-madhaparia-frontend`

| File within root | Purpose |
| --- | --- |
| `src/pages/AdminSystemPage.jsx` | Six sections, record editors, filters and paging |
| `src/pages/AdminSystemPage.css` | Cards, evaluation panels, timeline and mobile styling |
| `src/services/adminSystem.js` | Authenticated API calls, revision bodies and response checks |
| `src/i18n/adminSystemTranslations.js` | English/Kiswahili labels and messages |
| `src/utils/modelMetrics.js` | Scoped metric display; preserves recorded units/scales |
| `src/App.jsx` | Lazy protected `/admin/system` route |
| `src/layouts/AppLayout.jsx` | Administrator System navigation |
| `src/i18n/translations.js` | Global System navigation labels |
| `src/pages/AdminDashboardPage.jsx` | System shortcut |
| `src/pages/__tests__/AdminSystemPage.test.jsx` | Routing/access, forms, filtering, paging, errors and races |
| `src/services/__tests__/adminSystem.test.js` | API contracts, response validation and metric scopes |

Existing shared `src/components/AccountManagementDialog.jsx` and
`src/pages/AdminUsersPage.css` are reused. No npm dependency changes are needed.
The pre-existing untracked `public/images/` directory is not part of this work.

## Automated checks

Frontend validation: 311 tests pass across 44 files; lint and the production
build pass. Browser checks covered desktop, 390px mobile, dark mode, Kiswahili,
the largest text setting, edit dialogs and successful synthetic save flows.
Backend validation is recorded in the backend guide: 403 full-run passes, one
transient PostgreSQL setup error passing on rerun, and 22 passing focused checks
including the final NLP logging changes. Do not describe the first full run as
an uninterrupted all-pass run.

In the frontend root:

```powershell
npm.cmd test -- --maxWorkers=4
npm.cmd run lint
npm.cmd run build
```

## Manual acceptance checks before PRs

1. Apply the backend migration, restart the backend and run the frontend.
2. Sign in as an administrator. Open System; verify the active version, runtime
   state, counts and recorded evaluation scopes. A missing result must not look
   like a measured accuracy. Research scores must not look like clinical risk.
3. Search Symptoms for fever. Inspect protected definitions and baseline aliases.
   Save a review note. Add a temporary clearly identifiable test alias only to
   the intended symptom, with meaning confirmation. Check recognition through
   the patient workflow, then remove the temporary custom alias and confirm the
   baseline remains. A duplicate existing alias must be rejected.
4. In Diseases, edit an existing name/description. Refresh and confirm it persists.
   New results for that condition should use the update; old saved history
   should retain its original text. Restore any temporary test wording.
5. Filter Feedback by unhelpful/pending. Review a record, add an internal note,
   resolve it, then check the filters and its assessment link. The original
   patient comment/rating must remain unchanged.
6. Inspect NLP mapping events and saved assessment sources. Events start from
   this update and omit raw input. Historical unsupported symptoms/unmatched
   wording come from saved assessments, not reconstructed error guesses.
7. Open Activity and verify the corresponding changes, actor/target references
   and times. There must be no audit edit/delete control or secret values.
8. Open the same editable record in two browser tabs. Save in one tab; the old
   revision in the other must produce a conflict and refresh, not overwrite.
9. As a patient/guest, visit `/admin/system` directly. Private data must not load.
   Repeat on a narrow screen, dark mode, Kiswahili, enlarged text and keyboard.

Browser layout checks during implementation use synthetic fixture data only;
they do not create or change real patient accounts/content.

## Completion and Git

Implementation is ready for acceptance only after automated checks pass and the
development migration/manual workflow is verified. The user performs all Git
operations. Use separate backend/frontend PRs; the frontend PR can contain
`Closes #73` after acceptance. Do not close the issue before both changes are
merged. Do not include `.env` or the unrelated untracked images directory.
