# Feature Specification: Application-wide UI Harmonization (Phase 2)

**Feature Branch**: `003-ui-harmonization`

**Created**: 2026-10-28

**Status**: Approved direction — implementation

**Input**: Apply the approved “Porcelain & Cobalt” design system to every Giftlist web page, layout, and component; replace duplicated or inconsistent styling with shared tokens/components; preserve all existing functionality, data flows, and the native app.

**Design source of truth**: [design-system README](../../docs/design-system/README.md), [showcase](/design-system), [Phase 1 spec](../002-ui-design-system/spec.md).

**Scope**: Web (`apps/next`) only. Shared/native code in `packages/app` must keep working; web-specific variants are allowed. No database, API, or business-logic changes. The select/dropdown refinement approved after the showcase is part of this baseline.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A coherent shell and navigation (Priority: P1)

A visitor or signed-in user moves through Giftlist and sees the same brand, header, page frame, spacing, and feedback everywhere.

**Why this priority**: The shell is present on every screen; it sets the perceived consistency.

**Independent Test**: Open the home page, an auth page, the dashboard, a public list, and the profile; the header, page frame, footer/background, and typography follow the design system and the navigation works.

**Acceptance Scenarios**:

1. **Given** any page, **When** it loads, **Then** the canvas, typography, header, and container widths match the design system.
2. **Given** a signed-in user, **When** they use the header, **Then** navigation, account menu, and logout remain functional and keyboard accessible.
3. **Given** a signed-out visitor, **When** they open a public list, **Then** the header remains usable and the list content is the focus.
4. **Given** a mobile viewport, **When** the menu opens, **Then** it is styled consistently, dismissible with Escape, and does not trap focus.

### User Story 2 - Consistent authentication (Priority: P1)

A user registers, signs in, recovers a password, resets it, or enrolls a passkey through screens that look and behave as one system.

**Why this priority**: Auth is the first impression and a high-trust flow; inconsistencies here feel broken.

**Independent Test**: Complete every auth flow at desktop and mobile widths; compare controls, alerts, buttons, and spacing.

**Acceptance Scenarios**:

1. **Given** the login, register, forgot-password, reset-password, or setup-passkey page, **When** it renders, **Then** it uses the shared auth layout, fields, buttons, and alerts.
2. **Given** invalid input or a server error, **When** feedback appears, **Then** it uses the shared alert/error component and remains accessible.
3. **Given** the password strength indicator, **When** the user types, **Then** it keeps the approved behavior from Phase 1 and follows the new visuals.
4. **Given** a passkey prompt/setup, **When** it is displayed, **Then** it follows the same card and button language.

### User Story 3 - Dashboard and list management (Priority: P1)

A signed-in user manages their lists on a dashboard that uses the approved cards, buttons, empty states, badges, and dialogs.

**Why this priority**: It is the primary signed-in workspace.

**Independent Test**: Create, edit, delete, share, and reveal a list; verify dialogs, cards, empty state, and mobile layout.

**Acceptance Scenarios**:

1. **Given** the dashboard, **When** lists are displayed, **Then** each uses the shared card/badge/toolbar language.
2. **Given** no lists, **When** the dashboard renders, **Then** the shared empty state offers a clear primary action.
3. **Given** create/edit/delete actions, **When** dialogs open, **Then** they use the shared modal/alert language and remain keyboard accessible.
4. **Given** a list tile, **When** the user shares or reveals it, **Then** the action works and feedback uses the shared alerts.

### User Story 4 - Gift management in a list (Priority: P1)

A list owner adds, edits, deletes, and manages gifts with consistent forms, cards, status badges, scraped prefill, and reservation controls.

**Why this priority**: It is the core data-entry and owner workflow.

**Independent Test**: Add a manual gift and a scraped gift, edit, change status, reveal secret mode, cancel a reservation, and delete.

**Acceptance Scenarios**:

1. **Given** the manage page, **When** gifts are listed, **Then** each uses the shared gift card, badge, and action styles.
2. **Given** the add/edit gift dialog, **When** it opens, **Then** fields, buttons, errors, and the scraping state follow the system.
3. **Given** a reservation, **When** the owner cancels/unreserves, **Then** the action and confirmation follow the shared feedback language.
4. **Given** secret mode, **When** toggled/revealed, **Then** the visual state is clear and consistent.

### User Story 5 - Public sharing and reservation (Priority: P1)

A visitor opens a shared list, understands it immediately, and reserves or cancels a gift through a polished, accessible public experience.

**Why this priority**: It is the main external, unauthenticated experience.

