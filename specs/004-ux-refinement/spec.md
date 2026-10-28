# Feature Specification: UX Refinement & Navigation/Account Rework

**Feature Branch**: `004-ux-refinement`

**Created**: 2026-10-28

**Status**: Approved UX direction — implementation

**Input**: The owner approves the visual identity but finds the UX weak: logo replaced by a monogram, centred navigation, logout outside the account menu, full-width mobile menu, a large black CTA band on the home page, and action clutter. Apply the new `ui-ux-design` skill and Design Charter to fix the flows, not just the colours.

## UX Brief

- **User job (signed-out)**: understand Giftlist in seconds, create a list or open a shared list.
- **User job (signed-in)**: reach my lists, manage one list, share it, and get back to my account quickly.
- **Primary action per view**: home → start/see lists; dashboard → create a list; manage → add a gift; public list → reserve a gift; profile → update the section I came for.
- **Success signal**: the next action is obvious without reading every button, and no navigation/action competes with it.
- **Key friction to remove**: brand/navigation ambiguity in the header, logout in the header, oversized menus, too many equal card actions, a decorative black band, and brand-first public-list hero.
- **Non-goals**: new features, backend/API changes, native redesign, auth logic changes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A confident, familiar header (Priority: P1)

A visitor or signed-in user always recognises Giftlist, knows where they are, and finds account actions in one predictable place.

**Why this priority**: The header sets the perceived quality on every screen.

**Independent Test**: Inspect the header signed in/out at desktop and mobile; use nav, account menu, and mobile menu with keyboard.

**Acceptance Scenarios**:

1. **Given** any page, **When** the header renders, **Then** the real Giftlist logo is at the left and the primary nav is grouped with it, not centred.
2. **Given** a signed-in desktop user, **When** they click the avatar/name, **Then** a compact account menu opens with **Mon profil** and **Se déconnecter** only; “Mes listes” stays in the primary nav. There is no separate logout button.
3. **Given** the account menu, **When** the user tabs/clicks outside/presses Escape, **Then** it closes and focus returns to the trigger.
4. **Given** a mobile signed-in viewport, **When** the user opens the avatar menu, **Then** it contains Mes listes (nav is hidden), Mon profil and Se déconnecter; there is **no burger** and no duplicated menu.
5. **Given** any short menu, **When** it opens, **Then** it is an anchored popover with no app-wide dim overlay, no body scroll lock and no page shift.

### User Story 2 - A home page that explains and converts (Priority: P1)

A visitor understands the value, sees how it works, and has one clear path to start.

**Independent Test**: Open the home page signed out and signed in; check the primary CTA, steps, and absence of competing bands.

**Acceptance Scenarios**:

1. **Given** the home page, **When** it renders, **Then** the hero states the outcome and offers one primary action (start/see lists), with sign-in as a secondary action.
2. **Given** the home page, **When** the user scrolls, **Then** a “how it works” 3-step section explains create/share/reserve; the black CTA band is gone.
3. **Given** a signed-in user, **When** they return home, **Then** the primary CTA goes to their lists.
4. **Given** a mobile viewport, **When** the page is read, **Then** the order remains outcome → how it works → CTA, with no oversized decorative block.

### User Story 3 - Cards with a clear action hierarchy (Priority: P1)

A signed-in user scans lists and gifts and sees one obvious next action per item, with edit/delete available but not competing.

**Independent Test**: Dashboard/manage cards at desktop/mobile; verify one primary action and an overflow menu for secondary/destructive actions.

**Acceptance Scenarios**:

1. **Given** a list card, **When** it renders, **Then** it shows one primary action (“Gérer”) and a compact overflow menu for edit/delete.
2. **Given** a gift card, **When** it renders, **Then** the primary action is the next step (edit/manage/reserve depending on context) and destructive actions are lower-emphasis/confirmed.
3. **Given** an overflow menu, **When** opened, **Then** it is keyboard accessible, closes on Escape/outside click, and delete is a danger item.
4. **Given** a card without an image, **When** it renders, **Then** the image area is compact/tinted rather than a large empty white block.

### User Story 4 - List-first public sharing (Priority: P2)

A visitor opening a shared list focuses on the list and gifts, not on Giftlist branding.

**Independent Test**: Open a public list signed out at desktop/mobile; check the hero and gift cards.

**Acceptance Scenarios**:

1. **Given** a public list, **When** it renders, **Then** the list title and owner-safe metadata are the hero; no large Giftlist logo illustration dominates the page.
2. **Given** a missing list image, **When** the hero renders, **Then** it remains calm and list-focused (no empty banner).
3. **Given** a gift, **When** available, **Then** reserve is the primary action; cancel is secondary.
4. **Given** mobile, **When** scrolling the public page, **Then** the list title and gifts are reachable without a brand block taking the first screen.

### User Story 5 - Account and profile hierarchy (Priority: P2)

A user manages identity, security and sessions from a coherent account area.

**Independent Test**: Profile at desktop/mobile; account menu; logout path.

**Acceptance Scenarios**:

1. **Given** the profile, **When** it renders, **Then** sections are grouped by goal and the destructive logout is not a red primary action in a sidebar card.
2. **Given** the account menu, **When** the user picks logout, **Then** they are signed out and returned to the home page.
3. **Given** a password/passkey action, **When** it succeeds/fails, **Then** feedback appears next to that section.

### User Story 6 - A complete, trustworthy footer (Priority: P2)

A visitor finds the project links, the GitHub repository and the legal/copyright basics without hunting.

**Independent Test**: Footer at 1440/390 on home, auth and app pages.

**Acceptance Scenarios**:

