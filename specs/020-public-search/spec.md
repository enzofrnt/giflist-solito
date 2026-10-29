# Feature Specification: Public Search & Discoverability

**Branch**: `020-public-search` · **Status**: Approved

## User Stories

### 1. Search by code or username
A new **Recherche** tab/page has one search field. An exact list share code resolves the list immediately (even if the list is private). Otherwise the query searches **public accounts** by unique username (and display name). Results open the account’s public profile.

### 2. Public account/list flags
Accounts and lists have a `public` flag, default **true**.
- Public account: discoverable by username and its public lists can be browsed without a code.
- Private account: not discoverable; only a direct list code works.
- Public list: appears on a public account profile.
- Private list: never appears in discovery; only its full share code opens it.
Every public/private switch has an accessible info control explaining the rule.

### 3. Unique usernames
Usernames are unique, lowercase handles (`[a-z0-9_]{3,30}`), required for new accounts, editable in profile settings, searched by the directory.

## Requirements

- **FR-001**: Add `User.username @unique`, `User.isPublic @default(true)`; GiftList already has `isPublic`; migration backfills existing users with deterministic unique handles.
- **FR-002**: Registration requires/validates username; profile can change username (uniqueness enforced server-side).
- **FR-003**: `GET /api/search?q=` returns an exact code match first; otherwise public users matching username/name, with public list counts.
- **FR-004**: `GET /api/users/[username]` returns a public account + only public lists; no email.
- **FR-005**: `/api/auth/me`, login/register/profile expose `username`, `isPublic`; profile updates both.
- **FR-006**: List create/update accepts `isPublic`; dashboard/profile/manage UI exposes it with info tooltip.
- **FR-007**: Code lookup via existing public list API stays available even for private lists.
- **FR-008**: Mobile adds a third **Recherche** tab + user profile screen; web adds `/search` + `/u/[username]` and a header nav link.
- **FR-009**: No private data (email, reservations) in search/profile payloads.
- **FR-010**: Spec Kit + tests for uniqueness/public filtering/code precedence.
