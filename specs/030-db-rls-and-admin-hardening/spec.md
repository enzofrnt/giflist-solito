# Feature Specification: Database RLS & Admin Hardening

**Feature Branch**: `030-db-rls-and-admin-hardening`

**Created**: 2026-11-04

**Status**: Draft

**Input**: Security remediation for the Supabase Data API exposure, the unauthenticated legacy gift/reservation endpoints, and the client-only `/admin` gate. Delivery scope is web + API + database; the native client is not impacted.

**Scope**: Web (`apps/next`), its route handlers, and the PostgreSQL objects reachable through Supabase's Data API. Native (`apps/expo`) and shared UI (`packages/app`) are out of scope. This feature does not add product behavior; it closes three documented security gaps in `specs/001-giftlist-baseline/spec.md` (Known Baseline Gaps) without changing user-facing list, gift, or reservation flows.

## Problems

1. **Direct database exposure.** `public."Gift"`, `public."GiftList"`, `public."FavoriteList"` and `public."_prisma_migrations"` have Row-Level Security disabled and still carry Supabase's default grants to the `anon` and `authenticated` roles. The Supabase Data API (PostgREST) can therefore read and write them directly, bypassing every authorization rule enforced by the Next.js API. `Gift` and `GiftList` contain owner data and reserver PII (`reservedByEmail`, `reservedByName`); `FavoriteList` confirms private list relationships; `_prisma_migrations` leaks deployment history.
2. **Root cause is systemic.** Supabase applies `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ... TO anon, authenticated`. Every table Prisma creates is re-exposed automatically, even after a previous hardening migration. Proof: `FavoriteList` was created after the earlier RLS migrations and is exposed again.
3. **Unauthenticated legacy data paths.** `GET/POST/PUT/DELETE /api/gift` and `POST /api/reserve` accept requests with no authentication and no list scoping. `GET /api/gift` returns every gift of every list, including reserver e-mail addresses. Any caller can create, rewrite, or delete any gift by numeric id.
4. **Client-side admin authorization.** `/admin` embeds the hardcoded credentials a hardcoded username/password pair in the client bundle, authorizes on `localStorage.admin_authenticated`, and reads/writes through the unauthenticated `/api/gift`. The page is unlinked but publicly reachable, and the credentials are shipped to every visitor who requests it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Direct database access is closed (Priority: P1)

As the platform owner, I need the public Data API roles to have no access to application tables, so that the database cannot be read or written around the application's authorization rules.

**Why this priority**: This is the widest exposure: it bypasses every list/gift ownership check and leaks reserver PII. Fixing it also prevents the same regression for future tables.

**Independent Test**: Boot an isolated PostgreSQL instance that reproduces Supabase's default grants, apply all migrations, then attempt `SELECT`/`INSERT`/`UPDATE`/`DELETE` as `anon` and as `authenticated` on the four tables. Every attempt must be denied. The application's owner role must still perform CRUD on `Gift`, `GiftList`, and `FavoriteList`.

**Acceptance Scenarios**:

1. **Given** the migration has applied, **When** the `anon` or `authenticated` role queries `Gift`, `GiftList`, `FavoriteList`, or `_prisma_migrations`, **Then** the database denies the operation and returns no rows.
2. **Given** the migration has applied, **When** a table is created later by the `postgres` role, **Then** `anon` and `authenticated` have no table or sequence privileges on it.
3. **Given** the application connects with the table-owning `postgres` role, **When** it performs Prisma CRUD on `Gift`, `GiftList`, and `FavoriteList`, **Then** all operations succeed unchanged.
4. **Given** a database without Supabase roles (`gift_user` in local Docker) or without a Prisma migrations table (fresh pglite), **When** migrations run, **Then** they complete without error and remain forward-only.

---

### User Story 2 - Every data path requires authorization (Priority: P1)

As the platform owner, I need the unauthenticated legacy gift and reservation endpoints to stop existing, and the administrator to keep the cross-tenant data access they need through an authenticated endpoint.

**Why this priority**: Deleting the legacy routes removes the only anonymous path to all gifts and reserver PII. It must land with a replacement so the admin workflow is not silently broken.

**Independent Test**: Request `/api/gift` and `/api/reserve` without credentials and observe 404. Request `/api/admin/gift` without a session and observe 401; sign in with the admin credential, then call it and observe 200 with cross-tenant reads plus successful create/update/delete.

**Acceptance Scenarios**:

