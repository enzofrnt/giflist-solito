# Implementation Plan: UX Refinement

**Branch**: `004-ux-refinement` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

## Summary

Fix the UX problems left by the Phase 2 visual rollout: header/brand/navigation, account menu, mobile drawer, home hierarchy, card action priority, manage list actions, public-list hero and profile logout. Build and reuse a `ui-ux-design` skill and put the Design Charter into the Spec Kit constitution. No API/data/auth behavior changes.

## Technical Context

- TypeScript/Next 16.4.3/Bun 1.4.4; existing `.ds-*` system; new shared `DropdownMenu`; no new dependencies.
- Web only; native/shared untouched.
- Tests: typecheck, lint, existing test suite, build, Expo export, design guard, route smoke, keyboard/screenshots.

## Constitution Check

- [x] Spec-driven: spec + plan + tasks.
- [x] Design Charter: skill + charter added; header/action rules implemented.
- [x] Cross-platform: web-only; shared/native untouched.
- [x] Data/security: no API/schema/auth changes; admin security unchanged.
- [x] Evidence: desktop/mobile screenshots, keyboard/menu checks, gates.

## Project Structure

```text
.agents/skills/ui-ux-design/SKILL.md     # reusable UX process
.claude/skills/ui-ux-design              # symlink via sync script
.specify/memory/constitution.md          # Design Charter (v1.1.0)
apps/next/src/components/DropdownMenu.tsx
apps/next/src/components/Header.tsx      # logo, left nav, account menu, compact drawer
apps/next/src/components/home/HomePage.tsx
apps/next/src/app/dashboard/DashboardClient.tsx
apps/next/src/app/manage/[id]/page.tsx
apps/next/src/app/profile/ProfileClient.tsx
apps/next/src/app/list/[shareCode]/PublicListClient.tsx
apps/next/src/styles/_app.scss           # dropdown, header/account, drawer, steps
```

## Phase 0 Research

See [research.md](research.md).

## Phase 1 Design

- Header: real logo, left-grouped nav, context-aware account dropdown; no burger/duplicate nav and no dim/scroll-lock overlay.
- Home: hero + 3 steps; no black band.
- Dashboard: primary Gérer + overflow edit/delete.
- Manage: primary share/add; overflow edit/delete list.
- Profile: remove logout; fix home link.
- Public list: list-first hero; compact no-image placeholder.
- Global footer: brand/promise, product/project links, GitHub/bug report, copyright; light canvas body.
- Governance: `ui-ux-design` skill + Design Charter.

## Verification Plan

```sh
bun run web:typecheck
bun run web:lint
bun run test
bun run web:build
bun run --cwd apps/expo export
./scripts/design-system-guard.sh
```

- 1440/768/390 screenshots for header, home, dashboard, manage, public list, profile, mobile drawer.
- Account/overflow menus: open, keyboard arrows, Escape, outside click, focus.
- No horizontal overflow; 44px targets; no raw hex.
- Route smoke and production `/design-system` 404 unchanged.

## Complexity Tracking

| Deviation | Why | Alternative rejected |
|-----------|-----|----------------------|
| New `DropdownMenu` | Account + card overflow menus need reusable keyboard/aria behavior | Per-page menus would duplicate accessibility logic |
| Logo image in header | Owner requirement + charter rule | Monogram was rejected as brand dilution |
