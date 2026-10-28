# Verification: Expo SDK 57 & Core Mobile App

**Branch**: `feat/expo-sdk-57` · **Date**: 2026-10-28

## Versions

| Package | Version |
|---------|---------|
| expo | 57.0.31 |
| react-native | 0.86.3 |
| react | 19.2.0 (web + native) |
| react-native-reanimated | 4.5.1 |
| react-native-worklets | 0.10.1 |
| react-native-gesture-handler | 2.32.0 |
| react-native-screens | 4.26.2 |
| react-native-safe-area-context | 5.7.0 |
| @react-native-async-storage/async-storage | 2.2.0 |

- `expo-doctor`: **21/21 checks passed**.
- `native:typecheck`: pass (`tsc --noEmit`, `skipLibCheck` for RN/TS6 lib duplicates).
- `native:export`: iOS + Android Hermes bundles pass.
- Web `typecheck`, `test` 25/25, `web:build`, guard: pass after React 19.2.

## Identity / config

- `app.json`: Giftlist / giftlist / scheme `giftlist`; iOS+Android bundle `com.enzofournet.giflist`; icon + splash; portrait; light UI.
- `eas.json` prepared (development/preview/production); EAS project not created because EAS is not logged in.
- `apps/expo/env.example` + `apps/expo/README.md` document `EXPO_PUBLIC_API_URL` (iOS localhost, Android 10.0.2.2, LAN for device).
- Generated `ios/` and `android/` removed; Expo prebuild will regenerate.

## Shared layer

- `packages/app/ui/tokens.ts` (Porcelain & Cobalt tokens).
- `packages/app/ui`: `Button`, `Card`, `Badge`, `Field`, `Screen`, `AppHeader` with `.native.tsx` and `.web.tsx` variants.
- `packages/app/lib/api.ts` shared API client; `session.native.tsx` AsyncStorage session.
- Native screens use the shared tokens/primitives; no DOM/Tailwind imports in native.

## Native flows implemented

Home, Login, Register, Dashboard (create list), Manage list (list gifts, add/delete, share), Public list (load by share code, reserve), Profile/logout. Loading/error/empty states included.

## Runtime evidence / blocker

- Expo web preview of the native Home rendered (React Native Web) with the Giftlist copy/CTA; screenshots `docs/design-system/screenshots/phase-6/mobile-home.jpg` and `mobile-login.jpg`.
- **Native iOS simulator could not be launched on this machine**: Xcode 27.1 is present, but `/Applications/Xcode.app/Contents/Developer/Applications/Simulator.app` is absent and `xcrun simctl list` hangs; `open -a Simulator` reports “Unable to find application named 'Simulator'”. A full Xcode simulator runtime (or Expo Simulators access) is required for the native runtime smoke.
- No physical-device test was performed.

## Follow-up required

1. Install the iOS simulator runtime / full Xcode app (or obtain Expo Simulators access).
2. `eas login` + `eas build:configure` to associate the EAS project.
3. Run login/dashboard/manage/public flows on the simulator; then merge/deploy the mobile build.
