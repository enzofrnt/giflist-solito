# Feature Specification: Case-Preserving Pseudos

**Feature Branch**: `031-username-case-insensitive`

**Created**: 2026-11-09

**Status**: Draft

**Input**: A visitor cannot finish registration with the pseudo `Joris88` (or `Joris_88`): the form answers "Inscription impossible — Le pseudo doit contenir 3 à 30 caractères (lettres, chiffres, _)" even though the pseudo visibly satisfies the stated rule. The owner asks for a clean fix that allows uppercase and lowercase letters in a pseudo.

**Scope**: Web (`apps/next`), its API route handlers, the PostgreSQL migration set, and the shared/native clients (`packages/app`, `apps/expo`). Email-based login is out of scope and must not change.

## Problem

1. **Client/server rule contradiction.** The web registration form validates `/^[a-z0-9_]{3,30}$/` against the raw, case-preserved value, so any uppercase letter is rejected before the request is sent (`apps/next/src/app/register/page.tsx`). The hint next to the field says "lettres, chiffres et _", and the API's Zod schema accepts `A-Z`, so the user is told the input is valid while the form refuses it.
2. **Case is silently normalized elsewhere.** The profile pages and the native client force `toLowerCase()` on every keystroke, while the canonical server rule (`USERNAME_RE`) and every lookup (`/u/[username]`, `/api/users/[username]`, public-profile loader, search) assume lowercase. The product therefore has no single definition of a valid pseudo.
3. **No case-insensitive uniqueness.** `User.username` is unique case-sensitively; allowing displayed casing without a case-insensitive guarantee would let `Joris` and `joris` coexist as separate accounts.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registration accepts uppercase and lowercase pseudos (Priority: P1)

As a new visitor, I can register with the pseudo I chose (`Joris88`), keep its capitalization, and understand the rule from the hint.

**Why this priority**: Registration is currently blocked for any pseudo containing an uppercase letter; the account is never created and the visitor cannot log in.

**Independent Test**: Submit `Joris88` on `/register`; the account is created with `username = "Joris88"` and the verification flow starts. Submit `joris88`; the API answers 409 "Ce pseudo est déjà utilisé."

**Acceptance Scenarios**:

1. **Given** no account, **When** I register with `Joris88`, **Then** the account is created and `username` is stored as `Joris88`.
2. **Given** `Joris88` exists, **When** I register with `joris88` (or `JORIS88`), **Then** registration is refused with "Ce pseudo est déjà utilisé." and no second account is created.
3. **Given** I type invalid characters or fewer than 3 / more than 30 characters, **When** I submit, **Then** a clear error names the actual rule.
4. **Given** I type only lowercase (`joris_88`), **When** I submit, **Then** registration still succeeds.
5. **Given** an existing account, **When** I log in, **Then** email-based login is unchanged.

---

### User Story 2 - Public profiles and search resolve any casing (Priority: P1)

As a visitor following a shared profile link, `/u/Joris88` and `/u/joris88` both open the same public profile, and search returns the stored display casing.

**Why this priority**: Usernames are public URLs and search keys; a case-preserving display must not break existing lowercase links or create duplicate profiles.

**Independent Test**: With `Joris88` public, request `/u/JORIS88` and `/api/users/joris88`; both return the profile and the canonical display `Joris88`. The sitemap lists `/u/Joris88` once.

**Acceptance Scenarios**:

1. **Given** a public profile `Joris88`, **When** I open `/u/joris88`, **Then** the profile renders with the stored casing `@Joris88`.
2. **Given** a public profile `Joris88`, **When** I search `jor`, **Then** the result shows `Joris88`.
3. **Given** the sitemap, **When** it is generated, **Then** each profile appears once, with its stored casing.

---

### User Story 3 - Profile editing is consistent on web and native (Priority: P2)

As a signed-in user, I can change my pseudo on web and native, and the same rule and hint apply everywhere.

**Why this priority**: Prevents the contradiction from moving to the profile editor and keeps both clients aligned.

**Independent Test**: Edit the pseudo to `Joris_88` on `/profile` and in the native app; both save the case-preserved value and show the same hint.

**Acceptance Scenarios**:

1. **Given** I edit my pseudo to `Joris_88`, **When** I save, **Then** the API stores `Joris_88` and subsequent lookups work in any casing.
2. **Given** I edit my pseudo to a value already used case-insensitively, **When** I save, **Then** I see "Ce pseudo est déjà utilisé."

### Edge Cases

- Existing accounts keep their lowercase pseudos; no data migration is needed and old lowercase links keep working.
- Whitespace around the input is trimmed; inner spaces are invalid.
- The 30-character limit counts the display string, not a lowercased variant.
- A lowercased variant of an existing pseudo must not be creatable, even concurrently (database guarantee, not only an application check).

## Requirements *(mandatory)*

- **FR-001**: A pseudo MUST be 3–30 characters from `[A-Za-z0-9_]` (ASCII letters in either case, digits, underscore).
- **FR-002**: The pseudo MUST be stored trimmed and case-preserved (the user's capitalization is displayed, including on public URLs).
- **FR-003**: Uniqueness MUST be case-insensitive, enforced both by the application and by a database index on `lower(username)`.
- **FR-004**: All username lookups (public profile page, `/api/users/[username]`, search, profile update) MUST match case-insensitively.
- **FR-005**: Web registration, web profile, native registration and native profile MUST share one validation rule and one hint; the hint MUST say letters (both cases), digits and `_`.
- **FR-006**: The API MUST return the existing 400/409 semantics with a message that matches the real rule.
- **FR-007**: The sitemap MUST use the stored casing and de-duplicate case-insensitively.
- **FR-008**: Email-based login, password rules, `authVersion` semantics and share links MUST NOT change.
- **FR-009**: The change MUST ship as a forward-only migration; no destructive SQL and no rewrite of existing usernames.
- **FR-010**: Shared validation MUST live in `packages/app/lib` (constitution III), consumed by both clients and by the Next.js route handlers.

## Success Criteria *(mandatory)*

- **SC-001**: Registering with `Joris88` succeeds and stores `Joris88`; registering `joris88` afterwards is refused.
- **SC-002**: `/u/joris88` and `/u/Joris88` resolve to the same public profile.
- **SC-003**: Unit and integration tests cover acceptance, case-insensitive uniqueness, case-insensitive lookup and the shared rule.
- **SC-004**: `bun run web:typecheck`, `bun run test`, `bun run web:lint` and `bun run web:build` are green, with the Bun version caveat reported if the local runtime differs from 1.4.4.
