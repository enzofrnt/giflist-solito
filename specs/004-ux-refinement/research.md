# Phase 0 Research — UX Refinement

**Feature**: `004-ux-refinement` · **Date**: 2026-10-28
**Skill applied**: `.agents/skills/ui-ux-design` · **Charter**: `.specify/memory/constitution.md`

## Audit summary (owner feedback + screen review)

**Keep**: the Porcelain & Cobalt palette, typography, cards, forms, public-list overall structure, and the dashboard/manage visual language.

**P1 issues**:
1. Header replaces the Giftlist logo with a monogram and centres navigation; brand/nav are visually disconnected.
2. Logout sits next to the avatar as a separate top-level button; account actions have no menu.
3. Mobile menu is a full-width white panel that hides the product.
4. Home ends with a large black CTA band that competes with the hero and adds friction.
5. Dashboard cards show three equally prominent actions (Gérer/Modifier/Supprimer), so the primary action is unclear and destructive actions dominate.

**P2 issues**:
6. Manage list actions are three equal buttons; edit/delete compete with add/share.
7. Public list uses a large Giftlist logo as hero art when no list image exists; the list should be the hero.
8. Missing gift images create large empty white areas.
9. Profile has a red “Se déconnecter” primary button in a sidebar card; logout belongs to the account menu.
10. No reusable UX process/skill or charter enforcement existed.

## Decisions

### D1 — Shared DropdownMenu
Create `DropdownMenu` (account + overflow menus) with keyboard navigation, Escape/outside close, focus restore, `role="menu"`, danger/disabled items. Use it for the account menu and card/list overflow actions.

### D2 — Header
Real logo left; logo+nav grouped; account trigger (avatar/name + chevron) on the right; account menu contains profile/lists/logout. No separate logout. Mobile: compact right drawer `min(20rem, 88vw)` below the header, hidden account trigger, drawer account summary.

### D3 — Home
Remove the black CTA band. Replace feature cards + band with a 3-step “Créez / Partagez / Réservez” section; keep one primary CTA in the hero.

### D4 — Action hierarchy
Dashboard list cards: primary “Gérer” + overflow (edit/delete). Manage list toolbar: keep share/add; move edit/delete into overflow. Delete remains danger/confirmed.

### D5 — Profile
Remove the red logout button and fix the dead `/home` link to `/`; logout is available from the account menu.

### D6 — Public list
Remove the logo fallback; if the list has an image, show it as a restrained hero, otherwise single-column list-first hero. Compact no-image gift placeholder with a tinted panel.

### D7 — UX process
Commit `ui-ux-design` skill in `.agents/skills`; sync a Claude symlink; add the Design Charter to the constitution; reference it from AGENTS/CLAUDE/design docs.

## Risks

- Menu/dropdown focus can be fiddly: cover with keyboard tests.
- Header logo image must not distort on mobile: fixed height, auto width.
- Removing three buttons may hide actions: keep them in the overflow menu with clear labels.
- No API/behavior changes allowed.
