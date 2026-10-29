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
