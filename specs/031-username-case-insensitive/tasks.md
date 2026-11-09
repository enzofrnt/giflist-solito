# Tasks: Case-Preserving Pseudos

**Input**: Design documents from `/specs/031-username-case-insensitive/`

**Prerequisites**: `plan.md`, `spec.md`, `AGENTS.md`, `.specify/memory/constitution.md`

**Tests**: Required (spec SC-003). The pure shared-rule test lives in `apps/next/tests/username.test.ts`; the database/lookup regressions live in the existing pglite fixture (`apps/next/tests/password-reset.test.ts`), because two pglite fixtures in one Bun process share the Prisma singleton.

**Organization**: US1 (registration) and US2 (lookups) share the foundational shared-rule task; US3 (profile editors) consumes the same rule.

## Phase 1 — Foundational

- [x] T001 Create `packages/app/lib/usernameValidation.ts`: `USERNAME_MIN`, `USERNAME_MAX`, `USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/`, `USERNAME_HINT`, `USERNAME_ERROR`, `sanitizeUsernameInput` (case-preserving), `isValidUsername`.
- [x] T002 Rebuild `apps/next/src/lib/usernames.ts` on T001: `normalizeUsername` = trim (case-preserved), `isValidUsername`, `usernameFromName` (unchanged lowercase slug), `uniqueUsername` with case-insensitive candidate check.

## Phase 2 — US1: registration

- [x] T003 Update `apps/next/src/app/api/auth/register/route.ts` to use `USERNAME_RE` and the shared message.
- [x] T004 Update `registerUser` in `apps/next/src/lib/auth.ts`: trim-only storage, shared validation, `findFirst` with `mode: 'insensitive'` for duplicates.
- [x] T005 Update `apps/next/src/app/register/page.tsx`: shared validation/hint, case-preserving input sanitizer, no lowercase regex.
- [x] T006 Update `packages/app/features/native/register.tsx`: shared rule/hint, case-preserving sanitizer, `isValidUsername` for the submit guard.

## Phase 3 — US2: lookups and search

- [x] T007 Update `apps/next/src/app/api/users/[username]/route.ts` to case-insensitive equality.
- [x] T008 Update `apps/next/src/lib/public-profile.ts` to case-insensitive equality.
- [x] T009 `apps/next/src/app/u/[username]/page.tsx` needed no change: `normalizeUsername` now trims and `getPublicProfile` compares case-insensitively (covered by T016).
- [x] T010 `apps/next/src/app/api/search/route.ts` needed no change: the query is already `contains` + `mode: 'insensitive'`; `normalizeUsername` now trims only.
- [x] T011 Update `apps/next/src/lib/sitemap.ts` to keep stored casing and de-duplicate on the lowercase key.

## Phase 4 — US3: profile editors

- [x] T012 Update `apps/next/src/app/profile/ProfileClient.tsx`: case-preserving sanitizer, `pattern="[A-Za-z0-9_]{3,30}"`, shared hint, send trimmed value.
- [x] T013 Update `apps/next/src/app/api/auth/profile/route.ts`: trim-only validation/storage, insensitive duplicate check, truthful message.
- [x] T014 Update `packages/app/features/native/profile.tsx`: shared rule/hint and case-preserving sanitizer.

## Phase 5 — Database and tests

- [x] T015 Add `apps/next/prisma/migrations/20261109120000_username_case_insensitive/migration.sql` with the `lower(username)` unique index; applied by the pglite fixture and enforced by T016.
- [x] T016 Add `apps/next/tests/username.test.ts` (pure shared rule) and two integration tests in `apps/next/tests/password-reset.test.ts`: case-preserved storage, case-insensitive duplicate refusal, case-insensitive public lookup, DB `P2002` on `lower(username)`, suffix collision handling, sitemap casing (`sitemap.test.ts`).

## Phase 6 — Verification and ship

- [x] T017 `bun run web:typecheck` — green.
- [x] T018 `bun run test` — green: 87 pass / 7 skip / 0 fail (baseline 84 pass; 3 new tests).
- [x] T019 `bun run web:lint` — 0 error, 31 pre-existing warnings; none introduced by this change.
- [x] T020 `bun run web:build` — green (Bun 1.4.2 local vs canonical 1.4.4; Vercel runs 1.4.x).
- [ ] T021 Review `git diff`; commit only the feature files; push branch; open PR with spec link and evidence; merge to `main` (auto-deploy production); report the deployment result.

## Dependencies

- T002 after T001.
- T003–T006 after T002.
- T007–T011 after T002 (parallel with T003–T006).
- T012–T014 after T002.
- T015–T016 after T002; T016 after T004/T008/T011.
- T017–T020 after all code tasks; T021 last.
