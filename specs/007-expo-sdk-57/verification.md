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

## Runtime evidence (native iOS simulator)

- iOS 27.1 runtime installed; iPhone 17 Pro simulator booted.
- `expo run:ios --configuration Release` built, installed and launched `com.enzofournet.giflist` successfully.
- Native flows exercised with idb + a local mock API:
  - Home renders (screenshot `native-home.jpg`).
  - Login form → submit → Dashboard with list (screenshots `native-login.jpg`, `native-dashboard.jpg`).
  - Gérer la liste → Manage screen with gift (screenshot `native-manage.jpg`).
  - Deep link `giftlist://list/DEMO` → Public list screen (screenshot `native-public.jpg`).
  - Reservation modal opened; keyboard interaction verified.
- Native AsyncStorage token persistence fixed via `authStorage.native.ts` after the first login attempt exposed a missing-token bug.
- No physical-device test was performed.

## Follow-up required

1. `eas login` + `eas build:configure` to associate the EAS project (not done).
2. Normal EAS/TestFlight builds, once the account is connected.
3. Optional: exercise reservation confirmation and profile/logout end-to-end on a physical device.
