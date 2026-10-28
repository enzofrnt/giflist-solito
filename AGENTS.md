# Giftlist — Agent Guide (AGENTS.md)

This file is the canonical operating guide for every coding agent working in this repository: **DeepSeek Harness (DSH)**, **Codex CLI**, and **Claude Code**. It is loaded automatically (`AGENTS.md` by Codex/DSH, and via `@AGENTS.md` from `CLAUDE.md` by Claude). It is an operational derivative of `.specify/memory/constitution.md` and must never contradict it.

- **Canonical app state**: `origin/main` @ `3b71904` (2026-10-28). Production on Vercel is deployed from this commit.
- **Baselines**: [docs/spec-kit/app-baseline.md](docs/spec-kit/app-baseline.md) and [docs/spec-kit/vercel-baseline.md](docs/spec-kit/vercel-baseline.md).
- **Constitution**: [.specify/memory/constitution.md](.specify/memory/constitution.md) — read it before planning.
- **Spec Kit**: github/spec-kit 0.16.0, integrations `claude` + `codex`, shared scripts `sh`.

---

## 1. NON-NEGOTIABLE: every feature goes through Spec Kit

The user has a standing instruction: **any feature, enhancement, or behavior change must be specified with Spec Kit before implementation.** Do not write application code straight from a chat request.

Required pipeline, in order:

1. **`speckit-specify`** — create `specs/NNN-<slug>/spec.md` from the user's request (WHAT/WHY, user stories, requirements, success criteria). Never skip this.
2. **`speckit-clarify`** — optional, but REQUIRED when scope, permissions, data, or UX are ambiguous. Resolve `[NEEDS CLARIFICATION]` with the user.
3. **`speckit-plan`** — fill `plan.md` (technical context, constitution check, cross-platform impact, data/migration plan, verification plan).
4. **`speckit-tasks`** — generate dependency-ordered `tasks.md` grouped by user story.
5. **`speckit-analyze`** — run the consistency gate before coding (spec ↔ plan ↔ tasks). Fix gaps rather than ignoring warnings.
6. **`speckit-implement`** — execute tasks in order, run the verification gate, report evidence.

How to invoke the same skill in each client:

| Client | Package installed | How to invoke | Context file |
|--------|-------------------|---------------|--------------|
| Claude Code | `.claude/skills/speckit-*` (symlinks to the canonical `.agents/skills`) | Slash command: `/speckit-specify <description>`, `/speckit-plan`, `/speckit-tasks`, `/speckit-analyze`, `/speckit-implement` | `CLAUDE.md` (imports this file) |
| Codex CLI | `.agents/skills/speckit-*` | Reference the skill `speckit-specify` (or `$speckit-specify`) with the feature description; skills are discovered from `.agents/skills` | `AGENTS.md` (this file) |
| DeepSeek Harness (DSH) | `.agents/skills/speckit-*` | Call the `skill` tool with name `speckit-specify`, then provide the feature description in the prompt | `AGENTS.md` + `CLAUDE.md` (this file) |

Additional rules:

- One `speckit-specify` invocation creates exactly one feature directory. Do not hand-create spec directories.
- The baseline feature is `specs/001-giftlist-baseline/`. New features start at `002`.
- Specs/plans/tasks are committed in the same PR as the code. A PR without its spec link is incomplete.
- If implementation must deviate from the spec, update the spec/plan first, then code.
- Allowed bypasses: typo/docs-only changes, and emergency production hotfixes (write the retroactive spec the next working day). Anything else that skips the pipeline is a violation.
- Use `/speckit-converge` to reconcile the current codebase with a spec when adopting an existing area, and `/speckit-taskstoissues` when work should be tracked in GitHub Issues (`gh` is available and authenticated).

## 2. Before you touch code: sync, inspect, scope

