# Feature Specification: Password Strength & Password-Manager UX

**Feature Branch**: `009-password-ux`

**Created**: 2026-10-29

**Status**: Approved — implementation

**Input**: On web, the strength meter should always be visible (empty until typing). Mobile registration has no strength meter; add the same component. Mobile password managers must recognize the fields and link web/app credentials where possible.

## User Scenarios

### User Story 1 - Always-visible web meter (Priority: P1)

A user creating an account sees the password-strength track immediately, empty, then fills as they type.

**Acceptance Scenarios**:

1. **Given** the register form, **When** it loads, **Then** the strength track is visible at 0% with a neutral label.
2. **Given** a typed password, **Then** the bar and label update using the shared strength calculation.
3. **Given** an empty password, **Then** the bar is completely empty (no misleading color/progress).

### User Story 2 - Mobile strength meter (Priority: P1)

A mobile user creating an account gets the same visual strength component as web.

**Acceptance Scenarios**:

1. **Given** mobile registration, **Then** the strength track is always visible, empty at the start.
2. **Given** typing, **Then** the bar/label/rules update using the shared `calculatePasswordStrength`.
3. **Given** a strong password, **Then** the meter is green/cobalt and all rules are checked.

### User Story 3 - Password managers recognize fields (Priority: P1)

iOS/browser password managers offer to fill/save the right username and password, and can associate web credentials with the app.

**Acceptance Scenarios**:

1. **Given** login, **Then** email uses username semantics and password uses current-password/password content type.
2. **Given** register, **Then** password uses new-password semantics and password rules.
3. **Given** iOS app config, **Then** `associatedDomains` includes `webcredentials:giftlist.fr`.
4. **Given** a web request, **Then** `/.well-known/apple-app-site-association` returns the app’s `webcredentials` association.
5. **Given** a password manager, **Then** the web and native fields expose correct `autocomplete`/`textContentType`.

## Requirements

- **FR-001**: Web `PasswordInput` renders strength whenever `showStrength` is true, even when empty.
- **FR-002**: Empty state has 0% fill, neutral label, `aria-valuenow=0`.
- **FR-003**: Add native `PasswordStrength` shared UI using tokens + `calculatePasswordStrength`.
- **FR-004**: Mobile register renders the native strength component + rules.
- **FR-005**: Native login/register fields set correct `textContentType`, `autoComplete`, keyboard, and password rules.
- **FR-006**: Add iOS associated domain `webcredentials:giftlist.fr`.
- **FR-007**: Add AASA route with appID `35697BAZW4.com.enzofournet.giflist`.
- **FR-008**: No API/auth behavior change; no secret.

## Success Criteria

- Web empty bar is visibly empty; mobile empty bar visible.
- Native typing updates bar/rules.
- AASA returns valid JSON; app config contains associatedDomains.
- Typecheck/build/native export pass.

## Assumptions

- The web and mobile use the same scoring (`packages/app/lib/passwordStrength.ts`).
- iOS credential sharing requires the app signed with team `35697BAZW4` and installed from a build with the associated domain entitlement.
- Android asset-link fingerprint is outside this phase; iOS/Web is the priority.
