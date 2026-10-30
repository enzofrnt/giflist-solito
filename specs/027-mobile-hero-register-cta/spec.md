# Feature Specification: Explicit Account Creation in the Mobile Hero

**Branch**: `feat/mobile-header-auth-cta` · **Status**: Approved

## Problem

After the mobile header was reduced to a single “Connexion” action (feature 026), the home hero's primary button still reads “Commencer maintenant”. It already links to `/register`, but nothing on the mobile home page says “Créer un compte”; the explicit registration path is only visible after opening the login page. On a phone, the main account-creation action is therefore hidden behind a vague label.

## UX brief

- **User job**: start a gift list by creating an account from the home page.
- **Primary action**: “Créer un compte” (opens the registration screen).
- **Success moment**: one tap on the hero's cobalt button lands on the registration form.
- **Key friction**: “Commencer maintenant” does not state that it creates an account; the mobile header no longer carries a register entry point.
- **Scope**: web home hero, logged out, viewport below 480 px.
- **Non-goals**: desktop/tablet hero copy, header, page structure, native app, registration flow itself.

## Screen & action audit (home hero, logged out)

| Viewport | Hero actions | Issue |
|----------|--------------|-------|
| 1440 / 768 px | “Commencer maintenant” (→ `/register`), “Se connecter” | Fine: the header also exposes “Créer un compte” |
| 390 px | “Commencer maintenant” (→ `/register`), “Se connecter” | Header has no register control; the hero label is ambiguous, so no explicit create-account action is visible |

## User Story

### 1. Create an account directly from the mobile home page
A logged-out visitor on a phone sees “Créer un compte” as the hero's primary button and can open the registration form in one tap, next to the existing “Se connecter” secondary action.

## Requirements

- **FR-001**: Below 480 px, the logged-out hero's primary button label is exactly “Créer un compte” and links to `/register`.
- **FR-002**: At 480 px and above, the logged-out hero keeps “Commencer maintenant” (same `/register` destination); no desktop copy change.
- **FR-003**: Logged-in users keep “Voir mes listes” → `/dashboard` at every width.
- **FR-004**: The hero keeps exactly two actions for logged-out visitors (one primary, one secondary) — no third button and no duplicate registration action.
- **FR-005**: Only the visible label is exposed to assistive technology at each breakpoint; the button keeps its focus ring and 44 px height, and the label swap causes no layout shift or hydration mismatch.
- **FR-006**: No API, data, auth, or native-app change; no new dependency.

## Success Criteria

- At 390 px and 320 px logged out, the hero shows a cobalt “Créer un compte” button that opens `/register`, plus the “Se connecter” secondary link.
- At 768 px and 1440 px logged out, the hero still shows “Commencer maintenant”.
- The hero never shows two links with the same destination/label intent.
- Keyboard focus reaches the primary button, whose accessible name matches the visible label.
- `bun run web:typecheck`, `bun run web:lint` and `bun run web:build` pass.

## Assumptions

- “Il faudrait aussi un bouton pour créer un compte” means the mobile home page must expose account creation explicitly. The existing primary button already targets `/register`, so the chosen solution is to make its label explicit rather than add a third, redundant button (one primary action per view).
- The wording stays “Créer un compte” to match the desktop header and the registration page title.
- Desktop copy is intentionally untouched: the desktop header already provides the explicit register action.

## Out of scope

- The mobile header (feature 026) and the login/register pages.
- The secondary “Se connecter” action.
- Native home screen.
