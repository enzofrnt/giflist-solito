# Feature Specification: List Cards, Favorites & Media

**Branch**: `023-list-favorites-media` · **Status**: Approved

## Problems

1. Public list cards are full-width and have no image/placeholder; no-image layouts look broken.
2. Favorites can be added from a list, but not directly from a person’s list cards; removing from favorites is manual.
3. Favorites render below search results; they must be above the search field.
4. Favorite needs a proper shared identity: icon-only and icon+label variants, light red (not pink), documented in the charter.
5. Mobile “Informations personnelles” does not match the clean web form.
6. Images are URL-only; users must be able to upload images with reasonable free storage limits.

## Requirements

- **FR-001**: Shared `FavoriteButton` native/web, icon-only and with-label variants, `aria-pressed`, light-red token (`#e05a4f`/soft `#fdeceb`), defined in Iconography.
- **FR-002**: Add/remove favorite directly from public list cards; remove directly from favorites section.
- **FR-003**: Favorites section above the search input on web/mobile.
- **FR-004**: Standard list card with media area/placeholder; public profile lists use a responsive grid, not full-width blocks; mobile card remains full-width but compact.
- **FR-005**: Mobile personal information form mirrors web: `@pseudo`, public switch + info, pseudo/email edit, password section; no duplicate identity.
- **FR-006**: Image upload API using Vercel Blob (free tier): auth required, images only, max 5 MB, safe path, delete not required.
- **FR-007**: Web and native list/gift image fields offer upload; URL remains possible.
- **FR-008**: Store only URLs in existing DB fields; no schema migration.
- **FR-009**: No favorite toggle directly on owner list cards (settings only); public list cards may show favorite.
