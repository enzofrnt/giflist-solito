# Implementation Plan: Clean Sitemap for Google Search Console

**Branch**: `022-sitemap-search-console` · **Date**: 2026-10-29 · **Spec**: [spec.md](./spec.md)

## Summary

Replace the placeholder sitemap with one generated from real public data: the homepage plus every public account holding at least one public list. In parallel, give public profiles and the internal search page their own canonical/robots metadata so the sitemap only ever lists self-canonical, indexable URLs. Deliverable: a sitemap Search Console accepts with 0 errors and 0 warnings, refreshed hourly without a deploy.

## Technical Context

- **Language/Version**: TypeScript 5.x, Node 24.x (Vercel), Bun 1.4.x
- **Primary Dependencies**: Next.js 16.4.3 App Router metadata routes (`sitemap.ts`, `robots.ts`, `Metadata`), Prisma 6.16.x
- **Storage**: PostgreSQL via Prisma (read-only queries; **no schema change**)
- **Testing**: `bun test tests/*.test.ts` (`node:test` style, already used by `tests/email-config.test.ts`)
- **Target Platform**: Web only (`apps/next`); native untouched
- **Performance Goals**: sitemap generation ≤ 1 Prisma query, indexed (`isPublic` + `giftLists.some`), capped at 50 000 rows; cached 1 h
- **Constraints**: sitemap must never 500 on DB error; no preview host in production output; no `noindex` URL listed
- **Scale/Scope**: 1 metadata route, 1 metadata layout, 1 profile `generateMetadata`, 1 pure helper, 1 test file
- **Environment variables**: none added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Spec-driven**: `specs/022-sitemap-search-console/spec.md` covers FR-001…FR-010; PR will link it.
- [x] **Cross-platform**: Web only; no `packages/app` change, no native impact.
- [x] **Boundaries**: Server-only logic stays in `apps/next`; helper is pure and dependency-free; single Bun lockfile.
- [x] **Data**: No schema/migration change; read-only `User`/`GiftList` queries.
- [x] **Security**: Public-only selects (`username`, `updatedAt`); no email/secret can reach the sitemap; share URLs remain `noindex`.
- [x] **Evidence**: Commands below are runnable; runtime checks against `next start` are listed.
- [x] **Deployment**: No manual deploy; no env-var change; Vercel build unaffected (DB query is fail-soft).

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/022-sitemap-search-console/
├── spec.md
├── plan.md
├── tasks.md
├── verification.md
└── checklists/requirements.md
```

### Source (repository paths)

```text
apps/next/src/app/sitemap.ts                  # async sitemap, hourly ISR, fail-soft DB query
apps/next/src/app/robots.ts                   # keep disallows + sitemap; drop non-standard Host
apps/next/src/app/u/[username]/page.tsx       # generateMetadata (title/desc/canonical/index) + shared loader
apps/next/src/app/search/layout.tsx           # NEW: noindex,follow + own title/description/canonical
apps/next/src/lib/sitemap.ts                  # NEW: pure buildSitemapEntries + 50k cap
apps/next/src/lib/public-profile.ts           # NEW: request-cached public profile loader (dedupes query)
apps/next/tests/sitemap.test.ts               # NEW: pure-helper tests
```

## Design decisions

1. **Sitemap content = homepage + eligible public profiles.** Public lists stay `noindex` (privacy, spec 006) and are excluded; `/search` is excluded (US3). Profiles with zero public lists are thin and excluded.
2. **Honest `lastmod`.** Homepage gets no `lastModified` (its content is not modified per request); profiles use `User.updatedAt`. No `new Date()` placeholders.
3. **Hourly ISR.** `export const revalidate = 3600` on the route; satisfies US4 without redeploy and FR-007.
4. **Fail-soft query.** The Prisma call is wrapped in `try/catch`; on error the sitemap still returns the homepage entry (US5) and logs server-side.
5. **Profile canonical fix.** `generateMetadata` on `/u/[username]` sets a self-canonical (overriding the root `/` canonical) plus a unique title/description. Non-public/unknown users return `noindex` metadata and the page keeps `notFound()`.
6. **Search noindex.** A `search/layout.tsx` sets `robots: { index: false, follow: true }`, keeping the page crawlable for the signal and its internal links.
7. **Pure helper + tests.** URL assembly, lowercasing, de-duplication and the 50k cap live in `src/lib/sitemap.ts`, unit-tested without a DB or Next runtime.

## Verification

```sh
bun run web:typecheck
bun run test
bun run web:lint
bun run web:build
bun run --cwd apps/next start   # runtime checks, see below
```

Runtime checks (against `next start`, local DB or empty DB):

- `GET /sitemap.xml` → 200, `application/xml`, valid `urlset`, only apex URLs.
- `GET /robots.txt` → disallows private routes, `Sitemap: https://giftlist.fr/sitemap.xml`.
- `GET /u/<public-user>` → 200, unique title, canonical self, `index, follow`.
- `GET /u/<unknown>` → 404, `noindex`.
- `GET /search` → 200, `noindex, follow`, distinct title.
- Kill/invalid DB URL → sitemap 200 with homepage only.

## Risks

- **Bun mismatch**: local Bun is 1.4.2 vs canonical 1.4.4; gates are reported with that caveat, and the Vercel build uses its pinned runtime.
- **Thin site**: with public lists `noindex`, the sitemap stays small (home + profiles). That is intentional for a clean submission; changing list indexability needs its own spec.
- **Build-time prerender**: the sitemap is generated during `next build`. On Vercel the DB is reachable; locally an unavailable DB yields the fail-soft homepage-only variant.
