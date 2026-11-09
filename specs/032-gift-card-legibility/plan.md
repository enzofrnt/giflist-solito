# Implementation Plan: Gift price & product-link legibility

**Spec**: `specs/032-gift-card-legibility/spec.md` · **Branch**: `032-gift-card-legibility`

## Technical context

- Web: Next.js 16 App Router, SCSS design system (`apps/next/src/styles/*`), shared `GiftCard` in `apps/next/src/components/GiftCard.tsx` used by `/list/[shareCode]` (public) and `/manage/[id]` (editor).
- Tokens: `--ds-color-text`, `--ds-text-lg`, `--ds-weight-bold` (theme-aware via `_tokens.scss`); component classes live in `_cards.scss` / `_buttons.scss` (`ds-btn--secondary`, md default min-height 2.75 rem).
- Native: `packages/app/ui/GiftCard.native.tsx` + `tokens.ts`.
- No API, Prisma, env or dependency change.

## Constitution check

- Design Charter: cobalt stays the single primary action; the product link is a neutral navigate action (`--secondary`, not cobalt) — compliant.
- Shared tokens/classes only, no page-local hex — compliant.
- UX brief + screen/action audit recorded in the spec — compliant.
- One primary action per view preserved; accessibility (44 px, focus ring, sr-only hint) preserved — compliant.

## Changes

1. `apps/next/src/styles/_cards.scss`: add `.ds-price` (ink, `--ds-text-lg`, bold, `font-variant-numeric: tabular-nums`, snug leading).
2. `apps/next/src/components/GiftCard.tsx`: price → `.ds-price`; product link → `ds-btn ds-btn--secondary` (md, `self-start`, min-h-11) keeping icon + sr-only hint.
3. `apps/next/src/app/design-system/sections/CardsSection.tsx`: “Fiche cadeau” uses `.ds-price` and the secondary link.
4. `packages/app/ui/GiftCard.native.tsx`: dedicated `price` style (ink, bold, body size) instead of muted `meta`.
5. `specs/032-gift-card-legibility/`: spec, plan, tasks, verification.

## Verification

- `bun run web:typecheck`, `bun run web:lint`; `bun run web:build` before merge.
- Screenshots 1440 / 390, light + dark (design-system “Fiche cadeau” composition, which renders the shared classes); public/editor use the same `GiftCard` and styles.
- Keyboard sweep on the link; contrast check of ink on surface.
- `bun run --cwd apps/expo export` smoke if native touched (price style only).
