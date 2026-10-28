# Giftlist Constitution

<!--
  Canonical application snapshot: origin/main @ acde7cc (2026-10-28).
  Operational guidance for coding agents lives in /AGENTS.md and /CLAUDE.md.
  Baselines: docs/spec-kit/app-baseline.md, docs/spec-kit/vercel-baseline.md.
  Template version: Spec Kit 0.16.0.
-->

**Project**: Giftlist (`giflist-solito`) — a cross-platform gift-list app: Next.js web + API, Expo native app, shared Solito package, PostgreSQL/Prisma, deployed on Vercel at giftlist.fr.

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature, enhancement, or behavior change begins with a written specification. No application code is written before the feature has a spec, an implementation plan, and ordered tasks. The required pipeline is:

1. `/speckit-specify` — capture WHAT and WHY in `specs/NNN-slug/spec.md`
2. `/speckit-clarify` — only when requirements are ambiguous or high-impact
3. `/speckit-plan` — decide HOW in `specs/NNN-slug/plan.md`
4. `/speckit-tasks` — produce dependency-ordered `tasks.md`
5. `/speckit-analyze` — verify spec/plan/tasks consistency before coding
6. `/speckit-implement` — execute tasks, then verify

Rules:

- The spec is the source of truth for behavior. If implementation must deviate, update the spec first.
- Changes that alter existing behavior MUST update the relevant spec, not only the code.
- Exceptions are limited to typo/docs-only edits and emergency production hotfixes (a retroactive spec is required the next working day).
- Every feature directory is committed with its spec, plan, tasks, and checklists. A PR MUST link its spec directory.
- When in doubt, stop and specify. An unwritten requirement is an unverified requirement.

### II. Cross-Platform Parity

Giftlist ships one product through two clients. Behavior must be defined once and shared wherever possible.

- Shared product logic, types, validation, and presentational components live in `packages/app`.
- Web-only concerns (App Router pages, API routes, middleware, Prisma) live in `apps/next`.
- Native-only concerns (Expo config, native navigation, native modules) live in `apps/expo`.
- Platform-specific implementations use `.web.tsx` / `.native.tsx` (and `.web.ts` / `.native.ts`) siblings, never runtime platform checks scattered through business logic.
- Every spec MUST state its delivery scope: web, native, or both. If both, both MUST be verified before completion. A feature must not silently ship to only one client.
- Native is currently a shell (shared home + user-detail screens); do not assume web/native parity. Each feature explicitly declares native scope, and native gaps are tracked as specs rather than hidden.
- Do not duplicate business rules between apps; move them into `packages/app` and import from both.

### III. Monorepo Boundaries and Shared-First Design

- Dependency direction is one-way: `apps/next` and `apps/expo` may depend on `packages/app`; `packages/app` MUST NOT import from either app.
- Types used by both clients belong in `packages/app/types`; validation shared between clients belongs in `packages/app/lib`.
- Server-only code (Prisma, secrets, Next request handlers) MUST stay in `apps/next`.
- Bun 1.4.4 is the only runtime and package manager. `bun.lock` is the only lockfile; never add `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`. `bunfig.toml` intentionally uses a hoisted linker for Metro/Solito.
- Add pure-JS shared dependencies to the package that uses them; add native dependencies to `apps/expo` (and keep versions aligned when a dependency is shared).

### IV. Data Integrity and Forward-Only Migrations

PostgreSQL is the only database. Production and development both use PostgreSQL; SQLite is not a supported target.

- `apps/next/prisma/schema.prisma` and `apps/next/prisma/schema.production.prisma` MUST remain identical (modulo nothing). Any schema change updates both.
- Every schema change ships with a committed, versioned migration in `apps/next/prisma/migrations`, created with `bun run --cwd apps/next db:migrate:create --name <description>` and reviewed before applying.
- Migrations are forward-only and MUST be safe for previews that share a pre-production database. Destructive operations require an explicit data-migration plan in `plan.md`.
- Never run `db push`, `migrate reset`, or destructive SQL against production. Production applies `prisma migrate deploy`, never `db push`.
- Vercel deploys run migrations inside `bun run build:vercel`; a migration failure fails the build. Therefore a schema change is not "done" until its migration is committed, reviewed, and applies cleanly.
- Tests that touch data use the ephemeral PostgreSQL/pglite setup; do not point tests at shared or production databases.

### V. Security and Privacy by Default (NON-NEGOTIABLE)

- Authentication: JWT sessions (HS256) with bcrypt password hashing, optional WebAuthn passkeys, and expiring password-reset tokens stored only as SHA-256 hashes.
- Password reset and auth-version changes MUST invalidate outstanding sessions/passkeys consistently (`authVersion` semantics).
- All request input MUST be validated at the API boundary (Zod). Return the correct HTTP status and never leak stack traces or internals.
- Authorization is checked server-side on every mutation: a user may only read/modify their own lists and gifts. Public share endpoints MUST expose only the fields intended for public view and must never leak owner emails or secrets.
- Secrets (`JWT_SECRET`, `RESEND_API_KEY`, database URLs, passkey RP secrets) stay in environment variables or Vercel settings. Never commit them, never log them, never copy production values into previews.
- Preview deployments use isolated credentials and an isolated database. A passkey registered in preview is not valid in production; the relying-party domain logic must respect Vercel URLs.
- Rate limiting on auth endpoints is a requirement, not a nice-to-have. New auth flows must include abuse protection.
- The current codebase has documented violations of these rules (base spec: `specs/001-giftlist-baseline/spec.md` → Known Baseline Gaps, and `docs/spec-kit/app-baseline.md` §4). They are remediation items, not precedent: new work must neither extend them nor rely on them, and fixing them requires its own spec.

