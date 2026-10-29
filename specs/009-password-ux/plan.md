# Implementation Plan: Password Strength & Password-Manager UX

**Branch**: `009-password-ux` | **Date**: 2026-10-29

## Changes

1. Web `PasswordInput`: remove `&& value`, add empty label, neutral meter.
2. New `packages/app/ui/PasswordStrength.native.tsx` (tokens, percent, label, rules) + web variant; export.
3. Mobile register: render strength after password field; pass passwordRules.
4. Native fields: `textContentType` (`username`, `password`, `newPassword`), `autoComplete` (`username`, `current-password`, `new-password`).
5. `app.json` iOS `associatedDomains: ["webcredentials:giftlist.fr"]`.
6. `apps/next/src/app/.well-known/apple-app-site-association/route.ts` returning webcredentials appID.

## Verification

- Web screenshot empty/filled; mobile simulator screenshot register.
- AASA curl; app config inspect.
- Web typecheck/build/tests; native typecheck/export.
