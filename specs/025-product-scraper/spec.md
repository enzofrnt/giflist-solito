# Feature Specification: Reliable Product Scraping

**Branch**: `025-product-scraper` · **Status**: Local refinement

## Problems
- The BETA “Récupération automatique” often returns empty or wrong fields.
- The parser is a pile of site-specific regexes, has no JSON-LD support, and does not resolve relative image URLs.
- Amazon/Fnac/Darty/Boulanger/Cdiscount/Decathlon/IKEA/Apple/Shopify/WooCommerce markup changes break the regexes.
- No automated coverage for known merchants.

## Requirements
- **FR-001**: Prefer structured data: JSON-LD `Product`/`Offer` (including `@graph`, arrays), microdata, Open Graph, then heuristics.
- **FR-002**: Resolve relative/protocol-relative image URLs; decode HTML entities.
- **FR-003**: Normalize price to a numeric string (`1299.00`) and reject non-price text.
- **FR-004**: Fetch with timeout, redirects, realistic browser headers; optional ScrapingBee fallback; validate http(s) and block local targets.
- **FR-005**: Return partial results when some fields are found; useful 422 only when nothing is usable.
- **FR-006**: Deterministic fixture tests for Amazon, Fnac, Darty, Boulanger, Cdiscount, Decathlon, IKEA, Apple, Etsy, Shopify, WooCommerce and generic OG; optional network smoke tests.
- **FR-007**: No auth regression; route remains POST JSON `{url}`.
