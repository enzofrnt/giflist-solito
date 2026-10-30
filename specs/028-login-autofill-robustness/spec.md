# Feature Specification: Login Resilient to Browser Autofill

**Branch**: `feat/mobile-header-auth-cta` · **Status**: Approved

## Problem

The login form is controlled entirely by React state. Some browsers and password managers fill the e-mail/password inputs **without firing React input events**, so the state stays empty even though the fields look filled. On submit the client sends empty values, the API answers `400 Email invalide`, and the user sees “Connexion impossible — Email invalide” with the fields visually cleared. This is reproducible and is the most likely cause of failed login attempts on the dev instance. On phones, keyboards can also autocapitalize/autocorrect e-mail and password fields.

## UX brief

- **User job**: sign in with saved or typed credentials.
- **Primary action**: “Se connecter”.
- **Success moment**: the saved credentials are accepted and the dashboard opens.
- **Key friction**: autofilled fields are not sent; the error blames the e-mail although the field is visibly correct.
- **Scope**: web login page (`/login`) plus the shared password input attributes.
- **Non-goals**: server auth logic, token format, register/forgot-password forms, rate limiting.

## Requirements

- **FR-001**: On submit, the login handler reads `email` and `password` from the form DOM (`FormData`), so browser autofill is submitted even when no React input event fired.
- **FR-002**: The e-mail is trimmed before submission; the password is sent unchanged (no trimming, no case change).
- **FR-003**: React state is synchronised from the submitted values so the visible fields are not cleared during loading or after an error.
- **FR-004**: E-mail and password inputs disable mobile autocapitalization, autocorrection and spellcheck; existing `autocomplete` metadata (`username` / `current-password`) is preserved.
- **FR-005**: A genuinely wrong password still shows the server error; the client does not fabricate success.
- **FR-006**: No API, session, data or native change; no new dependency.

## Success Criteria

- A login with credentials injected into the DOM without input events (autofill simulation) reaches `/dashboard` with a valid token.
- A normal typed login still reaches `/dashboard`.
- A wrong password still shows “Connexion impossible” with the server message, and the typed e-mail remains visible.
- The rendered e-mail/password inputs expose `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"`.
- `bun run web:typecheck` and `bun run web:lint` pass.

## Assumptions

- Reading the DOM on submit is preferable to making the inputs uncontrolled: it keeps the current UI/validation code intact and only changes the source of truth at submit time.
- The shared `PasswordInput` is the right place for the keyboard attributes; all password fields benefit.

## Out of scope

- The register and forgot-password forms (they use the same controlled pattern; to be reviewed separately).
- Server-side e-mail normalisation and password policy.
