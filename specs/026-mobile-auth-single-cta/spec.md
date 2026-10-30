# Feature Specification: Single Mobile Auth Action in the Header

**Branch**: `feat/mobile-header-auth-cta` · **Status**: Approved

## Problem

On phones the web header shows two competing logged-out controls — a ghost “Connexion” and a primary “Créer un compte” — squeezed next to the logo and theme toggle. Two auth actions of equal visual weight in a 390 px header crowd the brand and break the “one primary action” rule. The login page already offers a clear path to registration (“Pas de compte ? Créez-en un”), so the second header button is redundant on mobile.

## UX brief

- **User job**: reach the sign-in screen (and, from there, registration if needed) from any page.
- **Primary action**: “Connexion”, rendered as the single cobalt button on mobile.
- **Success moment**: one tap on the header opens `/login`, where the register link is immediately visible.
- **Key friction**: two auth buttons competing for the same narrow space; no clear primary.
- **Scope**: web header below the `sm` breakpoint (480 px), logged-out state only.
- **Non-goals**: desktop/tablet header, native app, auth logic, page copy, header height, account menu.

## Screen & action audit (web header, logged out)

| Viewport | Current actions | Issue |
|----------|-----------------|-------|
| 1440 px | theme, ghost “Connexion”, primary “Créer un compte” | Fine: one primary, secondary visible |
| 768 px | same | Fine |
| 390 px | same | Two auth actions, cramped; redundant register entry point |

## User Stories

### 1. One tap to sign in on a phone
A logged-out visitor on a phone sees a single cobalt “Connexion” button in the header. Tapping it opens the login screen, where they can also create an account.

### 2. Desktop keeps both entry points
On tablet and desktop the existing pair (ghost “Connexion” + primary “Créer un compte”) remains unchanged so both journeys stay one click away.

## Requirements

- **FR-001**: Below 480 px viewport width, the logged-out header shows exactly one auth control: “Connexion” with primary (cobalt) styling.
- **FR-002**: The mobile “Connexion” control links to `/login`; the login page keeps its visible link to `/register`.
- **FR-003**: At 480 px and above, the logged-out header keeps the current pair: ghost “Connexion” + primary “Créer un compte”, each linking to its page.
- **FR-004**: The logged-in header (theme toggle + account menu) is unchanged at every width, and the header height/brand position do not change.
- **FR-005**: The hidden register control is removed from the accessibility tree and tab order on mobile; the remaining control keeps a visible focus ring and is the only primary action in the header.
- **FR-006**: No API, data, auth or native-app change; no new dependency.

## Success Criteria

- At 390 px logged out, the header contains one auth button, visibly cobalt, and it opens `/login`; registration is reachable in one further tap from the login page.
- At 768 px and 1440 px logged out, both controls remain and look identical to today.
- No horizontal overflow at 320–479 px, and the header stays 73 px tall.
- Keyboard tab order on mobile reaches the logo, theme toggle, then the single auth button.
- `bun run web:typecheck`, `bun run web:lint` and `bun run web:build` pass.

## Assumptions

- “Mobile” means the existing `sm` breakpoint (under 480 px); tablets and desktops keep both actions.
- The remaining mobile action is “Connexion” (not “Créer un compte”) because the request explicitly relies on the login page as the path to registration.
- The theme toggle stays visible; it is not an auth action.

## Out of scope

- Native (Expo) header/auth entry points.
- Changes to `/login`, `/register` or their copy.
- Reworking the header layout, logo size or sticky behaviour.
