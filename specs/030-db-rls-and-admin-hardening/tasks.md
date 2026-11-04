# Tasks: Database RLS & Admin Hardening

**Input**: Design documents from `/specs/030-db-rls-and-admin-hardening/`

**Prerequisites**: `plan.md` (required), `spec.md` (required), repository guidance in `AGENTS.md` and `.specify/memory/constitution.md`

**Tests**: Included because the feature explicitly requires a security regression suite. Tests are grouped under User Story 4 and are also referenced by the story checkpoints.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently. The database migration (US1) and the admin API/legacy-route removal (US2) are independent after the foundational tasks. The admin page work (US3) consumes the US2 session helper and endpoints. The regression suite (US4) verifies US1–US3.

**Format**: `[ID] [P?] [Story] Description with exact file path`

- **[P]**: different files, no dependency on an incomplete task.
- **[Story]**: `US1`, `US2`, `US3`, `US4`; setup, foundational, and polish tasks have no story label.
- Every behavior-changing task names its verification command.
- Total: **43 tasks** (2 setup, 2 foundational, 7 US1, 7 US2, 7 US3, 9 US4, 9 polish/verification).

## Path Conventions (Giftlist)

Use the real repository paths; never generic `src/` paths.

- Web pages/components: `apps/next/src/app/**`, `apps/next/src/components/**`
- API route handlers: `apps/next/src/app/api/**/route.ts`
- Server libraries: `apps/next/src/lib/*.ts`
- Database: `apps/next/prisma/schema.prisma`, `apps/next/prisma/schema.production.prisma`, `apps/next/prisma/migrations/**`
- Tests: `apps/next/tests/*.test.ts` (`bun test`)
- Spec artifacts: `specs/030-db-rls-and-admin-hardening/**`
- Native/shared code: `apps/expo/**`, `packages/app/**` — **not touched by this feature**

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the checkout and isolate this feature's write set before any code changes.

- [ ] T001 Verify the checkout is `main @ 5ac0528` from the repository root (`/Users/enzofournet/Git/giflist-solito`): run `git fetch origin`, `git rev-parse HEAD`, `git status --short`, and `bun --version` (expect 1.4.4); record the untracked `apps/next/prisma/migrations/20251117120000_add_gift_groups/` directory as out of scope.
- [ ] T002 [P] Create the implementation branch `fix/db-rls-admin-hardening` from `origin/main` in the repository's `.git` branch namespace; keep writes disjoint from parallel agents, and do not stage the untracked `GiftGroup` migration directory.

**Checkpoint**: The tree is understood, the branch is based on `5ac0528`, and the orphan migration is explicitly out of scope.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Resolve the strict-test blocker and document the environment contract that US2/US3 depend on.

**⚠️ CRITICAL**: T003 blocks the strict all-tables assertion in T029. T004 blocks the admin integration in US3.

- [ ] T003 Resolve the orphan `GiftGroup` blocker: confirm `git ls-tree origin/main apps/next/prisma/migrations` lacks `20251117120000_add_gift_groups`, and `apps/next/prisma/schema.prisma` has no `GiftGroup` model; coordinate with the Lead, then remove the untracked directory **or** adopt it through its own Spec Kit feature. Record the decision in `specs/030-db-rls-and-admin-hardening/plan.md` (Known Blockers). Do not add `GiftGroup` to this feature's migration.
- [ ] T004 [P] Add `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` placeholders (names plus a bcrypt generation command, never values) to `apps/next/env.example`, and document the Vercel targets (production, preview, development) in `specs/030-db-rls-and-admin-hardening/plan.md`. Do not create or print secrets.

**Checkpoint**: The strict test is no longer structurally blocked (or the blocker is explicitly documented and scheduled), and the admin env contract is written down.

---

## Phase 3: User Story 1 - Direct database access is closed (Priority: P1) 🎯 MVP

**Goal**: One forward-only Prisma migration enables RLS on the four exposed tables, revokes current table/sequence grants, revokes future default privileges, and leaves the owner connection unaffected.

**Independent Test**: Apply all migrations to a Supabase-like pglite fixture; `anon`/`authenticated` fail every CRUD attempt on `Gift`, `GiftList`, `FavoriteList`, `_prisma_migrations`; the owner still performs CRUD; a new table has no default grants.

### Implementation for User Story 1