1. **Given** an unauthenticated caller, **When** they request any method on `/api/gift` or `POST /api/reserve`, **Then** the route is not found (404) and no data or mutation occurs.
2. **Given** an unauthenticated caller, **When** they request `/api/admin/gift`, **Then** the response is 401 with no gift data.
3. **Given** a valid admin session, **When** the administrator requests `/api/admin/gift`, **Then** they receive every list's gifts, including reservation details, and can create, update, unreserve, and delete gifts.
4. **Given** invalid admin credentials, **When** they attempt to sign in, **Then** the response is a generic 401 and repeated attempts are throttled.
5. **Given** the admin credential is not configured, **When** anyone calls the admin login or admin gift API, **Then** the admin surface fails closed (503/401) while the public site continues to serve.

---

### User Story 3 - The admin console is authorized server-side (Priority: P2)

As the platform owner, I need `/admin` to be gated on the server by an environment-provided credential delivered through a secure session cookie, so that no credential or authorization decision lives in the browser.

**Why this priority**: The admin surface is the only cross-tenant editor. Client-side gating and bundled credentials make it a standing production risk even though it is unlinked.

**Independent Test**: Visit `/admin` without a session and observe a redirect to the login page. Sign in with the configured credential and observe an HttpOnly, SameSite=Strict session cookie and the admin UI. Sign out and observe the cookie cleared and the gate re-applied. Remove the environment variables and confirm the admin surface is unavailable while `/`, public lists, and reservations still work.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they request `/admin`, **Then** they are redirected to `/admin/login` and receive no admin content or credential material.
2. **Given** the configured admin username and password hash, **When** the administrator submits valid credentials, **Then** the server sets an HttpOnly, SameSite=Strict session cookie and grants access to `/admin`.
3. **Given** the session cookie, **When** the administrator uses `/admin` and `/api/admin/gift`, **Then** the server accepts the session and the client contains no `localStorage` authorization decision.
4. **Given** the administrator signs out, **When** the logout request completes, **Then** the cookie is cleared and `/admin` redirects to the login page again.
5. **Given** `ADMIN_USERNAME` or `ADMIN_PASSWORD_HASH` is missing, **When** anyone opens the admin surface, **Then** it shows an unavailable state and no login form, while the public site is unaffected.
6. **Given** repeated failed sign-ins, **When** the attempt limit is reached, **Then** the login endpoint returns 429 and stops evaluating credentials.

---

### User Story 4 - Security regression proof (Priority: P2)

As a reviewer, I need an automated suite that proves the database exposure, the legacy routes, and the admin gate cannot silently regress.

**Why this priority**: These defects recurred because no test asserted the Supabase-specific default privileges. Without a regression gate, the next table Prisma creates will be exposed again.

**Independent Test**: Run `bun run test`; the hardening suite must assert RLS, revoked table/sequence/default privileges, owner CRUD, admin 401/200 behavior, and the absence of legacy routes. The only permitted skip is the documented orphan `GiftGroup` blocker.

**Acceptance Scenarios**:

1. **Given** the test database is prepared like Supabase, **When** the hardening suite runs, **Then** every named table has RLS enabled, no permissive policies exist, and `anon`/`authenticated` have no table or sequence privileges.
2. **Given** a table created after the migration, **When** the default-privilege probe runs, **Then** the Data API roles have no privileges on the new table.
3. **Given** the owner connection, **When** the CRUD regression runs, **Then** Prisma operations on `Gift`, `GiftList`, and `FavoriteList` still succeed.
4. **Given** the admin endpoints, **When** the suite calls them without and with a valid session, **Then** it observes 401 and 200 respectively, and the legacy route files are absent.
5. **Given** the known orphan `GiftGroup` migration, **When** the strict "all tables" assertion runs, **Then** it is skipped/todo with an explicit blocker reference until that directory is resolved.

---

### Edge Cases

