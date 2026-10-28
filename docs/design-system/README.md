# Giftlist Design System — Phase 1

**Status**: proposal for review. The showcase is the source of truth for the visual identity; application-wide rollout (Phase 2) starts only after explicit approval.

- **Review page**: `/design-system` (local and Vercel preview; `404` on production, `noindex`)
- **Feature artifacts**: [`specs/002-ui-design-system/`](../../specs/002-ui-design-system/spec.md)
- **UI audit (evidence base)**: [ui-audit.md](ui-audit.md)
- **Screenshots**: [screenshots/](screenshots/)
- **Guardrails**: [`scripts/design-system-guard.sh`](../../scripts/design-system-guard.sh)

## Aperçu

![Hero Porcelain & Cobalt](screenshots/sections/hero.jpg)

![Palette](screenshots/sections/palette.jpg)

![Mot de passe](screenshots/sections/password.jpg)

## Direction — “Porcelain & Cobalt”

Giftlist keeps its logo, its cobalt blue and its French voice, but gains a warmer, more confident system:

- **Warm neutrals**: porcelain canvas `#faf9f7`, ink `#1b1917`, sand borders. Less “admin dashboard”, more “paper invitation”.
- **Cobalt primary** `#2563eb`: the same action color as today, formalised as `--ds-color-primary`.
- **Coral accent** `#f4673f`: celebration only (hero, gifting moments, illustrations). Never an error, never a destructive action.
- **Geist Sans / Geist Mono**: already loaded by the app, now actually used instead of Arial.
- **Soft warm shadows**, 10–14 px control/card radii, 4 px spacing rhythm, 44 px touch targets.

Full palette, type scale, spacing, radii and shadows are visible on the showcase, and defined once in [`apps/next/src/styles/_tokens.scss`](../../apps/next/src/styles/_tokens.scss).

## Architecture — Tailwind + Sass, one source of truth

```
apps/next/src/app/globals.css      Tailwind v4 entry (preflight + utilities) + @theme aliases
apps/next/src/styles/index.scss    Sass design-system entry (imported in app/layout.tsx)
├── _tokens.scss                   Sass maps -> :root { --ds-* } (single source of truth)
├── _mixins.scss                   focus-ring, breakpoints, elevation, reduced motion
├── _typography.scss               .ds-display/.ds-h1..4/.ds-body/.ds-label/.ds-mono
├── _buttons.scss                  .ds-btn + variants/sizes/states/loading
├── _forms.scss                    .ds-field/.ds-input/.ds-select/.ds-checkbox/.ds-switch
├── _feedback.scss                 .ds-alert + empty/skeleton
├── _cards.scss                    .ds-card/.ds-badge/.ds-chip/.ds-avatar/.ds-container
├── _strength.scss                 .ds-strength meter
└── _showcase.scss                 review-page layout only (not for product pages)
```

Why two layers:

- Tailwind v4 explicitly does not support CSS preprocessors, and the existing app has 820 Tailwind class usages. Moving `@import "tailwindcss"` into SCSS is unsupported and fragile.
- Sass is first-class in Next.js once `sass` is installed. The design system is therefore authored in SCSS, namespaced `ds-`, and does not change existing pages in Phase 1.
- Tokens are Sass maps that emit CSS custom properties. `globals.css` aliases them into Tailwind (`--color-primary: var(--ds-color-primary)`), so `.ds-*` classes and future `bg-primary` utilities read the same value.
- `@use` only (Dart Sass `@import` is deprecated and removed in 3.0). No `@apply` in SCSS.

## Component contract

The full contract is [`specs/002-ui-design-system/contracts/design-system-classes.md`](../../specs/002-ui-design-system/contracts/design-system-classes.md). Summary:

| Area | Classes |
|------|---------|
| Buttons | `.ds-btn` + `--primary/--secondary/--ghost/--danger/--accent`, `--sm/--md/--lg`, `--block`, `--icon`, `--loading` |
| Forms | `.ds-field`, `.ds-label`, `.ds-input`, `.ds-textarea`, `.ds-select`, `.ds-hint`, `.ds-error`, `.ds-check`, `.ds-switch` |
| Feedback | `.ds-alert` + `--info/--success/--warning/--danger`, `.ds-empty`, `.ds-skeleton` |
| Surfaces | `.ds-card` (+ header/body/footer, `--interactive`), `.ds-badge` (tones + dot), `.ds-chip`, `.ds-avatar`, `.ds-divider` |
| Layout | `.ds-container`, `.ds-section`, `.ds-stack`, `.ds-cluster`, `.ds-grid` |
| Password | `.ds-strength`, `.ds-strength__track/fill/label/rules` |

Rules:

- Use tokens (`var(--ds-*)`) or mixins, never raw hex/px in component partials.
- Component rules live in `@layer components`; Tailwind utilities can still override intentionally.
- Every interactive component shows a visible `:focus-visible` ring (2 px + 2 px offset).
- All controls meet 44 px minimum touch targets; reduced motion disables non-essential animation.
- No colour-only semantics: icon + text for alerts and badges.

## Usage in Phase 2

1. Replace page-local Tailwind strings with `.ds-*` components and tokens, starting with the highest-traffic screens (auth, dashboard, public list).
2. Remove duplicated button/input/modal recipes; reuse `.ds-btn`, `.ds-field`, `.ds-card`, `.ds-alert`.
3. Keep only layout utilities from Tailwind initially; if a page needs a new visual value, add a token instead of a raw value.
4. Every refactor PR links its spec and lists the pages/components changed; screenshots before/after are the acceptance evidence.
5. Do not introduce page-specific SCSS in `_showcase.scss`; it exists only for the review page.

## Accessibility baseline

- Focus visible everywhere, keyboard order logical, Escape closes overlays.
- `aria-describedby` + `aria-invalid` on invalid fields; `role="alert"`/`role="status"` on feedback.
- Password strength: `role="meter"`, `aria-valuenow`, `aria-valuetext`, `aria-live` on the label.
- Contrast: body/muted text ≥ 4.5:1, large text ≥ 3:1, control borders ≥ 3:1.
- `prefers-reduced-motion` respects user preference (spinners become static, no shimmer).
- `:focus-visible` is never removed; the global mixin is the only focus style.

## Review and approval gate

1. Open `/design-system` on a Vercel preview (SSO) or locally.
2. Review every section, especially palette, typography, buttons, forms, feedback and password strength.
3. Approve, reject, or list changes in the feature directory. Phase 2 must not start before an explicit decision.

## Local commands

```bash
bun install --frozen-lockfile
bun run web:dev            # http://localhost:3000/design-system
bun run web:typecheck
bun run web:lint
bun run web:build
bun run test
bun run --cwd apps/expo export
./scripts/design-system-guard.sh
```

The showcase does not call the API or the database. `VERCEL_ENV=production` returns `404` for `/design-system`; preview/local renders it.

## Maintenance

- `sass` is a devDependency of `apps/next`; `next.config.ts` exposes `src/styles` via `sassOptions.includePaths`.
- Tokens are the only place to change a colour, radius, shadow or type step. Update the showcase data (`showcase-data.ts`) only for documentation labels/hex, never to override a component.
- The password rules stay in `packages/app/lib/passwordValidation.ts`; scoring is in `packages/app/lib/passwordStrength.ts` and is covered by `apps/next/tests/password-strength.test.ts`.
- Phase 1 deliberately leaves `body { font-family: Arial }` and existing page classes untouched; switching the global body font is a Phase 2 change.
- Updating Spec Kit: see [`docs/spec-kit/README.md`](../spec-kit/README.md) and re-run the Claude skill link sync if needed.