- [ ] T005 [US1] Create the migration scaffold with `bun run --cwd apps/next db:migrate:create --name harden_public_data_api`; expected path `apps/next/prisma/migrations/<timestamp>_harden_public_data_api/migration.sql`. Do not modify `apps/next/prisma/schema.prisma` or `apps/next/prisma/schema.production.prisma`.
- [ ] T006 [US1] Write the guarded SQL in `apps/next/prisma/migrations/<timestamp>_harden_public_data_api/migration.sql`: `ENABLE ROW LEVEL SECURITY` on `public."Gift"`, `public."GiftList"`, `public."FavoriteList"`, and `public."_prisma_migrations"` (the last guarded by `to_regclass('public._prisma_migrations') IS NOT NULL`); `REVOKE ALL` on those tables from `PUBLIC` and, inside `pg_roles` guards, from `anon`/`authenticated`; `REVOKE ALL ON ALL SEQUENCES IN SCHEMA public` from the same roles; and `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES/SEQUENCES/FUNCTIONS` from `anon`/`authenticated` (functions also from `PUBLIC`). Include comments explaining the owner-bypass argument, the no-policy decision, the no-`FORCE` decision, and the rollback SQL. Add no permissive policy and no `FORCE ROW LEVEL SECURITY` (FR-001–FR-008, FR-025).
- [ ] T007 [US1] Review the migration SQL against `apps/next/prisma/migrations/20261028180000_add_password_recovery/migration.sql` and `apps/next/prisma/migrations/20261028190000_add_passkeys/migration.sql`: confirm the same guard style, no data changes (`DROP`/`DELETE`/`TRUNCATE`/`ALTER COLUMN`), no `db push`, and idempotent statements.
- [ ] T008 [US1] Apply the migration locally: `bun run --cwd apps/next docker:up`, then `bun run --cwd apps/next db:migrate:dev`, then `bun run --cwd apps/next --bun prisma migrate status` (there is no `db:migrate:status` script). Confirm it succeeds against the `gift_user`-owned Docker database where `postgres`/`anon`/`authenticated` may be absent (FR-006, FR-008).
- [ ] T009 [US1] Verify there is no application regression as the owner: with the local database migrated, run a Prisma check that creates, reads, updates, and deletes a `GiftList`, a `Gift`, and a `FavoriteList` (a temporary script or the new test suite is acceptable; do not leave ad-hoc scripts behind). Record the result (FR-007, SC-003).
- [ ] T010 [US1] Prove the deploy path: run `bun run --cwd apps/next build:vercel` against the local database URL so `prisma migrate deploy` writes `_prisma_migrations` after RLS is enabled on it; record the build/migration output. This is the guard against `FORCE`-like mistakes (FR-005, FR-007, SC-010).
- [ ] T011 [US1] Document rollback in the migration header and `specs/030-db-rls-and-admin-hardening/plan.md`: a new forward migration that re-grants table/sequence/default privileges, with `DISABLE ROW LEVEL SECURITY` only as an explicit incident step. Never document `migrate reset` or destructive rollback (FR-025).

**Checkpoint**: US1 is independently verifiable: the four tables are hardened, future tables are protected, and the owner connection still works.

---

## Phase 4: User Story 2 - Every data path requires authorization (Priority: P1)

**Goal**: Remove the unauthenticated legacy routes and replace them with an admin-session-gated `/api/admin/gift` that preserves cross-tenant read/write.

**Independent Test**: `/api/gift` and `/api/reserve` return 404; `/api/admin/gift` returns 401 without a session and 200 with one; the admin can read all gifts and create/update/delete.

### Implementation for User Story 2

