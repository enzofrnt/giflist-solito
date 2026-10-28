# Tasks: UI Design System Foundation & Showcase (Phase 1)

**Input**: Design documents from `/specs/002-ui-design-system/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [contracts/design-system-classes.md](contracts/design-system-classes.md), [quickstart.md](quickstart.md)
**Tests**: Focused unit tests for the extracted password-strength logic; no end-to-end suite exists for UI, so the Vercel build and manual/visual checks are the acceptance evidence.

## Phase 1: Setup

- [x] T001 Confirm canonical toolchain (Bun 1.4.4, `next@16.4.3`) and run `bun install --frozen-lockfile` at the repo root; record versions in the PR evidence.
- [x] T002 Add `sass` to `apps/next/package.json` devDependencies (via Bun) and update `bun.lock`; verify `bun run --cwd apps/next typecheck` after install.
- [x] T003 Configure Sass partial resolution in `apps/next/next.config.ts` (`sassOptions.includePaths` → `src/styles`) without touching the Solito/react-native-web aliases.
- [x] T004 Add `apps/next/src/styles/index.scss` and import it once in `apps/next/src/app/layout.tsx` after `./globals.css`.
- [x] T005 Create `apps/next/src/components/AppChrome.tsx` (client, `usePathname`) and wire it into `layout.tsx` so the product `Header` is not rendered on `/design-system`; existing routes keep the Header.

## Phase 2: Foundational (blocking prerequisites)

- [x] T006 Create `apps/next/src/styles/_tokens.scss`: SCSS maps (color ramps, semantic roles, type, space, radius, border, shadow, motion, z-index, container) and a single `:root` block emitting `--ds-*` custom properties.
- [x] T007 Create `apps/next/src/styles/_mixins.scss`: `ds-focus-ring`, `ds-media-up`, `ds-media-down`, `ds-elevation`, `ds-truncate`, `ds-visually-hidden`, `ds-motion` (reduced-motion aware).
- [x] T008 Add `@theme inline` aliases in `apps/next/src/app/globals.css` mapping Tailwind theme colors/fonts to `var(--ds-*)` (no visual change; enables Phase 2 utilities).
- [x] T009 Create `_typography.scss` with `.ds-display`, `.ds-h1`–`.ds-h4`, `.ds-body`, `.ds-body-sm`, `.ds-label`, `.ds-caption`, `.ds-mono`, `.ds-link`.
- [x] T010 Create `_buttons.scss` with `.ds-btn` variants (`primary`, `secondary`, `ghost`, `danger`, `accent`), sizes (`sm`, `md`, `lg`), `--block`, `--icon`, `--loading`, and all states via `ds-focus-ring`.
- [x] T011 Create `_forms.scss` with `.ds-field`, `.ds-label`, `.ds-input`, `.ds-textarea`, `.ds-select`, `.ds-hint`, `.ds-error`, `.ds-checkbox`, `.ds-radio`, `.ds-switch`, inline-field layout, and invalid/disabled/read-only/focus states.
- [x] T012 Create `_feedback.scss` with `.ds-alert` info/success/warning/danger (icon + title + message), plus `.ds-empty` and `.ds-skeleton`.
- [x] T013 Create `_cards.scss` with `.ds-card` (+ header/body/footer), `.ds-card--interactive`, `.ds-badge` tones + dot, `.ds-chip`, `.ds-avatar`, `.ds-divider`, `.ds-container`, `.ds-section`, `.ds-stack`, `.ds-grid`.
- [x] T014 Create `_strength.scss` with `.ds-strength`, level tones, track/fill, label, hint, and rules checklist; animate only when reduced motion is not requested.
- [x] T015 Create `_showcase.scss` (namespaced `.ds-showcase`) for the docs layout: nav, section shell, specimen grids, swatch/type/button matrices; no component styling outside the shared partials.
- [x] T016 Compose `apps/next/src/styles/index.scss` with `@use` imports only (no `@import`), tokens first, components in `@layer components`, showcase last.
- [x] T017 Create `packages/app/lib/passwordStrength.ts`: pure TS `calculatePasswordStrength(value)`, reusing `getPasswordRules`; output `{ level 0–4, label, tone, percent, rulesPassed }`; empty → neutral, non-empty weak → visible minimum fill; monotonic labels/percent.
- [x] T018 Add `apps/next/tests/password-strength.test.ts` covering empty, 1-rule, 2-rule, 3-rule, 4-rule, 5-rule, and the previous 0%-bar defect; it runs through the existing `bun run test` script.

## Phase 3: User Story 1 — Review the proposed visual identity (P1)

**Goal**: A standalone, review-only `/design-system` page presenting the complete visual identity.
**Independent Test**: Open `/design-system` locally/preview; every requested section renders and the password meter responds live.

- [x] T019 [US1] Build `apps/next/src/app/design-system/page.tsx`: `noindex` metadata, `notFound()` when `VERCEL_ENV === 'production'`, Phase-1 review banner, section anchors, and a "Phase 2 out of scope until approval" note.
- [x] T020 [P] [US1] Add `apps/next/src/app/design-system/sections/BrandSection.tsx` (logo lockup/sizes, one-line direction, do/don't).
- [x] T021 [P] [US1] Add `PaletteSection.tsx` (all token swatches with name/hex/role; semantic pairs and contrast notes).
- [x] T022 [P] [US1] Add `TypographySection.tsx` (display/h1–h4/body/label/caption/mono specimens using real French copy).
- [x] T023 [P] [US1] Add `ButtonsSection.tsx` (variant × size matrix and default/hover/focus/active/disabled/loading demos).
- [x] T024 [P] [US1] Add `FormsSection.tsx` (input, password, select, textarea, checkbox, radio, switch; label/hint/error/required/disabled; `aria-describedby` wiring).
- [x] T025 [P] [US1] Add `FeedbackSection.tsx` (info/success/warning/danger alerts and empty/skeleton states).
- [x] T026 [P] [US1] Add `CardsSection.tsx` (card variants, badges with dot, chips, dividers, avatars, interactive card).
- [x] T027 [P] [US1] Add `StatesSection.tsx` (interactive state matrix with keyboard focus demonstration and disabled/loading).
- [x] T028 [P] [US1] Add `SpacingSection.tsx` (space scale, radii, borders, shadow ladder, container widths).
- [x] T029 [US1] Add `PasswordStrengthSection.tsx` (client island) using `calculatePasswordStrength`; live input with empty/weak/medium/strong/very-strong examples, checklist, labels, ARIA meter/live.
- [x] T030 [US1] Add `ShowcaseNav.tsx` (sticky desktop sidebar + mobile anchor strip) and section wrapper components; ensure no link appears in the product Header.
- [x] T031 [US1] Verify the production guard by building/serving with `VERCEL_ENV=production` and confirming `/design-system` returns 404; verify preview/local renders.

## Phase 4: User Story 2 — Consistent reusable visual language (P1)

**Goal**: One token/component system, documented and reusable, with no showcase-local overrides.
**Independent Test**: Token/class grep guards pass; showcase uses shared classes; docs match the implementation.

- [x] T032 [US2] Write `docs/design-system/README.md`: visual direction, token roles, class contract, accessibility rules, Phase 2 migration guidance, and approval gate.
- [x] T033 [US2] Add a token/class usage guard (script or CI-ready shell snippet) that fails on raw hex/px in `_buttons.scss`, `_forms.scss`, `_feedback.scss`, `_cards.scss`, `_strength.scss`, and on `@import "tailwindcss"` inside `apps/next/src/styles`.
- [x] T034 [US2] Confirm all showcase specimens compose `.ds-*` classes from `_*.scss`; remove/relocate any one-off showcase style into `_showcase.scss` or the shared partials.
- [x] T035 [US2] Ensure `globals.css` still owns `@import "tailwindcss"` and the SCSS entry is the only new global stylesheet; document the hybrid architecture and why full Tailwind replacement is Phase 2.

## Phase 5: User Story 3 — Preserve existing strengths (P1)

**Goal**: Existing pages, brand, and password rules remain intact.
**Independent Test**: Existing routes render as before; password rules stay single-sourced; native smoke passes.

- [x] T036 [US3] Refactor `apps/next/src/components/PasswordInput.tsx` to import `calculatePasswordStrength` (no duplicate scoring), fix `minLength` to 8, add `role="meter"`/`aria-valuenow`/`aria-live`, and keep the existing toggle/checklist and page visuals otherwise unchanged.
- [x] T037 [US3] Smoke-check `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/setup-passkey`, `/dashboard`, `/profile`, `/manage/[id]`, `/list/[shareCode]`; confirm no Phase 2 restyle and no console errors.
- [x] T038 [US3] Run `bun run --cwd apps/expo export` and grep that no `.scss`/`.css` import reached `packages/app` or `apps/expo`; verify the shared password-strength module is pure TS.

## Phase 6: User Story 4 — Responsive and accessible review (P2)

**Goal**: The showcase is usable at 375/768/1440px and with a keyboard.
**Independent Test**: Resize, tab through all controls, check contrast/focus/reduced-motion.

- [x] T039 [US4] Verify responsive behavior at 375/768/1440px; fix overflow, stacking, and touch-target issues in `_showcase.scss`/component partials.
- [x] T040 [US4] Verify keyboard order, `:focus-visible` on every interactive demo, Escape/focus behavior for any overlay specimen, and `prefers-reduced-motion` suppression.
- [x] T041 [US4] Verify contrast for body text, muted text, borders, and semantic alerts; adjust tokens (not one-off overrides) if any pair fails the baseline.

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T042 Run the full gates under Bun 1.4.4: `bun run web:typecheck`, `bun run web:lint`, `bun run web:build`, `bun run test`, `bun run --cwd apps/expo export`; capture command output.
- [x] T043 Run the refactor guard snippet (Tailwind entry, no SCSS Tailwind import, no CSS in shared/native, `ds-btn` in built CSS, password single source).
- [x] T044 Capture review screenshots at 1440px and 375px (Puppeteer + system Chrome) into `docs/design-system/screenshots/`; verify no console errors.
- [x] T045 Review `git diff` for scope creep, secrets, and unintended edits to existing pages; confirm only root layout, `PasswordInput`, `globals.css` theme aliases, and new files changed.
- [x] T046 Commit on `feat/ui-design-system`, push, open the Phase 1 PR with spec link, evidence, showcase URL, and the explicit "Phase 2 not started" statement.
- [x] T047 Record the owner's approval/rejection/change-request in `specs/002-ui-design-system/`; do not start Phase 2 before that.

## Dependencies

- Phase 1 (T001–T005) → Phase 2 (T006–T018): tokens/mixins must exist before component partials; `PasswordInput` refactor depends on T017/T018.
- Phase 3 (US1) depends on T006–T016 (library) and T029 depends on T017.
- Phase 4 (US2) depends on the showcase sections existing (T019–T030).
- Phase 5 (US3) can run in parallel with US1/US2 once T017/T018 land; `PasswordInput` (T036) is independent of the showcase.
- Phase 6 (US4) depends on the showcase and components existing.
- Phase 7 runs last.

## Parallel Execution Examples

- **Foundational**: T006/T007 can be authored together; T009–T014 are separate files and can be parallel after tokens/mixins.
- **Showcase**: T020–T028 are separate section files; build them in parallel once T015/T016 and the component classes exist.
- **Preserve**: T036 (PasswordInput) and T038 (native smoke/grep) are independent of T020–T028.

## Implementation Strategy

1. **MVP review increment**: T001–T018 + T019–T030 (setup, tokens, core components, showcase, password demo) → build + screenshots → owner reviews.
2. Preserve increment: T036–T038 before the review to guarantee the auth pages still work with the shared password logic.
3. Accessibility/responsive pass: T039–T041 before requesting approval.
4. Ship: T042–T046; stop before Phase 2 and wait for T047.
