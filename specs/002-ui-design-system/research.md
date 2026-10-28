# Phase 0 Research — UI Design System Foundation & Showcase

**Feature**: `002-ui-design-system` · **Date**: 2026-10-28
**Evidence base**: [docs/design-system/ui-audit.md](../../docs/design-system/ui-audit.md)

## Decision 1 — Styling architecture: hybrid Tailwind v4 + Sass (two entries)

**Decision**: Keep `apps/next/src/app/globals.css` as the Tailwind v4 entry (`@import "tailwindcss"` and the existing reset/base). Add a separate Sass layer at `apps/next/src/styles/`, imported after `globals.css` in the root layout. Never import Tailwind from SCSS.

**Rationale**:

- Tailwind CSS v4 explicitly states it is "not designed to be used with CSS preprocessors like Sass, Less, or Stylus"; it bundles imports itself and expects to be the preprocessor ([Tailwind compatibility](https://tailwindcss.com/docs/compatibility)).
- Next.js supports `.scss` first-class once `sass` is installed ([Next.js Sass guide](https://nextjs.org/docs/app/guides/sass)). It compiles SCSS through `sass-loader` before PostCSS, so two separate entries coexist safely.
- The repo has **820 Tailwind `className` usages** in `apps/next/src/**` and only one 50-line stylesheet. A full SCSS rewrite in Phase 1 would touch every page, violating the "no rollout before approval" constraint.
- Dart Sass `@import` is deprecated (removed in 3.0); use `@use`/`@forward` ([Sass @import](https://sass-lang.com/documentation/at-rules/import/)).

**Alternatives rejected**:

- `globals.scss` importing Tailwind: unsupported, fragile, and Sass cannot resolve the `tailwindcss` module cleanly.
- Full SCSS migration now: too large, restyles existing pages, and conflicts with the Phase 2 approval gate.
- Plain CSS only: loses the requested variables/mixins/nesting maintainability and the user's explicit SCSS direction.

**Consequences**: Phase 1 ships the SCSS component/token layer and keeps Tailwind utilities for existing pages. Phase 2 migrates page-level utilities to `.ds-*` classes and can then decide whether Tailwind remains as a utility layer or is removed.

## Decision 2 — Token strategy: SCSS maps emit `--ds-*`, Tailwind theme aliases them

**Decision**: `_tokens.scss` owns the canonical values as Sass maps, emits a single `:root { --ds-*: … }` block, and exposes mixins/functions. No component partial contains a raw hex/px value. `globals.css` `@theme inline` gains aliases (e.g. `--color-primary: var(--ds-color-primary-600)`, `--color-ink: var(--ds-color-text)`) so Tailwind utilities and `.ds-*` classes share values.

**Rationale**: CSS custom properties are the only mechanism that reaches Tailwind utilities, inline styles, and future JS consumers without duplication. SCSS-only variables never reach Tailwind. Aliasing creates a stable bridge for Phase 2 (`bg-primary`, `text-ink`, …) without visual change now.

**Alternatives rejected**: Tailwind-only tokens (no SCSS mixins, user asked for SCSS); SCSS variables only (invisible to Tailwind); CSS-only tokens (no maps/loops/mixins).

## Decision 3 — Visual direction: “Porcelain & Cobalt” (proposal for review)

**Decision**: Build on the existing identity rather than replace it: warm porcelain neutrals, ink text, cobalt primary (`#2563eb`/`#1d4ed8`, already the de-facto brand blue), a coral gifting accent (`#f4673f`), semantic success/warning/danger/info, Geist Sans/Mono typography, soft warm shadows, 4px spacing rhythm, 10/14px control/card radii, 44px minimum touch target.

**Rationale**: The audit shows the existing UI already uses blue-600 as primary, gray neutrals, green/red/orange semantics, Geist fonts (loaded but overridden by Arial), and `rounded-lg`/`xl`. Keeping the blue preserves recognition; warming the neutrals and adding a controlled coral accent creates a distinctive, gift-appropriate identity without a rebrand. The logo (black gift/checklist + GIFT LIST wordmark) stays unchanged.

**Alternatives rejected**: A completely new brand/palette (loses continuity and the existing logo); a cool-gray + blue-only system (safe but generic, no unique identity); introducing dark mode now (out of scope, existing dark variables are dead code).

## Decision 4 — Showcase isolation: preview-only route, no product chrome

**Decision**: Route `/design-system`. It renders only when `VERCEL_ENV !== 'production'`; on production it calls `notFound()`. Metadata is `noindex/nofollow`; it is not linked from `Header`. A tiny `AppChrome` client wrapper hides the product Header only on this route (existing pages keep it).

**Rationale**: The owner must review the design on a real Vercel preview without exposing a half-finished style guide on giftlist.fr. There is only one root layout; hiding the Header in a small client wrapper avoids moving all routes into route groups in Phase 1, which would be a larger structural refactor.

**Alternatives rejected**: Public production page (unwanted exposure); route group per layout (requires moving every page); CSS-only `:has()` hiding (leaves the Header in the accessibility tree and is brittle).

## Decision 5 — Password strength: extract, correct, and reuse

**Decision**: Move scoring out of `PasswordInput.tsx` into `packages/app/lib/passwordStrength.ts` (pure TypeScript, no CSS). Keep `getPasswordRules`/`validatePassword` untouched as the server-aligned source of truth. New output: `{ level: 0–4, label, tone, percent, rulesPassed }`, empty state neutral, non-empty weak shows a visible minimum fill, labels monotonic with the bar. `PasswordInput` consumes it (fixes the 0%-bar and `minLength` 6→8 defects; adds meter ARIA); the showcase uses the same function with `.ds-strength` tokens.

**Rationale**: The audit found the current meter derives from the same rules but compresses 5 rules into 4 levels (`floor(score*0.8)`), so the bar and label disagree at the low end, and a non-empty 0-rule password renders an empty bar. Reusing the rules preserves client/server agreement; fixing the presentation is the requested refinement. Keeping the shared module in `packages/app/lib` makes it available to future native UI without CSS.

**Alternatives rejected**: New scoring rules (would diverge from server validation); duplicating the fixes only in the showcase (two sources of truth); leaving defects in place (the owner explicitly wants the existing indicator reused and refined).

## Decision 6 — Accessibility baseline

**Decision**: Provide a `ds-focus-ring` mixin used by all interactive `.ds-*` components, 44px minimum touch targets, `prefers-reduced-motion` guard, no color-only semantics, real labels/`aria-describedby` in form specimens, `role="meter"`/`aria-live` for strength, and keyboard-operable demos. The showcase must be reviewable with keyboard only.

**Rationale**: The audit found 0 `focus-visible:` usages, 0 `aria-describedby`/`aria-live`/`aria-invalid`, and no reduced-motion handling. A design system is the right place to fix this once for Phase 2.

**Alternatives rejected**: Per-component ad-hoc focus styles (recreates the current duplication); relying on browser defaults (the current `outline-none` pattern suppresses them).

## Decision 7 — Shared/native boundary: no CSS in `packages/app`/Expo

**Decision**: All SCSS stays in `apps/next`. `packages/app` receives only the pure TS password-strength module. Native/Expo continues to use React Native `StyleSheet`; a JS token module for native is deferred to a later phase and documented as the one accepted future duplication cost.

**Rationale**: Metro/Expo cannot compile SCSS, and `StyleSheet` cannot consume CSS variables. The audit explicitly flags any CSS import in `packages/app` as a native regression.

**Alternatives rejected**: Generating a JS token module now (useful but out of Phase 1 scope); React Native Web-only styling in shared code (breaks native).

## Decision 8 — Verification evidence: real build + screenshots

**Decision**: Install with canonical Bun 1.4.4, add `sass`, build with `next@16.4.3`, run typecheck/lint/test and Expo export, then serve the production build locally and capture screenshots at 1440px and 375px with Puppeteer/Chrome for the owner's review. Also test the production guard via `VERCEL_ENV=production` build behavior or a production deployment.

**Rationale**: The audit's blocking finding is a stale local install (Next 15.5.2, unrelated `node_modules/app`, Bun 1.4.2). Build evidence is only trustworthy after `bun install --frozen-lockfile` under Bun 1.4.4. Screenshots let the owner review the visual identity without opening the preview, and satisfy the design-approval gate.

**Alternatives rejected**: Claiming success from static inspection (no CSS compile evidence); relying on Vercel preview only (slower feedback, SSO-protected).

## Open items resolved by this research

- SCSS feasibility: **yes**, as a separate layer; full Tailwind replacement: **no** in Phase 1.
- Showcase visibility: **preview/local only**, noindex, not in navigation.
- Password strength: **reuse rules, fix presentation**, shared TS module.
- Design direction: **Porcelain & Cobalt**, proposed for owner approval; nothing rolled out yet.