1. **Given** any app page, **When** the footer renders, **Then** it shows the brand/promise, product links and project links including GitHub.
2. **Given** the GitHub link, **When** clicked, **Then** it opens the repository in a new tab with `rel="noreferrer"`.
3. **Given** mobile, **When** the footer is read, **Then** it stacks cleanly with no horizontal overflow.
4. **Given** the footer, **Then** it contains no invented legal pages or dead links.

### User Story 7 - UX process is reusable (Priority: P1)

The team can repeat this quality bar without re-learning it.

**Independent Test**: Inspect the skill, charter, and a new UX spec; confirm they are loaded via `.agents/skills` (Codex/DSH) and `.claude/skills` (Claude).

**Acceptance Scenarios**:

1. **Given** a new UI/UX change, **When** an agent starts, **Then** it can load the `ui-ux-design` skill and the Design Charter from the constitution.
2. **Given** the design system, **When** someone applies it, **Then** the charter requires a UX brief/audit before coding.
3. **Given** Spec Kit upgrades, **When** skills are re-linked, **Then** the custom skill is included in the Claude symlink sync.

### Edge Cases

- Long account names/list titles break the header/menu/card layout.
- Mobile drawer content taller than the viewport scrolls internally.
- Keyboard-only user opens account/overflow menus and closes with Escape.
- Menu/dropdown near the right edge does not overflow the viewport.
- No-image gifts/public lists still look intentional.
- Signed-out header, preview/production domains, and protected pages keep working.
- Reduced motion and 44px targets remain.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The header MUST display the real Giftlist logo (asset) on the left; no monogram/letter substitute.
- **FR-002**: Primary navigation MUST be grouped with the brand on the left on desktop; the nav MUST NOT be centred across the viewport.
- **FR-003**: Signed-in account actions MUST open a compact menu from the avatar/name. Desktop: Mon profil + Se déconnecter only (Mes listes stays in nav). Mobile: Mes listes + Mon profil + Se déconnecter because the nav is hidden. Logout MUST NOT be a separate header button.
- **FR-004**: Account and overflow menus MUST support keyboard navigation, Escape, outside-click close, focus restore, and accessible roles.
- **FR-005**: The app MUST NOT render a burger that duplicates the account menu/primary navigation. Signed-in mobile navigation is the avatar menu; signed-out mobile shows Connexion + Créer un compte in the header. Short menus MUST NOT use an app-wide dim overlay, body scroll lock or cause a page shift.
- **FR-017**: The logo is the home link when signed in; an “Accueil” nav item MUST NOT duplicate it inside the app.
- **FR-018**: Every app page (except the standalone design-system showcase) MUST render a global footer with brand/promise, product links, GitHub source, bug-report link and copyright.
- **FR-019**: Footer external links MUST be clearly labelled, open in a new tab with `rel="noreferrer"`, and no dead/invented legal pages may be added.
- **FR-006**: The home page MUST remove the black CTA band and add a 3-step “create / share / reserve” section with one primary action.
- **FR-007**: Dashboard list cards MUST show one primary action and move edit/delete into an overflow menu; delete MUST be confirmed and styled as danger.
- **FR-008**: Manage list-level secondary actions MUST move into an overflow menu; add/share remain primary/secondary as appropriate.
- **FR-009**: Gift image areas MUST be compact/tinted when no image exists, without a large empty white block.
- **FR-010**: Public list hero MUST be list-first (no dominant Giftlist logo art); it MUST show title, owner-safe metadata and gift count immediately.
- **FR-011**: Profile MUST group account sections by goal and MUST NOT present logout as a red primary sidebar action.
- **FR-012**: The custom `ui-ux-design` skill MUST be committed in `.agents/skills`, linked for Claude via the sync script, and referenced by AGENTS/CLAUDE/docs.
- **FR-013**: The Design Charter MUST be in the Spec Kit constitution with the brand/UX non-negotiables and enforcement.
- **FR-014**: Existing behavior and API calls MUST remain unchanged.
- **FR-015**: The app MUST remain responsive at 375/768/1440, keyboard accessible and reduced-motion friendly.
- **FR-016**: The change MUST pass typecheck, lint, tests, web build, Expo export and the design-system guard.

### Key Entities

- **Header**: brand, primary nav, account trigger/menu, mobile drawer.
- **Account menu**: profile, lists, logout.
- **Overflow menu**: secondary/destructive actions (edit, delete).
- **Card action hierarchy**: one primary + overflow.
- **Skill/charter**: reusable UX process and design governance.

## Success Criteria *(mandatory)*

- **SC-001**: Header uses the real logo and left-grouped nav on 100% of pages; no centred nav or separate logout button remains.
- **SC-002**: Account menu and overflow menus pass the keyboard/Escape/focus checks.
- **SC-003**: Home has no black CTA band and includes the 3-step section; one primary action.
- **SC-004**: Dashboard/manage cards expose one primary action and an overflow menu; no card shows three equal large buttons.
- **SC-005**: Public list hero is list-first at 1440/390; no dominant brand illustration.
- **SC-006**: No burger/duplicate menu; account menu is desktop-minimal (profile/logout) and mobile-complete (lists/profile/logout); no overlay dim, body scroll lock or page shift; no horizontal overflow at 390/360.
- **SC-007**: `ui-ux-design` skill is discoverable by DSH/Codex/Claude and the Design Charter is in the constitution.
- **SC-008**: Full gates pass; existing flows/routes unchanged.
- **SC-009**: Footer present on every app page, GitHub link present/valid, stacks at 390 without overflow, no dead links.

## Assumptions

- This is a UX refinement, not a new product feature; data/API/auth behavior stays intact.
- The approved Porcelain & Cobalt design system remains the visual system.
- The owner’s specific critiques are authoritative: logo, nav alignment, logout placement, menu size, black band, action clutter, public-list brand-first hero.
- Native screens are out of scope; web only.
- The admin security model remains unchanged and tracked separately.
