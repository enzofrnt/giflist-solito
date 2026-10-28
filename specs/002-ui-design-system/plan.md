# Implementation Plan: UI Design System Foundation & Showcase (Phase 1)

**Branch**: `002-ui-design-system` | **Date**: 2026-10-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-ui-design-system/spec.md`

**Note**: Phase 1 only. It creates the design-system layer and the review page; it does not restyle existing pages (Phase 2, gated on approval).

## Summary

Create a centralized, token-driven design system for the GiftList web client, expressed as a new SCSS layer (`apps/next/src/styles/`) that coexists with the existing Tailwind v4 entry, plus a standalone `/design-system` showcase page for review. The showcase presents the proposed visual identity (brand, palette, typography, buttons, forms, feedback, cards/badges, states, spacing/radii/shadows, password strength) and is available in local/preview only, not on the public production site. Existing pages keep their current rendering; the shared password-strength logic is extracted, corrected, and reused.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.1.0, Next.js 16.4.3 (App Router, Webpack), Bun 1.4.4, Node 24.x on Vercel

**Primary Dependencies**: Tailwind CSS v4 (`@tailwindcss/postcss`) for existing utilities; new `sass` (Dart Sass) for the design-system layer; React Native 0.81.5 + Solito for the shared/native boundary; no new UI runtime dependency

**Storage**: N/A for this feature (no schema, no migration, no API change)

**Testing**: `bun test` (existing suites; password-reset suite guards `passwordValidation`), `bun run web:typecheck`, `bun run web:lint`, `bun run web:build`, `bun run --cwd apps/expo export` (native smoke), plus repository grep guards

**Target Platform**: Web only (`apps/next`). `packages/app` is touched only for pure TypeScript password-strength logic; no CSS/SCSS is imported there. Expo/native rendering stays unchanged.

**Project Type**: Cross-platform monorepo; Phase 1 lives entirely in `apps/next`

**Performance Goals**: The showcase must load its CSS in one request and render without layout shift; token/component CSS should stay below ~25 KB gzipped on the showcase route; no client JavaScript on the page except the password-strength demo and the header-visibility wrapper

**Constraints**: Tailwind v4 must not be imported from SCSS (official incompatibility); SCSS uses `@use` only (no deprecated `@import`); design system classes are namespaced `ds-` and must not alter existing pages; showcase is review-only and mobile/tablet/desktop responsive; no dark mode in Phase 1

**Scale/Scope**: 1 new route, ~1 SCSS library (tokens + 7 partials), 1 showcase page with ~10 sections, 1 extracted shared password-strength module, 1 small chrome wrapper; no existing page restyle

**Environment variables**: None new. `VERCEL_ENV` (already provided by Vercel) gates the showcase: `production` → 404; preview/local → render.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Spec-driven**: [spec.md](spec.md) and [checklists/requirements.md](checklists/requirements.md) exist and cover Phase 1 scope and the approval gate.
- [x] **Cross-platform**: Web-only delivery is explicit. `packages/app` receives only pure TS logic (`passwordStrength.ts`), no CSS. Native smoke (`expo export`) is part of verification.
- [x] **Boundaries**: All SCSS lives in `apps/next/src/styles`; no import from `apps/*` into `packages/app`; Tailwind continues to own `@import "tailwindcss"` in `globals.css`; single Bun lockfile.
- [x] **Data**: No Prisma/schema/migration change; no `db push` or database access in the showcase.
- [x] **Security**: The showcase contains no auth, no user data, no secrets, no API calls; it is `noindex` and returns 404 on production Vercel. Password rules stay server-aligned by reusing `getPasswordRules`/`validatePassword`.
- [x] **Evidence**: Verification plan below is runnable under Bun 1.4.4 with `next@16.4.3` installed; visual review evidence will include build output and screenshots of the showcase.
- [x] **Deployment**: No env changes; preview builds run the same gates; production route is intentionally unavailable; merging Phase 1 does not restyle the product.

**Post-design re-check**: PASS. The only intentional deviation is the hybrid Tailwind + Sass coexistence (justified below), because Tailwind v4 explicitly does not support preprocessors and a full utility-class rewrite is Phase 2 scope.

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-design-system/
├── spec.md
├── plan.md                 # This file
├── research.md             # Phase 0 decisions (SCSS, tokens, password strength, a11y)
├── quickstart.md           # How to run and review the showcase
├── contracts/
│   └── design-system-classes.md  # Public class/variant contract for Phase 2
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks output

docs/design-system/
├── ui-audit.md             # Existing UI/CSS audit (evidence base)
└── README.md               # Design-system guidelines, token roles, Phase 2 rules
```

### Source Code (repository root)

```text
apps/next/
├── next.config.ts                     # + sassOptions.includePaths for src/styles
├── package.json / ../../bun.lock      # + sass devDependency
├── src/app/
│   ├── globals.css                    # Tailwind entry stays; + @theme aliases to --ds-* (no visual change)
│   ├── layout.tsx                     # + import '@/styles/index.scss'; + <AppChrome>
│   └── design-system/
│       ├── page.tsx                   # review-only route (404 on production), noindex
│       └── sections/*.tsx             # server sections + client password demo
├── src/components/
│   ├── AppChrome.tsx                  # hides product Header on /design-system
│   └── PasswordInput.tsx              # reuse extracted strength logic; fix minLength/aria (small refinement)
└── src/styles/
    ├── index.scss                     # @forward/@use entry, @layer components
    ├── _tokens.scss                   # SCSS maps -> :root --ds-* (single source of truth)
    ├── _mixins.scss                   # focus-ring, media, elevation, truncate, reduced-motion
    ├── _typography.scss               # .ds-display/.ds-h1..4/.ds-body/.ds-label/.ds-caption/.ds-link
    ├── _buttons.scss                  # .ds-btn + variants/sizes/states/icons/loading
    ├── _forms.scss                    # .ds-field/.ds-input/.ds-select/.ds-checkbox/.ds-switch/…
    ├── _feedback.scss                 # .ds-alert variants + .ds-empty/.ds-skeleton
    ├── _cards.scss                    # .ds-card/.ds-badge/.ds-chip/.ds-divider/.ds-avatar
    ├── _strength.scss                 # .ds-strength meter + levels
    └── _showcase.scss                 # docs layout only (namespaced .ds-showcase)

packages/app/lib/
├── passwordValidation.ts              # unchanged rules (server/client source of truth)
└── passwordStrength.ts                # NEW pure TS extraction + corrected 0-4 levels
```

**Structure Decision**: `apps/next` only for CSS; `packages/app` only for pure TS. The showcase is a route in the app directory but visually standalone (its own chrome) and review-gated. Existing page files are not edited in Phase 1 except the root layout (CSS import + chrome wrapper) and `PasswordInput` (shared logic/aria fix).

## Cross-Platform Impact

| Client | Impacted? | What changes | Verification |
|--------|-----------|--------------|--------------|
| Web (`apps/next`) | Yes | New SCSS layer, `/design-system` route, root layout imports/wrapper, `PasswordInput` refinement | typecheck, lint, build, manual showcase review, screenshots |
| Native (`apps/expo`) | No visual change | Consumes updated `packages/app/lib/passwordStrength.ts` only if imported; no CSS | `bun run --cwd apps/expo export` |
| Shared (`packages/app`) | Logic only | New `passwordStrength.ts`; `passwordValidation.ts` untouched | `bun test`, typecheck, grep: no CSS imports in shared/native |

## Data & Migration Plan

None. No Prisma models, no tables, no migrations, no API routes, no background jobs. The password-strength extraction keeps `getPasswordRules`/`validatePassword` as the server-validated source of truth.

## API & Contracts

No HTTP API changes. The UI contract for Phase 2 is documented in [contracts/design-system-classes.md](contracts/design-system-classes.md): class names, variants, sizes, states, data attributes, and accessibility expectations.

## Phase 0: Research

All unknowns are resolved in [research.md](research.md):

1. **Styling architecture** — keep Tailwind v4 as the utility engine; add a separate Sass layer. Decision: hybrid, two entry points; `@import "tailwindcss"` never enters SCSS. Rationale: Tailwind v4 explicitly does not support preprocessors, and Sass is supported by Next.js with `sass` installed. Alternative (full SCSS rewrite) is Phase 2 and would violate the no-rollout constraint.
2. **Token strategy** — SCSS maps are the authoring source; they emit `--ds-*` CSS custom properties at `:root`. `globals.css` gets `@theme inline` aliases (`--color-primary`, `--color-ink`, …) so Tailwind utilities and `.ds-*` classes read the same values. No duplicate hardcoded values.
3. **Password strength** — extract `calculatePasswordStrength` to `packages/app/lib/passwordStrength.ts`; keep labels and rule-derived scoring; fix the 0%-bar and score/label defects; expose `level`, `label`, `tone`, `percent`, `rulesPassed`; add ARIA meter/live semantics. UI and server keep using `getPasswordRules`.
4. **Showcase isolation** — `/design-system` returns `notFound()` when `VERCEL_ENV === 'production'`, is `noindex`, and is not linked from the Header. `AppChrome` hides the product Header only on this route.
5. **Visual direction** — “Porcelain & Cobalt”: warm porcelain canvas, ink text, cobalt primary (brand continuity), coral gifting accent, semantic success/warning/danger/info, Geist typography, soft warm shadows, 4px spacing rhythm, 10/14px radii, 44px touch targets.
6. **Accessibility** — global `:focus-visible` mixin, `aria-*` on form demos, `role="meter"` for strength, `prefers-reduced-motion` guard, no color-only semantics.

## Phase 1: Design

### Token architecture (single source)

- `_tokens.scss` defines SCSS maps and emits one `:root` block of `--ds-*` custom properties: color ramps and semantic roles, typography families/sizes/weights/line-heights, space, radius, border, shadow, motion, z-index, layout widths.
- `_mixins.scss` provides `ds-focus-ring`, `ds-media-up/down`, `ds-elevation`, `ds-truncate`, `ds-visually-hidden`, `ds-motion`.
- All component partials use `var(--ds-*)` or the mixins; no raw hex in component files.
- `globals.css` keeps `@import "tailwindcss"` and the existing reset/base, and adds only `@theme inline` aliases to the new token names. Existing pages render identically.

### Visual identity

- **Palette**: warm neutrals (porcelain `#faf9f7`, ink `#1b1917`, border `#e8e4dd`), cobalt primary (`#2563eb` / `#1d4ed8`), coral accent (`#f4673f`) for gift moments, success `#067647`, warning `#b54708`, danger `#b42318`, info `#175cd3`.
- **Type**: Geist Sans (UI/display) + Geist Mono (numbers/code). Scale from 12px caption to a clamped 48–64px display; body 15px/1.6; labels 12–13px uppercase tracking.
- **Shape**: radius 6/10/14/20/28; borders 1px warm neutral; shadows warm-tinted, five steps; 4px spacing scale; 44px minimum touch target.
- **Voice**: French UI copy, calm and helpful; no emoji in controls (logo/hero may keep the gift emoji).

### Component contracts (namespaced `ds-`)

- Buttons: `.ds-btn` + `--primary|secondary|ghost|danger|accent`, `--sm|md|lg`, `--block`, `--icon`, `--loading`; states default/hover/focus-visible/active/disabled.
- Forms: `.ds-field`, `.ds-label`, `.ds-input`, `.ds-textarea`, `.ds-select`, `.ds-hint`, `.ds-error`, `.ds-checkbox`, `.ds-radio`, `.ds-switch`; `aria-invalid`/`aria-describedby` wired in the showcase.
- Feedback: `.ds-alert` + `--info|success|warning|danger`, with icon + title + body; `.ds-empty`, `.ds-skeleton`.
- Containers: `.ds-card` (+ header/body/footer), `.ds-badge` (+ tones/dot), `.ds-chip`, `.ds-divider`, `.ds-avatar`.
- Interaction: `.ds-modal` specimen (static demo), `.ds-tooltip`? (not required; skip), `.ds-strength` meter.
- Layout helpers: `.ds-container`, `.ds-section`, `.ds-stack`, `.ds-grid` (used by the showcase; reusable by pages).
- All component rules live inside `@layer components`; utilities from Tailwind remain available and win when deliberately applied.

### Showcase route

- `apps/next/src/app/design-system/page.tsx` is a Server Component with `robots: noindex`, `notFound()` on production Vercel, and a self-contained layout (no product Header via `AppChrome`).
- Sticky section navigation (anchor links), one section per requested area, each composed from `.ds-*` classes and real form controls.
- Interactive password demo is the only substantial client island; it uses the extracted `calculatePasswordStrength` and renders all five levels with live feedback, checklist, and ARIA.
- The page includes a prominent “Phase 1 — proposition à valider” banner and a “Phase 2 hors scope jusqu'à validation” note.
- Responsive: single column below 768px, two-column specimen grids above; no horizontal overflow at 375/768/1440.

### Password strength refinement

- `packages/app/lib/passwordStrength.ts`: `calculatePasswordStrength(password)` → `{ level: 0–4, label, tone, percent, rulesPassed }`; empty → neutral, non-empty weak → minimum visible 10%; thresholds align labels and bar monotonically; rules derive from `getPasswordRules`.
- `PasswordInput.tsx` consumes the shared function (no duplicate scoring), fixes `minLength` to 8, adds `role="meter"`/`aria-valuenow`/`aria-live` and keeps the existing toggle/checklist. Visual styling stays compatible with the current auth pages (no full restyle), except corrected bar behavior.
- The showcase renders `.ds-strength` with the same logic and tokens, demonstrating all levels.

## Verification Plan

### Automated gates (Bun 1.4.4)

```sh
bun --version                                  # 1.4.4
bun install --frozen-lockfile                  # locks next@16.4.3 + sass
bun run web:typecheck
bun run web:lint
bun run web:build                              # must compile SCSS and Tailwind
bun run test                                   # password suite guards the extraction
bun run --cwd apps/expo export                 # native smoke, no CSS leak
```

### Refactor-specific assertions

```sh
# Tailwind entry still owns the Tailwind import
grep -q '@import "tailwindcss"' apps/next/src/app/globals.css
# No Tailwind import or deprecated Sass @import in the SCSS layer
! grep -rn '@import "tailwindcss"\|^@import' apps/next/src/styles
# No CSS/SCSS imported from shared/native
! grep -rn "\.scss'\|\.css'" packages/app apps/expo/src
# Design-system tokens/classes reached the build
grep -q 'ds-btn' .next/static/css/*.css
# Password rules remain single-sourced
grep -rn 'getPasswordRules\|validatePassword' apps/next/src packages/app/lib
```

### Manual / visual

- Start the production build locally (`PORT=3100 bun run --cwd apps/next start`) and open `/design-system`; verify all sections, the five password levels, keyboard focus, and 375/768/1440 layouts.
- Capture screenshots at 1440 and 375 for the review (saved under `docs/design-system/screenshots/`, committed only if small and useful).
- Smoke-check untouched pages (`/`, `/login`, `/register`, `/dashboard` after auth, `/list/[shareCode]`, `/manage/[id]`) to prove no Phase 2 restyle leaked.
- Verify production guard: build with `VERCEL_ENV=production` (or check the Vercel production deployment) and confirm `/design-system` returns 404.
- Record the owner's approval/rejection in `specs/002-ui-design-system/` before Phase 2.

### Evidence to report

Commands + exit status, build CSS contains `ds-*`, screenshot paths, console errors (none), and an explicit statement of anything not verified (e.g. production 404 if tested only via env simulation).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Hybrid Tailwind v4 + Sass (two styling entries) | User wants SCSS; Tailwind v4 does not support preprocessors, but the existing 820 Tailwind class usages cannot be rewritten in Phase 1 without restyling pages | Full SCSS migration would touch every page and violate the Phase 1 “no rollout” constraint; plain CSS would not deliver the requested nested/token/mixin maintainability |
| `AppChrome` client wrapper in root layout | The showcase must not render the product Header, and Next has no second root layout without moving every existing page | CSS-only hiding would leave the Header interactive/visible to assistive tech and is fragile; moving all routes into route groups is a larger refactor |
| Small `PasswordInput` refinement | The strength indicator must be reused/refined and currently has real score/minLength/ARIA defects | Duplicating the corrected logic only in the showcase would create two sources of truth and leave the app's indicator buggy |
