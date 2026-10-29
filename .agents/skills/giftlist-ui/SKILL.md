---
name: "giftlist-ui"
description: "Giftlist UI card, list, media and favorite design rules. Use before building or reviewing list cards, gift cards, public profiles, search results or account settings."
metadata:
  author: "giftlist"
  source: "docs/design-system/README.md"
---

# Giftlist UI — Cards, Lists, Media & Favorites

This skill complements `ui-ux-design`. Load both for any list/card/search UI change.

## Card anatomy (mandatory)

1. **Media first** — one image area with a fixed ratio (`16/10` web, `16/10` native). Use `object-cover` / `resizeMode="cover"`; never stretch. A missing image gets a compact branded placeholder, never a giant empty band.
2. **Identity** — title max 2 lines, optional owner `@username`, one short description max 2 lines.
3. **Meta** — gift count, visibility and secret mode only when useful. No duplicate badges.
4. **Action** — one primary (`Gérer`, `Voir la liste`) and at most one overflow/secondary icon. No button on every metadata line.
5. **Equal heights** — cards in a grid stretch to the tallest; footer stays at the bottom.

## Grid rules

- Web list cards: `ds-card-grid` with columns `minmax(260px, 300px)`, left-aligned, never full viewport width. At 1876 px do not render 400 px-wide cards.
- One column under 640 px.
- Public profile uses the same grid as “Mes listes”.
- Gift cards: compact horizontal thumbnail (96 px) + content; never a giant empty media block in management.

## Images

- Accept JPG/PNG/WebP/GIF, max 5 MB, through the upload control; URL input remains.
- Always preview the selected/uploaded image immediately (`value` prop on native upload).
- Failed/empty images show the placeholder; do not hide or collapse the card.

## Favorites

- Canonical `FavoriteButton`: icon-only on cards, icon+label on detail; light red `#e05a4f` / soft `#fdeceb`.
- Add/remove directly on public list cards and favorite rows.
- Favorites sit **above** the search field with a visible separator.

## Settings

- Identity is `@username + email`; no separate display name.
- One “Informations personnelles” card: identity header, pseudo, public switch + info, email edit, save.
- Password is a separate section; success/error feedback next to its section.

## Responsive/a11y checks

- Verify 1440 / 768 / 390 px; images not distorted; no horizontal scroll.
- 44 px touch targets, visible focus, `aria-pressed` for favorites, labels for icon-only controls.
- Empty/loading/error states keep the same card geometry.
