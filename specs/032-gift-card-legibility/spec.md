# Feature Specification: Gift price & product-link legibility

**Branch**: `032-gift-card-legibility`

**Created**: 2026-11-09

**Status**: Draft

**Input**: User description: "Le prix est gris sur les listes de cadeaux publiques et en mode édition, vraiment pas très visible. Pareil pour le bouton « Voir le produit », trop petit et pas assez visible."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the price at a glance (Priority: P1)

A visitor of a public gift list (or the owner in the editor) scans a gift card and immediately reads its price, because the amount is a decision input.

**Why this priority**: The price is currently styled as a muted chip and reads like a grey tag; it is one of the two legibility complaints.

**Independent Test**: Open a public list and the editor; the price on each card is ink-coloured, bold and larger than body text.

**Acceptance Scenarios**:

1. **Given** a gift with a price, **When** the public card renders, **Then** the price uses the shared `.ds-price` treatment (ink, bold, `--ds-text-lg`, tabular numerals) with no chip border.
2. **Given** the same gift in the editor, **When** its card renders, **Then** the price has the identical treatment and no layout break.
3. **Given** dark mode, **When** the card renders, **Then** the price uses the light ink token and stays legible.

---

### User Story 2 - See "Voir le produit" (Priority: P1)

A visitor finds the external product link without hunting: it is a visible, tappable secondary action.

**Why this priority**: The ghost/small control is nearly invisible; the link is the path to the actual gift.

**Independent Test**: On public and editor cards, the link is a bordered secondary button at 44 px minimum height with a readable label.

**Acceptance Scenarios**:

1. **Given** a gift with a URL, **When** the card renders, **Then** the link is `ds-btn ds-btn--secondary` at md size with icon + label and the “(nouvel onglet)” screen-reader hint.
2. **Given** the card primary action, **When** both are visible, **Then** the primary remains dominant and the link does not use cobalt.
3. **Given** keyboard navigation, **When** focus reaches the link, **Then** the focus ring is visible and Enter opens the product in a new tab.

---

### User Story 3 - Parity in the design system and native (Priority: P2)

The design-system showcase documents the new price and link patterns, and the native card shows the same price hierarchy.

**Why this priority**: Prevent drift back to the muted chip and keep cross-client consistency.

**Independent Test**: `/design-system` shows `.ds-price` in the “Fiche cadeau” composition; native card price is ink and bold.

**Acceptance Scenarios**:

1. **Given** the showcase, **When** the card composition renders, **Then** it uses `.ds-price` and the secondary product link.

### Edge Cases

- Gift without price: no empty element or reserved space; the cluster only renders what exists.
- Gift without URL: no product link, no broken layout.
- Long price values and long titles: no overflow, no card-height jumps (cards stretch to the tallest).
- The `.ds-chip` class stays untouched for tags/counts so other screens are unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Add a shared `.ds-price` treatment to `src/styles/_cards.scss`: `--ds-color-text`, `--ds-text-lg`, `--ds-weight-bold`, tabular numerals, snug leading; tokens only (no hex/px).
- **FR-002**: Web `GiftCard` renders the price with `.ds-price` (no chip border/background), copy unchanged (`123 €`).
- **FR-003**: The product link becomes `ds-btn ds-btn--secondary` at default md size (min 2.75 rem, 13 px label) with the existing icon and `sr-only` hint.
- **FR-004**: Public list and editor get the fix through the shared `GiftCard`; the card primary action is unchanged.
- **FR-005**: Native `GiftCard` gives the price the same hierarchy (ink colour, bold, one step above body).
- **FR-006**: The design-system showcase “Fiche cadeau” documents `.ds-price` and the secondary link.
- **FR-007**: No behaviour, API, data or copy change; no new dependency.

### UX brief

- **Job**: read the price → decide → open the product page.
- **Primary action per view**: unchanged (reserve publicly, edit/manage in the editor); “Voir le produit” is a neutral navigate action, so neutral bordered is correct.
- **Hierarchy**: media → title → **price (ink, bold)** → status badge → description → product link → primary action.
- **Scope**: web public list + editor; native price parity. **Non-goals**: layout redesign, currency formatting, native product link.

### Screen / action audit

| Screen | Actions today | Issue | Change |
|---|---|---|---|
| Public list card | Réserver (primary), Voir le produit (ghost 12 px) | Link nearly invisible; price looks like a grey tag | Price → `.ds-price`; link → secondary md |
| Editor card | Modifier, Annuler, Supprimer | Same grey price; weak link | Shared `GiftCard` fix |
| Showcase “Fiche cadeau” | Illustration only | Documents outdated pattern | `.ds-price` + secondary link |

## Success Criteria *(mandatory)*

- **SC-001**: At 1440 / 390 px, light and dark, the price is the second most prominent element after the title and is clearly not grey.
- **SC-002**: “Voir le produit” has a visible border, ≥ 44 px height and stays visually below the primary action.
- **SC-003**: `bun run web:typecheck`, `web:lint`, `web:build` pass; screenshots attached to the PR.

## Assumptions

- The price remains the raw stored number with `€` (no locale/currency refactor in this feature).
- Only the gift card is restyled; list cards, badges, chips and the rest of the design system are unchanged.
- Native receives price parity only; adding a product link to native is out of scope.