- [ ] T012 [US2] Create `apps/next/src/lib/admin-auth.ts`: `isAdminConfigured()` (both env names plus a bcrypt-shaped hash), `verifyAdminCredentials(username, password)` (timing-safe username comparison + `bcrypt.compare`), `createAdminSessionCookie()` / `getAdminSession()` (JWT signed with the existing `JWT_SECRET`, `aud: "giftlist-admin"`, `role: "admin"`, 8-hour expiry, `httpOnly`, `sameSite: "strict"`, `secure` in production, `path: "/"`), and `requireAdmin(request)` returning a safe 401 response or `null`. Fail closed when unconfigured or when `JWT_SECRET` is absent. Do not add a new session secret.
- [ ] T013 [US2] Create `apps/next/src/app/api/admin/auth/login/route.ts`: Zod `{ username, password }`; return 503 when unconfigured; apply `takeAuthQuota` from `apps/next/src/lib/password-reset.ts` for `admin-login-ip:<client address>` and `admin-login-user:<username>` (5 attempts / 15 minutes each) and return 429 when exhausted; return a generic 401 for any credential failure; set the admin session cookie on success. Do not log passwords or hashes (FR-015–FR-017, FR-019).
- [ ] T014 [US2] Create `apps/next/src/app/api/admin/auth/logout/route.ts`: clear the `admin_session` cookie with the same attributes and `maxAge: 0`; return 200 (idempotent when unauthenticated).
- [ ] T015 [US2] Create `apps/next/src/app/api/admin/gift/route.ts` with `GET`/`POST`/`PUT`/`DELETE`, calling `requireAdmin(request)` before parsing input or touching Prisma; move the Zod create/update schemas from `apps/next/src/app/api/gift/route.ts`; preserve cross-tenant reads (including `reservedByEmail`, `reservedByName`, `reservedAt`, `giftListId`, timestamps) and create/update/delete semantics; return safe 400/401/404 payloads and `Cache-Control: no-store` (FR-011–FR-013).
- [ ] T016 [US2] Delete `apps/next/src/app/api/gift/route.ts` and `apps/next/src/app/api/reserve/route.ts`; remove imports/helpers that become unused; run `grep -rn "/api/gift\\b\\|/api/reserve" apps packages docs specs --include='*.ts' --include='*.tsx' --include='*.md'` and confirm the only remaining references are historical specs/docs. The admin page caller is updated in US3 (FR-009, FR-010).
- [ ] T017 [US2] Verify the API contract manually or with a temporary script: `/api/gift` and `/api/reserve` return 404 for all methods; `/api/admin/gift` returns 401 without a cookie; after `POST /api/admin/auth/login` with the configured credential, it returns 200 and `GET`/`POST`/`PUT`/`DELETE` work; responses include `Cache-Control: no-store`; cookie flags are `HttpOnly`, `SameSite=Strict`, `Path=/` (FR-012, SC-004, SC-005).
- [ ] T018 [US2] Verify the public replacement path is untouched: exercise `GET /api/public/gift-lists/[shareCode]`, `POST .../gifts/[giftId]/reserve`, and `.../cancel`; confirm anonymous reservation still works and `/api/admin/gift` without a session leaks no data (FR-010, FR-020).

**Checkpoint**: US2 is independently verifiable at the API level: no anonymous legacy path remains, and admin data access requires a session.

---

## Phase 5: User Story 3 - The admin console is authorized server-side (Priority: P2)

**Goal**: `/admin` is gated on the server by the environment credential and a secure cookie; no credential or authorization flag is shipped to the browser; missing configuration fails closed.

**Independent Test**: Unauthenticated `/admin` redirects to `/admin/login`; valid credentials set an HttpOnly/SameSite=Strict cookie and render the admin UI; logout re-applies the gate; missing env makes admin unavailable while public pages remain 200.

### Implementation for User Story 3

