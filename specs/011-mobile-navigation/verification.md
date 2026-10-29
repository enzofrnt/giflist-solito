# Verification: Real Mobile Navigation

**Date**: 2026-10-29

## Results

- Custom bottom bar visible on the main shell only: **Mes listes** (active cobalt) and **Profil**; both icons are SVG.
- Tapping tabs switches content without pushing routes; there is no stack growth from tab switching.
- Header: logo + Giftlist centered; back at left on detail/auth screens; no “Mes listes / Mon profil” header text.
- Manage is a detail screen: back + share, tab bar hidden. Back returns to the lists shell.
- Gift editing is a dedicated screen (`giftForm`): all fields visible, cancel/save, no inline form at the bottom of the list. Save calls the existing PUT and returns to manage, which reloads via `useFocusEffect`.
- App starts on the main shell when a session exists, otherwise on marketing home.
- Auth success resets to the main shell; logout resets to home.

## Screenshots

- `docs/design-system/screenshots/phase-9/mobile-tabs.jpg`
- `docs/design-system/screenshots/phase-9/mobile-profile-tab.jpg`
- `docs/design-system/screenshots/phase-9/mobile-manage-detail.jpg`
- `docs/design-system/screenshots/phase-9/mobile-gift-form.jpg`

## Gates

- Native typecheck ✅ · Expo export ✅
- Release simulator build/install/launch ✅
- No API/schema changes.
- Note: `@react-navigation/bottom-tabs` was removed after a native startup crash; the custom shell keeps the requested UX without that dependency.
