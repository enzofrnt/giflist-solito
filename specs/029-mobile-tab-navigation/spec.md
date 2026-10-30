# Feature Specification: Mobile Tab Navigation & Separate Account Menu

**Branch**: `feat/mobile-header-auth-cta` · **Status**: Approved

## Problem

On the web below 768 px the header hides the primary navigation, so “Mes listes” was pushed into the account menu. That menu therefore mixes account actions (profile/logout) with product navigation, and the public search is unreachable when logged out. The top-right profile menu must stay, but it should contain account actions only.

## UX brief

- **User jobs**: move between my lists, discover public lists/accounts, and manage my account — on a phone.
- **Primary navigation**: three destinations — Mes listes (`/dashboard`), Recherche (`/search`), Profil (`/profile`).
- **Account**: the top-right avatar opens a menu with **Mon profil**, a separator, and **Se déconnecter**; it never contains lists.
- **Logged out**: discovery is available without an account via a header search icon and an outlined search button aligned to the hero action group.
- **Success**: each destination is one tap away; the active tab is visible; no desktop change.
- **Non-goals**: desktop layout, native app, auth logic, server/API.

## Screen & action audit

| Area | Current | Issue |
|------|---------|-------|
| Header <768 | logo, theme, avatar menu | primary nav hidden; account menu holds lists |
| Account menu | Mes listes, Mon profil, Se déconnecter | mixes navigation and identity |
| Search logged out | footer only | no visible entry point |
| Mobile bottom | none | no persistent navigation |

## Requirements

- **FR-001**: Below 768 px, authenticated users get a fixed bottom tab bar with **Mes listes / Recherche / Profil** (`/dashboard`, `/search`, `/profile`); each tab is a 44 px+ link with icon and label, `aria-current="page"` on the active destination.
- **FR-002**: The tab bar is hidden at ≥768 px and on auth screens, admin, the design-system page, and focused forms (`/manage/*`); visible on `/`, `/dashboard`, `/search`, `/profile`, `/list/*`, `/u/*`.
- **FR-003**: The top-right avatar menu remains on mobile: **Mon profil**, separator, **Se déconnecter**; “Mes listes” is removed. Desktop keeps its existing profile/logout menu, without separator or lists.
- **FR-004**: Clicking “Mon profil” or the Profil tab opens `/profile` and marks Profil active; the same follows for Mes listes and Recherche.
- **FR-005**: iOS Safari: the bar sits above the browser bottom toolbar/home indicator using `viewport-fit=cover` (already set) + `env(safe-area-inset-bottom)`; a page spacer prevents content/footer occlusion. No fixed overlay on the Safari search bar.
- **FR-006**: Logged out on mobile, the header shows a search icon (`/search`), plus theme and Connexion; the home hero adds an **outlined secondary** search button “Rechercher une liste ou un compte”, **full width of the action group**, below the account CTAs. Both are hidden at ≥768 px; desktop is unchanged.
- **FR-007**: No API, data, auth or native change; desktop must be visually identical.

## Success Criteria

- At 390 px logged in: bottom bar with 3 tabs, correct active state; menu shows Profil / separator / Déconnexion; both profile paths land on `/profile` with Profil active.
- At 320 px: no horizontal overflow; header and bar remain usable.
- At 768 px and 1440 px: no bottom bar, no mobile search icon/button, desktop header/menu unchanged.
- Logged out at 390 px: search icon and hero search button both open `/search`; the hero button is outlined and spans the action group width.
- Keyboard: bar links reachable, focus ring visible; menu separator is not focusable; Escape closes the menu.
- `bun run web:typecheck`, `bun run web:lint`, `bun run web:build` pass.

## Assumptions

- The mobile breakpoint is the existing `md` (768 px), where the header nav is hidden.
- The top-right account menu stays the canonical account surface on mobile; the bottom Profil tab is a shortcut to the profile page, not a logout button.
- The hero search button is mobile-only because the desktop header already exposes “Recherche”.

## Out of scope

- Native navigation and header.
- Moving logout into the profile page.
- Redesigning the desktop account menu or header.
