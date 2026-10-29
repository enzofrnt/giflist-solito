# Feature Specification: Secure Email Change + Branded Resend Emails

**Branch**: `017-email-change-branded-mail` · **Status**: Approved

## User Stories

### 1. Change account email
An authenticated user can request a new email from web or mobile, confirm it through a link sent by Resend, and then log in with the new address. Changing the email revokes old sessions.

### 2. Branded emails
Password-reset, email-change confirmation and security-notice emails use a consistent Giftlist HTML layout: logo, Porcelain/Cobalt palette, CTA button, readable text fallback.

### 3. Clean splash
The iOS launch/splash mark has rounded corners on both light and dark backgrounds. The square image is not visible.

## Requirements

- **FR-001**: Request endpoint requires auth + current password, validates new email, rejects duplicates.
- **FR-002**: Confirmation uses a signed 30-minute token bound to `userId`, current email, new email and `authVersion`; one-time via authVersion increment.
- **FR-003**: Successful change increments authVersion, returns a fresh session token, and emails a security notice to the old address.
- **FR-004**: Rate-limit email-change requests with the existing AuthRateLimit helper.
- **FR-005**: Web profile has an email-change form; `/email-change#token=` confirms and stores the refreshed token.
- **FR-006**: Mobile profile has the same request flow (confirmation opens the web link).
- **FR-007**: Shared branded HTML/text template with logo, CTA, preheader and footer; password-reset uses it.
- **FR-008**: Splash light/dark images are opaque with matching backgrounds so rounded corners render cleanly.
- **FR-009**: No schema migration; JWT-only pending-state.
