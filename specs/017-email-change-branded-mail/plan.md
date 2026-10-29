# Plan

## Auth
- Add `signEmailChangeToken` / `verifyEmailChangeToken` to `lib/auth.ts` (HS256, 30m, purpose).
- `lib/email-change.ts`: request (bcrypt current password, duplicate check, quota, Resend to new address), confirm (atomic updateMany, authVersion, new JWT, old-address notice).
- Routes: `POST /api/auth/email-change/request`, `POST /api/auth/email-change/confirm`.

## Email
- `lib/email-template.ts` with branded table layout + text fallback.
- Refactor password reset + security notice to use it.
- `public/email-logo.png` from the rounded mark.

## UI
- Web profile email form; `/email-change` page.
- Mobile profile email form using `api.requestEmailChange`.

## Splash
- `splash-light.png` / `splash-dark.png` opaque variants; app.json uses them.
