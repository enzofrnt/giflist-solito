# Implementation Plan: Reliable OpenGraph Cards for Shared Lists

**Branch**: `008-list-og-preview` | **Date**: 2026-10-29

## Summary

Add `apps/next/src/app/list/[shareCode]/opengraph-image.tsx` using `next/og` + Prisma public fields, return a 1200×630 branded card. Point list metadata at `/list/<code>/opengraph-image`; keep `noindex`. Fall back to a generic card if DB/list missing.

## Files

- `apps/next/src/app/list/[shareCode]/opengraph-image.tsx`
- `apps/next/src/app/list/[shareCode]/page.tsx` (metadata image URL)
- `apps/next/public/logo-og.png`

## Verification

- Curl `/list/DEMO/opengraph-image` → 200 `image/png`, 1200×630, even with DB unavailable.
- Valid list test once a real share code/DB is available.
- Typecheck/lint/test/build/guard.
