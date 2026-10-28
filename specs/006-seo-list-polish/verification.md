# Verification: Brand Icons, SEO/OpenGraph & Public List UX

**Branch**: `feat/seo-list-polish` · **Date**: 2026-10-28

## Icons / favicon

- `favicon.ico`: 48/32/16 cobalt gift/list mark.
- `icon.png`: 512; `apple-icon.png`: 180; `public/icons/icon-192.png`, `icon-512.png`.
- Rendered HTML links: `/favicon.ico` (48), `/icon.png` (512), `/apple-icon.png` (180); no `logo.webp` icon.
- Manifest served at `/manifest.webmanifest` with 192/512 icons.

## SEO / OpenGraph

- Root: `<title>Giftlist — listes de cadeaux à partager</title>`, canonical `https://giftlist.fr`, description, OG/Twitter, 1200×630 `/og/giftlist-og.png`, JSON-LD `WebSite` + `Organization`.
- `/login`, `/register`, `/setup-passkey`, `/dashboard`, `/profile`, `/admin`: titles + `noindex, nofollow` + correct canonical.
- `/manage/1`: `Gestion de liste · Giftlist`, noindex, canonical `/manage/1`.
- `/forgot-password`, `/reset-password`: titles + noindex + canonical.
- `/list/DEMO` (not found): `Liste introuvable · Giftlist`, noindex, canonical `/list/DEMO`; valid list path uses `generateMetadata` with title/description/image and OG.
- `/robots.txt` disallows private/auth/api/design-system; `/sitemap.xml` contains the public home only.
- `/design-system` remains noindex and 404 in production.

## Public list UX

- Card DOM order verified: `title → price/status → description` (e.g. `Casque audio sans fil`, `349 €`, `Disponible`).
- No-image placeholder: 6rem; images: 9rem `object-contain`; reserve button remains primary.
- Screenshots: `docs/design-system/screenshots/phase-5/list-desktop.jpg`, `list-mobile.jpg`.

## Gates (Bun 1.4.4)

- `web:typecheck` pass · `web:lint` 0 errors / 15 pre-existing warnings · `test` 25/25 · `web:build` pass · `expo export` pass · guard pass.
- Routes `/`, auth, dashboard, manage, list, robots, sitemap, manifest → 200.

## Limitations

- Valid public-list metadata was exercised by code path and not-found validation; no production share code was mutated.
- Public lists are deliberately noindex to protect shared gift/reservation data; OG previews still work.
- No API/schema/auth changes.
