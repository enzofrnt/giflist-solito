# Vercel Deployment Baseline — giflist-solito

**Captured**: 2026-10-28 19:2x Europe/Paris
**Purpose**: factual deployment baseline for the Spec Kit constitution (`.specify/memory/constitution.md`) and plan template (`.specify/templates/plan-template.md`).
**Mode**: read-only. No project, deployment, domain, env var, or setting was created, patched, promoted, rolled back, or deleted.

## 0. Provenance and confidence

| Item | Source | Confidence |
| --- | --- | --- |
| Project, domains, deployments, env var names | Vercel MCP plugin (`https://mcp.vercel.com`), read-only calls: `get_project`, `list_deployments`, `filter_project_envs`, `list_project_domains` | High — returned by Vercel API |
| Team/scope | `apps/next/.vercel/project.json` (`orgId`) + project `accountId` (match) | High |
| Build/install/region/framework | Canonical `origin/main:apps/next/vercel.json` + `apps/next/DEPLOYMENT.md` | High (repo-declared) |
| Root Directory, Build Command as configured *in the Vercel project record* | Not exposed by the read calls used | **TODO** — see §8 |

> **Note on retrieval**: the MCP plugin is authorized and connected for this workspace, but in the delegated capture session the tool-loading gate blocked direct calls (`adenxie_vercel_mcp_load_tools` → "The parent Agent must load these Vercel MCP tools first"), so the raw read responses were pulled once through the plugin in the lead session and are transcribed here. No `vercel` CLI was used and no plugin credential files were read (both out of scope). Every number below is from that single read; nothing is inferred except where marked.

## 1. Account / team

| Field | Value |
| --- | --- |
| Scope | Team `enzofrnts-projects` |
| Team ID | `team_B5BCUGJ6Zkjk0PiOR12QzQs9` |
| MCP endpoint | `https://mcp.vercel.com` (plugin: `@adenxie/dsh-vercel`) |
| Notes | Calls scoped with an explicit `teamId` returned **403** for this team; project-id/name-only calls succeed. Spec Kit tooling/scripts should **not** send `teamId`. |

## 2. Matching project

Exactly one project matches this repository.

| Field | Value |
| --- | --- |
| Name | `giflist-solito` |
| Project ID | `prj_iBGFAXN3borSQ2zFcTq9q8zAxtFU` |
| Framework | `nextjs` |
| Node.js version | `24.x` |
| Runtime for functions | Bun `1.4.x` (`bunVersion` in `apps/next/vercel.json`); repo pin `.bun-version` = `1.4.4` |
| Root Directory | `apps/next` (per `apps/next/DEPLOYMENT.md`; not exposed by `get_project` — TODO §8) |
| Install Command | `cd ../.. && bun install --frozen-lockfile` |
| Build Command | `bun run build:vercel` → `bun scripts/build-vercel.mjs` |
| Regions | `cdg1` (single region, Paris) |
| Git repository | `https://github.com/enzofrnt/giflist-solito` (`origin`) |
| Production branch | `main` |
| `live` flag | `false` (project-level "live" indicator reported false despite READY production deploys — not a failure; do not treat as outage) |
| Password protection | disabled |
| SSO protection | **enabled**, `deploymentType: all_except_custom_domains` |
| Trusted IPs | disabled |
| On-demand cache | `ENABLE_ROOT_PATH_BUILD_CACHE` set in all three targets |

## 3. Domains

| Domain | Role | Verified | Created (Europe/Paris) |
| --- | --- | --- | --- |
| `giftlist.fr` | Apex, production | yes | 2025-11-05 10:51 |
| `www.giftlist.fr` | `www` of apex, production | yes | 2025-11-06 12:14 |
| `giflist-solito.vercel.app` | Vercel default | yes | — |
| `giflist-solito-enzofrnts-projects.vercel.app` | Team-scoped alias | (reported in project domain list) | — |
| `giflist-solito-git-main-enzofrnts-projects.vercel.app` | Branch alias for `main` | (reported in project domain list) | — |

No redirect domains configured. **Canonical production URL: `https://giftlist.fr`** (`https://www.giftlist.fr` serves the same project).

## 4. Deployments

### 4.1 Current state

