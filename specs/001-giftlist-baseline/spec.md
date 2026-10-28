# Feature Specification: Giftlist Application Baseline

**Feature Branch**: `001-giftlist-baseline`

**Created**: 2026-10-28

**Status**: Baseline (documents existing behavior, not new work)

**Input**: Capture the current Giftlist application (canonical `origin/main` @ `acde7cc`) as the reference specification for future Spec Kit work.

**Scope**: Web is the primary client in production. Native (Expo) currently exposes the shared home and user-detail screens only; web-only behavior is marked as such. Anything in the *local* working tree that is not on `origin/main` (notably the uncommitted GiftGroup schema work) is explicitly out of scope for this baseline.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Account access and security (Priority: P1)

A person creates an account, signs in, recovers access if a password is forgotten, and can optionally add a passkey for faster sign-in.

**Why this priority**: Without accounts, lists cannot be owned, protected, or shared safely.

**Independent Test**: Register a new account, sign out, sign in with the password, request a password reset and complete it with the emailed link, then sign in with a passkey created from the profile.

**Acceptance Scenarios**:

1. **Given** a visitor without an account, **When** they register with a valid email and password, **Then** an account is created and they are signed in.
2. **Given** a registered user, **When** they submit valid credentials, **Then** a session is established and protected pages become accessible.
3. **Given** an unauthenticated visitor, **When** they open a protected page (dashboard, manage, profile), **Then** they are redirected to sign in.
4. **Given** a user who forgot their password, **When** they request recovery, **Then** an email with a single-use, expiring link is sent and completing it sets a new password and invalidates previous sessions/passkeys.
5. **Given** a signed-in user, **When** they register a passkey, **Then** they can later sign in with it instead of the password, and can remove it from their profile.
6. **Given** a user, **When** they change their password, **Then** the change requires a valid session and old sessions stop being valid.

### User Story 2 - Gift list management (Priority: P1)

A signed-in user creates gift lists, edits their details, chooses visibility and secret mode, and deletes lists they no longer want.

**Why this priority**: Lists are the core object of the product.

**Independent Test**: Create a list, edit its title/description/image, toggle public visibility and secret mode, then delete it and confirm it disappears from the dashboard.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they create a list with a title, **Then** the list appears on their dashboard with a share code.
2. **Given** an owned list, **When** the user edits title, description, image, or visibility, **Then** the changes persist and are visible on the list.
3. **Given** a list in secret mode, **When** a visitor opens its public link, **Then** secret behavior is applied and protected data is not exposed.
4. **Given** an owned list, **When** the user deletes it, **Then** the list and its gifts are removed and the public link stops working.
5. **Given** a user, **When** they open the QR/share view, **Then** they can share a working link to the list.

### User Story 3 - Gift management (Priority: P2)

A signed-in user adds gifts to a list, including title, price, description, image, and product URL, and can edit or delete them.

**Why this priority**: A list without gifts provides no value; this is the main data-entry workflow.

**Independent Test**: Add a gift manually, add one from a scraped product URL, edit both, and delete one.

**Acceptance Scenarios**:

1. **Given** an owned list, **When** the user adds a gift with valid data, **Then** it appears in the list for the owner and on the public page as intended.
2. **Given** a product URL on a supported retailer, **When** the user requests scraping, **Then** title/image/price are pre-filled where the provider supports it, and a clear error is shown otherwise.
3. **Given** an existing gift, **When** the user edits or deletes it, **Then** the change is persisted and access is restricted to the owner.
4. **Given** an invalid or oversized input, **When** the user submits, **Then** the API rejects it with a clear validation error and no partial write.

### User Story 4 - Sharing and reservations (Priority: P2)

A visitor opens a public list via its share link and reserves a gift anonymously (or cancels their reservation), while the owner can see and manage reservations.

**Why this priority**: Gift reservation is the product's central collaborative promise.

**Independent Test**: Open a public link from another browser, reserve a gift, see it marked reserved with the visitor's name, then unreserve it; verify the owner dashboard reflects the state.

**Acceptance Scenarios**:

