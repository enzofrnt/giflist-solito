# Tasks: Share Branding & List-Loading Performance

## Phase 1: README + QR

- [x] T001 Add the centered Giftlist logo at the top of `README.md`.
- [x] T002 QR: always use `/logo.webp`, imageSize 0.24, EC H; remove `listImage` prop and callers.
- [x] T003 Verify QR SVG/PNG render + scan/legibility.

## Phase 2: Performance

- [x] T004 AuthContext: stop invalidating/rechecking on every pathname; keep 60s cache + mount check.
- [x] T005 Dashboard: make “Gérer” a prefetchable `Link`.
- [x] T006 Public API: one query for list+gifts, select only user id/name (no email).
- [x] T007 Manage API: remove unused user include.
- [x] T008 Public list: reuse auth context (no duplicate auth request).
- [x] T009 Measure request count/timings dashboard → manage before/after.

## Phase 3: Verification

- [x] T010 Typecheck, lint, tests, web build, Expo export, guard.
- [x] T011 Route/API smoke; no email in public payload; order preserved.
- [x] T012 Screenshots/evidence, commit, push, PR, merge.
