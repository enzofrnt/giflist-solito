# UX Refinement Verification

**Branch**: `feat/ux-refinement` · **Date**: 2026-10-28
**Skill**: `.agents/skills/ui-ux-design` · **Charter**: constitution v1.1.0

## UX checks (Puppeteer, signed-in/out mocked data)

| Check | Result |
|-------|--------|
| Real logo present in header | pass |
| Nav grouped left (left offset 86px from brand) | pass |
| Nav not centred | pass |
| Separate header logout absent | pass |
| Home black CTA band absent | pass |
| Home has 3 “how it works” steps | pass |
| Account menu opens; ArrowDown focuses an item | pass |
| Account menu closes on Escape; focus restored to trigger | pass |
| Dashboard card overflow menu fully in viewport (not clipped by card) | pass |
| Manage list overflow menu opens | pass |
| Mobile drawer width 288px (≤20rem), inside viewport | pass |
| Mobile drawer closes on Escape | pass |
| Signed-out drawer shows Connexion/Créer un compte, no logout | pass |

## Screenshots

`docs/design-system/screenshots/phase-3/`: home with account, account menu, dashboard, dashboard card menu, manage, manage list menu, public list, profile, mobile drawer (signed-in/out).

## Gates

- `bun run web:typecheck` — pass
- `bun run web:lint` — 0 errors, 15 warnings (pre-existing auth loading warnings; down from 17)
- `bun run test` — 25/25 pass
- `bun run web:build` — pass
- `bun run --cwd apps/expo export` — pass
- `./scripts/design-system-guard.sh` — pass
- Route smoke: `/`, auth pages, `/dashboard`, `/profile`, `/admin`, `/list/*`, `/manage/*` → 200
- Production guard: `/design-system` → 404 with `VERCEL_ENV=production`; `/` → 200

## Scope / limitations

- No API, Prisma, auth-behavior or native changes; the diff is UI/UX, docs and governance.
- Admin known security model remains unchanged.
- The GiftGroup WIP remains untouched and uncommitted.
- Public-list before/after captures remain in `screenshots/phase-2/before/`; Phase 3 public list is list-first.
- Lint warnings are pre-existing `react-hooks/set-state-in-effect` in auth loading effects; the UX changes removed the new unused-variable/effect warnings.