| Role | Deployment | State | Env | Branch | Commit | Created (Europe/Paris) |
| --- | --- | --- | --- | --- | --- | --- |
| **Latest production** | `dpl_42X6AVBBxBWrqAoD8Xvf4i428un8` | READY | production | `main` | `acde7cc9d27bc268d52a6e8e3cdee1f25928f096` | 2026-10-28 19:23 |
| Latest preview | `dpl_53CZjjDvi67suervLQNiCT7zARgH` | READY | preview | `codex/passkeys` | `903f2ed` | 2026-10-28 19:17 |

- Production is **green and current**: the deployed SHA `acde7cc` is the tip of `origin/main` ("Merge PR #8 from enzofrnt/codex/passkeys — Add passkey authentication on the web").
- Latest preview URL: `giflist-solito-trgm70ua0-enzofrnts-projects.vercel.app` (SSO-protected).

### 4.2 Recent history (last 15, newest first)

| # | Deployment | State | Env | Branch | Commit | Created (Europe/Paris) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `dpl_42X6AVBBxBWrqAoD8Xvf4i428un8` | READY | production | main | `acde7cc` | 2026-10-28 19:23 |
| 2 | `dpl_53CZjjDvi67suervLQNiCT7zARgH` | READY | preview | codex/passkeys | `903f2ed` | 2026-10-28 19:17 |
| 3 | `dpl_Dhk3HysHYZ6iZJ81jvq7ioTbYwDH` | READY | preview | codex/passkeys | `cce2735` | 2026-10-28 19:06 |
| 4 | `dpl_J9KDE8nbNQsbgVejQRJHeeVc8wX9` | READY | production | main | `ee6622f` | 2026-10-28 18:58 |
| 5 | `dpl_584A5xMmCw3WWoWLHrmmVqCrJYg7` | CANCELED | preview | codex/bun-migration | `d4a1c96` | 2026-10-28 18:57 |
| 6 | `dpl_DdmQ5TRCtNKt7wD6VLXxtmG94CbR` | READY | production | main | `a07f981` | 2026-10-28 18:54 |
| 7 | `dpl_CnP4q3Kk41Ub119tV8sLZ8Yu9ygc` | READY | preview | codex/password-reset | `8c20386` | 2026-10-28 18:50 |
| 8 | `dpl_Cv5NuEeS5hdH847KfgyY1KCqwCdG` | READY | preview | codex/bun-migration | `7f0933f` | 2026-10-28 18:50 |
| 9–14 | (six further READY previews) | READY | preview | codex/bun-migration, codex/password-reset | `6856d7c`, `eb1c37e`, `8988daa`, `0b0f2d5`, `f27d27f`, … | 2026-10-28 |
| 15 | `dpl_2EuMFjWmkyJs6LqimLUArftRVKGi` | **ERROR** | preview | codex/password-reset | `e59d978` | 2026-10-28 18:17 |
| — | last READY production on old `main` | READY | production | main | `29dc59e` | 2025-11-06 18:07 |

### 4.3 Failures observed

1. **`ERROR` — `dpl_2EuMFjWmkyJs6LqimLUArftRVKGi`** (preview, `codex/password-reset`, `e59d978`, 2026-10-28 18:17). Build failed. **Root cause not captured** — the read calls used do not include build logs. TODO §8. Note `e59d978` is the current local `HEAD` of this checkout.
2. **`CANCELED` — `dpl_584A5xMmCw3WWoWLHrmmVqCrJYg7`** (preview, `codex/bun-migration`, `d4a1c96`). Commit message records a merge with conflicts in `package.json` / `pnpm-lock.yaml`; the run was canceled rather than failed. Historic pnpm→Bun transition noise; not a live defect.

No failed production deployment is in the recent window — production has not been broken by the migration/passkeys work.

## 5. Environment variables

Names only. No values, ciphertext, or decryption was requested or observed (`decrypt: false`). **19 distinct names**, returned as **35 target-scoped entries** (one per name × target).

### 5.1 Presence matrix