- [ ] T019 [US3] Convert `apps/next/src/app/admin/page.tsx` into a server component: read the cookie with `getAdminSession`, render the unavailable state when admin is not configured, call `redirect('/admin/login?next=/admin')` when there is no valid session, and render `<AdminClient />` when authorized. Create `apps/next/src/app/admin/AdminClient.tsx` with the current admin UI (list/form/edit/delete/unreserve) and the `'use client'` boundary.
- [ ] T020 [US3] Remove the hardcoded `ADMIN_CREDENTIALS` (a hardcoded username/password pair), the `localStorage.admin_authenticated` reads/writes, and the client-side login form from `apps/next/src/app/admin/AdminClient.tsx`; call `/api/admin/gift` for GET/POST/PUT/DELETE; call `/api/admin/auth/logout` from the logout action and redirect to `/admin/login`; on a 401 from the API, redirect to `/admin/login` (FR-014, FR-018).
- [ ] T021 [US3] Create `apps/next/src/app/admin/login/page.tsx` (server component) and `apps/next/src/app/admin/login/AdminLoginForm.tsx` (client component): redirect to `/admin` when already authenticated; show the unavailable state (no form) when admin is not configured; post to `/api/admin/auth/login`; on success `router.replace` a validated relative `next` target (default `/admin`); display a generic error on 401 and a throttling message on 429. No client-side credential comparison (FR-014, FR-015).
- [ ] T022 [US3] Implement fail-closed behavior across `apps/next/src/app/admin/page.tsx`, `apps/next/src/app/admin/login/page.tsx`, and `apps/next/src/app/api/admin/auth/login/route.ts`: with `ADMIN_USERNAME` or `ADMIN_PASSWORD_HASH` absent, the page/login show unavailable, login returns 503, `/api/admin/gift` returns 401, no redirect loop occurs, and `/`, public lists, and reservations still succeed (FR-019, FR-020).
- [ ] T023 [US3] Audit the client bundle and sources: `grep -rn "ADMIN_USERNAME\\|ADMIN_PASSWORD_HASH\\|admin_authenticated\\|enzo" apps/next/src packages/app` must show no hardcoded credential or localStorage authorization; confirm no admin secret is referenced from a `'use client'` module; inspect the `web:build` output if needed (FR-015, FR-018, SC-006).
- [ ] T024 [US3] Exercise the admin flows manually: unauthenticated `/admin` redirect; valid login sets the cookie and renders the page; wrong password 401; 6th attempt within the window 429; logout clears the cookie and redirects; `/admin` after logout redirects again; public home/list/reserve remain functional. Record the steps and results (SC-006–SC-008).
- [ ] T025 [US3] Update `apps/next/src/app/admin/layout.tsx` metadata if needed so both `/admin` and `/admin/login` remain `private: true` / `noindex`; keep the existing Porcelain & Cobalt design tokens and accessibility attributes. No UI redesign is required.

**Checkpoint**: US3 is independently verifiable in a browser: no client-side authorization remains and the page is server-gated.

---

## Phase 6: User Story 4 - Security regression proof (Priority: P2)

**Goal**: An automated pglite suite proves the database exposure, default privileges, owner CRUD, admin gate, and legacy-route removal, and documents the one known skip.

**Independent Test**: `bun run test` runs `apps/next/tests/security-hardening.test.ts`; all assertions pass; the only skip is the documented `GiftGroup` blocker.

### Tests for User Story 4

- [ ] T026 [US4] Create `apps/next/tests/security-hardening.test.ts` with a pglite fixture that mirrors `apps/next/tests/password-reset.test.ts`: create `anon`/`authenticated`, reproduce Supabase's default privileges (tables, sequences, functions), apply every `apps/next/prisma/migrations/*/migration.sql` in sorted order, start `PGLiteSocketServer`, set `POSTGRES_PRISMA_URL`/`JWT_SECRET`/`ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH` (bcrypt rounds 4), and clean up in `after`.
- [ ] T027 [US4] Add the RLS/privilege assertions to `apps/next/tests/security-hardening.test.ts`: for `Gift`, `GiftList`, `FavoriteList` (and `_prisma_migrations` when present), `relrowsecurity = true`, `relforcerowsecurity = false`, zero `pg_policies` rows, `has_table_privilege` false for `anon`/`authenticated` on SELECT/INSERT/UPDATE/DELETE, and `has_sequence_privilege` false (FR-001–FR-003, FR-005, SC-001).
- [ ] T028 [US4] Add the default-privilege assertions to `apps/next/tests/security-hardening.test.ts`: `pg_default_acl` contains no entry granting future tables/sequences/functions to `anon`/`authenticated`; create a new table as the current role after the migration and assert both roles have no privileges on it (FR-004, SC-002).
- [ ] T029 [US4] Add the strict "every table in `public` has RLS" assertion to `apps/next/tests/security-hardening.test.ts`: enumerate `pg_class` (`relkind IN ('r','p')`) and assert `relrowsecurity` for every table. While `apps/next/prisma/migrations/20251117120000_add_gift_groups/` exists, document the exception for `GiftGroup` with a `test.todo`/skip that cites T003; remove the exception and the skip once the blocker is resolved. The suite must never silently ignore other tables (FR-021, FR-023, SC-009).
- [ ] T030 [US4] Add the owner-CRUD regression to `apps/next/tests/security-hardening.test.ts`: as the app connection, create a user, list, gift, and favorite; update and delete them; assert all succeed and that the migration did not change row counts or data (FR-007, SC-003).
- [ ] T031 [US4] Add the admin tests to `apps/next/tests/security-hardening.test.ts`: `/api/admin/gift` returns 401 without a cookie and 200 with a valid session; CRUD works; `/api/admin/auth/login` returns 401 for a wrong password, 200 with the right one, 429 after the limit, and 503 when env is absent; `Set-Cookie` includes `HttpOnly`/`SameSite=Strict`; `/api/gift` and `/api/reserve` are absent (`existsSync(path.resolve('src/app/api/gift/route.ts')) === false` and the reserve equivalent) (FR-012, FR-016–FR-019, SC-005–SC-007).
- [ ] T032 [US4] Add portability tests to `apps/next/tests/security-hardening.test.ts`: (a) a fresh PGlite without `postgres`/`anon`/`authenticated` and without `_prisma_migrations` applies all migrations without throwing; (b) a second PGlite with a `_prisma_migrations` stub applies all migrations and shows RLS + revoked grants on the stub. This proves the guards and the owner-bypass deploy path (FR-006, FR-022, SC-010).
- [ ] T033 [US4] Add a static assertion in `apps/next/tests/security-hardening.test.ts` (or a dedicated test) that the new migration contains no `USING (true)`, no `FORCE ROW LEVEL SECURITY`, and no `DROP`/`DELETE`/`TRUNCATE`; fail the test if any appears (FR-005, FR-008).
- [ ] T034 [US4] Run `bun run test`, record the pass/skip counts, confirm the only skip/todo is the `GiftGroup` blocker, and verify test isolation (no shared database; `prisma.$disconnect`, socket stop, and database close in `after`).

