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
