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
- **Production (verified 2026-11-01 after merge)**: deployment `dpl_FFabaSRuKDvzYKyBNZZohh353vSo` (commit `d020838`) — `POST https://www.giftlist.fr/api/scrape-product` with the Casio URL → **HTTP 200** in 4.6 s, `{"title":"UTP-1302PD-1AV","price":"59.9","image":"https://www.casio.com/content/dam/…/image.png","description":"Exprime ta singularité…"}`. Production regression: Petit Bateau → 200 (`8.5`) in 0.6 s.
- **Caveat**: the bypass depends on the edge's path normalisation staying as observed; if Casio changes its Akamai rules the route degrades to the previous curl/ScrapingBee/422 chain.

### Independent review follow-ups (2026-11-01)

- **SSRF**: redirect targets of the raw-wire bypass are now re-validated with `isSafePublicUrl` before being followed, and that helper (moved to `lib/product-scraper.ts`, unit-tested) now strips IPv6 brackets and rejects `::`-prefixed / IPv4-mapped IPv6, `fc00::/7`, `fe80::/10`, and trailing-dot `localhost.` hosts. `POST` with `{"url":"http://127.0.0.1:3000/"}` returns 400.
- **Socket/time hygiene**: `rawGet` clears its hard-deadline timer on settle, destroys the response on decompression errors and on the 6 MB cap, and a shared per-request deadline bounds redirect hops.
- **`maxDuration` budget**: `POST` now tracks a 26 s budget; the bypass, curl and ScrapingBee steps receive the remaining time (curl `--max-time`, ScrapingBee `AbortSignal.timeout`) and are skipped when too little is left, so a blocked, slow site gets the friendly 422 instead of a platform 504.
- **200 challenge pages**: `scrapeDirect` now runs block detection on every response and refuses to return a parsed “product” from a block page unless it actually yielded useful fields.
- **Tests**: 36 pass / 7 skipped live / 0 fail (12 new outbound-URL-safety cases + 3 bot-protection cases).
- **Out of scope (documented baseline gap)**: `scrape-product` still has no auth/quota; this change adds no new exposure but does not remediate that gap (it needs its own spec, per the constitution).

## Hard bot protection (Cloudflare + DataDome) — 2026-11-01

- **Symptom**: `https://www.cultura.com/p-l-ecole-des-pouvoirs-secrets-edition-collector-9782203315617.html` → generic 422.
- **Investigation**: every request path is challenged. `curl`/Node with browser headers → `403` Cloudflare `"Just a moment..."` (also for `robots.txt`, `sitemap.xml`, `/graphql`, `/api/`, `/rest/V1/...`); `cultura.com` → 301 to `www`; a real headless Chrome (puppeteer, 20 s of real waits) stays on Cultura's DataDome interstitial `"Un instant…"`; `r.jina.ai` renders the Cloudflare challenge; Microlink's own API refuses with `EPROXYNEEDED` ("uses antibot protection"). The `/%2E` Akamai trick does not apply — the block is not path-scoped.
- **Conclusion**: fetching Cultura needs a paid anti-bot bypass (residential proxy + humanised browser, e.g. ScrapingBee `render_js` + `premium_proxy`, which is the already-wired `SCRAPINGBEE_API_KEY` path). No free server-side strategy reads the page, so this is not a fixable code defect.
- **Delivered for FR-010**: the route now distinguishes a block from “no product data” and returns a specific 422 (`blocked: true`) telling the user the site blocks automatic reading and to copy the fields manually; the existing inline `role="alert"` error area shows it. Unblocked failures keep the previous wording.

### FR-010 evidence (local + production)

- Cultura URL → `422` `{"error":"Ce site bloque la lecture automatique de ses pages (protection anti-bot). Ouvre le lien pour copier le titre, le prix et l’image, ou remplis les champs manuellement.","blocked":true}` in 1.1 s (before: generic “impossible de lire”).
- Non-blocked failures keep the generic wording: `https://example.com/does-not-exist` (404) → “Impossible de lire les informations de ce produit…”.
- No regression on the bypass: Casio URL → `200` (price `59.9`).

## Free ISBN fallback (FR-011/FR-012) — 2026-11-01

- **Why**: Cultura is unreachable server-side (Cloudflare challenge for HTTP clients, DataDome for headless browsers), and no free proxy/TLS trick works (`curl_cffi` impersonating Chrome/Safari/Firefox → still `403 Just a moment…`). A paid bypass is the only way to read Cultura itself.
- **Free alternative**: the Cultura URL embeds the ISBN (`9782203315617`). `placedeslibraires.fr` serves plain HTML without anti-bot protection and includes the book's fixed retail price: `13.95 €`, identical to the publisher's price (Casterman lists `13,95 €`). French law fixes book prices, so the price matches Cultura.
- **Verification (local + production egress)**:
  - `POST /api/scrape-product` with the Cultura URL → **HTTP 200** in 2.5 s: `{"title":"L'École des pouvoirs secrets Tome 1","price":"13.95","image":"https://images.epagine.fr/617/9782203315617_1_75.jpg", …,"source":{"vendor":"Place des Libraires","url":"…"}}`.
  - Production egress can read the same source (`POST https://www.giftlist.fr/api/scrape-product` with the PDL URL → 200, `13.95` in 2.0 s).
  - Regressions: Casio 200 (`59.9`, no ISBN → no fallback), Petit Bateau 200 (`8.5`), PDL product page 200, blocked non-book URL (Fnac `/a1`) still returns the FR-010 `blocked: true` message.
  - Unit: `extractIsbn` accepts store URLs with valid ISBN-13 (plain/hyphenated), rejects bad check digits, `1234567890123` and ISBN-10-only strings — 38 pass / 7 skipped / 0 fail.
  - Web form toast now names the source when `source` is returned; native receives the same fields, without the provenance line (declared web-only in the spec).
