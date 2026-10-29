# Verification: Public Search & Discoverability

- Migration adds unique `User.username`, `User.isPublic` and backfills existing accounts.
- Registration/profile validate lowercase unique handles; tests cover duplicate rejection.
- Search exact code returns a private list; user search excludes private accounts.
- Public profile API returns public account + public lists only; no email.
- Web `/search` and `/u/[username]`, header Recherche link.
- Mobile third tab Recherche + account public profile screen.
- Public/private switches with InfoHint on account and list settings.
- Tests: **30/30** pass.
- Web typecheck/build, design-system guard, native typecheck/export/build all pass.
- Screenshots: `docs/design-system/screenshots/phase-16/`.
