# Implementation Plan: Share Branding & List-Loading Performance

**Branch**: `005-share-performance` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

## Summary

Three small, high-impact changes:

1. README logo at the top.
2. QR share always uses the Giftlist logo at ~24% with EC H; remove the list-image prop.
3. Remove avoidable client/API work when opening lists: no auth recheck on every route, prefetchable manage link, one-query public API without email leak, manage API without unused user join, public list reuses auth context.

No schema/API contract change for the UI; server auth remains enforced.

## Technical Context

- Next.js 16.4.3 / React 19 / Bun 1.4.4; `qr-code-styling`; Prisma.
- `AuthContext` has a 60s module cache but invalidates on pathname; remove that invalidation.
- Public API currently does list query → gifts query and returns `user.email`; merge into one include and select id/name only.
- Manage API includes `user` but the page never uses it.
- Dashboard uses `router.push` for “Gérer”, preventing Next prefetch.

## Constitution Check

- [x] Spec-driven.
- [x] Design charter: QR/logo/readme visual coherence; loading states preserved.
- [x] Cross-platform: web only; native untouched.
- [x] Security: removes public email leak; no auth weakening.
- [x] Verification: request-count/timing evidence + gates.

## Files

```text
README.md
apps/next/src/components/QRCodeDisplay.tsx
apps/next/src/app/manage/[id]/page.tsx
apps/next/src/app/list/[shareCode]/PublicListClient.tsx
apps/next/src/app/dashboard/DashboardClient.tsx
apps/next/src/contexts/AuthContext.tsx
apps/next/src/app/api/public/gift-lists/[shareCode]/route.ts
apps/next/src/app/api/gift-lists/[id]/route.ts
specs/005-share-performance/
```

## Verification

- QR render/download at 224/1536, logo center, EC H; manual scan if possible.
- Puppeteer request count/timings on dashboard → manage; before/after.
- API smoke: public response has no `user.email`; gifts order preserved.
- `bun run web:typecheck`, `lint`, `test`, `build`, `expo export`, guard.
- Route smoke.

## Risks

- Removing auth route revalidation could delay a stale-user correction; mitigated by 60s expiry and server-side enforcement.
- Public API email removal is safe (UI only uses name); verify no consumer.
- QR logo ratio too large could hurt scanning; 24% + H is conservative.
