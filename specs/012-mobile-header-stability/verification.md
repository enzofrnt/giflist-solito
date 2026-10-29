# Verification: Stable Mobile Header

**Date**: 2026-10-29

## Result

- `Screen` now renders its `header` **outside the ScrollView and KeyboardAvoidingView**; the brand is fixed while content scrolls.
- All native screens (home, auth, lists, manage, profile, public, gift form) pass their header through this slot.
- Detail transitions (`manage`, `giftForm`, `public`) use `animation: 'fade'`; no horizontal page slide.
- Header keeps the same height and centered logo; back appears left and share right on manage/public.
- Deep-link config updated from obsolete `dashboard/profile` to `main/manage/giftForm/public`.

## Screenshots

- Existing phase 9 shots show the centered header and controls; fixed header behavior verified in simulator by scrolling content.

## Gates

- Native typecheck ✅ · export ✅
- No API/schema changes.
