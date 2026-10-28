# Tasks: Expo SDK 57 & Core Mobile App

## Phase 1: Upgrade/identity

- [x] T001 Align Expo SDK 57 / RN 0.86 / React 19.2 across root and apps/expo; update lockfile.
- [x] T002 Rename app (name/slug/scheme), add Android package, icon; add eas.json; document EXPO_PUBLIC_API_URL.
- [x] T003 Run Expo Doctor/export; fix mismatches.

## Phase 2: Shared layer

- [x] T004 Add shared tokens + Button/Card/Badge/Screen/Field/Alert/EmptyState native/web variants.
- [x] T005 Add shared API client + native session storage/context.

## Phase 3: Native screens

- [x] T006 Home + Login + Register.
- [x] T007 Dashboard + create list.
- [x] T008 Manage list: gifts, add/delete, share, empty/error.
- [x] T009 Public list: load by code, reserve.
- [x] T010 Profile/logout + protected navigation.

## Phase 4: Verification

- [ ] T011 Simulator smoke blocked: missing Simulator.app/runtime; Expo export + web gates pass.
- [ ] T012 Commit/push/open PR; merge only after simulator validation.
