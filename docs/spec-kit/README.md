# Spec-Driven Development (Spec Kit) — Giftlist

This directory documents the Spec Kit installation for `giflist-solito`. The tooling is **github/spec-kit 0.16.0**, shared by three clients:

| Client | Command surface | Instruction file |
|--------|-----------------|------------------|
| **Claude Code** | `.claude/skills/speckit-*` (symlinks → `.agents/skills/speckit-*`) → `/speckit-*` slash commands | `CLAUDE.md` → imports `AGENTS.md` |
| **Codex CLI** | `.agents/skills/speckit-*/SKILL.md` → reference `speckit-*` skills | `AGENTS.md` |
| **DeepSeek Harness (DSH)** | `.agents/skills/speckit-*/SKILL.md` → `skill` tool with `speckit-*` | `AGENTS.md` + `CLAUDE.md` |

The scripts are bash (`.specify/scripts/bash/*.sh`, `--script sh`). All three clients share one `.specify/` core, so a spec written by Claude is readable by Codex and DSH.

## What is committed

```text
.specify/
├── memory/constitution.md      # Project principles (Giftlist-specific, v1.0.0)
├── templates/                  # spec / plan / tasks / checklist templates (plan+tasks customized)
├── scripts/bash/               # create-new-feature, setup-plan, setup-tasks, check-prerequisites
├── integrations/               # installed integration manifests (claude, codex)
├── integration.json            # active/default integration state
├── init-options.json           # sequential feature numbering, sh scripts
└── workflows/                  # Spec Kit workflow definitions

.claude/skills/speckit-*        # Claude Code adapters — symlinks to .agents/skills (single source)
.agents/skills/speckit-*        # CANONICAL skill instructions (Codex + DSH; Claude reads through links)

AGENTS.md                       # canonical agent guide (Codex/DSH; imported by Claude)
CLAUDE.md                       # Claude entry point
docs/spec-kit/                  # these docs + baselines
specs/                          # feature artifacts, committed with code
```

`specs/001-giftlist-baseline/` captures the app as it exists today (canonical `origin/main` @ `acde7cc`, 2026-10-28). New features start at `specs/002-…`.

## Single source of truth for skills

Spec Kit installs two full copies of the ten `speckit-*` skills: `.claude/skills` (Claude format) and `.agents/skills` (Codex/DSH format). Giftlist avoids that duplication:

