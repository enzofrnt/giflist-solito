# Implementation Plan: Brand Icons, SEO/OpenGraph & Public List UX

**Branch**: `006-seo-list-polish` | **Date**: 2026-10-28

## Summary

Generate a proper icon/favicon set from the Giftlist mark, add complete metadata + robots/sitemap/manifest + JSON-LD, add per-route metadata (layouts for client routes, `generateMetadata` for public lists), and improve the public gift card hierarchy.

## Technical Context

- Next.js 16.4.3 App Router metadata API, file conventions (`icon.png`, `apple-icon.png`, `favicon.ico`, `manifest.ts`, `robots.ts`, `sitemap.ts`).
- Prisma read-only query for public-list metadata.
- ImageMagick-generated assets from `logo.webp`; 1200×630 OG.
- No schema/API/auth changes.

## Constitution Check

- [x] Spec-driven.
- [x] Design charter: branded icons/OG; public list hierarchy.
- [x] Privacy: noindex for private/public lists; no emails.
- [x] Web only; native untouched.
- [x] Verification: metadata inspection, routes, assets, gates.

## Files

```text
apps/next/public/favicon.ico, icon.png, apple-icon.png (app dir)
apps/next/public/icons/icon-192.png, icon-512.png
apps/next/public/og/giftlist-og.png
apps/next/src/lib/seo.ts
apps/next/src/app/manifest.ts, robots.ts, sitemap.ts
apps/next/src/app/layout.tsx + per-route layouts
apps/next/src/app/list/[shareCode]/page.tsx
apps/next/src/app/list/[shareCode]/PublicListClient.tsx
```

## Verification

- Inspect metadata/OG/JSON-LD via rendered HTML.
- `curl` robots/sitemap/manifest; icon dimensions.
- Public list screenshot at 1440/390; title before price.
- Typecheck/lint/test/build/Expo/guard; production 404 showcase.
