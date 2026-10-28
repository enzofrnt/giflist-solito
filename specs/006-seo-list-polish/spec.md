# Feature Specification: Brand Icons, SEO/OpenGraph & Public List UX

**Feature Branch**: `006-seo-list-polish`

**Created**: 2026-10-28

**Status**: Approved — implementation

**Input**: The favicon is broken/unrecognizable; SEO and OpenGraph are generic or missing on most pages; the public list cards put price/status before the gift title and use oversized empty image areas.

## User Scenarios & Testing

### User Story 1 - A recognizable brand tab (Priority: P1)

A visitor sees a clean Giftlist icon in the browser tab, bookmark, iOS home screen and PWA install.

**Acceptance Scenarios**:

1. **Given** a browser tab, **Then** the favicon is the Giftlist gift/list mark on a cobalt background, legible at 16/32px.
2. **Given** iOS/Android install, **Then** `apple-icon` and 192/512 manifest icons are available.
3. **Given** the old `logo.webp` favicon, **Then** it is no longer referenced by metadata.

### User Story 2 - Complete, safe SEO/OpenGraph (Priority: P1)

Search engines and social previews understand each page; private/share pages do not leak data or get indexed.

**Acceptance Scenarios**:

1. **Given** home, **Then** canonical URL, title template, description, OG/Twitter image (1200×630), locale and WebSite/Organization JSON-LD are present.
2. **Given** auth/dashboard/profile/admin/manage pages, **Then** metadata exists and `robots: noindex, nofollow`.
3. **Given** a public list, **Then** `generateMetadata` uses its title/description/image, sets an OG image (list image or default), canonical, and `noindex` for privacy.
4. **Given** the sitemap, **Then** only public indexable pages are listed (home); auth/private routes are disallowed in `robots.txt`.
5. **Given** the design-system showcase in production, **Then** it stays 404 and noindex metadata does not make it public.

### User Story 3 - Clearer public gift cards (Priority: P1)

A visitor scans a public list and understands each gift before its price/status.

**Acceptance Scenarios**:

1. **Given** a public gift card, **Then** the title is the first text after the image, before price/status.
2. **Given** no image, **Then** the placeholder is compact and tinted, not a large empty box.
3. **Given** an image, **Then** it is a restrained thumbnail (not a full white banner).
4. **Given** a gift, **Then** reserve is the primary action and product link is secondary.

### Edge Cases

- Missing OG image → default branded image.
- List not found → safe metadata/noindex, no DB error.
- Remote list image → absolute/relative URL handled by metadataBase.
- Long list title/description → truncate in metadata naturally.
- Private routes never appear in sitemap.

## Requirements

- **FR-001**: Generate a branded favicon set (`favicon.ico`, `icon.png`, `apple-icon.png`) from the Giftlist mark, not the full wordmark.
- **FR-002**: Add 192/512 PWA icons and a web manifest.
- **FR-003**: Root metadata: correct `metadataBase` (`giftlist.fr`/preview), title template, description, canonical, OG/Twitter, images, locale, robots.
- **FR-004**: Add per-route metadata for login/register/setup-passkey/dashboard/profile/admin/manage; private routes noindex.
- **FR-005**: Public list `generateMetadata` with title/description/image, OG, canonical, noindex.
- **FR-006**: Add `robots.ts`, `sitemap.ts`, `manifest.ts`.
- **FR-007**: Add WebSite + Organization JSON-LD on the root.
- **FR-008**: Fix existing metadata titles that manually append “| Giftlist” under a title template.
- **FR-009**: Reorder public gift card content (title → price/status → description) and reduce placeholder/image height.
- **FR-010**: Preserve all behavior/API/auth; no data leak; no visual regression elsewhere.

## Success Criteria

- **SC-001**: Favicon at 16/32/180/192/512 is the Giftlist mark; no `logo.webp` icon metadata.
- **SC-002**: Every page has a title/description/robots; private ones noindex.
- **SC-003**: Public list shares a useful OG preview (title/description/image) while remaining noindex.
- **SC-004**: `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` respond correctly.
- **SC-005**: Public gift title is above price/status; no-image height ≤ 6rem; card scan is clearer.
- **SC-006**: Gates green.

## Assumptions

- Public lists are private-by-link for search: OG works, indexing is disabled.
- No database/schema changes; metadata uses read-only queries.
- Web only; Expo/native untouched.
