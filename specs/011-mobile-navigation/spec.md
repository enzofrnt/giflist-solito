# Feature Specification: Real Mobile Navigation

**Branch**: `011-mobile-navigation` · **Created**: 2026-10-29 · **Status**: Approved

## Problem

Every mobile page is pushed on one stack: details accumulate, back can be repeated indefinitely, the header shows redundant “Mes listes/Mon profil”, and gift editing happens inline below the list, forcing the user to scroll back up.

## User Stories

### 1. Tab navigation
The app has a persistent bottom bar with **Mes listes** and **Profil**, showing the active section. Top-level tabs never stack on themselves.

### 2. Clear header
The Giftlist logo is centered at the top. A back button appears only on screens that are entered from another screen (manage, gift form, public, auth). No redundant header title/profile link.

### 3. Dedicated gift form
Add/edit gift opens a separate full screen (keyboard/scrolling safe). Saving returns to the managed list, which refreshes. No inline edit form at the bottom of the list.

### 4. Predictable back
Back from manage returns to lists; back from gift form returns to manage. Login/register reset to the tab shell; logout resets to marketing home.

## Requirements

- **FR-001**: Add a persistent custom bottom bar (no extra native-tab dependency) with tabs `lists` (Mes listes) and `profile` (Profil).
- **FR-002**: Root stack: home, login, register, public, main (tabs). Lists stack: lists → manage → giftForm.
- **FR-003**: Tab bar hidden on detail screens; visible on lists/profile.
- **FR-004**: Auth success resets to `main`; home “Voir mes listes” resets to `main`; logout resets to home.
- **FR-005**: Header centers logo; back at left when present; remove titles/profile links.
- **FR-006**: New `GiftFormScreen` for add and edit; route params `{ listId, gift? }`; manage navigates there.
- **FR-007**: Manage reloads on focus after returning from form.
- **FR-008**: Tab icons are vector (SVG) and labels accessible; active cobalt state.
- **FR-009**: No API/schema/security changes.

## Success Criteria

- Repeated tab switching does not grow history.
- Manage/edit always have a single clear back target.
- Header shows centered branding and no redundant section text.
- Gift form is fully reachable with keyboard open, even at list bottom.
- Native typecheck/export and simulator flow pass.
