# Implementation Plan: Real Mobile Navigation

## Structure

- `RootStack`: `home`, `login`, `register`, `public`, `main`, `manage`, `giftForm`.
- `main`: custom shell with local `lists` / `profile` tabs; only this screen shows the bottom bar.
- Detail screens (`manage`, `giftForm`, `public`, auth) are root-stack screens with a single back target and no tab bar.
- `GiftFormScreen`: add/edit, `Screen` scroll + keyboard avoidance, save then `goBack`.
- Manage: `useFocusEffect` reload; add/edit navigate to form; no inline form.
- AppHeader: absolute centered brand, left back, right slot.
- Tab icons: `react-native-svg` custom list/person icons.
- Removed the unused `@react-navigation/bottom-tabs` dependency after a native startup crash; custom shell avoids the extra native layer.

## Verification

- Native typecheck/export; simulator: tab switch, manage, edit form, save, back.
- No infinite stack: switch tabs/back to initial.
