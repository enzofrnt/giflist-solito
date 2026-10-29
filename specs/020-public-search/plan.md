# Plan

## Data
- User: username, isPublic; GiftList isPublic already exists but must be wired everywhere.
- Migration: add nullable username, backfill slug+id, set NOT NULL, unique index; add isPublic boolean default true.

## API
- `lib/usernames.ts` normalize/validate/unique generation.
- Auth register/login/me/profile include username/isPublic; profile update validates.
- `api/search`: code first, public users second.
- `api/users/[username]`: public only, public lists only.
- Gift list create/update include isPublic.

## Mobile
- Search tab with input/results; user profile screen; list result opens PublicListScreen.
- Public switches + Info buttons in account/list settings.
- Username in registration/profile.

## Web
- `/search`, `/u/[username]`, header nav; profile account public switch; list create/edit public switch; info tooltip component.

## Verification
- Unit tests for username normalization/backfill? Migration applied in PGlite; API/search filters; web/mobile builds.
