# Verification: Password Visibility & Button Icon System

## Password fields

- Native `PasswordField` eye/eye-off is used for login, registration + confirmation, email-change current password, and password-change current/new/confirmation.
- Web `PasswordInput` uses Lucide Eye/EyeOff and `aria-pressed`; profile email current password and admin login now use it.
- `grep` confirms no remaining raw `type="password"` or naked `secureTextEntry` outside the shared components.
- Screenshot: `docs/design-system/screenshots/phase-14/mobile-password-eye.jpg`.

## Share

- Native manage/public headers use `ShareAction` (`Share2` + `Partager`) as a compact cobalt pill.
- Web list share already uses `.ds-btn__icon` with a share glyph.
- Screenshot: `docs/design-system/screenshots/phase-14/mobile-share-action.jpg`.

## Icon system

- Native `Button` supports `icon={LucideIcon}`; Login, Register, Home, Dashboard, Manage, Gift form, Profile and Public use meaningful icons.
- Lucide is the common web/Android language; SF Symbols remain used for the iOS theme selector.
- Design Charter now has an **Iconography** section (version 1.2.0).
- `docs/design-system/README.md` documents `.ds-btn__icon`, `.ds-icon-btn`, sizes, semantics, accessibility and password/share rules.
- No API/schema changes.

## Gates

- Web typecheck/build ✅ · tests **27/27** ✅ · guard ✅
- Native typecheck/export ✅ · release simulator build/launch ✅
