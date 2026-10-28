---
name: "ui-ux-design"
description: "Audit and design Giftlist UI/UX: information architecture, hierarchy, navigation, affordances, friction, feedback, accessibility and responsive behavior, using the approved Porcelain & Cobalt design system."
metadata:
  author: "giftlist"
  source: "docs/design-system/README.md"
---

# Giftlist UI/UX Design Skill

Use this skill for **any UI/UX change** — not only visual styling. Applying the design system without fixing the user journey is not a redesign.

## When to use

- A screen "looks fine" but the flow, hierarchy or action priority is weak.
- Navigation, header, menus, dialogs, empty states, loading, errors, forms or mobile behavior change.
- A visual redesign or "apply the design system" request.
- A UX critique or audit request.

## Non-negotiables

1. **Start from the user job, not the component.** State the job in one sentence and the success moment.
2. **One primary action per view.** Secondary/destructive actions go into a menu or a clearly lower-emphasis treatment.
3. **Do not decorate a weak flow.** No new colour, gradient, card or band should compensate for unclear hierarchy.
4. **No behaviour change without a spec.** Use Spec Kit for every feature; for a UX pass, audit first and list the changes.
5. **Use the approved charter.** Tokens and components come from `docs/design-system/` and `.specify/memory/constitution.md`.
6. **Accessibility is part of UX.** Labels, focus, keyboard, dialogs, contrast, reduced motion, touch targets.
7. **Mobile is not a squeezed desktop.** Re-flow content, reduce actions, use a compact menu.

## Giftlist UX rules

### Header and navigation
- Brand: **the real Giftlist logo** on the left. Do not replace it with a monogram or a letter.
- Desktop: logo + primary navigation grouped on the left; account actions on the right. **Do not centre the nav** in the viewport.
- Account: avatar/name opens a **compact dropdown** containing profile, lists and logout. Logout is never a separate top-level button.
- Mobile: compact right-side drawer (≤ 20 rem) or a short sheet; not a full-width white page that hides the product. Header stays visible; X/Escape/overlay close.
- Current page is marked (`aria-current="page"`); focus is visible.

### Pages and actions
- One `h1` + one short subtitle; one primary action aligned with the page goal.
- Secondary and destructive actions go into a **kebab/overflow menu**, not three equal large buttons on every card.
- Delete is danger, confirmed, and never the most prominent action.
- Empty state: explain what is missing and offer exactly one clear action.
- Loading: stable layout, one spinner/skeleton, no layout jump.
- Errors: what happened + what to do next; no raw technical text.

### Lists and cards
- Card = title, one or two useful metadata lines, one clear primary action.
- Do not repeat the same large button row on every card; use one primary action and an overflow menu.
- Images: compact thumbnails for management; meaningful imagery for public gift cards. A missing image should not create a huge empty white area.
- Counts/status badges should help scanning; not every field needs a badge.

### Public list
- The **list and its gifts are the hero**, not the Giftlist brand. Do not put a large logo illustration above a public list.
- Show list title, owner-safe metadata and gift count immediately.
- Reservation is the primary action on an available gift; cancel is visible but secondary.
- No account required; the flow must remain obvious without login.

### Forms and dialogs
- Real labels, hints and inline errors; never placeholder-only.
- Primary submit at the end of the flow; cancel clearly secondary.
- Dialogs: role/aria, labelled title, Escape, focus trap/restore, body scroll lock, one primary action.
- Avoid opening a dialog for a two-field action that fits inline; avoid inline forms for long multi-step flows.

### Home and marketing
- Lead with the job and the outcome, then proof/how-it-works, then one CTA.
- Do not place a large contrasting black band in the middle of a calm page just to hold a CTA; integrate it or remove it.
- Three steps (“Créez / Partagez / Réservez”) are more useful than three generic feature cards.
- Repeat the primary CTA at most twice, with a clear hierarchy.

### Profile and account
- Group by user goal: identity, security, passkeys, sessions.
- Destructive actions (logout) belong in the account menu or a clearly separated session section, not as a red primary button in a sidebar card.
- Show success/error next to the affected section.

## Process

### 1. UX brief (before code)
Write: user job, primary action, success signal, key friction, scope, non-goals. Add it to the feature spec.

### 2. Screen audit
For each screen list: purpose, primary action, secondary actions, hierarchy issues, missing feedback, mobile risks, accessibility risks, copy issues. Use Nielsen’s heuristics:
visibility of status, match to real world, user control, consistency, error prevention, recognition over recall, flexibility, minimalist design, error recovery, help.

### 3. Action inventory
Count the actions per screen/card. If more than one equally weighted action exists, choose one primary and move the rest into a menu or lower-emphasis group. Destructive actions are never equal to the primary.

### 4. Flow and state design
Map happy path + empty + loading + error + success + disabled. Design the transitions (inline vs dialog, menu vs page) before implementation. Keep copy short and action-oriented.

### 5. Map to the design system
Use `.ds-page`, `.ds-page-header`, `.ds-card`, `.ds-btn` (one primary), `.ds-badge`, `.ds-alert`, `.ds-field`, `Modal`, etc. Do not invent local visual recipes. If the system lacks a pattern, propose a shared class/component, not a one-off.

### 6. Verify
- Desktop/tablet/mobile screenshots at 1440/768/390.
- Keyboard sweep; focus visible; menus/dialogs close with Escape; focus restored.
- Loading/empty/error states exercised.
- Copy checked in French, no dead ends.
- Existing flows and API behaviour unchanged.

## Anti-patterns (do not ship)

- Monogram/letter instead of the approved logo.
- Centred primary navigation.
- Logout as a separate header button next to the avatar.
- Full-width mobile menu covering the product.
- Three equal large buttons on every card.
- Big black CTA band with no structural role.
- Giant brand logo as the hero of a public list.
- Huge blank image areas when an image is missing.
- Placeholder-only labels, colour-only status, invisible focus.
- Restyling first and discovering the flow problems afterwards.

## Output format for an audit

1. Screen + user job.
2. What works (keep it).
3. Prioritised issues (P1 blocks the job, P2 friction, P3 polish) with evidence.
4. Proposed flow/hierarchy change.
5. Design-system mapping.
6. Acceptance checks / screenshots.

## Spec Kit links

- Constitution + Design Charter: `.specify/memory/constitution.md`.
- Visual system: `docs/design-system/README.md` and `docs/design-system/screenshots/`.
- Phase 1 baseline/contract: `specs/002-ui-design-system/`.
- Feature specs: `specs/NNN-.../spec.md`.
