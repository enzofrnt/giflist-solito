# Plan
1. Extract `lib/product-scraper.ts` with structured-data-first parser.
2. Rewrite scrape route with safe fetch/fallback and timeout.
3. Add merchant fixtures + optional live tests.
4. Update BETA copy to explain partial results.
5. Verify tests/build/dev flow.
6. Bot-block handling (FR-008/FR-009):
   - `lib/product-scraper.ts`: pure `isBotBlockedResponse(status, body)` and `botBypassPathVariants(pathname, search)`.
   - `api/scrape-product/route.ts`: direct fetch returns `{ product, blocked }`; when blocked and not useful, run one raw-wire request (`node:https`/`node:http`, manual redirects, gzip/br/deflate, timeout) on `<path>/%2E`, parsed with the canonical URL as base. The bypass uses `parsedUrl` for origin/host/path so WHATWG normalization cannot reintroduce the blocked path and SSRF validation still applies.
   - Keep the existing chain/order after the bypass: curl → ScrapingBee → friendly 422. No new dependency, no env var.
7. Free ISBN fallback (FR-011):
   - `lib/product-scraper.ts`: pure `extractIsbn` (978/979 + ISBN-13 check digit) so random 13-digit ids never trigger it.
   - `api/scrape-product/route.ts`: after direct/Akamai-bypass/curl fail, look the ISBN up on `placedeslibraires.fr` (search page → matching product page) inside the remaining budget, parse with `parseProductHtml`, and return `source`.
   - `manage/[id]`: success toast names the source when present (“prix unique du livre”). No new env var, no dependency, no UI hierarchy change.
