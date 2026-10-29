# Feature Specification: Clean Sitemap for Google Search Console

**Feature Branch**: `022-sitemap-search-console` · **Created**: 2026-10-29 · **Status**: Approved

**Input**: User description: "je veux avoir un sitemap propre a donner a la google search console."

## Why this feature

`https://giftlist.fr/sitemap.xml` currently lists a single URL (`https://giftlist.fr/`) and stamps it with `lastModified = now` on every build. Meanwhile the only other indexable public pages — public profiles at `/u/<username>` — inherit the root canonical (`https://giftlist.fr/`) and the root title/description, so they present themselves to search engines as duplicates of the homepage. Submitting today's sitemap to Google Search Console can therefore never surface anything beyond the homepage, and any future profile URL would be reported as an "alternate page with proper canonical tag" rather than indexed.

The deliverable is a sitemap that Search Console accepts as clean: only canonical, indexable, 200 URLs; real modification dates; no private, share or internal-search pages; refreshed automatically as public profiles change.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit a sitemap without errors (Priority: P1)

The Search Console owner submits `https://giftlist.fr/sitemap.xml` once and gets "Success — 0 errors, 0 warnings", with every listed URL returning 200, indexable and self-canonical.

**Why this priority**: This is the direct request. Without it nothing else matters.

**Independent Test**: Fetch the sitemap, extract every `<loc>`, follow each URL, and assert status 200, `robots: index`, and a canonical that equals the URL.

**Acceptance Scenarios**:

1. **Given** the sitemap is requested, **Then** it is valid sitemap 0.9 XML, UTF-8, `Content-Type: application/xml`, and contains only absolute `https://giftlist.fr` URLs.
2. **Given** the sitemap is requested, **Then** every entry returns 200 and is self-canonical.
3. **Given** the sitemap is requested, **Then** it contains no URL that is noindex, blocked by robots.txt, or redirected (no `/list/*`, `/login`, `/dashboard`, `/profile`, `/admin`, `/manage`, `/search`, `/api/*`, `/design-system`, preview host).

### User Story 2 - Public profiles indexed as distinct pages (Priority: P1)

A visitor who searches a pseudonym in Google lands on the person's public Giftlist profile, which has its own title, description and canonical, and lists that person's public gift lists.

**Why this priority**: Profiles are the only indexable content besides the homepage; making them distinct is what gives the sitemap SEO value.

**Independent Test**: Request `/u/<public-username>` and assert a unique `<title>` containing the pseudonym, a non-empty description, `rel=canonical` equal to its own URL, and presence of the URL in the sitemap.

**Acceptance Scenarios**:

1. **Given** a public account with at least one public list, **Then** `/u/<username>` appears exactly once in the sitemap, lowercased, with a real `lastmod`.
2. **Given** a public account page, **Then** it declares its own canonical, a unique title mentioning the pseudonym, a description, and `robots: index, follow`.
3. **Given** an unknown or non-public username, **Then** the page returns 404 and never appears in the sitemap.
4. **Given** a public account with no public list, **Then** its profile is excluded (thin page) until a public list exists.

### User Story 3 - Internal search page does not compete (Priority: P2)

The `/search` page stops being a duplicate of the homepage: it is `noindex, follow`, has its own title/description, and is excluded from the sitemap.

**Why this priority**: Internal result pages must not dilute crawl budget or be submitted to Search Console.

**Independent Test**: Request `/search` and assert `noindex` present, a distinct title, and no `/search` entry in the sitemap.

**Acceptance Scenarios**:

1. **Given** `/search`, **Then** its robots meta is `noindex, follow` (crawlable so Google can read the signal).
2. **Given** the sitemap, **Then** `/search` is absent.
3. **Given** `/search`, **Then** its title and description differ from the homepage.

### User Story 4 - Sitemap stays fresh without a deploy (Priority: P2)

When an account becomes public, publishes its first list, or goes private, the sitemap reflects it within 60 minutes without anyone redeploying.

**Why this priority**: A sitemap that only updates on deploy goes stale between releases.

**Independent Test**: Change the visibility of a staged account, wait for the refresh window, fetch the sitemap again and assert the entry appeared/disappeared.

**Acceptance Scenarios**:

