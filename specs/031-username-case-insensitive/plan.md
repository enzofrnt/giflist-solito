# Implementation Plan: Case-Preserving Pseudos

**Branch**: `fix/username-case-insensitive` | **Date**: 2026-11-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/031-username-case-insensitive/spec.md`

**Delivery scope**: Web (`apps/next`), API route handlers, one forward-only PostgreSQL migration, shared validation in `packages/app/lib`, and the native screens that consume it (`packages/app/features/native`). No native-only dependency and no new package.

## Summary

Make the pseudo rule single-sourced and case-preserving:

1. Add `packages/app/lib/usernameValidation.ts` — the only definition of the rule (`/^[A-Za-z0-9_]{3,30}$/`), the hint, the input sanitizer (preserves case) and `isValidUsername`.
2. Rewrite `apps/next/src/lib/usernames.ts` on top of it: `normalizeUsername` becomes trim-only (case preserved), `usernameFromName`/`uniqueUsername` keep generating lowercase handles but check case-insensitively.
3. API: Zod schema imports the shared pattern; `registerUser` and the profile route store the trimmed, case-preserved value and check duplicates with `mode: 'insensitive'`.
4. Lookups: `/u/[username]`, `/api/users/[username]`, `getPublicProfile` and search use case-insensitive comparisons; the sitemap keeps the stored casing and de-duplicates case-insensitively.
5. Migration `20261109120000_username_case_insensitive`: `CREATE UNIQUE INDEX "User_username_lower_key" ON "User" (lower("username"));`. `@unique` on `username` stays; the functional index closes the `Joris`/`joris` race.
6. Web registration/profile and native registration/profile consume the shared rule and hint, strip invalid characters while preserving case, and send the case-preserved value.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 24.x on Vercel, Bun 1.4.4 (local runtime is 1.4.2 — reported, not silently accepted)

**Primary Dependencies**: Next.js 16.4.3 App Router, Prisma 6.16.x (PostgreSQL), Zod 4.x, `@electric-sql/pglite` for tests. No new dependency.

**Storage**: PostgreSQL. `schema.prisma` / `schema.production.prisma` are unchanged (Prisma cannot express a functional index); the migration adds it in raw SQL, forward-only. Existing rows are already lowercase because every write path called `normalizeUsername`, so the index creation cannot collide on current data; if it did, the deploy fails safely and production keeps the previous build.

**Testing**: `bun test` under `apps/next/tests` with the ephemeral pglite fixture (same setup as `password-reset.test.ts`, applying every migration in directory order). New `username.test.ts` covers the shared rule, case-preserved storage, case-insensitive uniqueness and case-insensitive public lookup.

## Constitution Check

- **III — Shared-first**: the rule moves to `packages/app/lib`; `apps/next` and native import it. No reverse dependency (no Prisma in `packages/app`).
- **IV — Forward-only data**: one additive migration (unique functional index), no column/type change, no destructive SQL, schemas untouched. Production applies it via `build:vercel`.
- **V — Security**: Zod still validates at the API boundary; ownership, `authVersion` and email login untouched. Case-insensitive duplicate checks do not leak whether a pseudo exists beyond the already-existing 409 semantics.
- **VI — Evidence**: gates and a dedicated test suite are listed in tasks; the local Bun 1.4.2 mismatch is reported.
- **VII — Deployment continuity**: ship by branch + PR + merge to `main` (merge = production deploy). No manual deploy.

## Data Model / Migration

No Prisma model change. New migration file:

```sql
CREATE UNIQUE INDEX "User_username_lower_key" ON "User" (lower("username"));
```

`User.username` remains `@unique` (case-sensitive) plus this case-insensitive guarantee. Generated handles (`usernameFromName`) stay lowercase; user-chosen handles keep their casing.

## Lookup Contract

| Surface | Before | After |
|---|---|---|
| `/u/[username]` | trim + lowercase, exact match | trim, `equals` + `mode: 'insensitive'` |
| `/api/users/[username]` | trim + lowercase, exact match | trim, `equals` + `mode: 'insensitive'` |
| `getPublicProfile` | lowercase, exact match | trim, `equals` + `mode: 'insensitive'` |
| Search | lowercase + `contains` insensitive | trim + `contains` insensitive |
| Register/profile duplicate check | exact match | `equals` + `mode: 'insensitive'` |
| Sitemap | lowercased URL | stored casing, de-duplicated on lowercase key |

## Verification

```sh
bun run web:typecheck
bun run test           # includes apps/next/tests/username.test.ts
bun run web:lint
bun run web:build
```

Plus a manual check of `/register` with `Joris88`, `/u/joris88` and the profile editors (web; native via `bun run native` is not runnable in this headless workspace — reported as unverified).

## Risks

- A pre-existing mixed-case duplicate would make the unique index fail. Historical writes normalized to lowercase, so this is unlikely; failure is fail-safe (build fails, old deployment stays live).
- Case-insensitive lookups on PostgreSQL cannot use a plain btree index efficiently; profile lookup volume is low and the functional unique index still serves equality on `lower(username)` if needed later.
