# Implementation Plan: Expo SDK 57 & Core Mobile App

**Branch**: `007-expo-sdk-57` | **Date**: 2026-10-28

## Summary

Upgrade the monorepo to Expo SDK 57 / React Native 0.86 / React 19.2, rename the app to Giftlist, add shared tokens + cross-platform primitives, and build the native core flows with a small shared API/session layer. Local iOS simulator is the runtime; EAS config is prepared but not deployed.

## Technical Context

- Expo SDK 57, React Native 0.86.x, React 19.2; Expo CLI/Doctor; Bun 1.4.4.
- React Navigation native-stack; AsyncStorage; shared API base via `EXPO_PUBLIC_API_URL`.
- `packages/app/ui`: `*.native.tsx` with RN and `*.web.tsx` mapping to `ds-*` DOM classes.
- Token source: Porcelain & Cobalt values, mirrored from `apps/next/src/styles/_tokens.scss`.
- No Prisma/API changes.

## Constitution Check

- [x] Spec-driven.
- [x] Design Charter: native primitives/tokens; no raw local palettes.
- [x] Cross-platform: shared tokens/primitives/logic; web untouched behavior.
- [x] Security: no secrets; AsyncStorage token; 401 clears session.
- [x] Verification: Expo Doctor/export, simulator, web gates.

## Phases

1. Upgrade dependencies + app config/identity/icon.
2. Shared tokens/primitives + API/session.
3. Navigation/screens: Home, Login, Register, Dashboard, Manage, Public, Profile.
4. Verify simulator + export + web gates; document API URL/EAS.

## Verification

```sh
bun install
bun run --cwd apps/expo export
npx expo-doctor
bun run web:typecheck && bun run test && bun run web:build
```

Simulator: `bun run --cwd apps/expo start` then iOS simulator; exercise login/dashboard/list/public.