**Independent Test**: Open a public list signed out, reserve a gift, cancel it, use the QR/share view, and test mobile.

**Acceptance Scenarios**:

1. **Given** a public list, **When** it renders, **Then** it uses the shared hero/card/badge/button system and remains readable without auth.
2. **Given** an available gift, **When** the visitor reserves it, **Then** the reservation dialog is clear and the feedback uses shared alerts.
3. **Given** a reserved gift, **When** it is cancelled, **Then** the state is updated and visually distinct.
4. **Given** the QR/share view, **When** it opens, **Then** it follows the same modal/button language.

### User Story 6 - Profile, security, and account (Priority: P2)

A user manages their profile, password, and passkeys in a consistent settings-style page.

**Why this priority**: High-trust security surfaces benefit most from clear hierarchy and consistent controls.

**Independent Test**: Update the name, change the password, add/remove a passkey, and verify feedback.

**Acceptance Scenarios**:

1. **Given** the profile, **When** it renders, **Then** account sections use shared cards, fields, buttons, and alerts.
2. **Given** a password change or passkey action, **When** it completes, **Then** feedback is consistent and accessible.
3. **Given** a mobile viewport, **When** the user edits the profile, **Then** controls remain usable and readable.

### User Story 7 - Internal admin surface (Priority: P3)

The internal admin screen follows the same visual system while keeping its existing behavior.

**Independent Test**: Open `/admin` and use its list/gift controls; verify styling and no functional regression.

**Acceptance Scenarios**:

1. **Given** the admin page, **When** it renders, **Then** it uses the shared frame, forms, tables/cards, alerts, and buttons.
2. **Given** admin actions, **When** performed, **Then** existing behavior is preserved (security gaps are tracked separately, not fixed by styling).

### User Story 8 - Responsive and accessible everywhere (Priority: P1)

Every screen works at desktop, tablet, and mobile widths and with keyboard/assistive technology.

**Independent Test**: Sweep 1440/768/390 on every page; keyboard-navigate the main flows; check focus, labels, alerts, dialogs, and reduced motion.

**Acceptance Scenarios**:

1. **Given** any page at 390 px, **When** it renders, **Then** there is no horizontal overflow and all primary actions are reachable.
2. **Given** keyboard navigation, **When** tabbing, **Then** focus is always visible and logical; dialogs trap focus and restore it.
3. **Given** a dialog, **When** it opens, **Then** it has `role="dialog"`, `aria-modal`, a title association, Escape handling, and focus management.
4. **Given** reduced motion, **When** animations run, **Then** non-essential motion is suppressed.

### User Story 9 - Maintainable styling architecture (Priority: P2)

A developer can change a visual decision once and see it applied consistently.

**Independent Test**: Search for duplicated button/input/modal recipes; verify pages compose shared classes/components and tokens.

**Acceptance Scenarios**:

1. **Given** a page refactor, **When** it needs a button/field/card/alert/badge, **Then** it uses the shared class or component, not a new recipe.
2. **Given** a visual change, **When** a token or component class changes, **Then** all pages reflect it without per-page edits.
3. **Given** the styling guard, **When** run, **Then** it passes (no new raw hex in components, no CSS in shared/native, Tailwind entry intact).
4. **Given** the diff, **When** reviewed, **Then** there are no leftover debug styles or page-specific visual exceptions without justification.

### Edge Cases