- Run `git fetch origin` and compare with `origin/main`. This repo has several worktrees and local checkouts frequently lag `main`. If the current checkout is stale, **stop and say so**; do not plan or implement against an outdated tree.
- Check `bun --version`. Canonical is **1.4.4** (`>=1.4.4 <1.5.0`); this machine may still have 1.4.2. Do not run `bun install --frozen-lockfile` or a release build with a mismatched Bun — report the mismatch or use a compatible Bun, and never claim a gate passed under the wrong runtime.
- Expect unrelated uncommitted work (e.g. Prisma WIP, other agents' files). Never revert, stash, format, or commit someone else's changes. Keep your write set disjoint and report what you touched.
- Read the closest existing implementation before creating a new pattern: a route in `apps/next/src/app/api/**/route.ts`, a shared type in `packages/app/types`, a component in `apps/next/src/components`.
- Prefer the smallest correct change. No speculative abstractions, no new dependencies without a plan entry.

## 3. Canonical app state (snapshot 2026-10-28)

| Area | Canonical |
|------|-----------|
| Runtime / package manager | **Bun 1.4.4** (`bun.lock` only, `bunfig.toml` hoisted linker, `.bun-version`) |
| Web | **Next.js 16.4.3** App Router, Webpack (`--webpack`), React 19.1.0, Tailwind CSS v4 |
| Native | **Expo SDK 54**, React Native 0.81.5, React Navigation 7, Moti/Dripsy |
| Shared | `packages/app` (Solito) — components, features, hooks, lib, types, providers |
| Data | PostgreSQL + **Prisma 6.16.x** (Supabase production, Docker local); migrations in `apps/next/prisma/migrations` |
| Auth | JWT (HS256) + bcryptjs + WebAuthn passkeys (`@simplewebauthn/*` 14.x) + password reset via Resend |
| Email / scraping | Resend (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_DOMAIN`), Puppeteer + optional ScrapingBee |
| Deploy | Vercel project `giflist-solito` (`prj_iBGFAXN3borSQ2zFcTq9q8zAxtFU`, team `enzofrnts-projects`), Root Directory `apps/next`, region `cdg1`, Node 24.x, Bun 1.4.x |
| Domains | `giftlist.fr`, `www.giftlist.fr` (production); previews are SSO-protected |

If a fact here disagrees with a fetched `origin/main`, **`origin/main` wins** — update this file and the baselines in the same PR.

## 4. Commands (Bun only — never pnpm/npm/yarn)

Run from the repository root unless stated otherwise.

| Task | Command |
|------|---------|
| Install (CI-identical) | `bun install --frozen-lockfile` |
| Local dev (web) | `bun run web:dev` |
| Local dev (native) | `bun run native` |
| Typecheck | `bun run web:typecheck` |
| Tests | `bun run test` (password-reset suite); add/run suites under `apps/next/tests/*.test.ts` with `bun test` |
| Lint | `bun run web:lint` |
| Web build (local, no migrations) | `bun run web:build` |
| Production-equivalent build | `bun run --cwd apps/next build:vercel` (runs migrations; needs a DB URL) |
| Local database | `bun run --cwd apps/next docker:up` / `docker:down` / `docker:reset` |
| Prisma client | `bun run --cwd apps/next db:generate` |
| Migration (create) | `bun run --cwd apps/next db:migrate:create --name <description>` |
| Migration (apply local) | `bun run --cwd apps/next db:migrate:dev` |
| Migration (deploy, preview/prod only) | `bun run --cwd apps/next db:migrate` |
| Prisma Studio | `bun run --cwd apps/next db:studio` |
| Native export smoke | `bun run --cwd apps/expo export` |

Spec Kit maintenance (only when explicitly updating tooling):

```sh
specify integration status
specify integration upgrade --force   # then re-apply local template customizations
```

## 5. Repository map and boundaries

```text
apps/next/     Web + API + Prisma (Vercel Root Directory)
apps/expo/     Native client (Expo)
packages/app/  Shared product code consumed by both clients
specs/         Spec Kit feature artifacts (spec, plan, tasks, checklists)
docs/spec-kit/ Baselines and operating docs
.specify/      Spec Kit core: memory/constitution.md, templates, bash scripts
.claude/       Claude Code adapters (`.claude/skills/speckit-*` are symlinks to `.agents/skills`)
.agents/       CANONICAL skills for Codex + DSH (and the target of Claude's links)
```

- `packages/app` MUST NOT import from `apps/*`.
- Server-only code (Prisma, secrets, request handling) MUST stay in `apps/next`.
- Platform-specific implementations use `.web.tsx`/`.native.tsx` (or `.ts`) siblings.
- Never commit `.env*`, secrets, `.next/`, `node_modules/`, generated native projects, or `src/generated/prisma` edits (it is regenerated).

## 6. Implementation rules

### Cross-platform first
- Put behavior shared by web and native in `packages/app`; web-only UI in `apps/next/src/components`; native-only UI in `apps/expo` or `.native` files.
- A feature spec must state scope (web / native / both); verify every in-scope client.

### API route handlers (`apps/next/src/app/api/**/route.ts`)
- Parse and validate input with Zod; return proper status codes (`400/401/403/404/409/429/500`) and safe error payloads.
- Use the existing auth helpers (`src/lib/auth-request.ts`, `src/lib/auth.ts`, `src/lib/middleware.ts`) instead of re-reading tokens/JWTs ad hoc.
- Enforce ownership server-side for every list/gift mutation. Public share endpoints expose only public fields.
- Do not add callers of the legacy unauthenticated routes (`/api/gift`, `/api/reserve`) or rely on client-side admin gating; the Known Baseline Gaps in `specs/001-giftlist-baseline/spec.md` are defects to remediate, not patterns to extend.
- Use the `src/lib/prisma.ts` singleton; avoid N+1 queries and unbounded result sets.
- Rate-limit auth-sensitive endpoints (existing `AuthRateLimit` pattern).

### Data and migrations
- Update **both** `schema.prisma` and `schema.production.prisma` identically.
- Create a versioned migration with `db:migrate:create`, review the SQL, apply and test it locally, and commit it with the schema change.
- Forward-only and preview-safe. No `db push`, no `migrate reset`, no destructive SQL against shared/production databases.
- Vercel applies migrations during `build:vercel`; a broken migration fails the deploy.
- Tests use the ephemeral PostgreSQL/pglite fixture, never a shared database.

### Auth and security
- Never log or commit secrets; never copy production credentials into previews.
- Preserve `authVersion` invalidation semantics for password reset/change and passkey removal.
- Passkeys: relying-party domain must match the current host (production vs preview); verify origin checks.
- Validate all redirects/URLs and never trust client-supplied ownership IDs.

### Dependencies and configuration
- Add dependencies with Bun only; `bun.lock` is the single lockfile. Native modules go in `apps/expo` (or aligned versions across packages).
- New env var? Update `apps/next/env.example`, document targets, and set it in Vercel (production/preview/development as appropriate). Never print values.
- Next.js config aliases/Webpack tweaks are load-bearing for Solito/react-native-web; do not remove or switch to Turbopack without a plan that proves parity.

## 7. Verification and definition of done

A task is done only with evidence. Run every gate that applies and report the commands + outcomes:

```sh
bun run web:typecheck
bun run test          # required for auth/data/crypto/email/server logic
bun run web:lint
bun run web:build     # also enforced by Husky pre-commit
```

- Any Prisma change: migration created, SQL reviewed, applied locally, both schemas in sync.
- Any native/shared-UI change: run the app and exercise the flow; run `bun run --cwd apps/expo export` as a smoke check.
- Any env change: `.env.example` + Vercel targets documented.
- Review `git diff` for scope creep, secrets, and generated files before reporting.
- If something could not be verified, say so explicitly. Never claim a test/command passed without running it.

## 8. Git, pull requests, deployment

- Branch from current `origin/main`; never push directly to `main`. Use descriptive names (`feat/...`, `fix/...`, `chore/...`).
- Commit messages: imperative, scoped; do not mix unrelated changes.
- PR body must include: linked spec directory, behavior summary, verification evidence, migration notes, env-var names, and the Vercel preview URL once available.
- Merging to `main` auto-deploys production (Vercel). Merging is the deploy action; do not run manual Vercel deploys for feature work.
- Use `gh` for GitHub operations (repo, PRs, issues, checks). Confirm the target repo/branch before writing.
- Preview deployments run migrations against the preview database and are SSO-protected; treat preview data as disposable and isolated.

## 9. Keeping Spec Kit healthy

- `.specify/` (constitution, templates, scripts) and the `.agents/` skills are **committed**. `.claude/skills/*` are committed symlinks to `.agents/skills/*` (single source of truth, including `speckit-*` and `ui-ux-design`). Do not gitignore any of them.
- Do not hand-edit `.claude/skills/**` or `.agents/skills/**`; they are managed by `specify`. Update the canonical `.agents` copy (or upgrade Spec Kit), then run `./.specify/scripts/bash/sync-claude-skill-links.sh` to restore Claude's links. Re-apply the template customizations after an upgrade.
- Before running `specify integration upgrade --force`, delete the Claude skill links first (`find .claude/skills -type l -name 'speckit-*' -delete`) so the upgrade cannot write through a link into the canonical copy; then re-run the sync script.
- `specs/` is committed. Runtime pointer `.specify/feature.json` is generated by the scripts.
- Keep `AGENTS.md`, `CLAUDE.md`, the constitution, and `docs/spec-kit/*` consistent when architecture or deployment changes.
- See [docs/spec-kit/README.md](docs/spec-kit/README.md) for installation, per-agent usage, drift handling, and upgrade steps.

## 10. UI/UX changes

- The approved **Design Charter** is in `.specify/memory/constitution.md` and the visual system in `docs/design-system/`. They are mandatory.
- Load the **`ui-ux-design` skill** for any UI/UX work (new screen, header/navigation, menu/dialog, form, empty/loading/error state, redesign). In DSH use the `skill` tool; Claude has `/ui-ux-design`; Codex reads the same skill from `.agents/skills`.
- Write a short UX brief + screen/action audit in the feature spec/plan before coding. Applying tokens without fixing hierarchy/friction is not a redesign.
- Header rules: real logo on the left, nav grouped left (not centred), account menu from the avatar with logout inside, no separate logout button. Do not add a burger that duplicates the account menu/primary nav; short menus are anchored popovers, never app-wide dim overlays/scroll locks. Keep the account menu minimal (profile + logout; lists only when nav is hidden).
- Actions: one primary per view; secondary/destructive actions in overflow menus; public list is list-first, never brand-first.
- Verify with 1440/768/390 screenshots, keyboard/focus, dialogs/menus and the canonical gates.

## 11. When unsure

- Ambiguous requirement: ask the user via clarification (or the `speckit-clarify` skill) before planning. Do not silently invent product decisions.
- Stale/divergent checkout: report it and sync before writing code.
- Conflicting instructions: `.specify/memory/constitution.md` > this file > convenience. The latest direct user instruction in the conversation wins over all of them for the current task, except security and data-integrity rules.