| Variable | Production | Preview | Development | Required by |
| --- | --- | --- | --- | --- |
| `ENABLE_ROOT_PATH_BUILD_CACHE` | yes | yes | yes | Vercel build cache |
| `JWT_SECRET` | yes | yes | — | session/token signing |
| `EMAIL_FROM` | yes | yes | — | Resend sender |
| `RESEND_API_KEY` | yes | yes | — | password-reset email |
| `APP_URL` | yes | **no (by design)** | — | email links; previews derive origin from `VERCEL_BRANCH_URL` / `VERCEL_URL` |
| `RESEND_EMAIL_DOMAIN` | yes | — | — | Resend domain scoping |
| `POSTGRES_PRISMA_URL` | yes | yes | yes | Prisma runtime (pooled) |
| `POSTGRES_URL` | yes | yes | yes | Prisma/Vercel Postgres |
| `POSTGRES_URL_NON_POOLING` | yes | yes | yes | **migrations** (direct connection, priority 1) |
| `POSTGRES_USER` | yes | yes | yes | Vercel Postgres |
| `POSTGRES_PASSWORD` | yes | yes | yes | Vercel Postgres |
| `POSTGRES_DATABASE` | yes | yes | yes | Vercel Postgres |
| `POSTGRES_HOST` | yes | yes | yes | Vercel Postgres |
| `SUPABASE_URL` | yes | yes | yes | Supabase |
| `SUPABASE_ANON_KEY` | yes | yes | yes | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | yes | yes | Supabase (server-only) |
| `SUPABASE_JWT_SECRET` | yes | yes | yes | Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | yes | client Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | yes | yes | client Supabase |

**Database separation**: Production → `Gift-Production`; Preview and Development → `Gift-dev` (per `apps/next/DEPLOYMENT.md`). Preview deployments therefore migrate the *dev* database, never production.

### 5.2 Variables documented locally but **absent** from Vercel

| Variable | Reality |
| --- | --- |
| `DATABASE_URL` | Absent in all targets. Harmless: build falls back `POSTGRES_URL_NON_POOLING` → `DATABASE_URL` → `POSTGRES_PRISMA_URL`, and production defines the first. But `apps/next/env.example` still presents it as the Supabase option. |
| `NEXT_PUBLIC_BASE_URL` | Absent in all targets **and unused in code** (`git grep` on `origin/main` finds it only in `env.example`). Dead config — remove from the example. |
| `NEXT_PUBLIC_APP_URL` | **Absent, but read by code** — see risk R3. |

## 6. Observability / integrations

- **Deployment status**: production READY at `acde7cc`; preview pipeline healthy except one historical ERROR (§4.3).
- **Vercel Speed Insights**: `@vercel/speed-insights ^1.2.0` is a dependency of `apps/next`, so production traffic reports to the project's Speed Insights.
- **Protected previews**: SSO protection is on for `all_except_custom_domains`, so `*.vercel.app` previews require a Vercel account in the team. Custom domains (`giftlist.fr`, `www`) are exempt → public.
- **Build cache**: root-path build cache enabled for all targets.
- **Hidden production env vars**: `get_project`/`filter_project_envs` reported a `hiddenProductionEnvCount` field; **value not captured — TODO §8**. If non-zero, §5.1 is incomplete.
- Not inspected (out of scope / not requested): logs, analytics, cron jobs, firewall rules, integrations (Supabase/Resend connectors).

## 7. Local checkout vs canonical deployment (important)

**This working tree is stale relative to what Vercel builds.** Vercel deploys `origin/main`, which no longer resembles the local checkout.

| Aspect | Local checkout (this worktree, branch `codex/password-reset`) | Canonical `origin/main` (= what deploys) |
| --- | --- | --- |
| Package manager | pnpm (`packageManager: pnpm@10.12.4`), `pnpm-lock.yaml` | **Bun** `1.4.4` (`bun.lock`, `.bun-version`, `bunfig.toml`) |
| Next.js | `15.5.2` | **`16.4.3`** |
| Vercel config location | root `vercel.json` (framework nextjs, `chmod +x build.sh && ./build.sh`, `pnpm install`, `regions [cdg1]`) | **`apps/next/vercel.json`** (`bunVersion 1.4.x`, `bun install --frozen-lockfile`, `build:vercel`, `regions [cdg1]`). **No root `vercel.json`.** |
| Build entry | `apps/next/build.sh` (copies schema, `db push` fallback, `pnpm next build`) | `apps/next/scripts/build-vercel.mjs` (Bun.spawn; migrate deploy then build). **No `build.sh`.** |
| Prisma schema | mutates `schema.prisma` by copying `schema.production.prisma` at build | generates directly from `schema.production.prisma`; **no schema file rewriting** |
| Local DB | SQLite (`dev.db`) documented | PostgreSQL only in docs; no SQLite |
| `NEXT_PUBLIC_SUPABASE_*`, passkeys | absent | present (`@simplewebauthn/*`) |

