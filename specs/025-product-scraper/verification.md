# Verification: Reliable Product Scraping

- Structured-data-first parser (`Product`/`Offer`, `@graph`, arrays), microdata, Open Graph, Amazon-specific selectors.
- Relative image URLs resolved, HTML entities decoded (including French accents), prices normalized.
- Route validates public http(s), uses timeouts + browser headers, `curl` fallback for Cloudflare-fronted French shops, optional ScrapingBee fallback, useful 422.
- BETA copy no longer claims failure; explains usable partial data.
- Fixture suite: Amazon, Fnac, Darty, Boulanger, Cdiscount, Decathlon, IKEA, Apple, Etsy, Shopify, WooCommerce, generic OG + Etam, Petit Bateau, King Jouet, JouéClub, Concorde Love; **21 pass**.
- Live smoke (`SCRAPER_LIVE_TESTS=1`): Amazon.fr, Apple, Etam, Petit Bateau, King Jouet, JouéClub, Concorde Love; **7 pass** (28 total in file).
- Full suite: **65 tests**, 58 pass / 7 skipped live.
- API live checks confirmed title, price and 200-OK image for the five French merchants.
- UI live: Amazon URL auto-filled title and price in the add-gift modal.

## Bot-protected storefronts (FR-008/FR-009) — 2026-11-01

- **Symptom**: `https://www.casio.com/fr/watches/casio/product.UTP-1302PD-1AV/` returned the generic 422 both locally and from production (`POST https://www.giftlist.fr/api/scrape-product` → 422).
- **Root cause**: the Casio France storefront is behind Akamai. `GET` on the canonical path from Node `fetch` *and* from `curl`, with realistic browser headers, gets `403 Access Denied` (`errors.edgesuite.net`). The same page returns `200` (JSON-LD `Product`, price `59.9`, image, description) when the path carries a trailing percent-encoded dot segment (`…/%2E`). The old route re-serialized the validated URL with `new URL()`, and WHATWG parsing collapses `/%2E` to `/`, so the bypass could never be requested; `fetch()` normalises it the same way.
- **Change**: `isBotBlockedResponse` + `botBypassPathVariants` in `apps/next/src/lib/product-scraper.ts`; the route now records whether the direct fetch was blocked, and when so tries one raw-wire request (`node:https`/`node:http`, no WHATWG parsing, manual redirect guard, gzip/deflate/br, 6 MB cap, 9 s timeout) to `<path>/%2E` before the existing curl/ScrapingBee chain. SSRF validation is unchanged and the raw target is derived from the validated `URL`.
- **Evidence (local dev server, Bun 1.4.2)**:
  - `POST http://localhost:3000/api/scrape-product {"url":"https://www.casio.com/fr/watches/casio/product.UTP-1302PD-1AV/"}` → **HTTP 200** `{"title":"UTP-1302PD-1AV","price":"59.9","image":"https://www.casio.com/content/dam/…/image.png","description":"Exprime ta singularité…"}` in 4.4 s (same request before the change: 422).
  - Regression E2E on the same endpoint: Etam 200 (`32.99`), Petit Bateau 200 (`8.5`), King Jouet 200, Apple 200. The bypass only runs after a detected block.
  - `bun test apps/next/tests/product-scraper.test.ts` → 24 pass / 7 skipped (live) / 0 fail; the 3 new cases are deterministic.
  - `bun run web:typecheck` clean; `bun run web:lint` → 0 errors (32 pre-existing warnings, none in the changed files).
- **Vercel egress (verified)**: `POST https://giflist-solito-h9g03z5xw-enzofrnts-projects.vercel.app/api/scrape-product` (PR #43 preview deployment `dpl_H1dPVtb6U5Npvadzchvvm9XhYsYg`, reached through a temporary share link) returned **HTTP 200** with the same title/price/image/description in 4.0 s. The Akamai block is path-scoped, not IP-scoped, so the bypass works from the deployment region.
- **Production**: confirmed after merge with `curl -sS -X POST https://www.giftlist.fr/api/scrape-product -H 'Content-Type: application/json' -d '{"url":"https://www.casio.com/fr/watches/casio/product.UTP-1302PD-1AV/"}'`.
- **Caveat**: the bypass depends on the edge's path normalisation staying as observed; if Casio changes its Akamai rules the route degrades to the previous curl/ScrapingBee/422 chain.

### Independent review follow-ups (2026-11-01)

- **SSRF**: redirect targets of the raw-wire bypass are now re-validated with `isSafePublicUrl` before being followed, and that helper (moved to `lib/product-scraper.ts`, unit-tested) now strips IPv6 brackets and rejects `::`-prefixed / IPv4-mapped IPv6, `fc00::/7`, `fe80::/10`, and trailing-dot `localhost.` hosts. `POST` with `{"url":"http://127.0.0.1:3000/"}` returns 400.
- **Socket/time hygiene**: `rawGet` clears its hard-deadline timer on settle, destroys the response on decompression errors and on the 6 MB cap, and a shared per-request deadline bounds redirect hops.
- **`maxDuration` budget**: `POST` now tracks a 26 s budget; the bypass, curl and ScrapingBee steps receive the remaining time (curl `--max-time`, ScrapingBee `AbortSignal.timeout`) and are skipped when too little is left, so a blocked, slow site gets the friendly 422 instead of a platform 504.
- **200 challenge pages**: `scrapeDirect` now runs block detection on every response and refuses to return a parsed “product” from a block page unless it actually yielded useful fields.
- **Tests**: 36 pass / 7 skipped live / 0 fail (12 new outbound-URL-safety cases + 3 bot-protection cases).
- **Out of scope (documented baseline gap)**: `scrape-product` still has no auth/quota; this change adds no new exposure but does not remediate that gap (it needs its own spec, per the constitution).