**Checkpoint**: US4 is independently verifiable: the suite proves the security posture and fails if any part regresses.

---

## Phase 7: Polish, Documentation & Verification Gate

**Purpose**: Run the canonical gates, update the two required docs, and prepare review evidence.

- [ ] T035 Run `bun run web:typecheck` for the TypeScript sources under `apps/next/src` and `packages/app`, and record the result.
- [ ] T036 Run `bun run test` for `apps/next/tests/**/*.test.ts` and record the result; confirm the new suite is included and the only skip is the documented blocker.
- [ ] T037 Run `bun run web:lint` for `apps/next/src` and record the result.
- [ ] T038 Run `bun run web:build` for the `apps/next` App Router surface and record the result (also enforced by Husky pre-commit).
- [ ] T039 Update `docs/spec-kit/app-baseline.md`: the hardened-table count is **6** (`User`, `PasswordResetToken`, `AuthRateLimit`, `Passkey`, `PasskeyChallenge`, `EmailVerificationToken`), not 5; add the new `harden_public_data_api` migration, the removed legacy routes, the `/api/admin/gift` replacement, and the new admin env names. Do not edit this file before the code tasks land.
- [ ] T040 Update root `AGENTS.md`: the canonical app state is `origin/main @ 5ac0528`, not `3b71904`; note the admin env names and the security-hardening migration. Keep it consistent with `.specify/memory/constitution.md` and the baselines.
- [ ] T041 Update deployment/environment documentation (for example `apps/next/DEPLOYMENT.md` if it lists env vars) with the `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` names and the Vercel targets; set the values in Vercel for production/preview/development (names only in the PR; never print values), and redeploy the preview that needs them.
- [ ] T042 Review `git diff --stat` and `git diff` in the repository root for scope creep, secrets, generated artifacts, and unintended schema changes; confirm the untracked `apps/next/prisma/migrations/20251117120000_add_gift_groups/` is not staged; confirm `apps/next/prisma/schema.prisma` and `schema.production.prisma` are unchanged.
- [ ] T043 Capture final evidence and update the PR description for `specs/030-db-rls-and-admin-hardening/`, behavior summary, migration filename and rollback note, env-var names, gate outputs, SQL probe results, manual flow results, and the preview URL once available.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: after Setup. T003 blocks T029 (strict all-tables test). T004 blocks US3's admin login/UI integration.
- **US1 (Phase 3)**: after Foundational. Independent of US2/US3; can run in parallel with them once T003/T004 are done.
- **US2 (Phase 4)**: after Foundational. Independent of US1; T012 must precede T013/T015/T017; T013 and T015 must precede T017; T016 must precede T017.
- **US3 (Phase 5)**: after US2 (T012–T015 provide the session helper, login, and admin data route). T019 precedes T020; T021 precedes T022/T024; T023 can run after T020/T021.
- **US4 (Phase 6)**: after US1–US3 implementation (T026 can be scaffolded in parallel, but its assertions need the migration and routes). T026 precedes T027–T033; T034 runs last.
- **Polish (Phase 7)**: after all desired stories. T035–T038 use the completed code; T039–T041 are documentation/deployment; T042–T043 close the review.