**Consequences for Spec Kit work:**
- Anyone reading the local tree will document the wrong deployment. Treat `origin/main` as the source of truth and refresh the worktree before planning (the local branch is also 2 commits *behind* its remote).
- The local root `vercel.json` and `build.sh` must **not** be "fixed up" or re-added — they were deliberately deleted in the Bun/Next 16 migration. A plan that preserves them would silently regress the deploy to pnpm + `db push`.
- Local uncommitted changes exist (`apps/next/prisma/schema.prisma`, `schema.production.prisma`, new `prisma/migrations/20251117120000_add_gift_groups/`). They are **not** deployed and are unrelated to this capture.

## 8. Gaps, mismatches, and risks

**R1 — Build machine must provide Bun.** `bunVersion: "1.4.x"` + `bun run build:vercel` + `cd ../.. && bun install` mean the deploy is Bun-native. Any change that reverts to npm/pnpm installs, or removes `bunVersion`, breaks the build.

**R2 — Migrations run *inside* the deploy build, not as a separate step.** `scripts/build-vercel.mjs` runs `prisma migrate deploy` (120 s timeout, connected via `POSTGRES_URL_NON_POOLING` → `DATABASE_URL` → `POSTGRES_PRISMA_URL`) **before** `next build`, and **throws if the migration fails** or if `VERCEL` is set with no DB URL. No `db push`, no reset, no data-loss flags. So: a committed migration is applied automatically on deploy; an uncommitted schema edit is not. Preview deploys migrate `Gift-dev`, production deploys `Gift-Production`.

**R3 — `metadataBase` falls back to a domain this project does not own.** `apps/next/src/app/layout.tsx:19` uses `process.env.NEXT_PUBLIC_APP_URL || 'https://gift.enzo-frnt.fr'`. `NEXT_PUBLIC_APP_URL` is **not** in the Vercel env inventory, and `gift.enzo-frnt.fr` is **not** among the project domains. Production OG/canonical URLs therefore point at a foreign domain while the site serves `giftlist.fr`. Highest-value concrete defect found; fix is either set `NEXT_PUBLIC_APP_URL=https://giftlist.fr` in Vercel or derive from `APP_URL`/`VERCEL_*`.

**R4 — `APP_URL` is production-only, intentionally.** `apps/next/src/lib/email.ts` throws without `APP_URL`, but `getAppOrigin` special-cases `VERCEL_ENV=preview` to use `VERCEL_BRANCH_URL`/`VERCEL_URL` (enforced by `tests/email-config.test.ts`). Don't "helpfully" add `APP_URL` to preview — that would make every preview email link to production, and the test suite explicitly guards against it.

**R5 — Preview env vars are snapshotted at deployment creation.** `DEPLOYMENT.md` states an env change requires redeploying existing previews. Also relevant to WebAuthn: preview `RP ID`/origin is derived from `VERCEL_URL`/`VERCEL_BRANCH_URL` (`apps/next/src/lib/passkeys.ts:17`), so passkey tests must run on a preview whose alias matches, and SSO-protected previews need a logged-in Vercel session in the browser.

**R6 — Single region `cdg1`.** Latency-sensitive features should assume EU-only compute; no multi-region or edge deployment exists.

**R7 — Two stale artifacts must be flagged, not followed**: root `vercel.json`, `apps/next/build.sh`, and `apps/next/env.example`'s `NEXT_PUBLIC_BASE_URL` / `DATABASE_URL` guidance are all superseded.

### TODO — not verifiable with the read calls used
1. Project-record **Root Directory / Build Command / Install Command** (only `vercel.json` in-repo is confirmed; the dashboard values are assumed to match). Check with `get_project` on a client that returns `projectSettings`, or the dashboard.
2. Root cause of the `ERROR` build at `e59d978` (needs build logs / `get_deployment` events).
3. `hiddenProductionEnvCount` — whether additional production-only names are hidden from `filter_project_envs`.
4. Git integration details (auto-deploy on push, PR preview comments, ignored build step) — deployment targets show `main → production`, branches → previews, which implies GitHub app integration, but the integration settings weren't read.
5. Node `24.x` vs any `engines` field: repo declares no `engines`; the pin is Vercel-side only.

## 9. What the Spec Kit constitution / plan template should encode

Suggested constitution additions (deployment & delivery principles):