- Very long list/gift titles, emails, URLs, or prices must wrap/truncate consistently.
- Empty dashboard/list, loading, error, disabled, and reservation-conflict states must use the shared treatments.
- Secret-mode list: public and owner views must keep their behavior while using the new visual states.
- Scraping slow/failed: feedback must remain clear and not break the dialog layout.
- Modal stacking (alert over form dialog) must preserve focus and Escape behavior.
- Mobile safe areas and sticky headers must not overlap content or actions.
- Existing localStorage auth/session behavior must keep working; passkeys and password reset are untouched.
- Reduced-motion, forced-colors/high-contrast, and keyboard-only users must retain all information.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every web page MUST use the shared page frame (canvas, container, header/shell, typography hierarchy) from the design system.
- **FR-002**: The web header MUST be rebuilt with the design system while preserving navigation, auth state, mobile menu, and logout behavior; the native header must keep working.
- **FR-003**: The home page MUST present the product with the approved brand/hero language and a clear path to sign in/register, preserving current routing behavior.
- **FR-004**: All auth screens MUST use the shared auth layout, fields, buttons, alerts, and password-strength component.
- **FR-005**: The dashboard MUST use shared cards, badges, toolbars, empty states, and modals; list CRUD and sharing behavior must be preserved.
- **FR-006**: The manage page MUST use shared gift cards, forms, status badges, and dialogs; gift CRUD, scraping, secret mode, and reservation controls must be preserved.
- **FR-007**: The public list and reservation flow MUST use the shared public layout, cards, badges, dialogs, and feedback; unauthenticated access and reservation behavior must be preserved.
- **FR-008**: The profile page MUST use shared cards/fields/buttons for account, password, and passkey management.
- **FR-009**: The admin page MUST use the shared frame and components without changing its behavior.
- **FR-010**: All buttons, inputs, selects, textareas, checkboxes, switches, badges, alerts, cards, and modals MUST use the shared `.ds-*` classes or shared components.
- **FR-011**: The select control MUST use the approved token-based custom chevron (`.ds-select-wrap`), not the native appearance.
- **FR-012**: Modals MUST be accessible (`role="dialog"`, `aria-modal`, labelled title, focus trap, Escape, focus restore) and visually consistent.
- **FR-013**: Feedback (success/error/warning/info) MUST use the shared alert/modal language and remain accessible.
- **FR-014**: Typography, colors, spacing, radii, borders, shadows, and interactive states MUST resolve to design-system tokens; no new raw hex in application components.
- **FR-015**: Duplicated visual recipes (buttons, inputs, cards, modals, badges) MUST be replaced by shared implementations; page-specific CSS is allowed only for genuine layout needs and must be justified.
- **FR-016**: Every page MUST be responsive at 375/768/1440 with no horizontal overflow and usable touch targets.
- **FR-017**: Keyboard focus MUST be visible everywhere; dialogs must trap/restore focus; alerts must use appropriate live-region semantics.
- **FR-018**: `prefers-reduced-motion` MUST be respected for non-essential animations.
- **FR-019**: Existing functionality MUST remain intact: auth, list/gift CRUD, sharing/QR, reservations, scraping, secret mode, profile/passkeys, admin.
- **FR-020**: The native/Expo app MUST continue to build and run; no CSS/SCSS may be imported into `packages/app` or `apps/expo`.
- **FR-021**: The web build, typecheck, lint, existing tests, and the design-system guard MUST pass.
- **FR-022**: The approved showcase MUST remain the reference; visual deviations require an explicit note in the PR.
- **FR-023**: The implementation MUST include before/after evidence (screenshots or route walkthrough) for every page group.

### Key Entities

- **Page group**: auth, home/shell, dashboard, manage, public list, profile, admin.
- **Shared component**: design-system-backed button, field, select, alert, card, badge, modal, empty state, header.
- **Token**: the single named visual value used by all components.
- **Visual regression check**: the per-page acceptance evidence captured at desktop/mobile.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of web pages listed in FR-001–FR-009 use the shared frame and shared components for all visual primitives.
- **SC-002**: A repository search finds no repeated long button/input/modal class recipes outside the shared design-system components (target: 0 new duplicates).
- **SC-003**: No application component contains a raw hex color; all color usage resolves to `--ds-*` tokens or Tailwind theme aliases.
- **SC-004**: All primary flows pass at 375/768/1440 with no horizontal overflow; 100% of interactive controls have a visible focus state.
- **SC-005**: Dialogs meet the accessibility checklist (role, aria-modal, labelled title, focus trap, Escape, restore) — 100% of the six existing modal surfaces.
- **SC-006**: The full gate passes: typecheck, lint (0 errors), tests, web build, Expo export, design-system guard.
- **SC-007**: The diff contains no unintended behavior changes; existing routes and main user flows are smoke-tested and reported.
- **SC-008**: Before/after screenshots exist for every page group and are attached to the PR.

## Assumptions

- The approved Phase 1 direction (Porcelain & Cobalt, Geist, tokens, `.ds-*` classes) is final; only the select/dropdown refinement was requested after review.
- Phase 2 is web-only. Native screens are not redesigned; web-specific variants are allowed in `apps/next` or `.web` files.
- Existing business logic, API contracts, DB schema, auth rules, and route behavior are out of scope and must not change.
- The admin page’s known security gaps remain tracked in the Phase 1 baseline; this feature does not fix them.
- The design system may gain new shared classes/components (page shell, modal, list, auth layout) as long as they use tokens and are documented.
- Existing tests are the regression baseline; UI refactors add smoke/visual evidence rather than a new E2E suite.
- The showcase remains available in preview/local and is updated if a shared component changes.
