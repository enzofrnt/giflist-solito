# Verification

- Favorite token/button documented in the Design Charter and implemented native/web with icon-only and label variants.
- Add/remove favorites from public list cards, detail, and favorites rows; favorites are above search on web/mobile.
- List cards have a media area/placeholder; public lists use the standard card grid.
- Mobile personal information card mirrors web: pseudo, public switch + info, email edit, save; password separate.
- Vercel Blob store `giftlist-images` connected (production/preview/development); upload API enforces auth, MIME and 5 MB.
- Web/native image upload controls; URL input remains.
- Web typecheck/build ✅ · native typecheck/export ✅ · tests **37/37** ✅.
- Vercel Blob store `giftlist-images` active; `BLOB_READ_WRITE_TOKEN` set for Production/Preview/Development.
- Upload route is auth-protected; 5 MB and image MIME enforced.