### VI. Evidence Before Completion

A task is complete only when it has been verified, and the verification is reported.

- Run the canonical gates that apply: `bun run web:typecheck`, `bun run test`, `bun run web:lint`, `bun run web:build`, plus native checks when `apps/expo` changes.
- Never claim a command passed without running it in this workspace. Paste the command and its result summary.
- UI changes that affect web and native MUST be checked in both clients (or explicitly flagged as unverified).
- Report known gaps honestly: skipped tests, untested iOS/Android builds, environment limitations.
- Review `git diff` before declaring completion; do not mix unrelated changes or accidentally commit generated artifacts/secrets.

### VII. Deployment Continuity

- `main` is production. Merging to `main` auto-deploys to Vercel project `giflist-solito` (Root Directory `apps/next`, Bun 1.4.x, region `cdg1`) and serves giftlist.fr / www.giftlist.fr.
- Every branch/PR gets a Vercel preview. Previews run migrations against the preview database; they are SSO-protected.
- Feature work never deploys manually. Ship by merge, and keep `main` releasable at all times.
- Environment-variable changes are part of the feature: update `apps/next/env.example`, document them, set them in Vercel for the right targets, and redeploy previews that need them.
- The build must stay green: `bun install --frozen-lockfile` at the repo root, then `bun run build:vercel` in `apps/next`.

## Additional Constraints (Technology Stack)

Canonical versions as of the baseline snapshot; changes require a plan and a constitution check:

- **Runtime/tooling**: Bun 1.4.4 (`packageManager`, `.bun-version`, `bunfig.toml`), Node 24.x on Vercel.
- **Web**: Next.js 16.4.3 App Router, Webpack (`--webpack`) because Solito/react-native-web aliases are required. Do not switch to Turbopack without a plan that proves Solito compatibility.
- **UI**: React 19.1.0, React DOM 19.1.0, Tailwind CSS v4, PostCSS, Solito, React Navigation 7, Expo SDK 54, React Native 0.81.5, Moti, Dripsy.
- **Data**: Prisma 6.16.x, `@prisma/client` 6.16.x, PostgreSQL (Supabase in production, Docker locally).
- **Auth**: `jsonwebtoken`, `bcryptjs`, `@simplewebauthn/server`/`browser` 14.x.
- **Email**: Resend (`RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_EMAIL_DOMAIN`, `APP_URL`).
- **Scraping**: Puppeteer and optional ScrapingBee (`SCRAPINGBEE_API_KEY`).
- **QR**: `qrcode`, `qrcode-generator`, `qr-code-styling`, `react-native-svg`.
- **Tests**: `bun test` with `@electric-sql/pglite` ephemeral PostgreSQL; WebAuthn e2e uses Chrome with a virtual authenticator (`CHROME_PATH` override supported).
- **Validation**: Zod 4.x.
- **Observability**: `@vercel/speed-insights`.

## Development Workflow and Quality Gates

### Before specifying

1. `git fetch` and confirm the branch is based on current `main`; local worktrees can lag. If the checkout is stale, stop and sync before planning.
2. Check for unrelated working-tree changes; keep this feature's writes disjoint and do not commit someone else's work.

### Gates

| Gate | Command | Applies to |
|------|---------|-----------|
| Spec lint | `/speckit-analyze` | Every feature before implementation |
| Typecheck | `bun run web:typecheck` | Any TypeScript change |
| Tests | `bun run test` | Auth, data, crypto, email, server logic |
| Lint | `bun run web:lint` | Any code change |
| Web build | `bun run web:build` | Before push (also runs in Husky pre-commit) |
| Native smoke | `bun run native` / `bun run --cwd apps/expo export` | Any `apps/expo` or shared UI change |
| Migration check | `bun run --cwd apps/next db:migrate:create` + review SQL + apply locally | Any Prisma schema change |

### Implementation and review

- Implement in task order, smallest reviewable diff per task, and run the relevant gate after each logical change.
- Every PR MUST contain: linked spec, summary of behavior change, verification evidence, migration notes (if any), env-var changes (names only), and preview URL when available.
- Reviewers MUST verify constitution compliance; deviations require explicit justification in the plan's Complexity Tracking.
- Do not push directly to `main`; use a branch and PR. Keep commits scoped and messages imperative.

## Governance

- This constitution supersedes conflicting conventions. `AGENTS.md`, `CLAUDE.md`, and Spec Kit templates are operational derivatives and MUST stay consistent with it.
- Amendments are proposed via PR with rationale, a semver version bump, an update to **Last Amended**, and corresponding updates to agent instructions and templates.
- Version history and ratification date are recorded below. Compliance is checked by `/speckit-analyze` and in code review.

**Version**: 1.0.0 | **Ratified**: 2026-10-28 | **Last Amended**: 2026-10-28
