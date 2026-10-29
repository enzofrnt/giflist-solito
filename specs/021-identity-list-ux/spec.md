# Feature Specification: Unified Identity & Shared List Cards

**Branch**: `021-identity-list-ux` · **Status**: Approved

## User Stories

### 1. One identity: username + email
The app no longer exposes a separate display name. Registration asks for **pseudo + email + password**. Profile shows `@username` and email, with username/email editable and uniqueness enforced.

### 2. Shared list card
The same list card is used for “Mes listes” and public profiles:
- owner context: visibility (public/private), public toggle/info, manage action;
- public context: no edit/manage/delete controls, only “Voir la liste”.
Cards show image, title, description, gift count consistently.

### 3. Direct shared-list opening
Opening a list from search or a public profile goes straight to the list. The share-code input is shown only when the user explicitly chooses “Ouvrir une liste partagée” without a code.

### 4. Favorites
A user can favorite a list while viewing it; favorites appear in the search tab as compact shortcuts with the list name and owner username.

## Requirements

- **FR-001**: Remove name field from registration/profile UI; derive internal `name` from unique username for compatibility.
- **FR-002**: Public APIs/search/public profiles expose username only; no display-name split.
- **FR-003**: Shared native `ListCard` (owner/public); shared web `ListCard` (owner/public); public context has no management controls.
- **FR-004**: Public profile list cards and own-list cards share image/title/description/count hierarchy.
- **FR-005**: `PublicListScreen` auto-loads when `shareCode` route param exists and hides the code form.
- **FR-006**: Username/email uniqueness remains enforced server-side.
- **FR-007**: No API field removals that break legacy internal `name`.
- **FR-008**: Add `FavoriteList` relation/migration; authenticated favorites API (list/add/remove).
- **FR-009**: Favorite action on public/consulted list; favorites section in search (web/mobile) opens lists directly.
