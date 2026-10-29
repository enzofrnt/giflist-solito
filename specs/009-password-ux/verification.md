# Verification: Password Strength & Password-Manager UX

**Date**: 2026-10-29

## Web

- Register page at 1440: strength track **visible while empty**, fill `0%`, label `Robustesse : —`, hint `0/5 règles`.
- After typing a strong password: fill `100%`, label `Robustesse : Très fort`, hint `5/5 règles`.
- Screenshots: `docs/design-system/screenshots/phase-7/register-empty.jpg`, `register-filled.jpg`.
- Email fields now use `autocomplete="username"`; password fields use `current-password` / `new-password`.

## Mobile

- Native `PasswordStrength` (shared scoring) added to registration: empty track + rules visible before typing.
- Screenshot: `docs/design-system/screenshots/phase-7/mobile-register-empty.jpg`.
- Added confirm-password field.
- Login/register fields: `textContentType` `username`/`password`/`newPassword`, `autoComplete` `username`/`current-password`/`new-password`, iOS `passwordRules`.
- Release simulator build succeeded; types/export pass.

## Web ↔ App password manager association

- `apps/expo/app.json`: `ios.associatedDomains = ["webcredentials:giftlist.fr"]`.
- Prebuild generated `Giftlist.entitlements` with `com.apple.developer.associated-domains`.
- `/.well-known/apple-app-site-association` returns:
  ```json
  {"webcredentials":{"apps":["35697BAZW4.com.enzofournet.giflist"]}}
  ```
  with `application/json`.
- The capability is opt-in via `EXPO_PUBLIC_ENABLE_WEB_CREDENTIALS=1` because Apple Personal Teams reject Associated Domains (`Cannot create a iOS App Development provisioning profile... Personal development teams ... do not support the Associated Domains capability`).
- Requires a paid/EAS build with the capability and the same team; the AASA is already live.

## Gates

- Web typecheck ✅ · tests **25/25** ✅ · build ✅ · guard ✅
- Native typecheck ✅ · Expo export ✅
- No API/auth behavior change; no secret.
