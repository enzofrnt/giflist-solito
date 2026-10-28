# Tasks: Application-wide UI Harmonization (Phase 2)

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [design system](../../docs/design-system/README.md)
**Execution**: items marked [P] have disjoint file scopes; they can run in parallel.

## Phase 1: Shared foundation

- [x] T001 Add `.ds-page`, `.ds-page-header`, `.ds-toolbar`, `.ds-list`, `.ds-table`, `.ds-auth`, `.ds-modal`, `.ds-icon-btn`, `.ds-spinner` and `.ds-home` to `apps/next/src/styles/_app.scss`; import in `index.scss`.
- [x] T002 Add the web Header in `apps/next/src/components/Header.tsx` (brand, nav, auth, mobile menu, Escape, aria) and point `AppChrome` to it; leave shared/native Header untouched.
- [x] T003 Add accessible `apps/next/src/components/Modal.tsx` (portal, role=dialog, aria-modal, title, Escape, focus trap/restore, scroll lock).
- [x] T004 Add `apps/next/src/components/AuthCard.tsx` (brand, title, lead, form slot, footer links).
- [x] T005 Add `apps/next/src/components/home/HomePage.tsx` and render it from `apps/next/src/app/page.tsx`; preserve native shared home.
- [x] T006 Harmonize `PasswordInput` to `.ds-input-wrap`/`.ds-strength`/`.ds-input` and keep the shared password rules/ARIA.

## Phase 2: Authentication [P]

- [x] T007 Refactor `login/page.tsx` to `AuthCard` + `.ds-field`/`.ds-btn`/`.ds-alert`; preserve passkey/password flows.
- [x] T008 Refactor `register/page.tsx` to `AuthCard` + shared fields/strength/guide; preserve validation/redirects.
- [x] T009 Refactor `PasswordRecoveryForm` (forgot/reset) to `AuthCard` + shared alerts/fields; preserve token/hash/success logic.
- [x] T010 Refactor `setup-passkey/page.tsx` to `AuthCard` + shared buttons/alerts; preserve browser checks/redirects.

## Phase 3: Dashboard [P]

- [x] T011 Refactor `apps/next/src/app/dashboard/page.tsx` + `DashboardClient.tsx` to `.ds-page`/cards/toolbar/empty/badges/alerts.
- [x] T012 Refactor `apps/next/src/components/AlertModal.tsx` to `Modal` while keeping its multi-page API.
- [x] T013 Refactor `apps/next/src/components/EditListModal.tsx` to `Modal` + shared fields/buttons.
- [x] T014 Preserve list CRUD/share/QR/delete/reveal/loading behavior and verify dashboard at 390/768/1440.

## Phase 4: Manage & gifts [P]

- [x] T015 Refactor `apps/next/src/app/manage/[id]/page.tsx` to `.ds-page`/cards/toolbar/badges/alerts/empty.
- [x] T016 Refactor `GiftFormModal.tsx` to `Modal` + shared fields/select/textarea + scrape state.
- [x] T017 Refactor `GiftStatusBadge.tsx` to `.ds-badge` tones (keep API).
- [x] T018 Refactor `QRCodeDisplay.tsx` and `SecretModeToggle.tsx` to shared modal/button/switch styles (keep APIs).
- [x] T019 Preserve gift CRUD/scraping/secret mode/reservations/QR and verify manage at 390/768/1440.

## Phase 5: Public list & profile [P]

- [x] T020 Refactor `list/[shareCode]/page.tsx` + `PublicListClient.tsx` around the `.ds-home` hero + shared cards/badges/buttons/alerts.
- [x] T021 Refactor `ReserveDialog.tsx` to `Modal` + shared fields/buttons; preserve payload/callback behavior.
- [x] T022 Refactor `profile/page.tsx` + `ProfileClient.tsx` to `.ds-page` settings cards/fields/alerts.
- [x] T023 Refactor `PasskeyManager.tsx` to shared list/buttons/alerts; preserve register/remove flows.
- [x] T024 Verify public reservation/cancel/secret/QR and profile/passkey flows at 390/768/1440.

## Phase 6: Admin [P]

- [x] T025 Refactor `admin/page.tsx` to `.ds-page`/cards/table/fields/buttons/alerts without changing behavior or security model.
- [x] T026 Verify admin actions and responsive layout.

## Phase 7: Cross-cutting quality

- [x] T027 Sweep every page at 1440/768/390 for overflow, spacing, header overlap and touch targets.
- [x] T028 Keyboard sweep: focus visible everywhere, mobile menu Escape, dialogs trap/restore focus, labels/errors linked.
- [x] T029 Verify reduced motion and contrast for changed components.
- [x] T030 Grep for duplicated legacy button/input/modal recipes and remove leftovers in refactored files.
- [x] T031 Update `docs/design-system/README.md` + `specs/002.../contracts/design-system-classes.md` with the Phase 2 shell classes and select wrapper.
- [x] T032 Capture before/after screenshots for every page group in `docs/design-system/screenshots/phase-2/`.

## Phase 8: Verification & delivery

- [x] T033 Run `bun run web:typecheck`, `bun run web:lint`, `bun run test`, `bun run web:build`, `bun run --cwd apps/expo export`, `./scripts/design-system-guard.sh`.
- [x] T034 Route smoke: `/`, auth pages, dashboard, profile, admin, public list, manage.
- [x] T035 Review `git diff` for behavior changes, secrets, raw hex and scope creep.
- [x] T036 Commit on `feat/ui-harmonization`, push, open PR with spec link, evidence and before/after screenshots.
- [x] T037 Update the Phase 2 spec/tasks with the final evidence and note any known limitation.

## Dependencies

- T001–T006 block all page work.
- Phase 2/3/4/5/6 are disjoint file scopes and can run in parallel once T001–T006 exist.
- T027–T032 depend on all page groups; T033–T037 run last.