- **Missing admin environment variables** → the admin page, login endpoint, and admin API fail closed; public routes keep working; no redirect loop between `/admin` and `/admin/login`.
- **Local Docker role is `gift_user`, not `postgres`** → the migration's role-scoped statements are skipped by `pg_roles` guards; table-owner privileges are unaffected.
- **Fresh pglite has no `_prisma_migrations`** → the migration guards the table with `to_regclass`; the suite must still prove the branch works when a stub table exists.
- **`prisma migrate deploy` runs as the table owner** → RLS and REVOKEs do not block the owner; `FORCE ROW LEVEL SECURITY` is explicitly forbidden because it would block the migration write.
- **A future Prisma table is created after this migration** → default privileges are revoked, so it is not exposed; a test probes this.
- **Concurrent admin login attempts** → the quota update is atomic; at most the configured number of attempts are evaluated per window.
- **Cookie replay/expiry** → the session token has a short expiry and an admin audience; expired or tampered tokens are rejected and the gate reapplies.
- **Preview deploy** → migrations run against Gift-dev in the Vercel build; a bad migration fails the deploy instead of half-applying to production.
- **Orphan `GiftGroup` migration** → it is untracked, creates an unhardened table, and is applied by the test fixture; the strict all-tables gate cannot pass until it is resolved. It is not silently hardened in this feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST enable Row-Level Security on `public."Gift"`, `public."GiftList"`, `public."FavoriteList"`, and `public."_prisma_migrations"`.
- **FR-002**: The system MUST revoke all table privileges on those four tables from `PUBLIC` and, when present, from `anon` and `authenticated`.
- **FR-003**: The system MUST revoke sequence privileges from `PUBLIC`, `anon`, and `authenticated` so identity/serial values are not usable through the Data API.
- **FR-004**: The system MUST revoke default privileges for future tables, sequences, and functions from `anon` and `authenticated` (and `PUBLIC` for future function execution), so tables created later are not re-exposed automatically.
- **FR-005**: The system MUST NOT create permissive policies (for example `USING (true)`) and MUST NOT enable `FORCE ROW LEVEL SECURITY`.
- **FR-006**: Every migration statement MUST be portable: role-scoped statements guarded by `pg_roles` existence checks, and `_prisma_migrations` guarded by `to_regclass('public._prisma_migrations')`.
- **FR-007**: The system MUST continue to serve the application because the app connection role owns the tables and therefore bypasses RLS; this must be documented in the migration and the plan.
- **FR-008**: The database change MUST be exactly one forward-only, versioned Prisma migration with no change to `schema.prisma` or `schema.production.prisma`, no data deletion, and no `db push` / `migrate reset`.
- **FR-009**: `GET/POST/PUT/DELETE /api/gift` MUST no longer be reachable; the route handler MUST be removed rather than left unauthenticated.
- **FR-010**: `POST /api/reserve` MUST no longer be reachable; the route handler MUST be removed. Public reservation remains available through the share-code-scoped `/api/public/gift-lists/[shareCode]/...` routes.
- **FR-011**: The system MUST provide an admin-authenticated endpoint at `/api/admin/gift` that preserves cross-tenant read/write of gifts for the admin console.
- **FR-012**: Every `/api/admin/gift` method MUST return 401 before parsing or touching data when no valid admin session is present.
- **FR-013**: `/api/admin/gift` MUST validate input with Zod, return safe errors, and set `Cache-Control: no-store`; reservation PII is returned only to an authenticated admin.
- **FR-014**: `/admin` MUST be authorized server-side; unauthenticated requests MUST redirect to the login page and MUST NOT receive admin content or credentials.
- **FR-015**: Admin credentials MUST come from `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` (bcrypt); the server MUST compare the username and bcrypt-verify the password, and MUST NOT embed credentials in the client bundle.
- **FR-016**: A successful admin sign-in MUST set an HttpOnly, SameSite=Strict session cookie, Secure in production, with a bounded lifetime and path scope; the session MUST be signed with an existing server secret and carry an admin audience.
- **FR-017**: Admin sign-in MUST be rate-limited using the existing `AuthRateLimit` mechanism (per client address and per username), returning 429 when the limit is exceeded.
- **FR-018**: `localStorage.admin_authenticated` MUST no longer be read or written; no client-side value may grant admin access.
- **FR-019**: When `ADMIN_USERNAME` or `ADMIN_PASSWORD_HASH` is absent, the admin surface MUST fail closed: login returns 503, admin API returns 401, the page shows an unavailable state, and public routes are unaffected.
- **FR-020**: The public site (home, public lists, public reservations, search, auth) MUST keep working without admin configuration and without any behavior change caused by the RLS migration.
- **FR-021**: The test suite MUST assert RLS for every table in `public`, absence of table/sequence privileges for `anon`/`authenticated`, cleared default privileges, owner CRUD continuity, admin 401/200 behavior, and absence of the legacy routes.
- **FR-022**: The test suite MUST remain portable: it must apply all migrations both with Supabase-like roles and on a database without `postgres`/`anon`/`authenticated` and without `_prisma_migrations`.
- **FR-023**: The known orphan `GiftGroup` migration MUST be recorded as a blocker for the strict all-tables assertion; it MUST NOT be committed as part of this feature and MUST be resolved (removed or adopted through its own spec) before the strict gate can pass.
- **FR-024**: Documentation MUST be updated to state the correct number of hardened tables (6, not 5) and the current canonical commit (`5ac0528`, not `3b71904`), and to document the new admin environment variable names and Vercel targets.
- **FR-025**: The migration MUST have a documented rollback path consisting of a new forward migration that re-grants the privileges (and, only if explicitly required, disables RLS); destructive rollback is not permitted.

