# Phase 0 Research — Application-wide UI Harmonization

**Feature**: `003-ui-harmonization` · **Date**: 2026-10-28
**Inputs**: Phase 1 audit ([docs/design-system/ui-audit.md](../../docs/design-system/ui-audit.md)), Phase 1 design system, approved showcase.

## Decision 1 — Keep Tailwind for layout, use `.ds-*` for visual primitives

**Decision**: Page refactors keep responsive Tailwind layout utilities (flex/grid/width/spacing where appropriate) but replace colors, buttons, inputs, cards, badges, alerts and modals with `.ds-*` classes or shared components.

**Rationale**: 820 existing utility usages encode layout behavior that works; rewriting every utility to SCSS would be a large, regression-prone change with little visual benefit. The design system owns the visual language; layout remains compositional.

**Alternative rejected**: full SCSS rewrite of every page in one pass (high risk, delays consistency, violates the "preserve behavior" constraint).

## Decision 2 — Web-only Header

**Decision**: create `apps/next/src/components/Header.tsx` with the design system and point `AppChrome` to it. Leave `packages/app/components/Header.tsx` untouched for native.

**Rationale**: The shared Header is RN `StyleSheet` and renders on Expo; CSS cannot reach it and importing CSS in `packages/app` would break Metro. A web-only header is the clean boundary.

**Alternative rejected**: convert shared Header to Tailwind + `@source` (would still not serve native, and couples web utilities to shared code).

## Decision 3 — Web-only home page

**Decision**: `apps/next/src/app/page.tsx` renders a new `apps/next/src/components/home/HomePage.tsx`; the shared Solito home remains the native home.

**Rationale**: The shared home uses RN StyleSheet and is consumed by Expo. The web marketing page needs the approved brand/hero language and SEO-safe markup.

## Decision 4 — Shared accessible Modal

**Decision**: add `apps/next/src/components/Modal.tsx` with portal, `role="dialog"`, `aria-modal`, labelled title, Escape, focus trap/restore and body scroll lock; refactor existing dialogs to it where feasible, keeping their public APIs.

**Rationale**: Six hand-rolled dialogs currently lack dialog semantics/focus handling. A single component removes duplication and fixes accessibility once.

## Decision 5 — Shared auth shell

**Decision**: add `AuthCard` and rewrite auth/recovery/passkey screens around it; keep each page's state, fetch and redirect logic intact.

**Rationale**: Four auth layouts had different spacing/logo/error treatments. A single shell guarantees consistency and reduces repeated markup.

## Decision 6 — Select/dropdown fix

**Decision**: `.ds-select` uses `appearance: none` + a token-based CSS chevron in `.ds-select-wrap` (no image, no raw hex). This is the approved refinement from the Phase 1 review.

**Rationale**: The native arrow looked inconsistent; a CSS chevron matches stroke/border tokens and works across browsers.

## Decision 7 — Admin visual-only

**Decision**: restyle `admin/page.tsx` with the same components but do not change its gate/API behavior.

**Rationale**: The page has known security gaps tracked in the Phase 1 baseline; fixing them is a separate security feature. This feature must not silently change behavior.

## Decision 8 — Validation approach

**Decision**: run the full canonical gates plus per-page route smoke, responsive screenshots (1440/768/390), keyboard/focus checks and design-system guard. Capture before/after evidence for every page group.

**Rationale**: No UI E2E suite exists; visual evidence plus preserved behavior checks is the reliable acceptance path.
