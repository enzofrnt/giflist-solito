# Feature Specification: Expo SDK 57 & Core Mobile App

**Feature Branch**: `007-expo-sdk-57`

**Created**: 2026-10-28

**Status**: Approved — implementation

**Input**: Owner validated: local Xcode fallback (1B), Expo SDK 57 (2A), core mobile scope (3B), hybrid sharing starting with shared tokens/primitives (4C), and app identity/EAS preparation (5).

## User Scenarios & Testing

### User Story 1 - Modern Expo app (Priority: P1)

A developer can run the native app on the local iOS simulator and export it with Expo SDK 57.

**Acceptance Scenarios**:

1. **Given** `apps/expo`, **Then** Expo/React Native/React versions match SDK 57 (RN 0.86.x, React 19.2).
2. **Given** `expo-doctor`, **Then** no blocking dependency mismatch.
3. **Given** `expo export`, **Then** iOS/Android bundles are produced.
4. **Given** local Xcode, **Then** the app starts on the simulator with Metro.

### User Story 2 - Giftlist identity (Priority: P1)

The app is clearly Giftlist, not `solito-blank`.

**Acceptance Scenarios**:

1. **Given** app config, **Then** name/slug/scheme are Giftlist/giftlist and bundle/package IDs are `com.enzofournet.giflist`.
2. **Given** a launcher, **Then** the Giftlist icon is used.
3. **Given** a share link, **Then** `giftlist://` scheme is available for deep links.

### User Story 3 - Shared design layer (Priority: P1)

Web and native share brand tokens and basic UI primitives without sharing DOM-only components.

**Acceptance Scenarios**:

1. **Given** `packages/app/ui`, **Then** tokens (colors/spacing/radii/type) are shared.
2. **Given** native screens, **Then** they use shared `Button`, `Card`, `Badge`, `Screen`, `Field`, `Alert`/`EmptyState` primitives.
3. **Given** web, **Then** `.web.tsx` variants map to the existing `ds-*` classes without changing web screens.

### User Story 4 - Core mobile flows (Priority: P1)

A signed-in user can authenticate, see lists, open/manage a list, add/delete a gift and share it; a visitor can open a public list and reserve a gift.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** the user logs in, **Then** the token is stored and the dashboard loads.
2. **Given** the dashboard, **Then** the user sees their lists and can open one.
3. **Given** a list, **Then** the user sees gifts, can add a gift, delete a gift and share the link/QR URL.
4. **Given** a public share code, **Then** the visitor can view the list and reserve an available gift.
5. **Given** the profile, **Then** the user sees their identity and can log out.
6. **Given** no session, **Then** protected screens redirect to login.

### Edge Cases

- API unreachable/LAN IP: clear error, retry.
- Expired token: 401 clears session.
- Empty lists/gifts: empty states.
- Long titles/descriptions: truncation.
- Android emulator uses `10.0.2.2` instead of localhost.
- Web build remains intact after React 19.2.

## Requirements

- **FR-001**: Upgrade Expo to SDK 57 (RN 0.86.x, React 19.2) and align all Expo modules.
- **FR-002**: Rename app identity (name/slug/scheme), add Android package and icon.
- **FR-003**: Add `EXPO_PUBLIC_API_URL` config and document local/LAN/emulator values.
- **FR-004**: Add shared tokens + primitives in `packages/app/ui` with native/web variants.
- **FR-005**: Add native session/auth API client using AsyncStorage.
- **FR-006**: Implement native Home, Login, Register, Dashboard, Manage list, Public list, Profile.
- **FR-007**: Implement add/delete gift, share, reserve public gift.
- **FR-008**: Add loading/empty/error states and 44px-ish touch targets.
- **FR-009**: Keep web working; run web typecheck/build and Expo export.
- **FR-010**: No API/schema changes; no secrets committed.

## Success Criteria

- **SC-001**: `expo-doctor` has no blocking issues; `expo export` passes.
- **SC-002**: App launches on local iOS simulator; basic login/dashboard/public flow exercised.
- **SC-003**: Native screens use shared tokens/primitives; no DOM/Tailwind imports in native.
- **SC-004**: Web build/tests still pass on React 19.2.
- **SC-005**: API URL documented; no secret; WIP untouched.

## Assumptions

- Local Xcode is the simulator fallback until Expo Simulators access is available.
- The API remains hosted at the configured web origin; native uses `EXPO_PUBLIC_API_URL`.
- EAS project creation can be prepared (eas.json) but actual cloud builds require the owner's login.
- Admin/debug/scraping parity is out of scope for this phase.
