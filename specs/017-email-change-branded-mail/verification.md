# Verification: Secure Email Change + Branded Mail

## Email change

- Request requires an authenticated session, current password, valid new email and uniqueness.
- Confirmation uses a signed 30-minute HS256 token bound to userId/currentEmail/newEmail/authVersion.
- Success increments authVersion, invalidates old sessions, returns a fresh JWT and sends a security notice to the old address.
- Tests: `apps/next/tests/password-reset.test.ts` covers wrong password, successful one-time confirmation, session rotation, duplicate address and old-address notice.
- Result: **27/27 tests pass**.
- Web profile form + mobile profile form implemented.
- Web confirmation page: `/email-change#token=…`, stores the refreshed token and returns to `/profile`.

## Branded email

- Shared `email-template.ts` with logo, preheader, CTA, fallback link, footer and plain-text fallback.
- Password reset and password-change notification now use it; email-change confirmation and old-address security notice use it.
- Logo: `public/email-logo.png`, absolute URL in emails.
- Preview: `docs/design-system/screenshots/phase-13/email-reset.jpg`.

## Splash

- `splash-light.png` / `splash-dark.png` are opaque images whose background matches the splash background; the blue mark’s rounded corners blend into the screen.
- Light background `#faf9f7`; dark `#11100f`.
- iOS app icon remains square by design (system mask); splash/header mark use rounded assets.

## Screenshots

- Web: `web-email-change.jpg`
- Mobile: `mobile-email-settings.jpg`, `mobile-email-change.jpg`
- Email: `email-reset.jpg`

## Gates

- Web typecheck/build ✅ · tests **27/27** ✅ · native typecheck/export ✅.
- No schema migration.
