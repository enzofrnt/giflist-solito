# Verification: Light / Dark / System Theme

**Date**: 2026-10-29

## Web

- `data-theme` switches from `light` to `dark`; `--ds-color-canvas` becomes `#11100f`, body `rgb(17,16,15)`.
- Boot script applies the stored/system theme before paint (no flash).
- Header theme menu (Clair / Sombre / Système) opens with Lucide icons and selected state.
- Profile has the full Apparence radio group; dark cards/forms/buttons remain readable.
- Dark screenshots:
  - `docs/design-system/screenshots/phase-11/web-dark.jpg`
  - `docs/design-system/screenshots/phase-11/web-profile-theme-dark.jpg`
  - `docs/design-system/screenshots/phase-11/web-theme-menu.jpg`
- Light: `web-light.jpg`, `web-profile-theme-light.jpg`.

## Mobile (iOS simulator)

- Profile exposes Apparence with **SF Symbols** (sun/moon/half-circle) on iOS; selected option updates instantly.
- Light → dark changes canvas, cards, text, inputs, buttons, header, tab bar and status bar.
- Dark preference persists after terminating/relaunching the app.
- Système returns to the current system appearance (light in the simulator).
- Screenshots: `mobile-theme-light.jpg`, `mobile-theme-dark.jpg`.

## Icon assets

- `splash-icon.png` now has transparent rounded corners; `mark.png` (shared) is used for the in-app header.
- `icon.png` remains a square opaque source for the iOS system mask; Android keeps its adaptive icon.
- Splash dark variant uses `#11100f` background.
- `userInterfaceStyle: automatic`.

## Gates

- Web typecheck/build ✅; native typecheck ✅; native release simulator build/launch ✅; tests 25/25 ✅; design-system guard ✅.
- No API/schema/auth change.
