# Verification: Reliable OpenGraph Cards for Shared Lists

**Date**: 2026-10-29

## Tested

- `/list/DEMO/opengraph-image` with local DB unavailable → **200**, `image/png`, **1200×630**, generic card (no 500).
- Generic card screenshot inspected: logo, "Liste de cadeaux", owner fallback, "0 cadeau", `giftlist.fr`.
- Typecheck/build pass with the new metadata image route.
- List pages remain `noindex, nofollow`; OG/Twitter metadata points to the dynamic image for valid lists.

## Known limitation

- The local checkout has no running Postgres, so a valid list card could not be generated locally. Production has the DB; the route uses read-only public fields. A real share link should be tested after deploy.
