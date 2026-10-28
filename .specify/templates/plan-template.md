# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. Replace every placeholder with concrete facts; leave no `NEEDS CLARIFICATION` unresolved before `/speckit-tasks`.

## Summary

[Extract from spec: primary requirement, target user, delivery scope (web / native / both), and the technical approach chosen during research]

## Technical Context

<!--
  The values below describe the canonical Giftlist stack (origin/main @ acde7cc, 2026-10-28).
  Update a field ONLY if this feature intentionally changes it, and justify the change in
  Constitution Check / Complexity Tracking.
-->

**Language/Version**: TypeScript 5.x, React 19.1.0, React Native 0.81.5, Node 24.x (Vercel), Bun 1.4.4

**Primary Dependencies**: Next.js 16.4.3 (App Router, Webpack), Solito, React Navigation 7, Expo SDK 54, Prisma 6.16.x, Zod 4.x, Tailwind CSS v4

**Storage**: PostgreSQL (Supabase in production, Docker locally) through Prisma. Versioned migrations in `apps/next/prisma/migrations`; `schema.prisma` and `schema.production.prisma` stay identical.

**Testing**: `bun test` (`apps/next/tests/*.test.ts`) with `@electric-sql/pglite` ephemeral PostgreSQL; WebAuthn e2e uses Chrome + virtual authenticator (`CHROME_PATH`)

**Target Platform**: Web (modern browsers, giftlist.fr on Vercel) and iOS/Android (Expo, SDK 54). State the actual scope of this feature here.

**Project Type**: Cross-platform monorepo: `apps/next` (web + API), `apps/expo` (native), `packages/app` (shared)

**Performance Goals**: [feature-specific, e.g. list page interactive < 2 s on 4G; API p95 < 300 ms; no N+1 Prisma queries]

**Constraints**: [feature-specific, e.g. offline-safe native behavior; no new native modules; public share links must not require auth; previews must use isolated DB credentials]

**Scale/Scope**: [feature-specific, e.g. up to 1k gifts per list, 10k users, 2 screens; or N/A]

**Environment variables**: [new/changed names only, targets (production/preview/development), and whether `.env.example` must change. Never values.]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluate every gate and record PASS / N/A / VIOLATION (with justification):

- [ ] **Spec-driven**: Spec exists, is committed, and covers the full scope of this plan; PR will link it.
- [ ] **Cross-platform**: Delivery scope is explicit; shared logic lives in `packages/app`; platform files use `.web` / `.native`; both clients verified when in scope.
- [ ] **Boundaries**: No imports from `apps/*` into `packages/app`; server-only code stays in `apps/next`; single Bun lockfile.
- [ ] **Data**: Schema changes update both Prisma schemas, add a forward-only migration, and are safe for previews. No `db push` / `reset` against shared DBs.
- [ ] **Security**: Zod validation at boundaries, server-side ownership checks, no secret leakage, auth flows rate-limited and authVersion-aware.
- [ ] **Evidence**: Verification commands below are runnable; plan states exactly what will be run and what evidence will be captured.
- [ ] **Deployment**: No manual production deploy; env-var changes documented; build remains green with `build:vercel`.

Any violation MUST be justified below, with the simpler alternative that was rejected.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (if data changes)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API/route contracts, if any)
├── checklists/          # Quality checklists (/speckit-checklist)
└── tasks.md             # /speckit-tasks output (not created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/next/                     # Web + API (Vercel Root Directory)
├── src/app/                   # App Router: pages, layouts, route handlers
│   ├── api/                   # Route handlers (auth, gift-lists, public, scrape-product, ...)
│   ├── dashboard/ list/ manage/ profile/ admin/ login/ register/
│   └── forgot-password/ reset-password/ setup-passkey/
├── src/components/            # Web-only React components
├── src/lib/                   # auth, auth-request, middleware, prisma, passkeys, email, password-reset
├── prisma/                    # schema.prisma, schema.production.prisma, migrations/
├── scripts/build-vercel.mjs   # Deploy-time migrations + build
└── tests/                     # bun test suites

apps/expo/                     # Native app (Expo SDK 54)
├── App.tsx, index.js, app.json
└── ios/ (generated, not committed)

packages/app/                  # Shared across web + native
├── components/                # Header, LogoImage, FlickeringGrid
├── features/                  # home/, user/
├── navigation/                # native navigation
├── provider/                  # navigation + safe-area, .web/.native variants
├── hooks/ lib/ types/         # useAuth, authStorage, passwordValidation, Gift/GiftList/User types
├── assets/
└── index.ts
```

**Structure Decision**: [State which directories this feature touches and why. If shared code is needed, say which module moves/lands in `packages/app` and how both clients consume it.]

## Cross-Platform Impact

| Client | Impacted? | What changes | Verification |
|--------|-----------|--------------|--------------|
| Web (`apps/next`) | [yes/no] | [routes, components, API] | [commands / manual flow] |
| Native (`apps/expo`) | [yes/no] | [screens, navigation, native modules] | [simulator/manual flow] |
| Shared (`packages/app`) | [yes/no] | [types, hooks, components] | [typecheck + both clients] |

## Data & Migration Plan

<!-- Delete this section only if the feature touches no data at all. -->

- **Models affected**: [User / GiftList / Gift / Passkey / PasswordResetToken / AuthRateLimit / none]
- **Schema changes**: [exact fields/relations; both schema files updated]
- **Migration**: `apps/next/prisma/migrations/<timestamp>_<name>/migration.sql` — forward-only, preview-safe; destructive steps require a backfill plan
- **Backfill / data migration**: [none, or step-by-step, run before deploy]
- **Rollback**: [strategy if the deploy must be reverted]
- **Preview database impact**: [what happens to Gift-dev; isolation verified]

## API & Contracts

<!-- Delete if no HTTP surface changes. -->

| Method | Path | Auth | Request schema (Zod) | Response | Notes |
|--------|------|------|----------------------|----------|-------|
| [GET] | [/api/...] | [public/session/owner] | [fields] | [shape/statuses] | [rate limit, ownership] |

## Phase 0: Research

- [ ] Resolve every `NEEDS CLARIFICATION` from the spec and Technical Context
- [ ] Confirm existing patterns to reuse (read the closest current route/component first)
- [ ] Record decisions and rejected alternatives in `research.md`

## Phase 1: Design

- [ ] `data-model.md` (if data changes)
- [ ] `contracts/` (if HTTP surface changes)
- [ ] `quickstart.md` (how to run and verify locally)
- [ ] Re-run Constitution Check after design

## Verification Plan

Exact commands to run before completion, with expected evidence:

```sh
bun run web:typecheck
bun run test
bun run web:lint
bun run web:build
# migration features only:
bun run --cwd apps/next db:migrate:create --name <description>   # review SQL, then apply locally
# native/shared UI only:
bun run native
```

- [ ] Web flows exercised manually (list the flows)
- [ ] Native flows exercised if in scope (list the flows)
- [ ] Migration applied and reverted on a local database
- [ ] `git diff` reviewed for scope creep and secrets
- [ ] PR description includes spec link, evidence, env/migration notes

## Complexity Tracking

> Fill ONLY if a Constitution Check gate is violated or a non-canonical dependency/structure is introduced.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g. new native module] | [current need] | [why the existing Expo modules are insufficient] |
