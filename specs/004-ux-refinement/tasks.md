# Tasks: UX Refinement

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [UI/UX skill](../../.agents/skills/ui-ux-design/SKILL.md)

## Phase 1: Governance and reusable pattern

- [x] T001 Add the `ui-ux-design` skill in `.agents/skills/ui-ux-design/SKILL.md`; link it for Claude via the skill sync script; update AGENTS/CLAUDE/design docs.
- [x] T002 Add the Design Charter to `.specify/memory/constitution.md` (v1.1.0) with brand/UX non-negotiables and enforcement.
- [x] T003 Add `DropdownMenu` (keyboard, Escape/outside, focus, roles, danger/disabled) and shared styles.

## Phase 2: Header and navigation

- [x] T004 Replace the monogram with the real Giftlist logo at the left.
- [x] T005 Group primary nav with the brand on the left (no centred nav).
- [x] T006 Replace the separate logout with an account dropdown (profile, lists, logout) and remove the header logout button.
- [x] T007 Replace the full-width mobile panel with a compact right drawer (≤20rem) below the header, with account summary and actions.

## Phase 3: Home

- [x] T008 Remove the black CTA band.
- [x] T009 Replace feature cards/band with a 3-step “Créez / Partagez / Réservez” section and one primary CTA.

## Phase 4: Action hierarchy

- [x] T010 Dashboard list cards: primary “Gérer” + overflow edit/delete; delete confirmed/danger.
- [x] T011 Manage list toolbar: keep share/add; move edit/delete into overflow.
- [x] T012 Profile: remove the red logout button, fix the dead `/home` link, keep logout in the account menu.
- [x] T013 Public list: remove logo fallback; list-first hero; compact tinted no-image placeholder.

## Phase 5: Verification

- [x] T014 Typecheck, lint, tests, web build, Expo export, design guard.
- [x] T015 Keyboard/menu/drawer checks (Escape, outside click, focus, arrow keys).
- [x] T016 1440/768/390 screenshots of header, home, dashboard, manage, public list, profile, mobile drawer.
- [x] T017 Route smoke + production showcase guard; confirm no API/data changes.
- [x] T018 Update docs/specs, commit, push, open PR with before/after evidence.

## Dependencies

T001–T003 block the header/menus; T004–T007 depend on T003; T010–T013 depend on T003; T014–T018 run last.
