# Feature Specification: Reliable Product Scraping

**Branch**: `025-product-scraper` · **Status**: Local refinement

## Problems
- The BETA “Récupération automatique” often returns empty or wrong fields.
- The parser is a pile of site-specific regexes, has no JSON-LD support, and does not resolve relative image URLs.
- Amazon/Fnac/Darty/Boulanger/Cdiscount/Decathlon/IKEA/Apple/Shopify/WooCommerce markup changes break the regexes.
- No automated coverage for known merchants.
- Storefronts behind an edge bot manager (e.g. `www.casio.com`, Akamai) answer every server-side fetch with `403 Access Denied`, so users get the generic 422 even though the page is public and parseable. The same edge happily serves the page when the request path carries an extra percent-encoded dot segment (`…/product.UTP-1302PD-1AV/%2E`), but any code that re-serializes the URL through `new URL()` (what the route did) collapses `%2E` back to the canonical, blocked path.

## Requirements
- **FR-001**: Prefer structured data: JSON-LD `Product`/`Offer` (including `@graph`, arrays), microdata, Open Graph, then heuristics.
- **FR-002**: Resolve relative/protocol-relative image URLs; decode HTML entities.
- **FR-003**: Normalize price to a numeric string (`1299.00`) and reject non-price text.
- **FR-004**: Fetch with timeout, redirects, realistic browser headers; optional ScrapingBee fallback; validate http(s) and block local targets.
- **FR-005**: Return partial results when some fields are found; useful 422 only when nothing is usable.
- **FR-006**: Deterministic fixture tests for Amazon, Fnac, Darty, Boulanger, Cdiscount, Decathlon, IKEA, Apple, Etsy, Shopify, WooCommerce and generic OG; optional network smoke tests.
- **FR-007**: No auth regression; route remains POST JSON `{url}`.
- **FR-008**: Detect edge/bot blocks (403/429/503 or a block-page body) instead of treating them as “no data”. When the direct fetch is blocked, retry the validated URL once on the raw wire with a trailing percent-encoded dot segment that survives URL normalization, then parse it like any other page. Only http(s) non-local targets; no new dependency, no proxy required.
- **FR-009**: Bot-block detection and bypass-path construction are pure, unit-tested helpers; a failed bypass must degrade to the existing curl/ScrapingBee chain and the same friendly 422, never to a different error.
- **FR-010**: When every strategy is blocked (Cloudflare/DataDome/Akamai challenge, e.g. `www.cultura.com`), the 422 must say so explicitly — the site blocks automatic reading, copy the fields manually or with the link — instead of the generic “impossible de lire”. Response carries `blocked: true`; the web and native forms show that message inline, next to the URL field, and keep manual entry available.

## Free fallback for blocked book URLs (FR-011)

**Delivery scope**: web + native data path; the provenance note is web-only.

- **FR-011**: When no strategy can read the requested page and the URL carries a valid **ISBN-13**, look the ISBN up on a free, unprotected book aggregator (`placedeslibraires.fr`: search by ISBN, then the matching `/livre/<isbn>-…` product page) and parse it with the existing parser. No API key, no proxy, no third-party account. In France the retail price of a book is fixed by law, so the price returned is the same as the requested store's; the response adds `source: { vendor, url }` and the web form says the fields come from that vendor. Only exact-ISBN matches are accepted, and the fallback runs only after the direct, curl and Akamai-bypass attempts produced nothing useful.
- **FR-012**: Non-book URLs (no ISBN) keep the current behaviour: blocked sites return the explicit “site blocks automatic reading” 422 and manual entry stays available.