1. **Given** a public list, **When** a visitor opens the share link, **Then** the list and its gifts are displayed without requiring an account.
2. **Given** an available gift, **When** a visitor reserves it with a name, **Then** it is marked reserved with that name and cannot be reserved twice.
3. **Given** a reserved gift, **When** the visitor (or owner) cancels the reservation, **Then** the gift becomes available again.
4. **Given** a private list, **When** an unauthenticated visitor opens the link, **Then** access is denied and no private data is exposed.
5. **Given** reservations, **When** the owner views the list, **Then** reservation details are visible only to the owner.

### User Story 5 - Native shell (Priority: P3)

A mobile user launches the Expo app and sees the shared home screen and user-detail screen.

**Why this priority**: Native is currently a shell; web carries the full feature set. Native parity is future work driven by individual specs.

**Independent Test**: Launch the native app with `bun run native`, navigate from home to the user-detail screen.

**Acceptance Scenarios**:

1. **Given** the Expo app is built, **When** the user opens it, **Then** the home screen renders using the shared `packages/app` components.
2. **Given** the home screen, **When** the user navigates to user detail, **Then** the user-detail screen renders.

### Edge Cases

- Expired or reused password-reset link → rejected without changing the password or leaking whether the account exists.
- Passkey flow on a Vercel preview domain → keys are scoped to that host; a preview key must never authenticate production.
- Secret mode + public share link → protected fields must not leak through API responses or page source.
- Concurrent reservation of the same gift → at most one winner; the other receives a conflict-style response.
- Missing/invalid environment variables (database URL, JWT secret, Resend key) → fail clearly at deploy/build time, never fall back to insecure defaults in production.
- Scraping provider blocked or product not found → user-friendly fallback to manual entry.
- Deleted account/list with existing reservations → cascading rules keep data consistent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST let visitors register with a unique email, a name, and a password that satisfies the shared password policy.
- **FR-002**: The system MUST authenticate users with email/password and issue a session usable on protected pages and API routes.
- **FR-003**: The system MUST hash passwords with bcrypt and MUST never store or log plaintext passwords or secrets.
- **FR-004**: The system MUST provide a password-recovery flow that emails a single-use, expiring link and stores only a hash of the token.
- **FR-005**: Completing a password reset MUST invalidate existing sessions and passkeys for that account.
- **FR-006**: The system MUST support WebAuthn passkeys for registration, sign-in, listing, and removal, bound to the current host's relying-party domain.
- **FR-007**: The system MUST rate-limit authentication-related endpoints and reject cross-origin auth requests that are not same-origin.
- **FR-008**: Signed-in users MUST be able to create, read, update, and delete their own gift lists.
- **FR-009**: Each list MUST have a unique share code and support public/private visibility and secret mode.
- **FR-010**: Users MUST be able to add, edit, and delete gifts on their own lists, including title, URL, image, price, and description.
- **FR-011**: The system SHOULD pre-fill gift data from a supported product URL via scraping, with a clear manual fallback.
- **FR-012**: The public share page MUST display list data without authentication and MUST NOT expose owner email or private fields (see Known Baseline Gaps for the current reservation-data leakage).
- **FR-013**: Visitors MUST be able to reserve an available gift by providing a name, and reservations MUST include who reserved and when.
- **FR-014**: Visitors and owners MUST be able to cancel a reservation, returning the gift to available.
- **FR-015**: The system MUST prevent double reservation of the same gift under concurrency.
- **FR-016**: The owner dashboard MUST show lists, gifts, and reservation state for their own account only.
- **FR-017**: The system MUST enforce ownership server-side on every mutation (lists, gifts, reservations) and reject unauthorized access.
- **FR-018**: All API input MUST be validated server-side, with errors that do not leak internals.
- **FR-019**: The system MUST send transactional email through Resend using a verified sender/domain, with correct per-environment origins (preview links must point to the preview, never production).
- **FR-020**: The system MUST provide a profile page where users can view account details, change their password, and manage passkeys.
- **FR-021**: The system MUST provide an admin surface that is gated by real server-side authorization and contains no embedded credentials (see Known Baseline Gaps).
- **FR-022**: The web client MUST be responsive and usable on mobile browsers.
- **FR-023**: The native client MUST render the shared home and user-detail screens; other native features are introduced by future specs with explicit native scope.
- **FR-024**: The system MUST expose QR/share affordances for lists so users can share them easily.
- **FR-025**: The system MUST persist data in PostgreSQL using versioned Prisma migrations that are applied during Vercel deployment.

