# Verification: Unified Identity & Shared List Cards

- Native `ListCard` used for own lists and public profiles; owner context exposes Gérer + public toggle, public context only “Voir la liste”.
- Web `ListCard` shared by dashboard and `/u/[username]`; public profile has no edit/delete controls.
- Search/profile list links open `PublicListScreen` with the code; the code entry form is hidden for route-provided codes.
- UI identity is now `@username + email`; registration/profile no longer collect a separate name.
- Public list/search/profile APIs expose username, never email; uniqueness still enforced for username/email.
- Web typecheck/build ✅ · native typecheck/export ✅ · tests **30/30** ✅.
- Screenshot: `docs/design-system/screenshots/phase-17/mobile-direct-list.jpg`.
