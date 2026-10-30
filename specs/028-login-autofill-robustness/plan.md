# Plan

## Technical context

- Web only: `apps/next/src/app/login/page.tsx`, `apps/next/src/components/PasswordInput.tsx`.
- No API, Prisma, shared `packages/app`, or native change; no new dependency.

## Constitution check

- **Security**: credentials travel only in the JSON POST body (as today); no password in URL. The DOM is read on submit instead of trusting stale state.
- **Accessibility**: no change to labels, focus or error announcement; keyboard attributes only reduce autocorrect.
- **UI/UX process**: `ui-ux-design` skill loaded; brief recorded in `spec.md`.
- **Gates**: typecheck, lint, browser autofill + typed + wrong-password checks; no server logic touched, so the password-reset suite is not affected.

## Approach

1. **Read the form at submit time** in `handleSubmit`:
   - `const form = event.currentTarget`
   - `const values = new FormData(form)`
   - `email = String(values.get('email') ?? '').trim()`, `password` unchanged.
   - `setFormData({ email, password })` before the request so re-renders (loading, error) keep the visible values.
2. **Type the handler** as `React.FormEvent<HTMLFormElement>` so `FormData` accepts the form element.
3. **Mobile keyboard attributes**:
   - e-mail input: `autoCapitalize="none"`, `autoCorrect="off"`, `spellCheck={false}`;
   - shared `PasswordInput`: same three attributes.
4. **Verification** on the running dev server:
   - inject values with the native setter and no events, submit → expect `/dashboard`;
   - typed submit → `/dashboard`;
   - wrong password → 401 error displayed and e-mail retained.

## Risks

- If autofill happens *after* the submit click, the captured values are still the pre-submit ones; this is the same race as before and not made worse.
- `setFormData` with a trimmed e-mail changes the visible value only by trimming whitespace, which is intended.

## Verification plan

- Puppeteer on `http://127.0.0.1:3001` (next dev): autofill simulation, typed login, wrong password, attribute assertions.
- `bun run web:typecheck`, `bun run web:lint`.
- Production build gate via the pre-commit hook on commit (the dev server is restarted if the build replaces `.next`).