### Key Entities

- **Public Data API role**: The external `anon`/`authenticated` identities used by Supabase's Data API. It must hold no privilege on backend tables, sequences, or future tables.
- **Admin session**: A server-issued, signed, expiring cookie proving the administrator authenticated with the environment credential. It is the only authorization input for `/admin` and `/api/admin/gift`.
- **Hardening migration**: A single forward-only SQL artifact that enables RLS, revokes current grants, and changes default privileges. It changes database security state, not the Prisma data model.
- **Exposed tables**: `Gift` (reserver PII), `GiftList` (owner/list data), `FavoriteList` (private list relationships), `_prisma_migrations` (deployment history).
- **Admin credential**: `ADMIN_USERNAME` plus a bcrypt hash in `ADMIN_PASSWORD_HASH`, supplied per environment; absent values mean the admin surface is unavailable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After the migration, `anon` and `authenticated` can read or write **0 rows** across the four named tables through any SQL or Data API request; every attempt is denied.
- **SC-002**: After the migration, a newly created table has **0** privileges for `anon` and `authenticated`.
- **SC-003**: The application's owner role completes **100%** of the exercised `Gift`/`GiftList`/`FavoriteList` CRUD operations without errors.
- **SC-004**: The legacy routes return **404** for all methods in 100% of checks, and a repository search finds no runtime caller outside the retired admin page and historical specs.
- **SC-005**: `/api/admin/gift` returns **401** in 100% of unauthenticated checks and **200** with a valid admin session, with cross-tenant reads and mutations verified.
- **SC-006**: `/admin` redirects **100%** of unauthenticated requests to the login page, and the shipped client bundle contains **0** occurrences of the old hardcoded credentials or `localStorage.admin_authenticated`.
- **SC-007**: Repeated failed admin sign-ins are throttled: the configured attempt limit is enforced atomically and further attempts return **429**.
- **SC-008**: With the admin environment variables absent, the admin surface is unavailable in **100%** of checks while the public home, public list, and public reservation flows still return success.
- **SC-009**: The canonical gates (`web:typecheck`, `test`, `web:lint`, `web:build`) pass; the only skipped hardening assertion is the documented `GiftGroup` blocker.
- **SC-010**: The migration applies cleanly to a Supabase-like database, local Docker (`gift_user`), and a fresh pglite database without `_prisma_migrations`, with **0** migration errors.

## Assumptions

- The app connects to PostgreSQL with the Supabase `postgres` role, which owns the tables; table owners bypass RLS unless `FORCE ROW LEVEL SECURITY` is set. This is why the REVOKEs and RLS do not regress the application, and why `FORCE` is forbidden.
- The Supabase Data API is not a supported access path for this application; the only supported path is the Next.js API through Prisma. No anonymous policy is needed.
- The admin surface serves a single operator; it does not need multi-user roles, an audit log, or a persisted session table in this iteration.
- Reusing the existing `JWT_SECRET` for an admin-audience session token is acceptable; no new session secret is introduced. If the secret is missing, admin auth fails closed.
- The admin credential is provisioned per environment in Vercel; local development may leave it unset, in which case admin is simply unavailable.
- Native (`apps/expo`) and shared UI (`packages/app`) do not call the legacy routes or the admin surface and need no change.
- The legacy routes are deleted, not kept behind auth, so no caller can accidentally rely on the old contract.
- The untracked `apps/next/prisma/migrations/20251117120000_add_gift_groups/` directory is orphaned (absent from `origin/main`, no Prisma model). It is a known blocker for the strict all-tables assertion and is outside this feature's committed scope.
- Preview deployments migrate Gift-dev and production migrates Gift-Production inside the Vercel build; a migration failure fails the deploy rather than leaving the database half-migrated.
- The feature directory is `specs/030-db-rls-and-admin-hardening` (030 because 026–029 were already taken on `main`).
