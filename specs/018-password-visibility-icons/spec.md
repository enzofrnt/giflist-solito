# Feature Specification: Password Visibility & Button Icon System

**Branch**: `018-password-visibility-icons` · **Status**: Approved

## User Stories

### 1. See/hide every password
Every password field on web and mobile has a clean eye / eye-off control. Tapping toggles between dots and plain text; the action is accessible and never changes the password-manager autofill metadata.

### 2. Clean share action
The list share action has a recognizable share icon, a proper compact pill/button on mobile and a consistent icon+label button on web.

### 3. Icon language in the charter
The Design Charter documents the icon system: source, sizes, stroke, icon+label priority, icon-only rules, accessibility, and where icons are mandatory. Reusable APIs (`Button.icon`, `ds-btn__icon`, `ds-icon-btn`, `ShareAction`, password toggle) make adding meaningful icons consistent across web/mobile.

## Requirements

- **FR-001**: Native `PasswordField` with eye/eye-off toggle, Lucide icons, 44px control, `accessibilityLabel`, correct `textContentType`/`autoComplete`.
- **FR-002**: Replace every native secure `Field` with `PasswordField` (login, register + confirm, email current password, password current/new/confirm).
- **FR-003**: Web profile email-current-password and admin password use `PasswordInput`; all web password inputs expose eye/eye-off.
- **FR-004**: Web `PasswordInput` uses Lucide Eye/EyeOff and `aria-pressed`.
- **FR-005**: Native `Button` supports an optional Lucide `icon`; key actions use meaningful icons.
- **FR-006**: Mobile manage/public share uses a compact `ShareAction` with Share2 icon + label; web share keeps icon.
- **FR-007**: Add icon guidance to `.specify/memory/constitution.md` (bump version) and `docs/design-system/README.md`; document `.ds-btn__icon`, `.ds-icon-btn`, Lucide/SF Symbols rules.
- **FR-008**: No API/behavior change for auth or sharing payloads.