1. **One deployed surface.** The web app deploys from **`apps/next`** via the Vercel project `giflist-solito` (`prj_iBGFAXN3borSQ2zFcTq9q8zAxtFU`, team `team_B5BCUGJ6Zkjk0PiOR12QzQs9`). Vercel configuration is versioned **only** in `apps/next/vercel.json`; no root-level `vercel.json` may be reintroduced.
2. **Production branch is `main`.** Merge to `main` ⇒ autodeploy to production at `https://giftlist.fr`. Every other branch ⇒ a preview deployment (SSO-protected) against `Gift-dev`. No manual promote/rollback step exists today, so "merge" is the release action — hence PR review is the release gate.
3. **Bun is the only toolchain.** `bun@1.4.4`, sole lockfile `bun.lock`, `bunVersion 1.4.x`. Plans must not introduce npm/pnpm/yarn lockfiles or `engines`-based Node installs.
4. **Schema changes ship as committed Prisma migrations.** Edit `apps/next/prisma/schema.production.prisma` → generate a migration under `apps/next/prisma/migrations/` → commit it. The Vercel build runs `prisma migrate deploy` **before** `next build` and **fails the deploy** if migration fails. Never use `prisma db push`, `migrate reset`, or `--accept-data-loss` in a deploy path. A feature that changes the schema is not "done" until its migration is committed; otherwise production runs new code against an old schema.
5. **Feature work needs a migration + verification plan**: state which database the migration affects (preview → `Gift-dev`, production → `Gift-Production`), and confirm both were exercised.
6. **Env vars change in three places.** Any new variable must be added in Vercel (correct target: production / preview / development), documented in `apps/next/env.example`, and set in local `.env` (gitignored). Secrets never enter Git. Because preview values are snapshotted per deployment, redeploy previews after changing preview env.
7. **Origin correctness is a hard requirement.** Any generated absolute URL (email, OAuth/WebAuthn, OG metadata) must use the documented origin resolution: `APP_URL` in production, `VERCEL_BRANCH_URL`/`VERCEL_URL` in preview, never a hardcoded domain fallback (R3 is the counter-example).
8. **Single region `cdg1`** — no plan may assume multi-region or edge persistence.

Suggested plan-template `Technical Context` fill-ins (replacing the placeholders at `.specify/templates/plan-template.md:21-37`):

```
Language/Version: TypeScript 5; Bun 1.4.4; Next.js 16.4.3 (Webpack, not Turbopack, for Solito/RN aliases)
Primary Dependencies: Next.js, React 19.1, react-native-web 0.21, Prisma 6, @simplewebauthn/*, Resend, Tailwind 4
Storage: PostgreSQL (Supabase) — production "Gift-Production", preview/dev "Gift-dev"; Prisma migrations only
Testing: bun test (apps/next/tests/*.test.ts), tsx/prisma for DB-backed tests; typecheck via bun run web:typecheck
Target Platform: Vercel serverless, region cdg1, Node 24.x runtime with Bun 1.4.x function runtime; plus Expo native apps (out of Vercel scope)
Project Type: monorepo web app (apps/next deployed) + shared packages/*
Deployment: git push to main → production https://giftlist.fr; other branches → SSO-protected previews
```

## 10. Verification steps performed

- `adenxie_vercel_mcp_account action=status` → authorized, MCP connected (238 tools available).
- Read-only Vercel reads (via plugin, lead session): `get_project(giflist-solito)`, `list_deployments(projectId, limit 15)`, `filter_project_envs(decrypt=false)`, `list_project_domains`.
- Local reads: `vercel.json`, `apps/next/.vercel/project.json`, `apps/next/build.sh`, `apps/next/next.config.ts`, `apps/next/env.example`, `apps/next/DEPLOYMENT.md`, root/app `package.json`, `git remote -v`, `git branch -vv`.
- Canonical reads via git (no checkout): `.bun-version`, `apps/next/vercel.json`, `apps/next/package.json`, root `package.json`, `apps/next/scripts/build-vercel.mjs`, `apps/next/env.example`, `apps/next/DEPLOYMENT.md` at `origin/main`; `git ls-tree origin/main`; `git grep` for `NEXT_PUBLIC_BASE_URL`, `APP_URL`, `DATABASE_URL`, `VERCEL_BRANCH_URL`.
- **No** create/patch/promote/redeploy/rollback/delete calls. **No** env values decrypted or printed. **No** source file modified; sole write is this document.
