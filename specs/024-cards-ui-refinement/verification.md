# Verification

- List cards use a fixed `16/10` media area, compact placeholder, equal-height standard grid (`minmax(260px, 300px)` web, one column mobile).
- Public profile and own-list grids share the standard card.
- Search query is persisted in `/search?q=...`; public profile has a back link preserving the query/results; native retains stack back.
- Favorites/search separator visible web/native.
- Native upload controls preview the selected/uploaded image.
- QR logo is theme-aware (white asset in dark) and enlarged.
- `giftlist-ui` skill added with card/grid/media/favorite/settings rules.
- Gates: web typecheck/build ✅ · design guard ✅ · native typecheck/export ✅ · tests **37/37** ✅.
