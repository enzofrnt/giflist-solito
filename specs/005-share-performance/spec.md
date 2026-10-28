# Feature Specification: Share Branding & List-Loading Performance

**Feature Branch**: `005-share-performance`

**Created**: 2026-10-28

**Status**: Approved — implementation

**Input**: README needs the project logo; every share QR code must keep the Giftlist logo centered at a coherent scale; loading a list feels slow and sometimes breaks the experience. README + performance are pre-approved for merge; QR branding is part of the same share-quality pass.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Branded QR share (Priority: P1)

The owner shares a list; the generated QR always shows the Giftlist logo in the center, at a size that scans reliably and looks intentional.

**Independent Test**: Open the share dialog from manage/public list; inspect SVG and downloaded PNG; scan with a phone.

**Acceptance Scenarios**:

1. **Given** a list with or without a custom image, **When** the share QR renders, **Then** the center image is always `/logo.webp` (never the list image).
2. **Given** the QR, **Then** the logo occupies a coherent ~24% of the code and error correction is high enough to scan.
3. **Given** the downloaded PNG, **Then** it uses the same centered logo and high-resolution style.
4. **Given** a small screen, **Then** the QR remains legible and centered.

### User Story 2 - Fast, predictable list opening (Priority: P1)

A signed-in user clicks “Gérer” and reaches a usable list quickly; navigation no longer re-checks auth unnecessarily or waits on avoidable requests.

**Independent Test**: Count network requests and measure timings when navigating from dashboard to manage; compare before/after; verify data correctness.

**Acceptance Scenarios**:

1. **Given** an in-app navigation, **When** the route changes, **Then** the client does not re-fetch `/api/auth/me` solely because of the route change (cache remains valid).
2. **Given** the dashboard, **When** the user activates “Gérer”, **Then** Next.js can prefetch the manage route (link-based navigation).
3. **Given** the public list API, **When** it responds, **Then** list + gifts come from one database query and the owner email is never exposed.
4. **Given** the manage API, **Then** it does not join/return an unused user record.
5. **Given** the public list page, **Then** it reuses the auth context instead of a second independent auth check.
6. **Given** a slow network, **Then** the loading state remains stable and the previous page does not shift.

### User Story 3 - README first impression (Priority: P2)

A visitor sees the Giftlist logo immediately at the top of the README.

**Independent Test**: Render README on GitHub; logo visible before the title.

**Acceptance Scenarios**:

1. **Given** the README, **When** opened, **Then** the logo appears at the very top, centered and linked/accessible.
2. **Given** dark/light GitHub themes, **Then** the logo remains readable.

### Edge Cases

- QR logo fails to load: QR must still render/scannable.
- List has no custom image / has a large image: same center logo.
- User navigates quickly between lists: no auth recheck storm; each list loads its own data.
- Auth cache expires (60s): normal revalidation still occurs.
- Public API cache/props: gifts order preserved (createdAt desc), owner name still shown.
- No API contract change for clients except removal of unused/private fields.

## Requirements *(mandatory)*

- **FR-001**: README MUST start with the Giftlist logo (public `logo.webp`), centered, before the title.
- **FR-002**: QR center image MUST always be `/logo.webp`, regardless of `listImage`.
- **FR-003**: QR MUST use a coherent logo scale (~24%) and high error correction (`H`), for SVG and PNG.
- **FR-004**: Remove the now-unused `listImage` prop from `QRCodeDisplay` and its callers.
- **FR-005**: The auth context MUST NOT invalidate its 60s cache on every pathname change; revalidation remains on mount and after auth mutations.
- **FR-006**: Dashboard “Gérer” MUST use a prefetchable Next.js link, not an imperative `router.push`.
- **FR-007**: Public list API MUST fetch list + gifts in one query and MUST NOT expose `user.email`.
- **FR-008**: Manage API MUST NOT include/return the unused user join.
- **FR-009**: Public list MUST reuse the auth context (no duplicate independent auth request).
- **FR-010**: Loading/error states remain; no visual regression.
- **FR-011**: Existing behavior, routes, reservation flow, and auth semantics stay intact.
- **FR-012**: Typecheck, lint, tests, web build, Expo export and guard pass.

## Success Criteria

- **SC-001**: README logo visible at the top on GitHub.
- **SC-002**: QR SVG/PNG always use the centered Giftlist logo; scan test passes; logo ratio ~24%, EC H.
- **SC-003**: Navigating dashboard → manage no longer triggers an extra `/api/auth/me` request; only list data/auth-required calls happen.
- **SC-004**: Public API response is one DB query, no owner email; manage API no unused user join.
- **SC-005**: Manage route is prefetched by the dashboard link; perceived load is improved (request count/timings recorded).
- **SC-006**: Full gates green; no data/API contract break for UI.

## Assumptions

- The slowness is client/navigation + query/API overhead, not a database schema problem; no migration is needed.
- The public API is allowed to drop `user.email` because no UI uses it.
- Auth cache remains private to the client; server APIs still enforce auth.
- Web only for QR/README; performance changes are web-only; native untouched.