1. **Given** a newly public account with a public list, **Then** its profile appears within 60 minutes.
2. **Given** an account that becomes private or loses its last public list, **Then** its profile disappears within 60 minutes.
3. **Given** the sitemap endpoint, **Then** it is cached for a bounded time (not regenerated on every crawler hit).

### User Story 5 - Graceful degradation (Priority: P3)

If the database is unavailable while generating the sitemap, Search Console still receives a valid sitemap (at minimum the homepage) instead of a 500 or an empty file.

**Why this priority**: A 500 during a crawl trains Search Console to distrust the sitemap.

**Independent Test**: Generate with an unreachable database and assert 200 plus a valid `urlset` containing `/`.

**Acceptance Scenarios**:

1. **Given** a database error, **Then** the response is 200 and valid XML with the homepage entry.
2. **Given** zero public profiles, **Then** the response is 200 and valid with the homepage only.

### Edge Cases

- No public profile at all → sitemap still valid with `/`.
- Usernames are matched case-insensitively by the app; the sitemap always emits lowercase URLs.
- More than 50 000 URLs → cap at 50 000 (sitemap protocol limit) and log; the site is far below today.
- Public lists and share pages stay `noindex` for privacy (spec 006) and are never listed.
- `www.giftlist.fr` must keep serving a canonical to the apex; the sitemap never emits `www`.
- Preview deployments are SSO-protected and must not be suggested as a Search Console property.
- A username that is deleted between crawl and request returns 404; Search Console reports it and the next refresh drops it.

## Requirements *(mandatory)*

- **FR-001**: The sitemap lists the homepage and every public account that has at least one public list, and nothing else.
- **FR-002**: Every sitemap URL is absolute, on the apex `https://giftlist.fr`, unique, and 200.
- **FR-003**: No sitemap URL is `noindex`, disallowed by robots.txt, redirected, or one of the private routes (`/api/`, `/dashboard`, `/profile`, `/admin`, `/manage`, `/login`, `/register`, `/setup-passkey`, `/forgot-password`, `/reset-password`, `/design-system`, `/search`).
- **FR-004**: Each public profile declares its own title, description, canonical and `index, follow`; unknown/non-public profiles return 404 with `noindex`.
- **FR-005**: `/search` declares `noindex, follow` with its own title and description, and is not listed in the sitemap.
- **FR-006**: The sitemap exposes a real `lastmod` only when a genuine modification time is known (public profile `updatedAt`); no artificial "now" timestamps.
- **FR-007**: The sitemap is cached and refreshed at most hourly without a deploy; a database failure degrades to a valid homepage-only sitemap.
- **FR-008**: `robots.txt` keeps disallowing private routes and points to the sitemap at `https://giftlist.fr/sitemap.xml`.
- **FR-009**: The sitemap respects the 50 000-URL / 50 MB protocol limits.
- **FR-010**: The sitemap and profile pages behave correctly for the apex domain only (no preview host leakage in production).

## Key Entities

- **User** — `username` (unique, lowercased in URLs), `isPublic`, `updatedAt`; the source of profile entries.
- **GiftList** — `isPublic`; an account qualifies only when it holds at least one public list.

## Success Criteria *(mandatory)*

- **SC-001**: Search Console reports 0 errors and 0 warnings for the submitted sitemap.
- **SC-002**: 100% of sitemap URLs return 200, are self-canonical and `index`-able.
- **SC-003**: 0% of listed URLs are `noindex`, redirected, disallowed or duplicated.
- **SC-004**: Every public profile with a public list is listed within 60 minutes of becoming eligible.
- **SC-005**: 100% of public profiles have a unique title and a non-empty description.
- **SC-006**: A database outage produces a valid 200 sitemap containing the homepage, never a 500.

## Assumptions

- `giftlist.fr` (apex, HTTPS) is the primary property; `www` and `http` canonicalize to it.
- Public lists/share pages remain intentionally `noindex` (privacy decision from spec `006-seo-list-polish`); changing that is out of scope and would need its own spec.
- Profiles with zero public lists are thin and excluded, per FR-001.
- Single locale (`fr_FR`): no hreflang alternates.
- Search Console verification (DNS or meta tag) is an operator step outside the codebase.