### User Story Dependencies

- **US1 (P1)**: no dependency on US2/US3; it is the database MVP.
- **US2 (P1)**: no dependency on US1; it is the API MVP. It provides the session helper/endpoints that US3 consumes.
- **US3 (P2)**: depends on US2 (`admin-auth.ts`, `/api/admin/auth/*`, `/api/admin/gift`) but is otherwise independently testable in the browser.
- **US4 (P2)**: depends on US1–US3; it is the cross-cutting proof.

### Within Each User Story

- US1: scaffold → SQL → review → local apply → owner CRUD → deploy-path proof → rollback docs.
- US2: session helper → login/logout → admin data route → delete legacy routes → verification.
- US3: server gate/client split → remove client auth → login page → fail-closed → audit → manual flows → metadata.
- US4: fixture → RLS/grants → default ACL → strict all-tables → owner CRUD → admin → portability → static assertion → run.

### Parallel Opportunities

- T002 and T004 are independent of the migration work.
- T005–T011 (US1) and T012–T016 (US2) touch disjoint files after Foundational and can run in parallel by two agents if coordinated.
- T019 and T021 are different pages/components and can be written in parallel; T020 follows T019.
- T026 (fixture scaffold) can be written while US2/US3 land, but its imports/assertions must be finalized after T015/T019–T021.
- T035, T037, and T038 are independent read-only gates; run them in any order, but do not report them as passed without the actual output.

---

## Parallel Example: US1 + US2

```bash
# Agent A (database):
Task: "Create and write apps/next/prisma/migrations/<timestamp>_harden_public_data_api/migration.sql"
Task: "Apply locally and prove build:vercel + owner CRUD"

# Agent B (admin API):
Task: "Create apps/next/src/lib/admin-auth.ts"
Task: "Create apps/next/src/app/api/admin/auth/login/route.ts and logout/route.ts"
Task: "Create apps/next/src/app/api/admin/gift/route.ts and delete the legacy route files"
```

## Parallel Example: US4

```bash
# After the implementation files exist:
Task: "Write the pglite fixture in apps/next/tests/security-hardening.test.ts"
Task: "Write the RLS/default-ACL/owner-CRUD assertions"
Task: "Write the admin 401/200/429 and legacy-route-absence assertions"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Setup + Foundational (T001–T004).
2. Complete US1 (T005–T011): the database exposure is closed and the deploy path is proven.
3. Complete US2 (T012–T018): the anonymous legacy paths are gone and the admin API is gated.
4. **STOP and VALIDATE** US1 + US2 independently: SQL probes, owner CRUD, 401/200, legacy 404.
5. Then complete US3 (admin UI) and US4 (regression suite), followed by Polish.

If only one story can ship, ship US1 first: it closes the widest exposure and is independent of the admin work.

### Incremental Delivery

1. US1: harden the database and prove the owner bypass → deployable security improvement.
2. US2: retire the legacy routes and add the authenticated admin API → no anonymous data path.
3. US3: server-gate the admin console and remove client credentials → admin surface is safe.
4. US4: lock the posture with tests → prevents the `FavoriteList`-style recurrence.

---

## Notes

- [P] tasks touch different files and have no dependency on an incomplete task.
- [Story] labels map tasks to `spec.md` stories for traceability.
- Tests are included because the feature explicitly requires them; write the assertions before or alongside the implementation and confirm the expected 401/403/false results.
- The `GiftGroup` blocker is real: the strict all-tables assertion cannot pass while `apps/next/prisma/migrations/20251117120000_add_gift_groups/` exists. Do not delete another agent's untracked work without coordination; T003 owns that decision.
- Do not modify `packages/app` or `apps/expo`; the native client is out of scope.
- Do not commit generated Prisma artifacts (`apps/next/src/generated/prisma`) or the untracked `GiftGroup` directory.
- Do not run `prisma db push`, `prisma migrate reset`, or destructive SQL against any shared database.
- A PR is not complete without the spec link, verification evidence, migration notes, env-var names, and preview URL.