### Key Entities

- **User**: account identity (email, name, password hash, auth version, timestamps); owns lists and passkeys.
- **GiftList**: a collection owned by a user (title, description, image, visibility, secret flag, unique share code, timestamps); contains gifts.
- **Gift**: an item in a list (title, URL, image, price, description, status, reservation details, timestamps).
- **PasswordResetToken**: single-use recovery record (token hash, user, auth version, expiry).
- **AuthRateLimit**: per-key throttling record (key, count, expiry).
- **Passkey**: registered WebAuthn credential (id, user, relying-party id, public key, counter, transports, device metadata, timestamps).
- **PasskeyChallenge**: short-lived WebAuthn challenge (challenge, purpose, origin, relying-party id, optional user, expiry).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can register and create their first gift list in under 2 minutes on a typical mobile connection.
- **SC-002**: A visitor can open a shared link and reserve a gift in under 1 minute without creating an account.
- **SC-003**: 100% of protected list/gift mutations reject unauthenticated or non-owner requests in the automated and manual checks.
- **SC-004**: A password reset completes end-to-end and invalidates prior sessions/passkeys 100% of the time in the test suite.
- **SC-005**: No public API response or public page exposes owner email addresses or secret-mode fields.
- **SC-006**: The web build, typecheck, and test gates pass on `main` before and after every feature merge.
- **SC-007**: A share link remains stable and valid for the lifetime of its list; deleting the list makes the link unavailable.

## Known Baseline Gaps (security/reliability, NOT certified behavior)

The current code has these known defects. They are documented so no future feature copies them, and each needs its own remediation spec/PR. Until fixed, they are exceptions rather than precedent:

- **Legacy unauthenticated APIs**: `GET/POST/PUT/DELETE /api/gift` and `POST /api/reserve` operate without auth or list scoping (and `GET /api/gift` returns every gift, including reservation emails). New work MUST NOT add callers; prefer the scoped routes under `/api/gift-lists/**` and `/api/public/**`.
- **Public cancellation**: anyone with a share code can cancel any reservation (`/api/public/.../cancel`). Reservation identity/authorization is not enforced.
- **Secret mode is cosmetic**: the public API still returns `reservedByName` / `reservedByEmail`, and `/api/gift-lists/[id]/reveal` does not change server state.
- **Admin page**: `/admin` is unlinked, gates on `localStorage.admin_authenticated`, embeds hardcoded credentials, and calls the unauthenticated legacy API. It MUST NOT be reachable in production until it has real server-side auth.
- **SPA session model**: JWT is stored in `localStorage` and sent as a Bearer token; protected pages guard client-side only (no edge middleware/httpOnly cookie). Treat this as the current trade-off, not a security guarantee.
- **Scraper**: unauthenticated, unthrottled, server-side fetch of user-provided URLs (SSRF risk). Add auth, quota, and outbound URL restrictions before extending it.
- **No CI**: only Husky's full build on commit. Quality gates are run manually by agents (see `AGENTS.md`).
- **Stale/legacy artifacts**: `apps/next/prisma/dev.db` (SQLite) is tracked though unused; `env.example` still lists `NEXT_PUBLIC_BASE_URL`; `dripsy`/`moti` are declared but unused.
- **Metadata origin**: `layout.tsx` falls back to `https://gift.enzo-frnt.fr` when `NEXT_PUBLIC_APP_URL` is unset (not a project domain). Production canonical/OG metadata is therefore wrong until fixed.

## Assumptions

- Web (Next.js on Vercel) is the current primary client; native parity is incremental and must be scoped per feature.
- Authentication is JWT-cookie based today; no third-party identity provider (OAuth) is in scope for the baseline.
- Reservations are intentionally lightweight (name only, no visitor account), matching current behavior.
- Email delivery depends on a verified Resend domain; production uses `APP_URL=https://giftlist.fr`, previews use Vercel-provided URLs.
- The uncommitted local GiftGroup schema work and its migration are not part of this baseline and require their own Spec Kit feature.
- The 14 commits merged between `e59d978` and `acde7cc` (Bun migration, Next 16.4.3, password recovery, passkeys, security patches) are included in this baseline.
