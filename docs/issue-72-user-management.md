# Issue 72: administrator user-account management

The new **Users** navigation item and dashboard link open `/admin/users`.
Only authenticated administrators can enter this route; patient and guest
routes are denied before fetching account records. Backend permissions remain
authoritative for every operation.

## Interface

- Compact account cards show name, email, optional phone, role, access status
  and creation date. Administrator cards are protected and read-only.
- Search is debounced and performed on the backend, with role/status filters
  and pagination (12 cards per page). Counts describe all matching accounts.
- **Add patient** creates an active patient with profile details and an initial
  password. Passwords must match and meet the existing registration policy.
  No OTP is added to registration and no invitation is sent.
- **Manage account** offers activation/deactivation independently of
  blocking/unblocking. Access changes revoke previous authenticated sessions.
- **Delete account** opens a separate irreversible-action confirmation. It
  explains removal of the account, assessments and feedback, and requires
  the target email and current administrator password before submission.
- Native dialogs contain keyboard focus, support cancellation and restore
  focus on close. Manage initially focuses its heading, not a sensitive action.
  In-flight operations cannot be submitted twice or dismissed as if cancelled.
- Passwords are kept only in open form state and request bodies, not browser
  storage or URLs. Deletion clears the entered administrator password after
  each attempt. Changing authenticated identity discards the previous form state.
- Request cancellation and session guards prevent stale reads or mutation
  responses from restoring a previous administrator's view. Stale account
  revisions require reviewing refreshed data instead of overwriting changes.
- English/Kiswahili, mobile layouts, dark themes and enlarged text are supported.
  Dialog heights account for the existing text-size zoom preferences.
- Login shows whether an account is blocked or deactivated after the backend
  verifies the password. Incorrect credentials retain the generic login error.

The frontend uses the new `/admin/users` APIs and the backend migration
`d7a42f9b6e10`. The backend must be updated before the frontend is deployed.

## Files

| File | Purpose |
| --- | --- |
| `src/pages/AdminUsersPage.jsx` | Account list, filters, paging and reviewed actions |
| `src/pages/AdminUsersPage.css` | Responsive cards/forms and themed dialogs |
| `src/components/AccountManagementDialog.jsx` | Native modal lifecycle and focus handling |
| `src/services/adminUsers.js` | Authenticated API calls, response validation and errors |
| `src/i18n/adminUsersTranslations.js` | English/Kiswahili management labels |
| `src/App.jsx` | Lazy-loaded admin-only users route |
| `src/layouts/AppLayout.jsx` | Administrator navigation |
| `src/i18n/translations.js` | Shared Users navigation translation |
| `src/pages/AdminDashboardPage.jsx` | Link from dashboard to Users |
| `src/pages/__tests__/AdminUsersPage.test.jsx` | Route permissions and management workflows |
| `src/services/__tests__/adminUsers.test.js` | API contract and credential transport checks |
| `src/pages/LoginPage.jsx` | Restricted-account login messages |
| `src/pages/__tests__/LoginAccountStatus.test.jsx` | English/Kiswahili restriction messages and invalid-login regression |

## Automated verification

```powershell
npm.cmd test -- --maxWorkers=4
npm.cmd run lint
npm.cmd run build
```

The four-worker setting bounds memory/CPU use while testing lazy-loaded routes.
The full frontend suite passed with 283 tests across 41 files, and lint/build
passed. Browser layout testing uses a separate synthetic fixture server and
does not create or delete real accounts.

## Manual acceptance

Restart the backend after updating it. The development migration has already
been applied. Start the frontend with `npm.cmd run dev`, then:

1. Log in as an administrator and open **Users**. Search an existing name/email
   and try role/status filters and pagination.
2. Add a new disposable patient account with an email you control. Confirm its
   name, phone, patient role and active status. Try the same email again and
   confirm a duplicate-email error.
3. In another browser session, log in as that patient. Block the account from
   the admin session. Refresh the patient page; its old session must be rejected,
   and login must fail. Unblock and log in again with a fresh session.
4. Deactivate the account and check login fails. Test blocked plus inactive:
   unblocking alone must not activate it; activating alone must not unblock it.
   Restore both access flags before proceeding.
5. Open deletion confirmation for that disposable account. Wrong email must
   keep deletion disabled; a wrong admin password must show a safe error and
   preserve the account. Cancel and confirm the account remains.
6. Use the correct email and your administrator password to delete only the
   disposable account. It should disappear from the list and lose login access;
   any assessments/feedback belonging to it are permanently removed.
7. Verify your own and other administrator accounts have disabled management
   controls. As a patient, `/admin/users` must remain inaccessible.
8. Try keyboard navigation, mobile layout, dark mode, enlarged text and Kiswahili.
   Stop the backend and refresh to check the error/retry state.

Issue 72 remains open until manual acceptance and both PR merges are complete.
The repository owner performs all Git actions. Keep `.env` and the unrelated
`public/images/` folder out of commits.
