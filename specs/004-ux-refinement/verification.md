# UX Refinement Verification

**Branch**: `feat/ux-refinement` · **Date**: 2026-10-28
**Skill**: `.agents/skills/ui-ux-design` · **Charter**: constitution v1.1.1

## UX checks (Puppeteer, signed-in/out mocked data)

| Check | Result |
|-------|--------|
| Real logo present in header | pass |
| Desktop nav grouped left, only “Mes listes” (no “Accueil” duplication) | pass |
| Nav not centred | pass |
| No burger button on desktop or mobile | pass |
| Desktop account menu items = Mon profil, Se déconnecter | pass |
| Mobile account menu items = Mes listes, Mon profil, Se déconnecter | pass |
| No separate header logout | pass |
| Menu has no app-wide dim overlay / no body scroll lock | pass |
| Menu causes **0 px** page shift | pass |
| Account menu keyboard (ArrowDown), Escape, focus restored | pass |
| Signed-out mobile header shows Connexion + Créer un compte, no burger | pass |
| Signed-out header fits at 320/360/390 with no horizontal overflow | pass |
| Home black CTA band absent; 3 “how it works” steps | pass |
| Dashboard card menu fully in viewport (portal, not clipped) | pass |
| Manage list overflow menu opens | pass |
| Global footer present on app pages (incl. auth) | pass |
| GitHub source link present + `target=_blank` | pass |
| Footer at 1440/390: no horizontal overflow | pass |
| Dark-mode preference: body stays light canvas (no black strip) | pass |

## Screenshots

`docs/design-system/screenshots/phase-3/`: home with account, account menu, dashboard, dashboard card menu, manage, manage list menu, public list, profile, footer desktop/mobile, mobile header, mobile account menu, mobile signed-out.

## Gates

- `bun run web:typecheck` — pass
- `bun run web:lint` — 0 errors, 15 warnings (pre-existing auth loading warnings; down from 17)
- `bun run test` — 25/25 pass
- `bun run web:build` — pass
- `bun run --cwd apps/expo export` — pass
- `./scripts/design-system-guard.sh` — pass
- Route smoke: `/`, auth pages, `/dashboard`, `/profile`, `/admin`, `/list/*`, `/manage/*` → 200
- Production guard: `/design-system` → 404 with `VERCEL_ENV=production`; `/` → 200

## Follow-up from owner review

- Account menu reduced to profile/logout on desktop; “Mes listes” stays in the nav.
- Burger removed entirely: it duplicated the account menu and only had a few actions.
- Mobile uses the avatar menu (lists/profile/logout); signed-out mobile shows auth actions in the header.
- Short menus are anchored popovers: no grey overlay, no scroll lock and no page shift.
- “Accueil” removed from in-app nav; the logo is the home link.
- Global footer added: brand/promise, product links, GitHub source, bug report, documentation and copyright; no invented legal pages.
- Body/light canvas fixed for dark-mode preferences (no black strip above the footer).
- Design Charter updated to v1.1.2 and the UX skill now names burger duplication / dim overlays as anti-patterns.

## Scope / limitations

- No API, Prisma, auth-behavior or native changes; the diff is UI/UX, docs and governance.
- Admin known security model remains unchanged.
- The GiftGroup WIP remains untouched and uncommitted.
- Public-list before/after captures remain in `screenshots/phase-2/before/`; Phase 3 public list is list-first.
- Lint warnings are pre-existing `react-hooks/set-state-in-effect` in auth loading effects; the UX changes removed the new unused-variable/effect warnings.
