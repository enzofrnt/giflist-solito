# Verification: Mobile Polish

**Date**: 2026-10-29

## Results

- Home “Créer un compte” now uses the visible secondary/outlined style (screenshot `phase-8/mobile-home.jpg`).
- Manage list:
  - product thumbnail shown per gift, with branded fallback for missing images;
  - “Modifier” opens a pre-filled edit form (title, link, image, price, description);
  - “Enregistrer” calls `PUT /api/gift-lists/:id/gifts/:giftId` and replaces the row;
  - “Supprimer” unchanged.
  - Screenshots: `mobile-manage.jpg`, `mobile-edit.jpg`.
- Profile/settings:
  - “Mot de passe” card + “Modifier” opens current/new/confirm form;
  - strength meter and rules shown;
  - endpoint `PUT /api/auth/change-password`, new token persisted via `signIn`.
  - Screenshots: `mobile-profile.jpg`, `mobile-password.jpg`, `mobile-password-filled.jpg`.
- Strength bar uses RN `Animated.timing` (260 ms, width interpolation) instead of a hard jump.
- Release simulator build: install + launch OK; real interactions exercised against the local mock API.

## Gates

- Native typecheck ✅ · Expo export ✅
- Web typecheck/lint/build/tests ✅ (no web code changed; regression gate).
- No API/schema change.

## Notes

- The real production API is used by the device build; the simulator screenshots use a local mock to exercise the UI.
- Gift photos depend on `gift.image`; list items without image use the Giftlist fallback.
