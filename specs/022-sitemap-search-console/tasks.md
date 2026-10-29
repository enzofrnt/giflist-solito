---
description: "Task list for Clean Sitemap for Google Search Console"
---

# Tasks: Clean Sitemap for Google Search Console

**Input**: Design documents from `/specs/022-sitemap-search-console/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md)

**Tests**: Required for the pure sitemap helper (server logic, no DB).

**Organization**: Grouped by user story; US1 and US2 are P1 and ship together.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [x] T001 Create the feature branch `feat/sitemap-search-console` from current `origin/main` and confirm `bun --version` (canonical 1.4.4; report mismatches).

## Phase 2: Foundational

- [x] T002 [P] Add `apps/next/src/lib/sitemap.ts`: `MAX_SITEMAP_URLS = 50_000`, `SitemapProfileInput`, `buildSitemapEntries(siteUrl, profiles)` returning homepage first (no `lastModified`), profiles lowercased/de-duplicated/encoded with `lastModified = updatedAt`, capped at 50 000.
- [x] T003 [P] Add `apps/next/tests/sitemap.test.ts` covering: homepage-only, lowercase + dedupe, real `lastmod`, absence of `/list/`, `/search`, `www`, cap at 50 000, trailing-slash normalisation. Verify with `bun run --cwd apps/next test:password-reset` (runs `tests/*.test.ts`).

## Phase 3: User Story 1 — sitemap without errors (P1)

- [x] T004 [US1] Rewrite `apps/next/src/app/sitemap.ts`: `export const revalidate = 3600`; `loadPublicProfiles()` query `user.findMany({ where: { isPublic: true, giftLists: { some: { isPublic: true } } }, select: { username, updatedAt }, take: MAX_SITEMAP_URLS })` wrapped in try/catch returning `[]` with a server log; return `buildSitemapEntries(SITE_URL, profiles)`.
- [x] T005 [US1] Update `apps/next/src/app/robots.ts`: keep the private-route disallows and `Sitemap`/`Host`→apex; remove the non-standard `Host` directive (Google ignores it, Yandex-only); keep `/search` crawlable. Verify textual output.
- [x] T006 [US1] Runtime-verify `GET /sitemap.xml` and `GET /robots.txt` against `next start`: 200, `application/xml`, valid XML, absolute apex URLs, no private/noindex/redirect entries.

## Phase 4: User Story 2 — public profiles as distinct pages (P1)

- [x] T007 [US2] Add `apps/next/src/lib/public-profile.ts`: request-cached `getPublicProfile(username)` returning `{ username, giftLists }` for `isPublic: true` users with public lists only; no email/secret fields.
- [x] T008 [US2] Update `apps/next/src/app/u/[username]/page.tsx`: use the shared loader in the component and add `generateMetadata` — unique title/description, self-canonical via `pageMetadata`, `index, follow` when found; `noindex,nofollow` + "Profil introuvable" when absent (page keeps `notFound()`).
- [x] T009 [US2] Verify `GET /u/<public>` head (unique title, description, self canonical, index) and `GET /u/<unknown>` (404, noindex); confirm the URL appears in `/sitemap.xml`.

## Phase 5: User Story 3 — internal search page (P2)

- [x] T010 [US3] Add `apps/next/src/app/search/layout.tsx` spreading `pageMetadata({ title: 'Rechercher un pseudo ou une liste', description: '…', path: '/search' })` with `robots: { index: false, follow: true }`.
- [x] T011 [US3] Verify `GET /search` is `noindex, follow`, has its own title, and is absent from `/sitemap.xml`.

## Phase 6: User Story 4 — freshness (P2)

- [x] T012 [US4] Confirm `revalidate = 3600` is present in `sitemap.ts` output config and document the 60-minute window in `verification.md`.

## Phase 7: User Story 5 — graceful degradation (P3)

- [x] T013 [US5] Verify the fail-soft path: run the server with an unreachable `POSTGRES_PRISMA_URL` and assert `/sitemap.xml` is 200 with the homepage entry only.

## Phase 8: Polish & gates

- [x] T014 Run `bun run web:typecheck`, `bun run test`, `bun run web:lint`, `bun run web:build`; record results and the Bun-version caveat in `verification.md`.
- [x] T015 Review `git diff` for scope, secrets and generated files; write `specs/022-sitemap-search-console/verification.md`; prepare PR body linking this spec.
- [ ] T016 After merge, give the operator: submit `https://giftlist.fr/sitemap.xml` in Search Console (domain property), expected "Success", and the www→apex check.

## Dependencies

- T002 → T003 → T004/T005.
- T007 → T008/T009.
- T004/T008 required before T006/T009 runtime checks.
- T010 → T011.
- T014 gates everything.
- US3, US4, US5 are independent of US2.