- **Canonical**: `.agents/skills/speckit-*/SKILL.md` — full instructions, used directly by Codex and DSH.
- **Claude adapters**: `.claude/skills/speckit-*` are **relative symlinks** to `../../.agents/skills/speckit-*`. Claude Code officially supports symlinked skill folders and reads `SKILL.md` from the target ([docs](https://code.claude.com/docs/en/skills), “Symlinked folders”).
- **Regenerate after an upgrade** (which replaces links with real copies):

```sh
./.specify/scripts/bash/sync-claude-skill-links.sh
```

The script removes/recreates the links and verifies each one resolves to a readable `SKILL.md`. Never edit files under `.claude/skills` or `.agents/skills` by hand: update the canonical `.agents` copy (or upgrade Spec Kit) and re-link.

> Trade-off: `specify integration status` reports the 10 Claude Spec Kit skills as “modified” because the symlinked target carries the canonical Codex/DSH format instead of Spec Kit's Claude copy. That is expected (see Troubleshooting). The project also ships an unmanaged `ui-ux-design` skill linked the same way. Before running `specify integration upgrade --force`, remove the links first (or run the upgrade and then the sync script) so the upgrade cannot write through a link into the canonical copy.

## The working agreement

**Every feature request must go through Spec Kit before code is written.** The pipeline is:

```text
speckit-specify → (speckit-clarify) → speckit-plan → speckit-tasks → speckit-analyze → speckit-implement
```

- `speckit-specify` creates `specs/NNN-<slug>/spec.md` (WHAT/WHY, user stories, requirements, success criteria).
- `speckit-plan` fills `plan.md`: technical context, constitution check, cross-platform impact, data/migration plan, verification plan.
- `speckit-tasks` produces `tasks.md` grouped by user story with exact paths and a mandatory verification phase.
- `speckit-analyze` is the pre-implementation consistency gate.
- `speckit-implement` executes tasks; nothing is “done” without evidence (typecheck/tests/lint/build + manual flows).

Use `speckit-clarify` whenever scope, data, permissions, or UX are ambiguous. Use `speckit-converge` to reconcile an existing area with its spec, and `speckit-taskstoissues` to file GitHub issues (`gh` is authenticated).

## Per-client usage

### Claude Code

```text
/speckit-specify "Add gift groups to lists"
/speckit-clarify
/speckit-plan
/speckit-tasks
/speckit-analyze
/speckit-implement
```

Claude loads `CLAUDE.md`, which imports `AGENTS.md` and the constitution. It discovers skills in `.claude/skills/` — those entries are symlinks to the canonical `.agents/skills/` copies.

### Codex CLI

Codex reads `AGENTS.md` from the repo root and discovers skills in `.agents/skills/`. Reference the skill by name in your prompt (for example `speckit-specify`) or pick it from the skill interface, then provide the feature description. Do not pass `$ARGUMENTS` literally; replace it with the description.

### DeepSeek Harness (DSH)

DSH loads `AGENTS.md` (and `CLAUDE.md`) and scans `.agents/skills/`. Call the `skill` tool with the exact skill name, then provide the feature description in the prompt:

```text
skill name: speckit-specify
prompt: Add gift groups to lists, including grouping, ordering, and web + native display.
```

DSH exposes the ten `speckit-*` skills automatically once `.agents/skills/` is present.

## Why the setup matches this repository

- Bun 1.4.4, Next.js 16.4.3, Expo SDK 54, Prisma 6.16, PostgreSQL, Vercel `apps/next` — all encoded in the constitution, `AGENTS.md`, and the customized plan/tasks templates.
- Commands in templates are the real ones (`bun run web:typecheck`, `bun run test`, `bun run web:build`, `db:migrate:create`, …), not generic placeholders.
- The plan template forces cross-platform impact, data/migration planning, and a verification plan; the tasks template forces a verification gate.
- Deployment reality (main → production, previews per branch, migrations inside `build:vercel`, SSO-protected previews) is encoded as a constitution principle and a deployment section in `AGENTS.md`.

## Maintenance

```sh
specify integration status        # expect 12 intentional "modified" entries: 10 Claude links + 2 customized templates
specify integration list          # list available integrations and installed state
specify check                     # tool availability for every integration
```

- Do **not** hand-edit `.claude/skills/**` or `.agents/skills/**`. Reinstall/upgrade with `specify integration upgrade --force` (or `specify integration install <key> --force`), then:
  1. re-apply the local customizations in `.specify/templates/plan-template.md` and `tasks-template.md` (upgrades overwrite shared templates);
  2. run `./.specify/scripts/bash/sync-claude-skill-links.sh` to restore the single-source links.
- When upgrading Claude specifically, remove the symlinks first (`find .claude/skills -type l -name 'speckit-*' -delete`) so the upgrade cannot write through a link into the canonical `.agents` copy. Then run the sync script.
- The constitution is authored content: upgrade scripts will not change it.
- Add a new client? `specify integration install <key>`, then document its invocation here and in `AGENTS.md`. If it supports symlinked skills, add it to the sync script.
- If `specify` is missing: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git` (this machine has it at `~/.local/bin/specify`).

## Drift policy

This repository has multiple worktrees, and local checkouts can lag `origin/main` (the current checkout may show pnpm/Next 15 while production runs Bun/Next 16). **Always** `git fetch` and plan from current `origin/main`. The baselines record the commit they describe; if they disagree with `origin/main`, update the baselines rather than trusting stale files.

## Access to the running product and GitHub

- **Vercel**: use the Vercel MCP plugin (read-only reads for project/deployments/env names). Project `giflist-solito`, team `enzofrnts-projects`. Do not read secret values, do not change settings without explicit confirmation.
- **GitHub**: use the authenticated `gh` CLI for repo/PR/issue/check operations. Confirm the target repo and branch before writing.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `specify integration status` reports `WARNING` with **12 modified managed files** (10 Claude + 2 shared) | Expected and intentional: the 10 `.claude/skills/speckit-*` entries are symlinks to the canonical `.agents` copies, and `plan-template.md` / `tasks-template.md` are customized for Giftlist. The custom `ui-ux-design` skill is linked too but is not tracked by the integration manifest. `Missing managed files` and `Invalid manifest paths` must stay `0`. Do not run `integration upgrade --force` without re-applying the template customizations and re-running the skill-link sync. |
| Agent does not see the skills | Confirm `.agents/skills/` exists and `.claude/skills/speckit-*` links resolve (`./.specify/scripts/bash/sync-claude-skill-links.sh`); restart the client so it re-scans. |
| `Not a Spec Kit project` | Run from the repo root that contains `.specify/`. |
| Scripts not executable | `chmod +x .specify/scripts/bash/*.sh` (should already be executable). |
| Feature directory not found by plan/tasks | Re-run `speckit-specify` or check `.specify/feature.json`; scripts also accept a feature directory argument. |
| `$ARGUMENTS` appears literally | Replace it with the actual feature description in the prompt. |
| Stale checkout | `git fetch origin`, then rebase/switch onto `origin/main` before planning; report the drift if you cannot change branches. |
